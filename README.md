# learnts

This repository is for learning TypeScript.

## Setup

```sh
npm install
```

## Commands

```sh
npm run dev        # Run and watch for file changes
npm test           # Run property-based tests with fast-check
npm run typecheck  # Check types
npm run build      # Compile TypeScript to JavaScript in dist/
npm start          # Run the compiled JavaScript
```

## Property-based testing

Tests use [fast-check](https://fast-check.dev/) with the Node.js test runner. Add
property-based tests to the `test/` directory using the `*.test.ts` suffix.
