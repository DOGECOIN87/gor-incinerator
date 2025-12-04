# Gor Incinerator - Project Structure

## Overview
This document describes the organization of the Gor Incinerator codebase.

## Directory Structure

```
gor-incinerator.fun/
├── src/                          # Backend source code (TypeScript)
│   ├── services/                 # Business logic services
│   │   ├── accountService.ts     # Token account discovery & filtering
│   │   ├── transactionService.ts # Transaction building & execution
│   │   ├── feeService.ts         # Fee calculation & collection
│   │   └── __tests__/            # Service unit tests
│   │       ├── accountService.test.ts
│   │       ├── transactionService.test.ts
│   │       └── feeService.test.ts
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # Shared interfaces & types
│   ├── utils/                    # Utility functions
│   │   ├── errors.ts             # Custom error classes
│   │   ├── logger.ts             # Structured logging
│   │   └── validators.ts         # Input validation
│   ├── burn.ts                   # Main execution script
│   └── config.ts                 # Configuration management
│
├── dist/                         # Compiled JavaScript (generated)
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── burn.js
│   └── config.js
│
├── frontend/                     # Front-end React application
│   ├── App.tsx                   # Main React app component
│   ├── Home.tsx                  # Landing page component
│   ├── burn.ts                   # Front-end burn logic
│   ├── config.ts                 # Front-end configuration
│   ├── const.ts                  # Front-end constants
│   ├── index.css                 # Tailwind CSS styles
│   ├── index.html                # HTML entry point
│   ├── logo.png                  # Application logo
│   ├── robots.txt                # SEO robots file
│   ├── package.json              # Front-end dependencies
│   └── README.md                 # Front-end documentation
│
├── docs/                         # Documentation
│   ├── FEE_IMPLEMENTATION_SUMMARY.md    # Fee implementation details
│   ├── FEE_INTEGRATION_GUIDE.md         # Front-end integration guide
│   └── BLOCKCHAIN_SEPARATION_GUIDE.md   # Multi-chain explanation
│
├── node_modules/                 # Dependencies (generated)
│
├── .env.example                  # Example environment configuration
├── .gitignore                    # Git ignore rules
├── jest.config.js                # Jest testing configuration
├── package.json                  # Backend dependencies & scripts
├── package-lock.json             # Dependency lock file
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Main project documentation
└── PROJECT_STRUCTURE.md          # This file

```

## Key Files

### Backend Core

#### `src/burn.ts`
Main execution script that:
- Initializes configuration
- Discovers empty token accounts
- Builds and executes transactions
- Collects fees (if configured)
- Logs results

#### `src/config.ts`
Configuration management:
- Loads environment variables
- Validates RPC URL and wallet
- Manages fee settings
- Creates blockchain connection

#### `src/services/feeService.ts`
Fee calculation and collection:
- Calculates 5% fee based on rent reclaimed
- Creates fee transfer instructions
- Validates fee configuration
- Provides transparent fee reporting

#### `src/services/transactionService.ts`
Transaction management:
- Builds versioned transactions
- Integrates fee collection
- Handles signing and sending
- Implements retry logic
- Confirms transactions

#### `src/services/accountService.ts`
Account discovery:
- Queries token accounts from blockchain
- Filters empty accounts
- Applies blacklist rules
- Handles malformed data

### Configuration Files

#### `.env.example`
Template for environment configuration:
```dotenv
RPC_URL=https://rpc.gorbagana.com
WALLET=[1,2,3,...,64]
FEE_RECIPIENT=CeD9epfL2eHfbJxKNdCY5Udaisn1hh3zBMiDGeDJs7BL
FEE_PERCENTAGE=5
```

#### `tsconfig.json`
TypeScript compiler configuration:
- Target: ES2016
- Module: CommonJS
- Strict mode enabled
- Output to `dist/`
- Excludes frontend and node_modules

#### `jest.config.js`
Testing framework configuration:
- Uses ts-jest for TypeScript
- Test pattern: `**/__tests__/**/*.test.ts`
- Coverage reporting enabled

#### `package.json`
Backend dependencies and scripts:
- `npm run build` - Compile TypeScript
- `npm run burn` - Run the incinerator
- `npm test` - Run test suite

### Front-End

#### `frontend/Home.tsx`
Landing page component featuring:
- Hero section with stats
- Features grid
- Step-by-step setup guide
- Fee transparency information
- Responsive design

#### `frontend/App.tsx`
Main React application:
- Routing setup
- Theme provider
- Error boundary
- Toast notifications

#### `frontend/README.md`
Comprehensive front-end documentation:
- Feature overview
- Fee structure details
- Setup instructions
- Configuration examples
- Architecture explanation

### Documentation

#### `docs/FEE_IMPLEMENTATION_SUMMARY.md`
Complete overview of fee implementation:
- Implementation details
- Fee structure
- Security features
- Testing results
- Usage examples

#### `docs/FEE_INTEGRATION_GUIDE.md`
Guide for front-end developers:
- UI/UX recommendations
- Component examples
- Configuration instructions
- Marketing copy suggestions
- Testing checklist

