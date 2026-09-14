# Erudit

This repository contains a TypeScript React client and Node.js server bundled with Rsbuild.

## Technologies
- **Client-side:** React and TypeScript
- **Server-side:** Node.js 24 and Express
- **Build tooling:** Rsbuild, pnpm, and Prettier

## Requirements

Use Node 24 through nvm and pnpm 10:

```sh
nvm use
corepack enable
pnpm install
```

TLS/SSL is not supported directly; terminate TLS at a platform router or reverse proxy.

## Commands

Install dependencies:
```sh
pnpm install
```

Production build:
```sh
pnpm run build
```

Development mode starts the Rsbuild client server with HMR and the Node server concurrently. The server is built once and is not reloaded, so in-memory game sessions remain available:
```sh
pnpm run dev
```

Start the production server:
```sh
pnpm start
```

Run formatting and checks:
```sh
pnpm run format
pnpm run format:check
pnpm run lint
pnpm test
```

The application server listens on port `8080` and Socket.IO listens on port `8090`.

The client production artifacts are emitted under `dist/client`, including `manifest.json`; the server bundle is `dist/server/index.js`.

Docker:
```sh
docker build . -t boilerplate-react-typescript-nodejs
docker run --name boilerplate-react-typescript-nodejs --rm -p 8080:8080 -it boilerplate-react-typescript-nodejs
```
