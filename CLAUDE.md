# CLAUDE.md - AI Assistant Guide for Gor-Incinerator

> **Last Updated**: December 2024
> **Purpose**: Guide for AI assistants working with the Gor-Incinerator codebase

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Codebase Structure](#codebase-structure)
4. [Development Workflows](#development-workflows)
5. [Key Conventions](#key-conventions)
6. [Common Tasks](#common-tasks)
7. [Testing Strategy](#testing-strategy)
8. [Deployment](#deployment)
9. [Important Files Reference](#important-files-reference)
10. [Do's and Don'ts](#dos-and-donts)
11. [Quick Reference](#quick-reference)

---

## 🎯 Project Overview

### What is Gor-Incinerator?

Gor-Incinerator is a **token burning service** for the Gorbagana blockchain (a Solana fork) that helps users reclaim rent from empty token accounts. It operates as a three-tier application with a transparent 5% service fee split 50/50 between Aether Labs and Gor-Incinerator.

### Key Features

- Web interface with Backpack wallet integration
- Protected API backend for Gorbag Wallet integration
- CLI tool for server-side operations
- Close up to 14 token accounts per transaction
- Transparent 5% fee (2.5% to Aether Labs, 2.5% to Gor-Incinerator)
- >90% transaction success rate
- Comprehensive transaction logging and reconciliation

### Technology Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Three.js, GSAP |
| **Backend CLI** | Node.js, TypeScript, Solana Web3.js, SPL Token |
| **API** | Cloudflare Workers, TypeScript, Cloudflare D1 (SQLite) |
| **Blockchain** | Gorbagana (Solana fork) |
| **Testing** | Jest (backend), Vitest (API) |
| **Deployment** | Cloudflare Pages (frontend), Cloudflare Workers (API) |

---

## 🏗 Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                         │
│  • Backpack wallet integration                                  │
│  • Direct wallet mode (user signs locally)                      │
│  • API mode (backend builds transaction)                        │
│  • 3D animated landing page (Three.js)                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│               API BACKEND (Cloudflare Workers)                  │
│  • Protected endpoints with API key authentication              │
│  • GET /assets/:wallet - List burn-eligible accounts            │
│  • POST /build-burn-tx - Build unsigned transaction             │
│  • GET /reconciliation/report - Monthly reports (admin)         │
│  • Cloudflare D1 database for transaction logging               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND CLI (Node.js TypeScript)                   │
│  • Server-side token burning operations                          │
│  • Direct RPC connection to Gorbagana                           │
│  • Fee calculation and collection                               │
│  • Comprehensive error handling and logging                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                GORBAGANA BLOCKCHAIN (RPC)                       │
│  • Solana Web3.js compatible                                    │
│  • Token account queries                                        │
│  • Transaction building and signing                             │
│  • Fee transfers (atomic execution)                             │
└─────────────────────────────────────────────────────────────────┘
```

### Design Patterns

1. **Service-Oriented Architecture**: Business logic separated into discrete services
2. **Static Class Pattern**: Services use static methods (no instantiation needed)
3. **Middleware Pattern**: Authentication and CORS middleware in API
4. **Error Propagation**: Custom error classes for different error types
5. **Type-Driven Development**: Strict TypeScript with comprehensive interfaces

---

## 📁 Codebase Structure

### Root Directory

```
gor-incinerator/
├── src/                          # Backend CLI source (TypeScript)
├── frontend/                     # React web application
├── api/                          # Cloudflare Workers API backend
├── docs/                         # Project documentation
├── dist/                         # Compiled JavaScript (generated, gitignored)
├── node_modules/                 # Dependencies (gitignored)
├── package.json                  # Backend dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── jest.config.js                # Testing configuration
├── .env.example                  # Environment template
└── README.md                     # Main project documentation
```

### Backend CLI (`/src/`)

```
src/
├── services/                     # Business logic services
│   ├── feeService.ts             # Fee calculation (5% of rent)
│   ├── accountService.ts         # Token account discovery & filtering
│   ├── transactionService.ts    # Transaction building & execution
│   └── __tests__/                # Service unit tests
│       ├── feeService.test.ts
│       ├── accountService.test.ts
│       └── transactionService.test.ts
├── types/
│   └── index.ts                  # TypeScript interfaces & types
├── utils/
│   ├── errors.ts                 # Custom error classes
│   ├── logger.ts                 # Structured logging
│   └── validators.ts             # Input validation functions
├── burn.ts                       # Main CLI entry point
└── config.ts                     # Configuration management
```

### Frontend (`/frontend/`)

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.tsx              # Landing page with 3D model
│   │   └── NotFound.tsx          # 404 page
│   ├── components/
│   │   ├── BurnInterface.tsx     # Direct wallet mode UI
│   │   ├── BurnInterfaceAPI.tsx  # API mode UI
│   │   ├── TrashCanModel.tsx     # Three.js 3D animation
│   │   ├── ErrorBoundary.tsx     # Error boundary wrapper
│   │   ├── ThemeToggle.tsx       # Dark/light theme switcher
│   │   └── ui/                   # shadcn/ui components
│   ├── contexts/
│   │   └── ThemeContext.tsx      # Theme provider
│   ├── services/
│   │   └── apiClient.ts          # API communication
│   └── App.tsx                   # Main app with routing
├── public/                       # Static assets
├── package.json                  # Frontend dependencies
├── vite.config.ts                # Vite build configuration
├── tailwind.config.js            # Tailwind CSS configuration
└── README.md                     # Frontend documentation
```

### API Backend (`/api/`)

```
api/
├── src/
│   ├── routes/
│   │   ├── assets.ts             # GET /assets/:wallet
│   │   ├── buildBurnTx.ts        # POST /build-burn-tx
│   │   └── reconciliation.ts     # GET /reconciliation/report
│   ├── services/
│   │   ├── blockchainService.ts  # RPC interactions
│   │   ├── feeService.ts         # Fee splitting (50/50)
│   │   └── databaseService.ts    # D1 transaction logging
│   ├── middleware/
│   │   ├── auth.ts               # API key authentication
│   │   └── cors.ts               # CORS handling
│   ├── types/
│   │   └── index.ts              # Type definitions
│   ├── utils/
│   │   └── errors.ts             # Error handling
│   └── index.ts                  # Main entry point & router
├── migrations/                   # D1 database migrations
├── scripts/                      # Reconciliation scripts
├── package.json                  # API dependencies
├── wrangler.toml                 # Cloudflare Workers config (gitignored)
└── README.md                     # API documentation
```

### Documentation (`/docs/`)

```
docs/
├── GORBAG_WALLET_INTEGRATION.md  # API integration guide for partners
├── API_DEPLOYMENT_GUIDE.md       # API deployment instructions
├── FEE_IMPLEMENTATION_SUMMARY.md # Fee system details
├── FEE_INTEGRATION_GUIDE.md      # Frontend fee integration
├── BLOCKCHAIN_SEPARATION_GUIDE.md # Multi-chain operation guide
├── BUSINESS_MODEL.md             # Revenue model & metrics
├── DEPLOYMENT_GUIDE.md           # General deployment guide
├── TESTING_GUIDE.md              # Testing procedures
├── MARKETING_COPY.md             # Marketing content
└── INDEX.md                      # Documentation index
```

---

## 🔨 Development Workflows

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd gor-incinerator

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Install API dependencies
cd api
npm install
cd ..

# 5. Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Backend CLI Development

```bash
# Compile TypeScript
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run the incinerator (requires .env configuration)
npm run burn
```

### Frontend Development

```bash
cd frontend

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

### API Development

```bash
cd api

# Start local development server
npm run dev

# Deploy to Cloudflare
npm run deploy

# View live logs
npm run tail

# Run tests
npm test

# Type checking only
npm run type-check

# Set up secrets
wrangler secret put API_KEY
wrangler secret put ADMIN_API_KEY
wrangler secret put GOR_RPC_URL
```

### Git Workflow

```bash
# Create feature branch (must start with 'claude/' for CI)
git checkout -b claude/feature-name-session-id

# Make changes and commit
git add .
git commit -m "feat: Description of changes"

# Push to remote (retry up to 4 times with exponential backoff if network fails)
git push -u origin claude/feature-name-session-id

# Create pull request
gh pr create --title "Feature Title" --body "Description"
```

---

## 📐 Key Conventions

### Naming Conventions

| Entity | Convention | Example |
|--------|-----------|---------|
| **TypeScript Files** | camelCase | `feeService.ts`, `accountService.ts` |
| **Test Files** | camelCase.test.ts | `feeService.test.ts` |
| **React Components** | PascalCase.tsx | `BurnInterface.tsx`, `ThemeToggle.tsx` |
| **Interfaces/Types** | PascalCase | `TokenAccountInfo`, `TransactionResult` |
| **Classes** | PascalCase | `FeeService`, `Config`, `Logger` |
| **Functions** | camelCase (verb-first) | `calculateFee()`, `validatePublicKey()` |
| **Constants** | UPPER_SNAKE_CASE | `RENT_PER_ACCOUNT`, `TOKEN_PROGRAM_ID` |
| **CSS Classes** | kebab-case | `burn-interface`, `fee-display` |
| **Documentation** | SCREAMING_SNAKE_CASE.md | `README.md`, `DEPLOYMENT_GUIDE.md` |

### Code Organization Principles

#### 1. Separation of Concerns

```
Services: Business logic (fee calculation, account filtering, tx building)
Utils: Reusable utilities (logging, validation, error handling)
Types: Type definitions and interfaces
Config: Environment and configuration management
```

#### 2. Single Responsibility Principle

Each file has one clear purpose:
- `feeService.ts` - Only fee-related logic
- `accountService.ts` - Only account operations
- `transactionService.ts` - Only transaction handling

#### 3. Dependency Direction

```
burn.ts
  ↓
services/ (feeService, transactionService, accountService)
  ↓
utils/ (logger, errors, validators)
  ↓
types/ (interfaces)
  ↓
config
```

#### 4. Test Co-location

```
services/
  ├── feeService.ts
  └── __tests__/
      └── feeService.test.ts
```

### TypeScript Conventions

```typescript
// 1. Strict type checking enabled
// - No implicit any
// - Strict null checks
// - Strict function types

// 2. Interface definitions with clear naming
export interface TokenAccountInfo {
  pubkey: PublicKey;
  mint: string;
  owner: string;
  balance: string;
  decimals: number;
}

// 3. Static class methods for services
export class FeeService {
  static calculateFee(accountCount: number): FeeCalculation {
    // Implementation
  }
}

// 4. Error handling with custom errors
throw new ValidationError("Invalid fee percentage");

// 5. Comprehensive JSDoc comments
/**
 * Calculates the service fee for closing token accounts
 * @param accountCount - Number of accounts to close
 * @returns Fee calculation breakdown
 * @throws ValidationError if accountCount is invalid
 */
```

### React Conventions

```typescript
// 1. Functional components with hooks
export default function BurnInterface() {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return <JSX />;
}

// 2. Component props with TypeScript interfaces
interface BurnInterfaceProps {
  walletAddress: string;
  onSuccess: (result: TransactionResult) => void;
}

// 3. Context for global state
const { theme, setTheme } = useTheme();

// 4. Error boundaries for error handling
<ErrorBoundary>
  <Component />
</ErrorBoundary>
```

### API Route Pattern

```typescript
export async function handleRoute(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // 1. Validate input
    const body = await request.json();
    if (!body.wallet) {
      throw new ValidationError("Missing wallet address");
    }

    // 2. Process request
    const result = await processRequest(body, env);

    // 3. Return JSON response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // 4. Handle errors with proper status codes
    return handleError(error);
  }
}
```

### Logging Pattern

```typescript
Logger.debug("Detailed debug information", { data });
Logger.info("General information", { data });
Logger.warn("Warning message", { data });
Logger.error("Error message", { error, data });
```

### Environment Variables

```typescript
// Backend CLI (.env)
RPC_URL=https://rpc.gorbagana.com
WALLET=[1,2,3,...,64]  // uint8 array format
FEE_RECIPIENT=<wallet_address>
FEE_PERCENTAGE=5

// Frontend (VITE_ prefix)
VITE_API_BASE_URL=https://api.gor-incinerator.fun
VITE_API_KEY=gorincin_...

// API (Cloudflare secrets via wrangler)
API_KEY=gorincin_...
ADMIN_API_KEY=gorincin_...
GOR_RPC_URL=https://rpc.gorbagana.com
GOR_VAULT_ADDRESS_AETHER=<wallet_address>
GOR_VAULT_ADDRESS_INCINERATOR=<wallet_address>
```

---

## 🎯 Common Tasks

### Adding a New Backend Service

```typescript
// 1. Create service file: src/services/newService.ts
export class NewService {
  /**
   * Description of what this method does
   */
  static async doSomething(): Promise<Result> {
    Logger.info("Starting operation");

    try {
      // Implementation
      const result = await performOperation();

      Logger.info("Operation completed", { result });
      return result;
    } catch (error) {
      Logger.error("Operation failed", { error });
      throw new ServiceError("Failed to perform operation", error);
    }
  }
}

// 2. Add types: src/types/index.ts
export interface NewServiceResult {
  success: boolean;
  data: any;
}

// 3. Add tests: src/services/__tests__/newService.test.ts
describe('NewService', () => {
  it('should perform operation successfully', async () => {
    const result = await NewService.doSomething();
    expect(result).toBeDefined();
  });
});

// 4. Import and use in burn.ts
import { NewService } from './services/newService';
const result = await NewService.doSomething();
```

### Adding a New API Endpoint

```typescript
// 1. Create route handler: api/src/routes/newRoute.ts
export async function handleNewRoute(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Parse request
    const body = await request.json();

    // Validate
    validateInput(body);

    // Process
    const result = await processRequest(body, env);

    // Return response
    return jsonResponse(result, 200);
  } catch (error) {
    return handleError(error);
  }
}

// 2. Add route to router: api/src/index.ts
import { handleNewRoute } from './routes/newRoute';

if (url.pathname === '/new-route' && request.method === 'POST') {
  return withAuth(request, env, () => handleNewRoute(request, env));
}

// 3. Add types: api/src/types/index.ts
export interface NewRouteRequest {
  field: string;
}

// 4. Update API documentation: api/README.md
```

### Adding a New React Component

```typescript
// 1. Create component: frontend/src/components/NewComponent.tsx
import React, { useState } from 'react';

interface NewComponentProps {
  prop1: string;
  onAction: () => void;
}

export default function NewComponent({ prop1, onAction }: NewComponentProps) {
  const [state, setState] = useState('');

  return (
    <div className="new-component">
      {/* JSX */}
    </div>
  );
}

// 2. Add styles in Tailwind classes or index.css

// 3. Import and use in parent component
import NewComponent from './components/NewComponent';

<NewComponent prop1="value" onAction={handleAction} />
```

### Modifying the Fee Structure

**IMPORTANT**: Fee structure modifications require careful coordination!

```typescript
// 1. Update backend CLI: src/services/feeService.ts
private static readonly FEE_PERCENTAGE = 5; // Change this

// 2. Update API: api/src/services/feeService.ts
private static readonly FEE_PERCENTAGE = 5; // Keep in sync!

// 3. Update split if needed (currently 50/50)
private static readonly AETHER_LABS_SPLIT = 0.5;
private static readonly GOR_INCINERATOR_SPLIT = 0.5;

// 4. Update documentation in multiple places:
// - README.md
// - frontend/README.md
// - api/README.md
// - docs/FEE_IMPLEMENTATION_SUMMARY.md
// - docs/GORBAG_WALLET_INTEGRATION.md

// 5. Update frontend display components
// - BurnInterface.tsx
// - BurnInterfaceAPI.tsx

// 6. Update tests with new expected values
// - src/services/__tests__/feeService.test.ts
```

### Adding Database Tables (API)

```sql
-- 1. Create migration: api/migrations/002_new_table.sql
CREATE TABLE new_table (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  field TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_field ON new_table(field);

-- 2. Apply migration
wrangler d1 migrations apply gor-incinerator-logs

-- 3. Update databaseService.ts
export async function insertNewRecord(
  db: D1Database,
  data: any
): Promise<void> {
  await db.prepare(
    'INSERT INTO new_table (field) VALUES (?)'
  ).bind(data.field).run();
}

-- 4. Update types
export interface NewTableRecord {
  id: number;
  field: string;
  created_at: string;
}
```

---

## 🧪 Testing Strategy

### Backend CLI Tests (Jest)

```bash
# Run all tests
npm test

# Run specific test file
npm test -- feeService.test.ts

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

**Test Structure:**

```typescript
// src/services/__tests__/feeService.test.ts
import { FeeService } from '../feeService';

describe('FeeService', () => {
  describe('calculateFee', () => {
    it('should calculate correct fee for single account', () => {
      const result = FeeService.calculateFee(1);

      expect(result.feePercentage).toBe(5);
      expect(result.totalRent).toBeGreaterThan(0);
      expect(result.feeAmount).toBe(result.totalRent * 0.05);
      expect(result.netAmount).toBe(result.totalRent - result.feeAmount);
    });

    it('should throw error for invalid account count', () => {
      expect(() => FeeService.calculateFee(-1))
        .toThrow(ValidationError);
    });
  });
});
```

**Current Test Coverage:**

- `feeService.ts`: 13 test cases (comprehensive)
- `accountService.ts`: Basic coverage
- `transactionService.ts`: Basic coverage

**Testing Principles:**

1. **Mock external dependencies** (Config, Logger, RPC connections)
2. **Test edge cases** (zero, negative, boundary values)
3. **Test error handling** (invalid inputs, network errors)
4. **Test business logic** (fee calculations, account filtering)
5. **No real blockchain connections** in tests

### API Tests (Vitest)

```bash
cd api

# Run tests
npm test

# Run with watch mode
npm test -- --watch
```

### Frontend Testing

Currently limited frontend testing. Consider adding:

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Create tests for components
frontend/src/components/__tests__/BurnInterface.test.tsx
```

### Manual Testing Checklist

**Backend CLI:**
- [ ] Can connect to Gorbagana RPC
- [ ] Can query token accounts
- [ ] Can build and sign transactions
- [ ] Fees calculated correctly
- [ ] Transaction executes successfully
- [ ] Error handling works

**Frontend:**
- [ ] Backpack wallet connects
- [ ] Token accounts load
- [ ] Fee calculations display correctly
- [ ] Transaction signing works
- [ ] Success/error messages display
- [ ] Responsive design works on mobile

**API:**
- [ ] Health endpoint returns 200
- [ ] Assets endpoint returns accounts
- [ ] Build transaction returns valid base64
- [ ] Authentication rejects invalid keys
- [ ] Rate limiting works
- [ ] Reconciliation report generates

---

## 🚀 Deployment

### Frontend Deployment (Cloudflare Pages)

**Automatic Deployment:**

1. Push to GitHub main branch
2. Cloudflare Pages auto-builds via GitHub integration
3. Vite builds to `dist/`
4. Deployed to edge network globally

**Manual Deployment:**

```bash
cd frontend

# Build production bundle
npm run build

# Deploy to GitHub Pages (alternative)
npm run deploy
```

**Environment Variables (Cloudflare Pages Dashboard):**

```
VITE_API_BASE_URL=https://api.gor-incinerator.fun
VITE_API_KEY=gorincin_...
```

### API Deployment (Cloudflare Workers)

```bash
cd api

# Deploy to production
wrangler deploy

# Deploy to development environment
wrangler deploy --env dev

# Set secrets
wrangler secret put API_KEY
wrangler secret put ADMIN_API_KEY
wrangler secret put GOR_RPC_URL
wrangler secret put GOR_VAULT_ADDRESS_AETHER
wrangler secret put GOR_VAULT_ADDRESS_INCINERATOR

# View live logs
wrangler tail
```

**Configuration:**

- `wrangler.toml` is gitignored (copy from `wrangler.toml.example`)
- D1 database must be created first: `wrangler d1 create gor-incinerator-logs`
- Migrations applied automatically on deploy or manually: `wrangler d1 migrations apply gor-incinerator-logs`

### Backend CLI Deployment (Server)

```bash
# SSH into server
ssh user@server

# Clone repository
git clone <repo-url>
cd gor-incinerator

# Install dependencies
npm install

# Configure environment
cp .env.example .env
nano .env  # Edit configuration

# Build
npm run build

# Set up systemd service (Linux)
sudo nano /etc/systemd/system/gor-incinerator.service

# Enable and start service
sudo systemctl enable gor-incinerator
sudo systemctl start gor-incinerator

# Check status
sudo systemctl status gor-incinerator
```

**Systemd Service Example:**

```ini
[Unit]
Description=Gor Incinerator Token Burning Service
After=network.target

[Service]
Type=simple
User=gor
WorkingDirectory=/home/gor/gor-incinerator
ExecStart=/usr/bin/node dist/burn.js
Restart=always
RestartSec=10
EnvironmentFile=/home/gor/gor-incinerator/.env

[Install]
WantedBy=multi-user.target
```

### Deployment Checklist

See `DEPLOYMENT_CHECKLIST.md` for comprehensive pre-launch and post-launch checklists.

**Key Points:**

- [ ] All environment variables configured
- [ ] Secrets set in Cloudflare Workers
- [ ] D1 database created and migrated
- [ ] Frontend builds without errors
- [ ] API deploys successfully
- [ ] Test with real transactions (small amounts)
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Configure uptime monitoring

---

## 📚 Important Files Reference

### Backend CLI

| File | Purpose | When to Modify |
|------|---------|----------------|
| `src/burn.ts` | Main entry point | Add new CLI features |
| `src/config.ts` | Configuration management | Add new env vars |
| `src/services/feeService.ts` | Fee calculation | Change fee structure |
| `src/services/accountService.ts` | Account filtering | Change filtering logic |
| `src/services/transactionService.ts` | Transaction building | Change tx structure |
| `src/utils/logger.ts` | Logging utility | Change log format |
| `src/utils/errors.ts` | Custom errors | Add new error types |
| `src/types/index.ts` | Type definitions | Add new types |

### Frontend

| File | Purpose | When to Modify |
|------|---------|----------------|
| `src/App.tsx` | Main app component | Add routes, providers |
| `src/pages/Home.tsx` | Landing page | Update marketing copy |
| `src/components/BurnInterface.tsx` | Direct wallet UI | Update wallet flow |
| `src/components/BurnInterfaceAPI.tsx` | API mode UI | Update API flow |
| `src/components/TrashCanModel.tsx` | 3D animation | Change 3D model |
| `src/contexts/ThemeContext.tsx` | Theme state | Add theme features |
| `src/services/apiClient.ts` | API communication | Update API calls |
| `vite.config.ts` | Build configuration | Change build settings |
| `tailwind.config.js` | Styling config | Add custom styles |

### API

| File | Purpose | When to Modify |
|------|---------|----------------|
| `src/index.ts` | Main router | Add routes |
| `src/routes/assets.ts` | Assets endpoint | Update asset logic |
| `src/routes/buildBurnTx.ts` | Transaction builder | Update tx building |
| `src/routes/reconciliation.ts` | Admin reports | Update reporting |
| `src/middleware/auth.ts` | Authentication | Update auth logic |
| `src/middleware/cors.ts` | CORS handling | Update CORS config |
| `src/services/blockchainService.ts` | RPC interactions | Update RPC calls |
| `src/services/feeService.ts` | Fee splitting | Update fee splits |
| `src/services/databaseService.ts` | D1 operations | Update database queries |
| `wrangler.toml` | Cloudflare config | Update deployment settings |

### Documentation

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Main project overview | End users, developers |
| `CLAUDE.md` | AI assistant guide | AI assistants |
| `PROJECT_STRUCTURE.md` | Code organization | Developers |
| `DEPLOYMENT_CHECKLIST.md` | Launch checklist | DevOps, Product |
| `docs/GORBAG_WALLET_INTEGRATION.md` | Partner API guide | Integration partners |
| `docs/API_DEPLOYMENT_GUIDE.md` | API deployment | DevOps |
| `docs/FEE_IMPLEMENTATION_SUMMARY.md` | Fee system details | Developers |
| `docs/BUSINESS_MODEL.md` | Revenue model | Business stakeholders |

---

## ✅ Do's and Don'ts

### ✅ DO

#### Code Quality
- **DO** use strict TypeScript with no implicit `any`
- **DO** write comprehensive JSDoc comments for public methods
- **DO** follow existing naming conventions consistently
- **DO** add tests for new features and bug fixes
- **DO** handle errors with appropriate custom error classes
- **DO** log important operations with appropriate severity levels

#### Architecture
- **DO** use static class methods for services (no instantiation)
- **DO** separate concerns (services, utils, types, config)
- **DO** validate inputs at service boundaries
- **DO** use middleware pattern for cross-cutting concerns (auth, CORS)
- **DO** keep components small and focused on single responsibility

#### Git Workflow
- **DO** create feature branches with `claude/` prefix for CI
- **DO** write clear, descriptive commit messages
- **DO** use conventional commit format: `feat:`, `fix:`, `docs:`, etc.
- **DO** push with `-u origin branch-name` for new branches
- **DO** retry failed pushes up to 4 times with exponential backoff

#### Testing
- **DO** mock external dependencies in tests (RPC, database)
- **DO** test edge cases and error scenarios
- **DO** verify fee calculations are correct
- **DO** test authentication and authorization

#### Documentation
- **DO** update documentation when changing features
- **DO** keep API documentation in sync with implementation
- **DO** document breaking changes clearly
- **DO** add examples for complex features

#### Security
- **DO** validate all user inputs
- **DO** use environment variables for sensitive data
- **DO** implement proper authentication for protected endpoints
- **DO** sanitize error messages (don't leak sensitive info)
- **DO** verify transaction contents before signing

### ❌ DON'T

#### Code Quality
- **DON'T** use `any` type unless absolutely necessary
- **DON'T** commit commented-out code (use git history)
- **DON'T** leave console.log statements in production code
- **DON'T** ignore TypeScript errors
- **DON'T** suppress linter warnings without good reason

#### Architecture
- **DON'T** mix business logic with UI components
- **DON'T** make direct RPC calls from components (use services)
- **DON'T** duplicate code between backend and API (use shared types)
- **DON'T** create circular dependencies between modules
- **DON'T** hardcode configuration values (use environment variables)

#### Git Workflow
- **DON'T** push directly to main branch
- **DON'T** commit sensitive data (.env files, private keys)
- **DON'T** force push to shared branches without coordination
- **DON'T** create branches without the `claude/` prefix for CI
- **DON'T** skip the pull request review process

#### Testing
- **DON'T** make real blockchain transactions in tests
- **DON'T** use hardcoded private keys in tests
- **DON'T** skip tests to make CI pass
- **DON'T** test implementation details (test behavior)

#### Security
- **DON'T** log sensitive data (private keys, API keys)
- **DON'T** commit API keys or secrets to repository
- **DON'T** trust user input without validation
- **DON'T** expose admin endpoints without authentication
- **DON'T** return detailed error messages to clients (log internally)

#### Deployment
- **DON'T** deploy without testing locally first
- **DON'T** deploy during high-traffic periods without notice
- **DON'T** skip database migrations
- **DON'T** change fee structure without updating all components
- **DON'T** deploy API changes without updating frontend

#### Fee Structure
- **DON'T** modify fee percentage without business approval
- **DON'T** change fee split ratios without partner agreement
- **DON'T** change vault addresses in production without verification
- **DON'T** update fees in one place and forget others (API, CLI, frontend, docs)

---

## 🔍 Quick Reference

### Environment Setup

```bash
# Backend CLI
RPC_URL=https://rpc.gorbagana.com
WALLET=[1,2,3,...,64]
FEE_RECIPIENT=<wallet>
FEE_PERCENTAGE=5

# Frontend
VITE_API_BASE_URL=https://api.gor-incinerator.fun
VITE_API_KEY=gorincin_...

# API (Cloudflare secrets)
API_KEY=gorincin_...
ADMIN_API_KEY=gorincin_...
GOR_RPC_URL=https://rpc.gorbagana.com
GOR_VAULT_ADDRESS_AETHER=<wallet>
GOR_VAULT_ADDRESS_INCINERATOR=<wallet>
```

### Common Commands

```bash
# Backend CLI
npm install              # Install dependencies
npm run build           # Compile TypeScript
npm test                # Run tests
npm run burn            # Run incinerator

# Frontend
cd frontend
npm install             # Install dependencies
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# API
cd api
npm install             # Install dependencies
npm run dev             # Start local dev server
npm run deploy          # Deploy to Cloudflare
npm run tail            # View live logs
wrangler secret put KEY # Set secret
```

### Key Constants

```typescript
// Fee structure
FEE_PERCENTAGE = 5;                    // 5% total service fee
AETHER_LABS_SPLIT = 0.5;               // 2.5% to Aether Labs
GOR_INCINERATOR_SPLIT = 0.5;           // 2.5% to Gor-Incinerator

// Transaction limits
MAX_ACCOUNTS_PER_TX = 14;              // Max accounts per transaction
COMPUTE_BUDGET_UNITS = 45_000;         // Compute units per transaction
COMPUTE_UNIT_PRICE = 1_000;            // microLamports per compute unit

// Rent calculation
RENT_PER_ACCOUNT = 0.00203928;         // GOR per token account (~2039 lamports)
```

### Important Addresses

```typescript
// Token Program (Solana standard)
TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"

// Fee recipient vaults (configured in environment)
AETHER_LABS_VAULT = env.GOR_VAULT_ADDRESS_AETHER
GOR_INCINERATOR_VAULT = env.GOR_VAULT_ADDRESS_INCINERATOR
```

### API Endpoints

```bash
# Public
GET  /health

# Protected (requires x-api-key header)
GET  /assets/:wallet
POST /build-burn-tx

# Admin only (requires admin x-api-key)
GET  /reconciliation/report?start=YYYY-MM-DD&end=YYYY-MM-DD
```

### File Locations

```bash
# Core business logic
src/services/feeService.ts
src/services/accountService.ts
src/services/transactionService.ts

# API endpoints
api/src/routes/assets.ts
api/src/routes/buildBurnTx.ts
api/src/routes/reconciliation.ts

# Frontend components
frontend/src/components/BurnInterface.tsx
frontend/src/components/BurnInterfaceAPI.tsx

# Configuration
.env                    # Backend CLI config (gitignored)
frontend/.env           # Frontend config (gitignored)
api/wrangler.toml       # API config (gitignored)

# Documentation
README.md               # Project overview
docs/GORBAG_WALLET_INTEGRATION.md  # Partner API guide
DEPLOYMENT_CHECKLIST.md # Launch checklist
```

### Useful Links

- **GitHub Repository**: https://github.com/DOGECOIN87/gor-incinerator
- **Website**: https://gor-incinerator.fun
- **API Base URL**: https://api.gor-incinerator.fun
- **Gorbagana RPC**: https://rpc.gorbagana.com
- **Backpack Wallet**: https://backpack.app

### Support

- **GitHub Issues**: https://github.com/DOGECOIN87/gor-incinerator/issues
- **Contact**: @mattrickbeats via X.com

---

## 📝 Notes for AI Assistants

### Understanding Context

When working on this codebase:

1. **This is a production service** handling real financial transactions
2. **Fee structure is contractual** (50/50 split with partners)
3. **Blockchain operations are irreversible** - test carefully
4. **Multiple deployment targets** - keep backend, API, and frontend in sync

### Common Modification Scenarios

**Scenario: User reports transaction failures**
1. Check RPC endpoint status
2. Review compute budget (may need adjustment)
3. Check transaction logs in API database
4. Verify fee calculations are correct
5. Test with different account counts

**Scenario: Partner requests API changes**
1. Update API endpoint in `api/src/routes/`
2. Update API documentation in `api/README.md` and `docs/GORBAG_WALLET_INTEGRATION.md`
3. Add/update tests
4. Deploy API changes first, then update documentation

**Scenario: Fee structure needs updating**
1. Get business approval for changes
2. Update `feeService.ts` in both `src/` and `api/src/`
3. Update frontend components
4. Update all documentation
5. Update tests with new expected values
6. Coordinate deployment across all components

**Scenario: Adding new blockchain features**
1. Implement in `src/services/` first (backend CLI)
2. Add comprehensive tests
3. Migrate to API if needed
4. Update frontend to expose feature
5. Document new feature

### Red Flags to Watch For

- ❌ Fee percentages not adding up to 100%
- ❌ Vault addresses hardcoded in multiple places
- ❌ Transaction signing failures (check recent blockhash)
- ❌ RPC rate limiting (may need fallback RPC)
- ❌ Database connection failures (check D1 binding)
- ❌ API key authentication bypassed
- ❌ Environment variables missing or misconfigured

### Best Practices for AI Assistance

1. **Read before modifying** - Always read relevant files first
2. **Maintain consistency** - Keep backend, API, and frontend in sync
3. **Update tests** - Tests are documentation and validation
4. **Update docs** - Documentation is critical for partners
5. **Consider impact** - Changes may affect partners using the API
6. **Test thoroughly** - Financial transactions require extra care

---

**End of CLAUDE.md**

> This guide is maintained by the development team and should be updated as the codebase evolves. Last updated: December 2024.
