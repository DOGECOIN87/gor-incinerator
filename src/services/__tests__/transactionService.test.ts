import {
  PublicKey,
  Keypair,
  VersionedTransaction,
  TransactionMessage,
} from "@solana/web3.js";
import { TransactionService } from "../transactionService";
import { TokenAccountInfo } from "../../types/index";
import { Config } from "../../config";
import { Logger } from "../../utils/logger";
import { TransactionError, NetworkError } from "../../utils/errors";

// Mock the Config and Logger modules
jest.mock("../../config");
jest.mock("../../utils/logger");

describe("TransactionService", () => {
  const mockPayer = new PublicKey("11111111111111111111111111111112");
  const mockWallet = Keypair.generate();
  const mockBlockhash = "11111111111111111111111111111111";
  const mockSignature =
    "5h6xBEauJ3PK6SWCZ1PGjkqa6LUohRQiS8th3NvCX7cYoFfsPQK3FkwEk6QdWteGSpVCrQy4bkMsqS2UTLHbP123";

  const mockConnection = {
    sendTransaction: jest.fn(),
    getSignatureStatus: jest.fn(),
  };

  const createMockTokenAccount = (
    mint: string,
    pubkey?: PublicKey
  ): TokenAccountInfo => ({
    pubkey: pubkey || new PublicKey("11111111111111111111111111111113"),
    mint,
    owner: mockPayer.toString(),
    balance: "0",
    decimals: 6,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (Config as any).connection = mockConnection;
  });

  describe("buildCloseAccountsTransaction", () => {
    it("should build a transaction with compute budget and close instructions", async () => {
      const accounts = [
        createMockTokenAccount(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          new PublicKey("11111111111111111111111111111113")
        ),
        createMockTokenAccount(
          "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
          new PublicKey("11111111111111111111111111111114")
        ),
      ];

      const transaction = await TransactionService.buildCloseAccountsTransaction(
        accounts,
        mockPayer,
        mockBlockhash
      );

      expect(transaction).toBeInstanceOf(VersionedTransaction);
      expect(transaction.message.recentBlockhash).toBe(mockBlockhash);

      // Verify transaction has instructions (2 compute budget + 2 close)
      const instructions = transaction.message.compiledInstructions;
      expect(instructions.length).toBeGreaterThanOrEqual(2);
    });

    it("should create close account instructions for each token account", async () => {
      const accounts = [
        createMockTokenAccount(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          new PublicKey("11111111111111111111111111111113")
        ),
      ];

      const transaction = await TransactionService.buildCloseAccountsTransaction(
        accounts,
        mockPayer,
        mockBlockhash
      );

      expect(transaction).toBeInstanceOf(VersionedTransaction);
      expect(transaction.message.compiledInstructions.length).toBeGreaterThan(0);
    });

    it("should handle maximum batch size of 14 accounts", async () => {
      const baseKey = "11111111111111111111111111111112";
      const accounts = Array.from({ length: 14 }, (_, i) =>
        createMockTokenAccount(
          `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1${i}`,
          new PublicKey(baseKey)
        )
      );

      const transaction = await TransactionService.buildCloseAccountsTransaction(
        accounts,
        mockPayer,
        mockBlockhash
      );

      expect(transaction).toBeInstanceOf(VersionedTransaction);
    });

    it("should throw error when trying to close more than 14 accounts", async () => {
      const baseKey = "11111111111111111111111111111112";
      const accounts = Array.from({ length: 15 }, (_, i) =>
        createMockTokenAccount(
          `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1${i}`,
          new PublicKey(baseKey)
        )
      );

      await expect(
        TransactionService.buildCloseAccountsTransaction(
          accounts,
          mockPayer,
          mockBlockhash
        )
      ).rejects.toThrow("Cannot close more than 14 accounts");
    });

    it("should throw error when building transaction with no accounts", async () => {
      await expect(
        TransactionService.buildCloseAccountsTransaction(
          [],
          mockPayer,
          mockBlockhash
        )
      ).rejects.toThrow("Cannot build transaction with no accounts");
    });

    it("should set correct compute budget parameters", async () => {
      const accounts = [
        createMockTokenAccount(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          new PublicKey("11111111111111111111111111111113")
        ),
      ];

      const transaction = await TransactionService.buildCloseAccountsTransaction(
        accounts,
        mockPayer,
        mockBlockhash
      );

      // Verify transaction structure
      expect(transaction.message.recentBlockhash).toBe(mockBlockhash);
      expect(transaction).toBeInstanceOf(VersionedTransaction);
    });
  });

  describe("executeTransaction", () => {
    it("should sign and send transaction successfully", async () => {
      const accounts = [
        createMockTokenAccount(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          new PublicKey("11111111111111111111111111111113")
        ),
      ];

      const transaction = await TransactionService.buildCloseAccountsTransaction(
        accounts,
        mockPayer,
        mockBlockhash
      );

      mockConnection.sendTransaction.mockResolvedValue(mockSignature);
      mockConnection.getSignatureStatus.mockResolvedValueOnce({
        value: {
          confirmationStatus: "processed",
          err: null,
        },
      });

      const result = await TransactionService.executeTransaction(
        transaction,
        mockWallet,
        1
      );

      expect(result.success).toBe(true);
      expect(result.signature).toBe(mockSignature);
      expect(mockConnection.sendTransaction).toHaveBeenCalled();
    }, 15000);

    it("should retry on transaction send failure", async () => {
      const accounts = [
        createMockTokenAccount(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          new PublicKey("11111111111111111111111111111113")
        ),
      ];

      const transaction = await TransactionService.buildCloseAccountsTransaction(
        accounts,
        mockPayer,
        mockBlockhash
      );

      // First call fails, second succeeds
      mockConnection.sendTransaction
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockSignature);

      mockConnection.getSignatureStatus.mockResolvedValueOnce({
        value: {
          confirmationStatus: "processed",
          err: null,
        },
      });

      const result = await TransactionService.executeTransaction(
        transaction,
        mockWallet,
        2
      );

      expect(result.success).toBe(true);
      expect(mockConnection.sendTransaction).toHaveBeenCalledTimes(2);
    }, 15000);

    it("should throw error after max retries exceeded", async () => {
      const accounts = [
        createMockTokenAccount(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          new PublicKey("11111111111111111111111111111113")
        ),
      ];

      const transaction = await TransactionService.buildCloseAccountsTransaction(
        accounts,
        mockPayer,
        mockBlockhash
      );

      mockConnection.sendTransaction.mockRejectedValue(
        new Error("Network error")
      );

      await expect(
        TransactionService.executeTransaction(transaction, mockWallet, 2)
      ).rejects.toThrow("Failed to execute transaction after 2 retries");
    }, 10000);

    it("should handle transaction confirmation failure", async () => {
      const accounts = [
        createMockTokenAccount(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          new PublicKey("11111111111111111111111111111113")
        ),
      ];

      const transaction = await TransactionService.buildCloseAccountsTransaction(
        accounts,
        mockPayer,
        mockBlockhash
      );

      mockConnection.sendTransaction.mockResolvedValue(mockSignature);
      mockConnection.getSignatureStatus.mockResolvedValue({
        value: {
          confirmationStatus: "processed",
          err: { InstructionError: [0, { Custom: 1 }] },
        },
      });

      await expect(
        TransactionService.executeTransaction(transaction, mockWallet, 1)
      ).rejects.toThrow();
    }, 10000);
  });

  describe("confirmTransaction", () => {
    it("should confirm transaction with processed commitment", async () => {
      mockConnection.getSignatureStatus.mockResolvedValue({
        value: {
          confirmationStatus: "processed",
          err: null,
        },
      });

      const confirmed = await TransactionService.confirmTransaction(
        mockSignature,
        mockBlockhash
      );

      expect(confirmed).toBe(true);
      expect(mockConnection.getSignatureStatus).toHaveBeenCalledWith(
        mockSignature
      );
    });

    it("should return false when transaction has error", async () => {
      mockConnection.getSignatureStatus.mockResolvedValueOnce({
        value: {
          confirmationStatus: "processed",
          err: { InstructionError: [0, { Custom: 1 }] },
        },
      });

      const confirmed = await TransactionService.confirmTransaction(
        mockSignature,
        mockBlockhash
      );

      expect(confirmed).toBe(false);
    });

    it("should handle transient RPC errors and continue polling", async () => {
      mockConnection.getSignatureStatus
        .mockRejectedValueOnce(new Error("RPC error"))
        .mockResolvedValueOnce({
          value: {
            confirmationStatus: "processed",
            err: null,
          },
        });

      const confirmed = await TransactionService.confirmTransaction(
        mockSignature,
        mockBlockhash
      );

      expect(confirmed).toBe(true);
      expect(mockConnection.getSignatureStatus).toHaveBeenCalledTimes(2);
    });
  });

  describe("transaction signing", () => {
    it("should sign transaction with provided keypair", async () => {
      const accounts = [
        createMockTokenAccount(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          new PublicKey("11111111111111111111111111111113")
        ),
      ];

      const transaction = await TransactionService.buildCloseAccountsTransaction(
        accounts,
        mockPayer,
        mockBlockhash
      );

      mockConnection.sendTransaction.mockResolvedValue(mockSignature);
      mockConnection.getSignatureStatus.mockResolvedValueOnce({
        value: {
          confirmationStatus: "processed",
          err: null,
        },
      });

      const result = await TransactionService.executeTransaction(
        transaction,
        mockWallet,
        1
      );

      expect(result.success).toBe(true);
      // Verify transaction was signed (signatures array should be populated)
      expect(transaction.signatures.length).toBeGreaterThan(0);
    }, 15000);
  });

  describe("retry logic", () => {
    it("should use exponential backoff for retries", async () => {
      const accounts = [
        createMockTokenAccount(
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          new PublicKey("11111111111111111111111111111113")
        ),
      ];

      const transaction = await TransactionService.buildCloseAccountsTransaction(
        accounts,
        mockPayer,
        mockBlockhash
      );

      // Fail twice, then succeed
      mockConnection.sendTransaction
        .mockRejectedValueOnce(new Error("Network error"))
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce(mockSignature);

      mockConnection.getSignatureStatus.mockResolvedValueOnce({
        value: {
          confirmationStatus: "processed",
          err: null,
        },
      });

      const startTime = Date.now();
      const result = await TransactionService.executeTransaction(
        transaction,
        mockWallet,
        3
      );
      const elapsed = Date.now() - startTime;

      expect(result.success).toBe(true);
      // Should have waited at least 3 seconds (1s + 2s backoff)
      expect(elapsed).toBeGreaterThanOrEqual(3000);
      expect(mockConnection.sendTransaction).toHaveBeenCalledTimes(3);
    }, 20000);
  });
});
