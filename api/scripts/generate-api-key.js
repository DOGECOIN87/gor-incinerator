#!/usr/bin/env node

/**
 * API Key Generation Script
 * Generates secure API keys in format: gorincin_[32_char_random]
 * 
 * Usage:
 *   node generate-api-key.js
 *   node generate-api-key.js --partner "Aether Labs"
 */

const crypto = require('crypto');

/**
 * Generate a secure API key
 * @param {string} partner - Partner name (optional)
 * @returns {object} API key details
 */
function generateAPIKey(partner = 'default') {
  // Generate 32 random bytes and convert to hex (64 characters)
  const randomBytes = crypto.randomBytes(32);
  const randomHex = randomBytes.toString('hex');
  
  // Create API key in format: gorincin_[random]
  const apiKey = `gorincin_${randomHex}`;
  
  // Generate creation timestamp
  const createdAt = new Date().toISOString();
  
  // Generate key ID (first 8 chars of SHA256 hash)
  const keyId = crypto.createHash('sha256').update(apiKey).digest('hex').substring(0, 8);
  
  return {
    keyId,
    apiKey,
    partner,
    createdAt,
    format: 'gorincin_[64_hex_chars]',
    length: apiKey.length,
  };
}

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  let partner = 'default';
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--partner' && args[i + 1]) {
      partner = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
API Key Generation Script

Usage:
  node generate-api-key.js [options]

Options:
  --partner <name>    Partner name (e.g., "Aether Labs")
  --help, -h          Show this help message

Examples:
  node generate-api-key.js
  node generate-api-key.js --partner "Aether Labs"
      `);
      process.exit(0);
    }
  }
  
  return { partner };
}

/**
 * Main function
 */
function main() {
  const { partner } = parseArgs();
  
  console.log('\n🔑 Generating API Key...\n');
  
  const keyData = generateAPIKey(partner);
  
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log('  API KEY GENERATED');
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log();
  console.log(`  Key ID:      ${keyData.keyId}`);
  console.log(`  Partner:     ${keyData.partner}`);
  console.log(`  Created:     ${keyData.createdAt}`);
  console.log(`  Length:      ${keyData.length} characters`);
  console.log();
  console.log('  API Key:');
  console.log(`  ${keyData.apiKey}`);
  console.log();
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log();
  console.log('⚠️  IMPORTANT: Store this API key securely!');
  console.log('   - This key will NOT be shown again');
  console.log('   - Store in a password manager or secure vault');
  console.log('   - Never commit to version control');
  console.log('   - Use environment variables or secrets management');
  console.log();
  console.log('📝 Next Steps:');
  console.log();
  console.log('   1. Store the API key securely');
  console.log('   2. Set as Cloudflare Worker secret:');
  console.log('      wrangler secret put API_KEY');
  console.log();
  console.log('   3. For admin access, set as admin key:');
  console.log('      wrangler secret put ADMIN_API_KEY');
  console.log();
  console.log('   4. Test the API key:');
  console.log('      curl -H "x-api-key: YOUR_API_KEY" https://api.gor-incinerator.com/health');
  console.log();
  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log();
}

// Run the script
main();
