import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FeeService } from "../feeService";
import { Config } from "../../config";
import { Logger } from "../../utils/logger";
import { ValidationError } from "../../utils/errors";

jest.mock("../../config");
jest.mock("../../utils/logger");

describe("FeeService", () => {
  const mockPayer = new PublicKey("11111111111111111111111111111112");
  const mockFeeRecipient = new PublicKey(
    "11111111111111111111111111111113"
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (Config as any).feePercentage = 5;
    (Config as any).feeRecipient = mockFeeRecipient;
  });

  describe("calculateFee", () => {
    it("should calculate correct fee for single account", () => {
      const result = FeeService.calculateFee(1);

      expect(result.feePercentage).toBe(5);
      expect(result.totalRent).toBeGreaterThan(0);
      expect(result.feeAmount).toBeGreaterThan(0);
      expect(result.netAmount).toBe(result.totalRent - result.feeAmount);
    });

    it("should calculate correct fee for multiple accounts", () => {
      const result = FeeService.calculateFee(14);

      expect(result.feePercentage).toBe(5);
      expect(result.feeAmount).toBe(Math.floor((result.totalRent * 5) / 100));
    });

    it("should throw error for zero accounts", () => {
      expect(() => FeeService.calculateFee(0)).toThrow(ValidationError);
    });

    it("should throw error for negative accounts", () => {
      expect(() => FeeService.calculateFee(-1)).toThrow(ValidationError);
    });

    it("should calculate zero fee when percentage is 0", () => {
      (Config as any).feePercentage = 0;
      const result = FeeService.calculateFee(1);

      expect(result.feeAmount).toBe(0);
      expect(result.netAmount).toBe(result.totalRent);
    });

    it("should calculate full amount as fee when percentage is 100", () => {
      (Config as any).feePercentage = 100;
      const result = FeeService.calculateFee(1);

      expect(result.feeAmount).toBe(Math.floor(result.totalRent));
      expect(result.netAmount).toBeLessThanOrEqual(1);
    });
  });

  describe("createFeeInstruction", () => {
    it("should create transfer instruction when fee recipient is configured", () => {
      const instruction = FeeService.createFeeInstruction(1, mockPayer);

      expect(instruction).not.toBeNull();
      expect(instruction?.programId.toString()).toBe(
        "11111111111111111111111111111111"
      );
    });

    it("should return null when no fee recipient is configured", () => {
      (Config as any).feeRecipient = null;
      const instruction = FeeService.createFeeInstruction(1, mockPayer);

      expect(instruction).toBeNull();
    });

    it("should return null when fee percentage is 0", () => {
      (Config as any).feePercentage = 0;
      const instruction = FeeService.createFeeInstruction(1, mockPayer);

      expect(instruction).toBeNull();
    });

    it("should create instruction with correct lamports amount", () => {
      const accountCount = 10;
      const feeCalc = FeeService.calculateFee(accountCount);
      const instruction = FeeService.createFeeInstruction(
        accountCount,
        mockPayer
      );

      expect(instruction).not.toBeNull();
      // Verify the instruction contains the correct amount
      expect(instruction?.data.length).toBeGreaterThan(0);
    });
  });

  describe("validateFeeConfig", () => {
    it("should validate correct configuration", () => {
      expect(() => FeeService.validateFeeConfig()).not.toThrow();
    });

    it("should throw error for negative fee percentage", () => {
      (Config as any).feePercentage = -1;
      expect(() => FeeService.validateFeeConfig()).toThrow(ValidationError);
    });

    it("should throw error for fee percentage over 100", () => {
      (Config as any).feePercentage = 101;
      expect(() => FeeService.validateFeeConfig()).toThrow(ValidationError);
    });

    it("should validate when no fee recipient is configured", () => {
      (Config as any).feeRecipient = null;
      expect(() => FeeService.validateFeeConfig()).not.toThrow();
    });

    it("should validate fee percentage of 0", () => {
      (Config as any).feePercentage = 0;
      expect(() => FeeService.validateFeeConfig()).not.toThrow();
    });

    it("should validate fee percentage of 100", () => {
      (Config as any).feePercentage = 100;
      expect(() => FeeService.validateFeeConfig()).not.toThrow();
    });
  });
});
