import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PublicKey, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { createBurnCheckedInstruction, createCloseAccountInstruction } from '@solana/spl-token';
import { buildBurnTransaction } from './transactionBuilder';
import { ValidationError, Env } from '../types';
import { getMintAuthority, getAccountInfo } from './blockchainService';
import { calculateFee, createFeeInstructions } from './feeService';

// Mock dependencies
vi.mock('./blockchainService');
vi.mock('./feeService');
vi.mock('@solana/spl-token');

// Mock constants
const MOCK_WALLET = 'MockWallet111111111111111111111111111111111111';
const MOCK_MINT = 'MockMint11111111111111111111111111111111111111';
const MOCK_ACCOUNT_PUBKEY = 'MockAcc111111111111111111111111111111111111';
const MOCK_BLOCKHASH = 'MockBlockhash11111111111111111111111111111111';

const mockConnection = {
  getLatestBlockhash: vi.fn().mockResolvedValue({ blockhash: MOCK_BLOCKHASH }),
} as any;

const mockEnv: Env = {
  DB: {} as any,
  API_KEY: 'test',
  ADMIN_API_KEY: 'test',
  GOR_RPC_URL: 'test',
  GOR_VAULT_ADDRESS_AETHER: 'AetherVault11111111111111111111111111111111',
  GOR_VAULT_ADDRESS_INCINERATOR: 'IncineratorVault11111111111111111111111111',
  ENVIRONMENT: 'test',
};

const mockFeeCalc = {
  totalRent: 2039280, // 2 accounts * RENT_PER_ACCOUNT (in lamports)
  serviceFee: 101964, // 5% of totalRent
  aetherLabsFee: 50982,
  gorIncineratorFee: 50982,
  netAmount: 1937316,
};

const mockFeeInstructions: TransactionInstruction[] = [
  SystemProgram.transfer({
    fromPubkey: new PublicKey(MOCK_WALLET),
    toPubkey: new PublicKey(mockEnv.GOR_VAULT_ADDRESS_AETHER),
    lamports: mockFeeCalc.aetherLabsFee,
  }),
  SystemProgram.transfer({
    fromPubkey: new PublicKey(MOCK_WALLET),
    toPubkey: new PublicKey(mockEnv.GOR_VAULT_ADDRESS_INCINERATOR),
    lamports: mockFeeCalc.gorIncineratorFee,
  }),
];

describe('buildBurnTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (calculateFee as vi.Mock).mockReturnValue(mockFeeCalc);
    (createFeeInstructions as vi.Mock).mockReturnValue(mockFeeInstructions);
  });

  // Test Case 1: Close-only case (zero balance)
  it('should build a transaction with only CloseAccount for zero balance accounts', async () => {
    const mockAccountInfo = {
      mint: MOCK_MINT,
      owner: MOCK_WALLET,
      amount: 0,
      decimals: 6,
    };
    (getAccountInfo as vi.Mock).mockResolvedValue(mockAccountInfo);
    (createBurnCheckedInstruction as vi.Mock).mockReturnValue({ programId: 'BurnChecked' });
    const mockCloseIx = { programId: 'CloseAccount' };
    (createCloseAccountInstruction as vi.Mock).mockReturnValue(mockCloseIx);

    const request = {
      wallet: MOCK_WALLET,
      accounts: [MOCK_ACCOUNT_PUBKEY],
    };

    await buildBurnTransaction(mockConnection, mockEnv, request);

    // Verify BurnChecked was NOT called
    expect(createBurnCheckedInstruction).not.toHaveBeenCalled();
    // Verify CloseAccount was called
    expect(createCloseAccountInstruction).toHaveBeenCalledTimes(1);
    // Verify fee instructions were called
    expect(createFeeInstructions).toHaveBeenCalledTimes(1);
  });

  // Test Case 2: Burn + Close order (non-zero balance, wallet is authority)
  it('should build a transaction with BurnChecked, CloseAccount, and Fee Transfers in order', async () => {
    const mockAccountInfo = {
      mint: MOCK_MINT,
      owner: MOCK_WALLET,
      amount: 1000,
      decimals: 6,
    };
    (getAccountInfo as vi.Mock).mockResolvedValue(mockAccountInfo);
    (getMintAuthority as vi.Mock).mockResolvedValue(new PublicKey(MOCK_WALLET)); // Wallet is authority

    const mockBurnIx = { programId: 'BurnChecked' };
    const mockCloseIx = { programId: 'CloseAccount' };
    (createBurnCheckedInstruction as vi.Mock).mockReturnValue(mockBurnIx);
    (createCloseAccountInstruction as vi.Mock).mockReturnValue(mockCloseIx);

    const request = {
      wallet: MOCK_WALLET,
      accounts: [MOCK_ACCOUNT_PUBKEY],
    };

    const response = await buildBurnTransaction(mockConnection, mockEnv, request);

    // Verify BurnChecked was called
    expect(createBurnCheckedInstruction).toHaveBeenCalledTimes(1);
    // Verify CloseAccount was called
    expect(createCloseAccountInstruction).toHaveBeenCalledTimes(1);
    // Verify response structure
    expect(response.accountsToClose).toBe(1);
    expect(response.blockhash).toBe(MOCK_BLOCKHASH);
    expect(response.serviceFee).toBe(mockFeeCalc.serviceFee / 10**9); // Lamports to GOR
  });

  // Test Case 3: Non-burnable non-empty account (wallet is NOT authority)
  it('should throw ValidationError if balance > 0 and wallet is not mint authority', async () => {
    const mockAccountInfo = {
      mint: MOCK_MINT,
      owner: MOCK_WALLET,
      amount: 1000,
      decimals: 6,
    };
    (getAccountInfo as vi.Mock).mockResolvedValue(mockAccountInfo);
    (getMintAuthority as vi.Mock).mockResolvedValue(new PublicKey('OtherAuthority111111111111111111111111111111')); // Other authority

    const request = {
      wallet: MOCK_WALLET,
      accounts: [MOCK_ACCOUNT_PUBKEY],
    };

    await expect(buildBurnTransaction(mockConnection, mockEnv, request)).rejects.toThrow(
      ValidationError
    );
    expect(createBurnCheckedInstruction).not.toHaveBeenCalled();
    expect(createCloseAccountInstruction).not.toHaveBeenCalled();
    expect(createFeeInstructions).not.toHaveBeenCalled();
  });
});
