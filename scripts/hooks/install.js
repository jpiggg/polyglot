#!/usr/bin/env node

const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
 
async function run() {
    if (process.env.CI) return;
    await cp.exec('husky install');

    if (fs.existsSync(path.resolve(process.cwd(), './.husky'))) return;
    await cp.exec('pnpm exec husky add .husky/pre-commit "pnpm run lint"');
    await cp.exec('pnpm exec husky add .husky/pre-push "pnpm run lint:deep"');
}

run()
    .then(() => console.log(`✅ Git hooks installed`))
    .catch((error) => console.error('❌ Error while installing hooks:\n', error))
