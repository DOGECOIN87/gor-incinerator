import { Keypair, Connection, PublicKey } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";

/**
 * Configuration class for managing environment variables and blockchain connection
 * Validates all required environment variables on initialization
 */
export class Config {
  public static RPC_URL: string;
  public static gorWallet: Wallet;
  public static connection: Connection;
  public static feeRecipient?: PublicKey;
  public static feePercentage: number;

  /**
   * Initialize configuration from environment variables
   * Throws error if required variables are missing or invalid
   */
  static initialize(): void {
    // Validate RPC_URL
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("Missing required environment variable: RPC_URL");
    }
    Config.RPC_URL = rpcUrl;

    // Validate WALLET
    const walletEnv = process.env.WALLET;
    if (!walletEnv) {
      throw new Error("Missing required environment variable: WALLET");
    }

    try {
      const walletArray = JSON.parse(walletEnv);
      if (!Array.isArray(walletArray)) {
        throw new Error("WALLET must be a JSON array");
      }
      const walletUint8 = Uint8Array.from(walletArray);
      if (walletUint8.length < 32) {
        throw new Error("WALLET must contain at least 32 bytes");
      }
      const keypair = Keypair.fromSeed(walletUint8.slice(0, 32));
      Config.gorWallet = new Wallet(keypair);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Invalid WALLET format: ${error.message}`);
      }
      throw new Error("Invalid WALLET format");
    }

    // Initialize connection with "processed" commitment
    Config.connection = new Connection(Config.RPC_URL, {
      commitment: "processed",
    });

    // Validate and set FEE_RECIPIENT if provided
    const feeRecipientEnv = process.env.FEE_RECIPIENT;
    if (feeRecipientEnv) {
      try {
        Config.feeRecipient = new PublicKey(feeRecipientEnv);
      } catch (error) {
        throw new Error(`Invalid FEE_RECIPIENT format: ${feeRecipientEnv}`);
      }
    }

    // Validate and set FEE_PERCENTAGE with default of 5
    const feePercentageEnv = process.env.FEE_PERCENTAGE;
    if (feePercentageEnv) {
      const feePercentage = parseFloat(feePercentageEnv);
      if (isNaN(feePercentage) || feePercentage < 0 || feePercentage > 100) {
        throw new Error(
          `Invalid FEE_PERCENTAGE: must be a number between 0 and 100`
        );
      }
      Config.feePercentage = feePercentage;
    } else {
      Config.feePercentage = 5;
    }
  }
}
