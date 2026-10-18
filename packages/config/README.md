# @carbadapt/config

Shared tooling for the monorepo. This package has no runtime code.

## What goes here

- `tsconfig.base.json`, extended by every TypeScript project.
- `prettier.json`, referenced from the root `package.json` (`"prettier": "./packages/config/prettier.json"`).

## What must NOT go here

Product code, environment secrets, ESLint plugin implementations, and anything imported by `apps/web` or `apps/api` at runtime.

## Where the other tools live

ESLint's flat config is `eslint.config.mjs` at the repo root, and `.prettierignore` is there too. Both tools load config relative to the working directory, and ESLint resolves plugins from the config file's own directory. Keeping those two files at the root avoids a second copy of the lint dependencies inside this package.

## Milestone

The base TypeScript and Prettier settings are in place in this step (scaffold slice of M0). Add new shared rules here when a second package would otherwise copy them.
