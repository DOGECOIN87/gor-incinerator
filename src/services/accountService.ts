import { PublicKey } from "@solana/web3.js";
import { TokenAccountInfo, TokenAccountData } from "../types/index";
import { Logger } from "../utils/logger";
import { AccountError } from "../utils/errors";
import { Config } from "../config";

/**
 * Service for discovering, filtering, and validating token accounts
 * Handles querying token accounts from the blockchain and filtering based on balance and blacklist
 */
export class AccountService {
  private static readonly MAX_BATCH_SIZE = 14;

  /**
   * Retrieves empty token accounts for a wallet, filtered by blacklist and batch size
   * @param wallet - The wallet public key to query accounts for
   * @param blacklist - Array of mint addresses to exclude from results
   * @param maxAccounts - Maximum number of accounts to return (default: 14)
   * @returns Array of empty token accounts
   * @throws AccountError if account query fails or data is malformed
   */
  static async getEmptyTokenAccounts(
    wallet: PublicKey,
    blacklist: string[] = [],
    maxAccounts: number = this.MAX_BATCH_SIZE
  ): Promise<TokenAccountInfo[]> {
    try {
      Logger.debug("Querying token accounts", { wallet: wallet.toString() });

      // Query all token accounts owned by the wallet
      const accounts = await Config.connection.getParsedTokenAccountsByOwner(
        wallet,
        { programId: new PublicKey("TokenkegQfeZyiNwAJsyFbPVwwQQfuM32jneSYP1daM") }
      );

      Logger.debug("Retrieved token accounts", {
        count: accounts.value.length,
      });

      // Filter and map accounts
      const filteredAccounts: TokenAccountInfo[] = [];

      for (const account of accounts.value) {
        try {
          // Skip if we've reached the max batch size
          if (filteredAccounts.length >= maxAccounts) {
            break;
          }

          // Parse the account data
          const parsedData = account.account.data.parsed as TokenAccountData;

          // Create TokenAccountInfo object
          const tokenAccount: TokenAccountInfo = {
            pubkey: account.pubkey,
            mint: parsedData.info.mint,
            owner: parsedData.info.owner,
            balance: parsedData.info.tokenAmount.amount,
            decimals: parsedData.info.tokenAmount.decimals,
          };

          // Check if account is empty and not blacklisted
          if (
            this.isAccountEmpty(tokenAccount) &&
            !this.isAccountBlacklisted(tokenAccount, blacklist)
          ) {
            filteredAccounts.push(tokenAccount);
          }
        } catch (error) {
          // Log malformed data but continue processing other accounts
          Logger.warn("Skipping malformed token account", {
            pubkey: account.pubkey.toString(),
            error: error instanceof Error ? error.message : "Unknown error",
          });
          continue;
        }
      }

      Logger.info("Filtered empty token accounts", {
        total: accounts.value.length,
        empty: filteredAccounts.length,
        blacklisted: accounts.value.length - filteredAccounts.length,
      });

      return filteredAccounts;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      Logger.error("Failed to query token accounts", { error: message });
      throw new AccountError(`Failed to query token accounts: ${message}`);
    }
  }

  /**
   * Checks if a token account has zero balance
   * @param account - The token account to check
   * @returns true if account balance is zero, false otherwise
   */
  static isAccountEmpty(account: TokenAccountInfo): boolean {
    return account.balance === "0";
  }

  /**
   * Checks if a token account's mint is in the blacklist
   * @param account - The token account to check
   * @param blacklist - Array of mint addresses to check against
   * @returns true if account mint is blacklisted, false otherwise
   */
  static isAccountBlacklisted(
    account: TokenAccountInfo,
    blacklist: string[]
  ): boolean {
    return blacklist.includes(account.mint);
  }
}
