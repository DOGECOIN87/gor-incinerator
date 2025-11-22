import { PublicKey } from "@solana/web3.js";
import { AccountService } from "../accountService";
import { TokenAccountInfo } from "../../types/index";
import { Config } from "../../config";
import { Logger } from "../../utils/logger";

// Mock the Config and Logger modules
jest.mock("../../config");
jest.mock("../../utils/logger");

describe("AccountService", () => {
  const mockWallet = new PublicKey(
    "11111111111111111111111111111112"
  );
  const mockMint1 = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
  const mockMint2 = "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm";
  const mockMint3 = "So11111111111111111111111111111111111111112";

  // Create a mock connection object
  const mockConnection = {
    getParsedTokenAccountsByOwner: jest.fn(),
  };

  const createMockTokenAccount = (
    mint: string,
    balance: string,
    pubkey?: PublicKey
  ): TokenAccountInfo => ({
    pubkey: pubkey || new PublicKey("11111111111111111111111111111113"),
    mint,
    owner: mockWallet.toString(),
    balance,
    decimals: 6,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (Config as any).connection = mockConnection;
  });

  describe("isAccountEmpty", () => {
    it("should return true for accounts with zero balance", () => {
      const account = createMockTokenAccount(mockMint1, "0");
      expect(AccountService.isAccountEmpty(account)).toBe(true);
    });

    it("should return false for accounts with non-zero balance", () => {
      const account = createMockTokenAccount(mockMint1, "1000000");
      expect(AccountService.isAccountEmpty(account)).toBe(false);
    });

    it("should return false for accounts with large balances", () => {
      const account = createMockTokenAccount(mockMint1, "999999999999");
      expect(AccountService.isAccountEmpty(account)).toBe(false);
    });
  });

  describe("isAccountBlacklisted", () => {
    it("should return true if mint is in blacklist", () => {
      const account = createMockTokenAccount(mockMint1, "0");
      const blacklist = [mockMint1, mockMint2];
      expect(AccountService.isAccountBlacklisted(account, blacklist)).toBe(
        true
      );
    });

    it("should return false if mint is not in blacklist", () => {
      const account = createMockTokenAccount(mockMint3, "0");
      const blacklist = [mockMint1, mockMint2];
      expect(AccountService.isAccountBlacklisted(account, blacklist)).toBe(
        false
      );
    });

    it("should return false for empty blacklist", () => {
      const account = createMockTokenAccount(mockMint1, "0");
      expect(AccountService.isAccountBlacklisted(account, [])).toBe(false);
    });
  });

  describe("getEmptyTokenAccounts", () => {
    it("should filter and return only empty accounts", async () => {
      const mockAccounts = [
        {
          pubkey: new PublicKey("11111111111111111111111111111113"),
          account: {
            data: {
              parsed: {
                info: {
                  isNative: false,
                  mint: mockMint1,
                  owner: mockWallet.toString(),
                  state: "initialized",
                  tokenAmount: {
                    amount: "0",
                    decimals: 6,
                    uiAmount: 0,
                    uiAmountString: "0",
                  },
                },
              },
            },
          },
        },
        {
          pubkey: new PublicKey("11111111111111111111111111111114"),
          account: {
            data: {
              parsed: {
                info: {
                  isNative: false,
                  mint: mockMint2,
                  owner: mockWallet.toString(),
                  state: "initialized",
                  tokenAmount: {
                    amount: "1000000",
                    decimals: 6,
                    uiAmount: 1,
                    uiAmountString: "1",
                  },
                },
              },
            },
          },
        },
      ];

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue(
        { value: mockAccounts }
      );

      const result = await AccountService.getEmptyTokenAccounts(mockWallet);

      expect(result).toHaveLength(1);
      expect(result[0].mint).toBe(mockMint1);
      expect(result[0].balance).toBe("0");
    });

    it("should exclude blacklisted accounts", async () => {
      const mockAccounts = [
        {
          pubkey: new PublicKey("11111111111111111111111111111113"),
          account: {
            data: {
              parsed: {
                info: {
                  isNative: false,
                  mint: mockMint1,
                  owner: mockWallet.toString(),
                  state: "initialized",
                  tokenAmount: {
                    amount: "0",
                    decimals: 6,
                    uiAmount: 0,
                    uiAmountString: "0",
                  },
                },
              },
            },
          },
        },
        {
          pubkey: new PublicKey("11111111111111111111111111111114"),
          account: {
            data: {
              parsed: {
                info: {
                  isNative: false,
                  mint: mockMint2,
                  owner: mockWallet.toString(),
                  state: "initialized",
                  tokenAmount: {
                    amount: "0",
                    decimals: 6,
                    uiAmount: 0,
                    uiAmountString: "0",
                  },
                },
              },
            },
          },
        },
      ];

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue(
        { value: mockAccounts }
      );

      const blacklist = [mockMint1];
      const result = await AccountService.getEmptyTokenAccounts(
        mockWallet,
        blacklist
      );

      expect(result).toHaveLength(1);
      expect(result[0].mint).toBe(mockMint2);
    });

    it("should limit results to max batch size", async () => {
      const baseKey = "11111111111111111111111111111112";
      const mockAccounts = Array.from({ length: 20 }, (_, i) => ({
        pubkey: new PublicKey(baseKey),
        account: {
          data: {
            parsed: {
              info: {
                isNative: false,
                mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1${i}`,
                owner: mockWallet.toString(),
                state: "initialized",
                tokenAmount: {
                  amount: "0",
                  decimals: 6,
                  uiAmount: 0,
                  uiAmountString: "0",
                },
              },
            },
          },
        },
      }));

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue(
        { value: mockAccounts }
      );

      const result = await AccountService.getEmptyTokenAccounts(mockWallet);

      expect(result).toHaveLength(14);
    });

    it("should handle custom max accounts parameter", async () => {
      const baseKey = "11111111111111111111111111111112";
      const mockAccounts = Array.from({ length: 10 }, (_, i) => ({
        pubkey: new PublicKey(baseKey),
        account: {
          data: {
            parsed: {
              info: {
                isNative: false,
                mint: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1${i}`,
                owner: mockWallet.toString(),
                state: "initialized",
                tokenAmount: {
                  amount: "0",
                  decimals: 6,
                  uiAmount: 0,
                  uiAmountString: "0",
                },
              },
            },
          },
        },
      }));

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue(
        { value: mockAccounts }
      );

      const result = await AccountService.getEmptyTokenAccounts(
        mockWallet,
        [],
        5
      );

      expect(result).toHaveLength(5);
    });

    it("should skip malformed account data and continue processing", async () => {
      const mockAccounts = [
        {
          pubkey: new PublicKey("11111111111111111111111111111113"),
          account: {
            data: {
              parsed: {
                info: {
                  // Missing tokenAmount field - malformed
                  isNative: false,
                  mint: mockMint1,
                  owner: mockWallet.toString(),
                  state: "initialized",
                },
              },
            },
          },
        },
        {
          pubkey: new PublicKey("11111111111111111111111111111114"),
          account: {
            data: {
              parsed: {
                info: {
                  isNative: false,
                  mint: mockMint2,
                  owner: mockWallet.toString(),
                  state: "initialized",
                  tokenAmount: {
                    amount: "0",
                    decimals: 6,
                    uiAmount: 0,
                    uiAmountString: "0",
                  },
                },
              },
            },
          },
        },
      ];

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue(
        { value: mockAccounts }
      );

      const result = await AccountService.getEmptyTokenAccounts(mockWallet);

      expect(result).toHaveLength(1);
      expect(result[0].mint).toBe(mockMint2);
    });

    it("should return empty array when no accounts exist", async () => {
      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue(
        { value: [] }
      );

      const result = await AccountService.getEmptyTokenAccounts(mockWallet);

      expect(result).toHaveLength(0);
    });

    it("should return empty array when all accounts are blacklisted", async () => {
      const mockAccounts = [
        {
          pubkey: new PublicKey("11111111111111111111111111111113"),
          account: {
            data: {
              parsed: {
                info: {
                  isNative: false,
                  mint: mockMint1,
                  owner: mockWallet.toString(),
                  state: "initialized",
                  tokenAmount: {
                    amount: "0",
                    decimals: 6,
                    uiAmount: 0,
                    uiAmountString: "0",
                  },
                },
              },
            },
          },
        },
        {
          pubkey: new PublicKey("11111111111111111111111111111114"),
          account: {
            data: {
              parsed: {
                info: {
                  isNative: false,
                  mint: mockMint2,
                  owner: mockWallet.toString(),
                  state: "initialized",
                  tokenAmount: {
                    amount: "0",
                    decimals: 6,
                    uiAmount: 0,
                    uiAmountString: "0",
                  },
                },
              },
            },
          },
        },
      ];

      mockConnection.getParsedTokenAccountsByOwner.mockResolvedValue(
        { value: mockAccounts }
      );

      const blacklist = [mockMint1, mockMint2];
      const result = await AccountService.getEmptyTokenAccounts(
        mockWallet,
        blacklist
      );

      expect(result).toHaveLength(0);
    });

    it("should throw AccountError on RPC connection failure", async () => {
      mockConnection.getParsedTokenAccountsByOwner.mockRejectedValue(
        new Error("RPC connection failed")
      );

      await expect(
        AccountService.getEmptyTokenAccounts(mockWallet)
      ).rejects.toThrow("Failed to query token accounts");
    });
  });
});
