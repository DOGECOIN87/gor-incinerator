# Testing Guide - Gor-Incinerator API

Comprehensive testing guide for the Gor-Incinerator API implementation.

## 📋 Table of Contents

- [Testing Strategy](#testing-strategy)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [End-to-End Tests](#end-to-end-tests)
- [Load Testing](#load-testing)
- [Security Testing](#security-testing)
- [Manual Testing](#manual-testing)

---

## Testing Strategy

### Test Pyramid

```
         ╱╲
        ╱  ╲         E2E Tests (10%)
       ╱────╲        - Full user flows
      ╱      ╲       - Real blockchain interaction
     ╱────────╲      
    ╱          ╲     Integration Tests (30%)
   ╱────────────╲    - API endpoint tests
  ╱              ╲   - Database operations
 ╱────────────────╲  
╱__________________╲ Unit Tests (60%)
                     - Fee calculations
                     - Validation logic
                     - Utility functions
```

### Test Coverage Goals

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user flows
- **Load Tests**: 100 req/min sustained

---

## Unit Tests

### Fee Service Tests

Create `api/src/services/__tests__/feeService.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import { calculateFee, createFeeInstructions, lamportsToGor, gorToLamports } from '../feeService';
import { PublicKey } from '@solana/web3.js';

describe('Fee Service', () => {
  describe('calculateFee', () => {
    it('should calculate correct fees for 1 account', () => {
      const result = calculateFee(1);
      
      expect(result.totalRent).toBe(2039280); // lamports
      expect(result.serviceFee).toBe(101964); // 5%
      expect(result.aetherLabsFee).toBe(50982); // 2.5%
      expect(result.gorIncineratorFee).toBe(50982); // 2.5%
      expect(result.netAmount).toBe(1937316); // 95%
    });

    it('should calculate correct fees for 14 accounts', () => {
      const result = calculateFee(14);
      
      expect(result.totalRent).toBe(28549920); // lamports
      expect(result.serviceFee).toBe(1427496); // 5%
      expect(result.aetherLabsFee).toBe(713748); // 2.5%
      expect(result.gorIncineratorFee).toBe(713748); // 2.5%
      expect(result.netAmount).toBe(27122424); // 95%
    });

    it('should split fees evenly (50/50)', () => {
      const result = calculateFee(10);
      
      expect(result.aetherLabsFee).toBe(result.gorIncineratorFee);
      expect(result.aetherLabsFee + result.gorIncineratorFee).toBe(result.serviceFee);
    });

    it('should throw error for zero accounts', () => {
      expect(() => calculateFee(0)).toThrow('Account count must be positive');
    });

    it('should throw error for more than 14 accounts', () => {
      expect(() => calculateFee(15)).toThrow('Cannot close more than 14 accounts per transaction');
    });

    it('should throw error for negative accounts', () => {
      expect(() => calculateFee(-1)).toThrow('Account count must be positive');
    });
  });

  describe('createFeeInstructions', () => {
    const mockPayer = new PublicKey('8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP');
    const mockAetherVault = 'AetherVault111111111111111111111111111111';
    const mockIncineratorVault = 'IncineratorVault11111111111111111111111111';

    it('should create two transfer instructions', () => {
      const instructions = createFeeInstructions(
        10,
        mockPayer,
        mockAetherVault,
        mockIncineratorVault
      );

      expect(instructions).toHaveLength(2);
    });

    it('should create instructions with correct amounts', () => {
      const instructions = createFeeInstructions(
        10,
        mockPayer,
        mockAetherVault,
        mockIncineratorVault
      );

      const feeCalc = calculateFee(10);
      
      // First instruction should be for Aether Labs
      expect(instructions[0].data.readBigUInt64LE(4)).toBe(BigInt(feeCalc.aetherLabsFee));
      
      // Second instruction should be for Gor-incinerator
      expect(instructions[1].data.readBigUInt64LE(4)).toBe(BigInt(feeCalc.gorIncineratorFee));
    });

    it('should throw error for invalid Aether vault address', () => {
      expect(() => {
        createFeeInstructions(10, mockPayer, 'invalid', mockIncineratorVault);
      }).toThrow('Invalid Aether Labs vault address');
    });

    it('should throw error for invalid Incinerator vault address', () => {
      expect(() => {
        createFeeInstructions(10, mockPayer, mockAetherVault, 'invalid');
      }).toThrow('Invalid Gor-incinerator vault address');
    });
  });

  describe('lamportsToGor', () => {
    it('should convert lamports to GOR correctly', () => {
      expect(lamportsToGor(1000000000)).toBe(1); // 1 GOR
      expect(lamportsToGor(2039280)).toBeCloseTo(0.00203928, 8);
      expect(lamportsToGor(0)).toBe(0);
    });
  });

  describe('gorToLamports', () => {
    it('should convert GOR to lamports correctly', () => {
      expect(gorToLamports(1)).toBe(1000000000); // 1 GOR
      expect(gorToLamports(0.00203928)).toBe(2039280);
      expect(gorToLamports(0)).toBe(0);
    });

    it('should round down fractional lamports', () => {
      expect(gorToLamports(0.0000000015)).toBe(1); // Should floor
    });
  });
});
```

### Blockchain Service Tests

Create `api/src/services/__tests__/blockchainService.test.ts`:

```typescript
import { describe, it, expect } from '@jest/globals';
import { validateWalletAddress, validateAccountAddresses } from '../blockchainService';
import { PublicKey } from '@solana/web3.js';

describe('Blockchain Service', () => {
  describe('validateWalletAddress', () => {
    it('should validate correct wallet address', () => {
      const validAddress = '8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP';
      const result = validateWalletAddress(validAddress);
      
      expect(result).toBeInstanceOf(PublicKey);
      expect(result.toBase58()).toBe(validAddress);
    });

    it('should throw error for invalid address', () => {
      expect(() => validateWalletAddress('invalid')).toThrow();
    });

    it('should throw error for empty address', () => {
      expect(() => validateWalletAddress('')).toThrow();
    });
  });

  describe('validateAccountAddresses', () => {
    it('should validate array of correct addresses', () => {
      const addresses = [
        '8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP',
        'DzP3K8vQZ2nM5xLrT9wY1jH4sB6cF8dE7gA2hN9pK3qR'
      ];
      
      const result = validateAccountAddresses(addresses);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(PublicKey);
      expect(result[1]).toBeInstanceOf(PublicKey);
    });

    it('should throw error for invalid address in array', () => {
      const addresses = [
        '8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP',
        'invalid'
      ];
      
      expect(() => validateAccountAddresses(addresses)).toThrow();
    });

    it('should throw error for empty array', () => {
      expect(() => validateAccountAddresses([])).toThrow();
    });
  });
});
```

### Running Unit Tests

```bash
# Install Jest and dependencies
cd api
npm install --save-dev jest @jest/globals @types/jest ts-jest

# Configure Jest (jest.config.js)
cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
EOF

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## Integration Tests

### API Endpoint Tests

Create `api/src/__tests__/integration.test.ts`:

```typescript
import { describe, it, expect, beforeAll } from '@jest/globals';

describe('API Integration Tests', () => {
  const API_URL = process.env.API_URL || 'http://localhost:8787';
  const API_KEY = process.env.API_KEY || 'test_api_key';
  const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'test_admin_key';

  describe('GET /health', () => {
    it('should return 200 and service info', async () => {
      const response = await fetch(`${API_URL}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.service).toBe('Gor-Incinerator API');
      expect(data.status).toBe('healthy');
      expect(data.endpoints).toBeInstanceOf(Array);
    });
  });

  describe('GET /assets/:wallet', () => {
    it('should return 401 without API key', async () => {
      const response = await fetch(`${API_URL}/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP`);
      
      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid API key', async () => {
      const response = await fetch(
        `${API_URL}/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP`,
        {
          headers: { 'x-api-key': 'invalid_key' }
        }
      );
      
      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid wallet address', async () => {
      const response = await fetch(
        `${API_URL}/assets/invalid`,
        {
          headers: { 'x-api-key': API_KEY }
        }
      );
      
      expect(response.status).toBe(400);
    });

    it('should return 200 with valid API key and wallet', async () => {
      const response = await fetch(
        `${API_URL}/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP`,
        {
          headers: { 'x-api-key': API_KEY }
        }
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('wallet');
      expect(data).toHaveProperty('accounts');
      expect(data).toHaveProperty('summary');
    });
  });

  describe('POST /build-burn-tx', () => {
    it('should return 401 without API key', async () => {
      const response = await fetch(`${API_URL}/build-burn-tx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: '8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP',
          accounts: ['DzP3K8vQZ2nM5xLrT9wY1jH4sB6cF8dE7gA2hN9pK3qR']
        })
      });
      
      expect(response.status).toBe(401);
    });

    it('should return 400 for missing wallet', async () => {
      const response = await fetch(`${API_URL}/build-burn-tx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          accounts: ['DzP3K8vQZ2nM5xLrT9wY1jH4sB6cF8dE7gA2hN9pK3qR']
        })
      });
      
      expect(response.status).toBe(400);
    });

    it('should return 400 for missing accounts', async () => {
      const response = await fetch(`${API_URL}/build-burn-tx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          wallet: '8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP'
        })
      });
      
      expect(response.status).toBe(400);
    });

    it('should return 400 for more than 14 accounts', async () => {
      const accounts = Array(15).fill('DzP3K8vQZ2nM5xLrT9wY1jH4sB6cF8dE7gA2hN9pK3qR');
      
      const response = await fetch(`${API_URL}/build-burn-tx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          wallet: '8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP',
          accounts,
          maxAccounts: 15
        })
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /reconciliation/report', () => {
    it('should return 401 without admin API key', async () => {
      const response = await fetch(
        `${API_URL}/reconciliation/report?start=2025-01-01&end=2025-01-31`,
        {
          headers: { 'x-api-key': API_KEY } // Regular key, not admin
        }
      );
      
      expect(response.status).toBe(401);
    });

    it('should return 400 for missing start date', async () => {
      const response = await fetch(
        `${API_URL}/reconciliation/report?end=2025-01-31`,
        {
          headers: { 'x-api-key': ADMIN_API_KEY }
        }
      );
      
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid date format', async () => {
      const response = await fetch(
        `${API_URL}/reconciliation/report?start=2025-13-01&end=2025-01-31`,
        {
          headers: { 'x-api-key': ADMIN_API_KEY }
        }
      );
      
      expect(response.status).toBe(400);
    });

    it('should return 200 with valid admin key and dates', async () => {
      const response = await fetch(
        `${API_URL}/reconciliation/report?start=2025-01-01&end=2025-01-31`,
        {
          headers: { 'x-api-key': ADMIN_API_KEY }
        }
      );
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('period');
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('transactions');
    });
  });
});
```

### Running Integration Tests

```bash
# Set environment variables
export API_URL=http://localhost:8787
export API_KEY=your_test_api_key
export ADMIN_API_KEY=your_test_admin_key

# Start local dev server
npm run dev

# Run integration tests
npm test -- integration.test.ts
```

---

## Load Testing

### Using Apache Bench

```bash
# Test health endpoint (no auth)
ab -n 1000 -c 10 https://api.gor-incinerator.fun/health

# Test assets endpoint (with auth)
ab -n 1000 -c 10 -H "x-api-key: YOUR_API_KEY" \
  https://api.gor-incinerator.fun/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP
```

### Using k6

Create `api/tests/load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

const API_URL = 'https://api.gor-incinerator.fun';
const API_KEY = __ENV.API_KEY;

export default function () {
  // Test health endpoint
  const healthRes = http.get(`${API_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // Test assets endpoint
  const assetsRes = http.get(
    `${API_URL}/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP`,
    {
      headers: { 'x-api-key': API_KEY },
    }
  );
  check(assetsRes, {
    'assets status is 200': (r) => r.status === 200,
    'assets response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

Run with:

```bash
# Install k6
# macOS: brew install k6
# Linux: See https://k6.io/docs/getting-started/installation/

# Run load test
API_KEY=your_api_key k6 run api/tests/load-test.js
```

---

## Security Testing

### Authentication Tests

```bash
# Test missing API key
curl -i https://api.gor-incinerator.fun/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP
# Expected: 401 Unauthorized

# Test invalid API key
curl -i -H "x-api-key: invalid" \
  https://api.gor-incinerator.fun/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP
# Expected: 401 Unauthorized

# Test valid API key
curl -i -H "x-api-key: gorincin_YOUR_KEY" \
  https://api.gor-incinerator.fun/assets/8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP
# Expected: 200 OK
```

### Input Validation Tests

```bash
# Test SQL injection attempt
curl -X POST https://api.gor-incinerator.fun/build-burn-tx \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"wallet": "'; DROP TABLE transactions; --", "accounts": []}'
# Expected: 400 Bad Request

# Test XSS attempt
curl -X GET "https://api.gor-incinerator.fun/assets/<script>alert('xss')</script>" \
  -H "x-api-key: YOUR_KEY"
# Expected: 400 Bad Request

# Test oversized payload
dd if=/dev/zero bs=1M count=10 | curl -X POST \
  https://api.gor-incinerator.fun/build-burn-tx \
  -H "x-api-key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  --data-binary @-
# Expected: 413 Payload Too Large or 400 Bad Request
```

---

## Manual Testing

### Test Checklist

#### Pre-Deployment

- [ ] Health endpoint returns correct response
- [ ] API key authentication works
- [ ] Invalid API keys are rejected
- [ ] Assets endpoint returns burn-eligible accounts
- [ ] Build transaction endpoint returns valid transaction
- [ ] Transaction can be deserialized
- [ ] Fee calculations are correct (5% total, 50/50 split)
- [ ] Reconciliation endpoint requires admin key
- [ ] Date validation works correctly
- [ ] Error responses are properly formatted

#### Post-Deployment

- [ ] API is accessible via public URL
- [ ] HTTPS is working correctly
- [ ] CORS headers are set correctly
- [ ] Response times are under 500ms
- [ ] Rate limiting works (test 101 requests in 1 minute)
- [ ] Database logging is working
- [ ] Reconciliation reports are accurate
- [ ] Error tracking is working (check Sentry/logs)

#### Blockchain Integration

- [ ] Transactions can be signed by wallet
- [ ] Signed transactions broadcast successfully
- [ ] Transactions confirm on-chain
- [ ] Fees are transferred to correct vaults
- [ ] User receives 95% of rent
- [ ] Aether Labs receives 2.5%
- [ ] Gor-incinerator receives 2.5%

---

## Test Data

### Valid Test Wallet Addresses

```
8xKZFz7qJR2H9PmVJW3nN4kLdMqY6tBsC1rEfGhUiSoP
DzP3K8vQZ2nM5xLrT9wY1jH4sB6cF8dE7gA2hN9pK3qR
```

### Invalid Test Inputs

```
invalid
<script>alert('xss')</script>
'; DROP TABLE transactions; --
../../../etc/passwd
```

---

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd api && npm install
      
      - name: Run unit tests
        run: cd api && npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./api/coverage/lcov.info
```

---

## Reporting Issues

When reporting test failures, include:

1. **Test name and description**
2. **Expected behavior**
3. **Actual behavior**
4. **Steps to reproduce**
5. **Environment details** (API URL, Node version, etc.)
6. **Error messages and stack traces**
7. **Screenshots or logs** (if applicable)

---

**Last Updated**: December 2024  
**Version**: 1.0.0
