import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { FeeCalculation } from "../types/index";
import { Config } from "../config";
import { Logger } from "../utils/logger";
import { ValidationError } from "../utils/errors";

/**
 * Service for calculating and creating fee transfer instructions
 * Handles the 5% fee collection from rent reclaimed
 */
export class FeeService {
  // Rent per token account on Solana/Gorbagana (approximately 0.00203928 SOL/GOR)
  private static readonly RENT_PER_ACCOUNT = 0.00203928 * LAMPORTS_PER_SOL;

  /**
   * Calculates fee details based on number of accounts closed
   * @param accountCount - Number of token accounts being closed
   * @returns Fee calculation details including total rent, fee amount, and net amount
   */
  static calculateFee(accountCount: number): FeeCalculation {
    if (accountCount <= 0) {
      throw new ValidationError("Account count must be positive");
    }

    const totalRent = accountCount * this.RENT_PER_ACCOUNT;
    const feePercentage = Config.feePercentage;
    const feeAmount = Math.floor((totalRent * feePercentage) / 100);
    const netAmount = totalRent - feeAmount;

    Logger.debug("Fee calculation", {
      accountCount,
      totalRent: totalRent / LAMPORTS_PER_SOL,
      feePercentage,
      feeAmount: feeAmount / LAMPORTS_PER_SOL,
      netAmount: netAmount / LAMPORTS_PER_SOL,
    });

    return {
      totalRent,
      feePercentage,
      feeAmount,
      netAmount,
    };
  }

  /**
   * Creates a fee transfer instruction if fee recipient is configured
   * @param accountCount - Number of accounts being closed
   * @param payer - The wallet paying/receiving the rent
   * @returns Transfer instruction or null if no fee recipient configured
   */
  static createFeeInstruction(
    accountCount: number,
    payer: PublicKey
  ): TransactionInstruction | null {
    // If no fee recipient is configured, return null
    if (!Config.feeRecipient) {
      Logger.debug("No fee recipient configured, skipping fee collection");
      return null;
    }

    // If fee percentage is 0, return null
    if (Config.feePercentage === 0) {
      Logger.debug("Fee percentage is 0, skipping fee collection");
      return null;
    }

    const feeCalc = this.calculateFee(accountCount);

    // Only create instruction if fee amount is greater than 0
    if (feeCalc.feeAmount <= 0) {
      Logger.debug("Fee amount is 0, skipping fee collection");
      return null;
    }

    Logger.info("Creating fee transfer instruction", {
      recipient: Config.feeRecipient.toString(),
      amount: feeCalc.feeAmount / LAMPORTS_PER_SOL,
      percentage: Config.feePercentage,
    });

    return SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: Config.feeRecipient,
      lamports: feeCalc.feeAmount,
    });
  }

  /**
   * Validates fee configuration
   * @throws ValidationError if configuration is invalid
   */
  static validateFeeConfig(): void {
    if (Config.feePercentage < 0 || Config.feePercentage > 100) {
      throw new ValidationError(
        `Invalid fee percentage: ${Config.feePercentage}. Must be between 0 and 100.`
      );
    }

    if (Config.feeRecipient) {
      try {
        // Validate that fee recipient is a valid public key
        new PublicKey(Config.feeRecipient);
      } catch (error) {
        throw new ValidationError(
          `Invalid fee recipient public key: ${Config.feeRecipient}`
        );
      }
    }

    Logger.debug("Fee configuration validated", {
      feePercentage: Config.feePercentage,
      feeRecipient: Config.feeRecipient?.toString() || "not configured",
    });
  }
}
