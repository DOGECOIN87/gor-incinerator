/**
 * Fee calculation service with 50/50 split
 * Calculates fees for Aether Labs and Gor-incinerator
 * Supports 0% fee discount for Gorbagio NFT holders
 */

import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { FeeCalculation, ValidationError } from "../types";

/**
 * Rent per token account on Gorbagana (approximately 0.00203928 GOR)
 * This is the standard rent-exempt minimum for a token account
 */
export const RENT_PER_ACCOUNT = 0.00203928 * LAMPORTS_PER_SOL;

/**
 * Service fee percentage (5% of total rent reclaimed)
 * Set to 0% for Gorbagio NFT holders
 */
export const FEE_PERCENTAGE = 5;

/**
 * Fee percentage for Gorbagio NFT holders (0%)
 */
export const GORBAGIO_FEE_PERCENTAGE = 0;

/**
 * Calculate fee breakdown with 50/50 split
 * @param accountCount - Number of token accounts being closed
 * @returns Fee calculation with split between Aether Labs and Gor-incinerator
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

  // Split fee 50/50 between Aether Labs and Gor-incinerator
  const aetherLabsFee = Math.floor(serviceFee / 2);
  const gorIncineratorFee = Math.floor(serviceFee / 2);

  // Calculate net amount user receives (95% of total rent)
  const netAmount = totalRent - serviceFee;

  return {
    totalRent,
    serviceFee,
    aetherLabsFee,
    gorIncineratorFee,
    netAmount,
  };
}

/**
 * Calculate fee breakdown with Gorbagio NFT holder discount
 * @param accountCount - Number of token accounts being closed
 * @param isGorbagioHolder - Whether wallet holds a Gorbagio NFT
 * @returns Fee calculation with 0% fees for Gorbagio holders
 */
export function calculateFeeWithDiscount(accountCount: number, isGorbagioHolder: boolean): FeeCalculation {
  if (accountCount <= 0) {
    throw new ValidationError("Account count must be positive");
  }

  if (accountCount > 14) {
    throw new ValidationError("Cannot close more than 14 accounts per transaction");
  }

  // Calculate total rent reclaimed
  const totalRent = Math.floor(accountCount * RENT_PER_ACCOUNT);

  // Apply 0% fee for Gorbagio NFT holders
  if (isGorbagioHolder) {
    return {
      totalRent,
      serviceFee: 0,
      aetherLabsFee: 0,
      gorIncineratorFee: 0,
      netAmount: totalRent, // User receives 100% of rent
    };
  }

  // Standard 5% fee for non-holders
  return calculateFee(accountCount);
}

/**
 * Create fee transfer instructions for both vault addresses
 * @param accountCount - Number of accounts being closed
 * @param payer - Wallet address paying the fees
 * @param aetherVaultAddress - Aether Labs vault address
 * @param incineratorVaultAddress - Gor-incinerator vault address
 * @param isGorbagioHolder - Whether wallet holds a Gorbagio NFT (defaults to false)
 * @returns Array of transfer instructions (empty for Gorbagio holders)
 */
export function createFeeInstructions(
  accountCount: number,
  payer: PublicKey,
  aetherVaultAddress: string,
  incineratorVaultAddress: string,
  isGorbagioHolder: boolean = false
): TransactionInstruction[] {
  // Gorbagio NFT holders pay 0% fees - no transfer instructions needed
  if (isGorbagioHolder) {
    return [];
  }

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
    throw new ValidationError(`Invalid Gor-incinerator vault address: ${incineratorVaultAddress}`);
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

  if (feeCalc.gorIncineratorFee > 0) {
    instructions.push(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: incineratorVault,
        lamports: feeCalc.gorIncineratorFee,
      })
    );
  }

  return instructions;
}

/**
 * Convert lamports to GOR for display
 * @param lamports - Amount in lamports
 * @returns Amount in GOR
 */
export function lamportsToGor(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Convert GOR to lamports
 * @param gor - Amount in GOR
 * @returns Amount in lamports
 */
export function gorToLamports(gor: number): number {
  return Math.floor(gor * LAMPORTS_PER_SOL);
}
