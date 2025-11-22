import { Config } from "./config";
import {
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import bs58 from "bs58";
import { FeeService } from "./services/feeService";
import { Logger } from "./utils/logger";

// Initialize configuration from environment variables
Config.initialize();

// Validate fee configuration
FeeService.validateFeeConfig();

const blacklist = [
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
];

(async function close_atas() {
  Logger.info("Starting Gor Incinerator", {
    wallet: Config.gorWallet.publicKey.toString(),
    feePercentage: Config.feePercentage,
    feeRecipient: Config.feeRecipient?.toString() || "not configured",
  });

  const atas = await Config.connection.getParsedTokenAccountsByOwner(
    Config.gorWallet.publicKey,
    {
      programId: TOKEN_PROGRAM_ID,
    }
  );

  Logger.info("Found token accounts", { count: atas.value.length });

  const inst = [
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1000 }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: 45000 }),
  ];

  let accountsToClose = 0;

  const block = await Config.connection.getLatestBlockhash({
    commitment: "processed",
  });

  for (const ata of atas.value.slice(0, 15)) {
    const data = (<TokenAccountData>ata.account.data.parsed).info;
    if (blacklist.includes(data.mint)) {
      Logger.debug("Skipping blacklisted mint", { mint: data.mint });
      continue;
    }
    if (data.tokenAmount.amount != "0") {
      Logger.debug("Skipping non-empty account", { mint: data.mint });
      continue;
    }
    Logger.debug("Adding account to close", { mint: data.mint });

    inst.push(
      createCloseAccountInstruction(
        ata.pubkey,
        Config.gorWallet.publicKey,
        Config.gorWallet.publicKey
      )
    );
    accountsToClose++;
  }

  if (accountsToClose === 0) {
    Logger.info("No empty token accounts to close");
    return;
  }

  // Add fee transfer instruction if configured
  const feeInstruction = FeeService.createFeeInstruction(
    accountsToClose,
    Config.gorWallet.publicKey
  );
  if (feeInstruction) {
    inst.push(feeInstruction);
    const feeCalc = FeeService.calculateFee(accountsToClose);
    Logger.info("Fee will be collected", {
      accountsToClose,
      feeAmount: feeCalc.feeAmount / 1e9,
      feePercentage: Config.feePercentage,
      recipient: Config.feeRecipient?.toString(),
    });
  }

  const txn = new VersionedTransaction(
    new TransactionMessage({
      instructions: inst,
      payerKey: Config.gorWallet.publicKey,
      recentBlockhash: block.blockhash,
    }).compileToV0Message()
  );
  txn.sign([Config.gorWallet.payer]);
  let sig = bs58.encode(txn.signatures[0]);

  Logger.info("Sending transaction", { signature: sig });

  await Config.connection.sendTransaction(txn, {
    preflightCommitment: "processed",
    skipPreflight: false,
    maxRetries: 10,
  });

  let res = await Config.connection.confirmTransaction(
    {
      ...block,
      signature: sig,
    },
    "processed"
  );

  if (!res.value.err) {
    Logger.info("Transaction successful", {
      accountsClosed: accountsToClose,
      signature: sig,
    });
    console.log(`${accountsToClose} token accounts successfully closed`);
    if (Config.feeRecipient) {
      const feeCalc = FeeService.calculateFee(accountsToClose);
      console.log(
        `Fee collected: ${feeCalc.feeAmount / 1e9} GOR (${Config.feePercentage}%)`
      );
    }
  } else {
    Logger.error("Transaction failed", { error: res.value.err });
    console.error("Transaction failed:", res.value.err);
  }
})();

interface TokenAccountData {
    info: {
        isNative: boolean,
        mint: string,
        owner: string,
        state: string,
        tokenAmount: {
            amount: string,
            decimals: number,
            uiAmount: number,
            uiAmountString: string
        }
    }
}