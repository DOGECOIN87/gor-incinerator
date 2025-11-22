import {
  PublicKey,
  Keypair,
  VersionedTransaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  TransactionMessage,
} from "@solana/web3.js";
import { TokenAccountInfo, TransactionResult } from "../types/index";
import { Logger } from "../utils/logger";
import { TransactionError, NetworkError } from "../utils/errors";
import { Config } from "../config";
import { FeeService } from "./feeService";

/**
 * Service for building, signing, and executing blockchain transactions
 * Handles transaction construction with compute budget optimization, signing, sending, and confirmation
 */
export class TransactionService {
  private static readonly COMPUTE_UNIT_PRICE = 1000; // microLamports
  private static readonly COMPUTE_UNIT_LIMIT = 45000; // units
  private static readonly MAX_RETRIES = 10;
  private static readonly CONFIRMATION_TIMEOUT = 60000; // 60 seconds in milliseconds

  /**
   * Builds a versioned transaction that closes multiple token accounts
   * Includes compute budget instructions for optimization
   * @param accounts - Array of token accounts to close
   * @param payer - The wallet that will pay for the transaction
   * @param recentBlockhash - Recent blockhash for the transaction
   * @returns A versioned transaction ready to be signed
   * @throws TransactionError if transaction building fails
   */
  static async buildCloseAccountsTransaction(
    accounts: TokenAccountInfo[],
    payer: PublicKey,
    recentBlockhash: string
  ): Promise<VersionedTransaction> {
    try {
      if (accounts.length === 0) {
        throw new TransactionError("Cannot build transaction with no accounts");
      }

      if (accounts.length > 14) {
        throw new TransactionError(
          "Cannot close more than 14 accounts in a single transaction"
        );
      }

      Logger.debug("Building close accounts transaction", {
        accountCount: accounts.length,
        payer: payer.toString(),
      });

      const instructions: TransactionInstruction[] = [];

      // Add compute budget instructions for optimization
      instructions.push(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: this.COMPUTE_UNIT_PRICE,
        })
      );

      instructions.push(
        ComputeBudgetProgram.setComputeUnitLimit({
          units: this.COMPUTE_UNIT_LIMIT,
        })
      );

      // Create close account instructions for each token account
      for (const account of accounts) {
        const closeInstruction = createCloseAccountInstruction(
          account.pubkey, // account to close
          payer, // destination for rent reclamation
          payer, // account owner
          [],
          TOKEN_PROGRAM_ID
        );
        instructions.push(closeInstruction);
      }

      // Add fee transfer instruction if configured
      const feeInstruction = FeeService.createFeeInstruction(
        accounts.length,
        payer
      );
      if (feeInstruction) {
        instructions.push(feeInstruction);
        Logger.debug("Added fee transfer instruction", {
          feePercentage: Config.feePercentage,
          recipient: Config.feeRecipient?.toString(),
        });
      }

      Logger.debug("Created instructions", {
        computeBudgetInstructions: 2,
        closeInstructions: accounts.length,
        feeInstructions: feeInstruction ? 1 : 0,
        totalInstructions: instructions.length,
      });

      // Create the transaction message
      const messageV0 = new TransactionMessage({
        payerKey: payer,
        recentBlockhash: recentBlockhash,
        instructions: instructions,
      }).compileToV0Message();

      // Create versioned transaction
      const transaction = new VersionedTransaction(messageV0);

      Logger.debug("Transaction built successfully", {
        size: transaction.serialize().length,
      });

      return transaction;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error("Failed to build transaction", { error: message });
      throw error instanceof TransactionError
        ? error
        : new TransactionError(`Failed to build transaction: ${message}`);
    }
  }

  /**
   * Executes a transaction by signing and sending it to the blockchain
   * Includes retry logic for failed sends
   * @param transaction - The versioned transaction to execute
   * @param wallet - The keypair to sign the transaction with
   * @param maxRetries - Maximum number of retries (default: 10)
   * @returns Transaction result with signature and success status
   * @throws TransactionError if all retries fail
   */
  static async executeTransaction(
    transaction: VersionedTransaction,
    wallet: Keypair,
    maxRetries: number = this.MAX_RETRIES
  ): Promise<TransactionResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.debug("Executing transaction", {
          attempt,
          maxRetries,
        });

        // Sign the transaction
        transaction.sign([wallet]);

        Logger.debug("Transaction signed", {
          signer: wallet.publicKey.toString(),
        });

        // Send the transaction with "processed" preflight commitment
        const signature = await Config.connection.sendTransaction(
          transaction,
          {
            skipPreflight: false,
            preflightCommitment: "processed",
          }
        );

        Logger.info("Transaction sent", {
          signature,
          attempt,
        });

        // Confirm the transaction
        const confirmed = await this.confirmTransaction(
          signature,
          transaction.message.recentBlockhash,
          0 // We'll use timeout instead of lastValidBlockHeight
        );

        if (confirmed) {
          Logger.info("Transaction confirmed", { signature });

          return {
            signature,
            success: true,
          };
        } else {
          throw new TransactionError("Transaction confirmation failed");
        }
      } catch (error) {
        lastError =
          error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          Logger.warn("Transaction execution failed, retrying", {
            attempt,
            error: lastError.message,
          });

          // Exponential backoff: wait 1s, 2s, 4s, etc.
          const delayMs = Math.pow(2, attempt - 1) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        } else {
          Logger.error("Transaction execution failed after all retries", {
            attempts: maxRetries,
            error: lastError.message,
          });
        }
      }
    }

    throw new TransactionError(
      `Failed to execute transaction after ${maxRetries} retries: ${lastError?.message || "Unknown error"}`
    );
  }

  /**
   * Confirms a transaction with "processed" commitment level
   * Includes timeout handling for transactions exceeding 60 seconds
   * @param signature - The transaction signature to confirm
   * @param blockhash - The blockhash used in the transaction
   * @param lastValidBlockHeight - The last valid block height (optional, uses timeout if not provided)
   * @returns true if transaction is confirmed, false if timeout or not confirmed
   * @throws NetworkError if RPC connection fails
   */
  static async confirmTransaction(
    signature: string,
    blockhash: string,
    lastValidBlockHeight: number = 0
  ): Promise<boolean> {
    try {
      Logger.debug("Confirming transaction", {
        signature,
        timeout: this.CONFIRMATION_TIMEOUT,
      });

      const startTime = Date.now();

      // Poll for confirmation with timeout
      while (Date.now() - startTime < this.CONFIRMATION_TIMEOUT) {
        try {
          const status = await Config.connection.getSignatureStatus(signature);

          if (status.value) {
            if (status.value.confirmationStatus === "processed") {
              Logger.debug("Transaction confirmation status: processed", {
                signature,
              });
              return true;
            }

            if (status.value.err) {
              Logger.error("Transaction failed on chain", {
                signature,
                error: JSON.stringify(status.value.err),
              });
              return false;
            }
          }

          // Wait before next poll
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          Logger.warn("Error checking transaction status", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
          // Continue polling on transient errors
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      Logger.warn("Transaction confirmation timeout", {
        signature,
        timeoutMs: this.CONFIRMATION_TIMEOUT,
      });

      return false;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error("Failed to confirm transaction", {
        signature,
        error: message,
      });
      throw new NetworkError(`Failed to confirm transaction: ${message}`);
    }
  }
}
