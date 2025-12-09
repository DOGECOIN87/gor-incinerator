import { describe, it, expect, vi } from 'vitest';
import { PublicKey } from '@solana/web3.js';
import {
  enrichTokenAccounts,
  TOKEN_BLACKLIST,
  getMintAuthority,
  isBlacklisted,
} from './blockchainService';
import { ParsedTokenAccountData } from '../types';

// Mock dependencies
vi.mock('./blockchainService', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./blockchainService')>();
  return {
    ...mod,
    getMintAuthority: vi.fn(),
    isBlacklisted: vi.fn((mint: string) => mod.TOKEN_BLACKLIST.includes(mint)),
  };
});

// Mock constants
const MOCK_WALLET = 'MockWallet111111111111111111111111111111111111';
const MOCK_MINT_A = 'MintA1111111111111111111111111111111111111111';
const MOCK_MINT_B = 'MintB1111111111111111111111111111111111111111';
const MOCK_MINT_BLACKLISTED = TOKEN_BLACKLIST[0];

const mockConnection = {} as any; // Mock connection object

const createMockAccount = (
  pubkey: string,
  mint: string,
  amount: string,
  decimals: number
): ParsedTokenAccountData => ({
  pubkey: new PublicKey(pubkey),
  account: {
    data: {
      parsed: {
        info: {
          isNative: false,
          mint: mint,
          owner: MOCK_WALLET,
          state: 'initialized',
          tokenAmount: {
            amount: amount,
            decimals: decimals,
            uiAmount: Number(amount) / 10 ** decimals,
            uiAmountString: (Number(amount) / 10 ** decimals).toString(),
          },
        },
      },
    },
  },
});

describe('Burn Eligibility Logic (enrichTokenAccounts)', () => {
  const walletPubkey = new PublicKey(MOCK_WALLET);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test Case 1: Empty Account (balance === "0")
  it('should be burnEligible if the account balance is zero', async () => {
    const mockAccount = createMockAccount('Acc111111111111111111111111111111111111', MOCK_MINT_A, '0', 6);
    (getMintAuthority as vi.Mock).mockResolvedValue(null); // Authority check is skipped for zero balance

    const result = await enrichTokenAccounts(mockConnection, walletPubkey, [mockAccount]);

    expect(result[0].burnEligible).toBe(true);
    expect(result[0].authComment).toBe('Zero balance, allowing close.');
    expect(getMintAuthority).not.toHaveBeenCalled();
  });

  // Test Case 2: Burnable Non-Empty Account (wallet is mint authority)
  it('should be burnEligible if balance > 0 and wallet is mint authority', async () => {
    const mockAccount = createMockAccount('Acc222222222222222222222222222222222222', MOCK_MINT_A, '1000', 6);
    (getMintAuthority as vi.Mock).mockResolvedValue(walletPubkey); // Wallet is mint authority

    const result = await enrichTokenAccounts(mockConnection, walletPubkey, [mockAccount]);

    expect(result[0].burnEligible).toBe(true);
    expect(result[0].authComment).toBe('Wallet is Mint Authority, allowing burn of non-zero balance.');
    expect(getMintAuthority).toHaveBeenCalledWith(mockConnection, new PublicKey(MOCK_MINT_A));
  });

  // Test Case 3: Non-Burnable Non-Empty Account (wallet is NOT mint authority)
  it('should NOT be burnEligible if balance > 0 and wallet is NOT mint authority', async () => {
    const mockAuthority = new PublicKey('OtherAuthority111111111111111111111111111111');
    const mockAccount = createMockAccount('Acc333333333333333333333333333333333333', MOCK_MINT_B, '500', 9);
    (getMintAuthority as vi.Mock).mockResolvedValue(mockAuthority); // Other authority

    const result = await enrichTokenAccounts(mockConnection, walletPubkey, [mockAccount]);

    expect(result[0].burnEligible).toBe(false);
    expect(result[0].authComment).toBe('Non-zero balance, and wallet is not Mint Authority, cannot be burned/closed.');
    expect(getMintAuthority).toHaveBeenCalled();
  });

  // Test Case 4: Blacklisted Account (zero balance)
  it('should NOT be burnEligible if the mint is blacklisted, even with zero balance', async () => {
    const mockAccount = createMockAccount('Acc444444444444444444444444444444444444', MOCK_MINT_BLACKLISTED, '0', 6);
    
    const result = await enrichTokenAccounts(mockConnection, walletPubkey, [mockAccount]);

    expect(result[0].burnEligible).toBe(false);
    expect(result[0].authComment).toBe('Blacklisted token, cannot be burned or closed.');
    expect(getMintAuthority).not.toHaveBeenCalled();
  });

  // Test Case 5: Blacklisted Account (non-zero balance, wallet is authority)
  it('should NOT be burnEligible if the mint is blacklisted, even if wallet is mint authority', async () => {
    const mockAccount = createMockAccount('Acc555555555555555555555555555555555555', MOCK_MINT_BLACKLISTED, '100', 6);
    (getMintAuthority as vi.Mock).mockResolvedValue(walletPubkey); // Wallet is mint authority

    const result = await enrichTokenAccounts(mockConnection, walletPubkey, [mockAccount]);

    expect(result[0].burnEligible).toBe(false);
    expect(result[0].authComment).toBe('Blacklisted token, cannot be burned or closed.');
    // getMintAuthority is called because balance > 0, but the blacklist check takes precedence
    expect(getMintAuthority).toHaveBeenCalled(); 
  });
});
