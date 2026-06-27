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

## HTTP client

This project includes a small HTTP client built with
[undici](https://undici.nodejs.org/).

```ts
import { createHttpClient } from "./http-client.js";

const client = createHttpClient({
  baseUrl: "https://api.example.com",
});

const response = await client.get<{ id: number; name: string }>("/users/1");

console.log(response.data.name);
```
