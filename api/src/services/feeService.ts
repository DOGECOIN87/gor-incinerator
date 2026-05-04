/**
 * Fee calculation service with 50/50 split
 * Calculates fees for Aether Labs and Cook-incinerator
 */

import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { FeeCalculation, ValidationError } from "../types";

/**
 * Rent per token account on Cookie Chain (approximately 0.00203928 COOK)
 * This is the standard rent-exempt minimum for a token account
 */
export const RENT_PER_ACCOUNT = 0.00203928 * LAMPORTS_PER_SOL;

/**
 * Service fee percentage (5% of total rent reclaimed)
 */
export const FEE_PERCENTAGE = 5;

/**
 * Calculate fee breakdown with 50/50 split
 * @param accountCount - Number of token accounts being closed
 * @returns Fee calculation with split between Aether Labs and Cook-incinerator
 */
export function calculateFee(accountCount: number): FeeCalculation {
  if (accountCount <= 0) {
    throw new ValidationError("Account count must be positive");
  }

  if (accountCount > 14) {
    throw new ValidationError("Cannot close more than 14 accounts per transaction");
  }

  // Calculate total rent reclaimed
  const totalRent = Math.floor(accountCount * RENT_PER_ACCOUNT);

  // Calculate 5% service fee
  const serviceFee = Math.floor((totalRent * FEE_PERCENTAGE) / 100);

  // Split fee 50/50 between Aether Labs and Cook-incinerator
  const aetherLabsFee = Math.floor(serviceFee / 2);
  const cookIncineratorFee = Math.floor(serviceFee / 2);

  // Calculate net amount user receives (95% of total rent)
  const netAmount = totalRent - serviceFee;

  return {
    totalRent,
    serviceFee,
    aetherLabsFee,
    cookIncineratorFee,
    netAmount,
  };
}

/**
 * Create fee transfer instructions for both vault addresses
 * @param accountCount - Number of accounts being closed
 * @param payer - Wallet address paying the fees
 * @param aetherVaultAddress - Aether Labs vault address
 * @param incineratorVaultAddress - Cook-incinerator vault address
 * @returns Array of two transfer instructions (50/50 split)
 */
export function createFeeInstructions(
  accountCount: number,
  payer: PublicKey,
  aetherVaultAddress: string,
  incineratorVaultAddress: string
): TransactionInstruction[] {
  const feeCalc = calculateFee(accountCount);

  // Validate vault addresses
  let aetherVault: PublicKey;
  let incineratorVault: PublicKey;

  try {
    aetherVault = new PublicKey(aetherVaultAddress);
  } catch (error) {
    throw new ValidationError(`Invalid Aether Labs vault address: ${aetherVaultAddress}`);
  }

  try {
    incineratorVault = new PublicKey(incineratorVaultAddress);
  } catch (error) {
    throw new ValidationError(`Invalid Cook-incinerator vault address: ${incineratorVaultAddress}`);
  }

  const instructions: TransactionInstruction[] = [];

  // Only create instructions if fees are greater than 0
  if (feeCalc.aetherLabsFee > 0) {
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: aetherVault,
        lamports: feeCalc.aetherLabsFee,
      })
    );
  }

  if (feeCalc.cookIncineratorFee > 0) {
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: incineratorVault,
        lamports: feeCalc.cookIncineratorFee,
      })
    );
  }

  return instructions;
}

/**
 * Convert lamports to COOK for display
 * @param lamports - Amount in lamports
 * @returns Amount in COOK
 */
export function lamportsToCook(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Convert COOK to lamports
 * @param cook - Amount in COOK
 * @returns Amount in lamports
 */
export function cookToLamports(cook: number): number {
  return Math.floor(cook * LAMPORTS_PER_SOL);
}
