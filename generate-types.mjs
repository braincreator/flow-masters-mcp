#!/usr/bin/env node

// Script to generate Payload types with a custom loader
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const loaderPath = path.resolve(__dirname, 'loader.mjs');

// Run payload generate:types with the custom loader
const child = spawn('npx', ['payload', 'generate:types'], {
  env: {
    ...process.env,
    NODE_OPTIONS: `--experimental-loader=${loaderPath}`
  },
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  process.exit(code);
});