#### `docs/BLOCKCHAIN_SEPARATION_GUIDE.md`
Explains multi-chain operation:
- How RPC_URL determines blockchain
- Same wallet on different chains
- Network isolation guarantees
- Safety considerations
- Practical scenarios

## Build Artifacts

### `dist/`
Compiled JavaScript output from TypeScript:
- Generated by `npm run build`
- Mirrors `src/` structure
- Used by `npm run burn`
- Excluded from git

### `node_modules/`
NPM dependencies:
- Generated by `npm install`
- Excluded from git
- Contains all runtime dependencies

## Development Workflow

### 1. Setup
```bash
npm install                    # Install dependencies
cp .env.example .env          # Create configuration
# Edit .env with your settings
```

### 2. Development
```bash
npm run build                 # Compile TypeScript
npm test                      # Run tests
npm run test:watch            # Watch mode for tests
```

### 3. Execution
```bash
npm run burn                  # Run the incinerator
```

### 4. Testing
```bash
npm test                      # Run all tests
npm test -- --coverage        # With coverage report
```

## File Naming Conventions

### TypeScript Files
- **Services**: `camelCase.ts` (e.g., `feeService.ts`)
- **Tests**: `camelCase.test.ts` (e.g., `feeService.test.ts`)
- **Types**: `index.ts` in types directory
- **Utils**: `camelCase.ts` (e.g., `logger.ts`)

### React Components
- **Components**: `PascalCase.tsx` (e.g., `Home.tsx`)
- **Styles**: `kebab-case.css` (e.g., `index.css`)

### Documentation
- **Markdown**: `SCREAMING_SNAKE_CASE.md` (e.g., `README.md`)
- **Guides**: Descriptive names (e.g., `FEE_INTEGRATION_GUIDE.md`)

## Code Organization Principles

### 1. Separation of Concerns
- **Services**: Business logic
- **Utils**: Reusable utilities
- **Types**: Type definitions
- **Config**: Configuration management

### 2. Single Responsibility
Each file/class has one clear purpose:
- `feeService.ts` - Only fee-related logic
- `accountService.ts` - Only account operations
- `transactionService.ts` - Only transaction handling

### 3. Dependency Direction
```
burn.ts
  ↓
services/ (feeService, transactionService, accountService)
  ↓
utils/ (logger, errors, validators)
  ↓
types/ (interfaces)
```

### 4. Test Co-location
Tests live alongside the code they test:
```
services/
  ├── feeService.ts
  └── __tests__/
      └── feeService.test.ts
```

## Environment-Specific Files

### Development
- `.env` - Local configuration (not in git)
- `.env.example` - Template (in git)

### Production
- Use environment variables directly
- Or create `.env.production`

### Testing
- Tests use mocked configuration
- No real blockchain connections

## Git Workflow

### Tracked Files
- Source code (`src/`, `frontend/`)
- Documentation (`docs/`, `*.md`)
- Configuration templates (`.env.example`)
- Build configs (`tsconfig.json`, `jest.config.js`)
- Package definitions (`package.json`)

### Ignored Files (`.gitignore`)
- Build artifacts (`dist/`, `*.js` in root)
- Dependencies (`node_modules/`)
- Environment files (`.env`)
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)

## Adding New Features

### 1. Create Service
```typescript
// src/services/newService.ts
export class NewService {
  static doSomething() {
    // Implementation
  }
}
```

### 2. Add Tests
```typescript
// src/services/__tests__/newService.test.ts
describe('NewService', () => {
  it('should do something', () => {
    // Test
  });
});
```

### 3. Update Types
```typescript
// src/types/index.ts
export interface NewType {
  // Properties
}
```

### 4. Document
- Update relevant README files
- Add JSDoc comments
- Create guide if needed

## Maintenance

### Regular Tasks
- `npm audit` - Check for vulnerabilities
- `npm outdated` - Check for updates
- `npm test` - Ensure tests pass
- Review logs for errors

### Updating Dependencies
```bash
npm update                    # Update minor versions
npm install package@latest    # Update specific package
```

### Code Quality
- TypeScript strict mode enforced
- ESLint rules (if configured)
- Prettier formatting (if configured)
- Test coverage monitoring

## Support Files

### `.gitignore`
Prevents committing:
- Build artifacts
- Dependencies
- Environment files
- IDE configurations
- OS-specific files

### `package.json` Scripts
- `build` - Compile TypeScript
- `burn` - Run incinerator
- `test` - Run test suite
- `test:watch` - Watch mode

## Summary

The codebase is organized into clear, logical sections:
- **Backend** (`src/`) - Core functionality
- **Frontend** (`frontend/`) - User interface
- **Documentation** (`docs/`) - Guides and explanations
- **Configuration** (root) - Build and environment setup

This structure promotes:
- Easy navigation
- Clear separation of concerns
- Maintainability
- Testability
- Scalability

For specific implementation details, see the relevant documentation in `docs/`.
