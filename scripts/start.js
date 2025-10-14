#!/usr/bin/env node

// Startup script for Render deployment
// This ensures we run from the correct directory

const { spawn } = require('child_process');
const path = require('path');

// Get the project root (where package.json is)
const projectRoot = path.resolve(__dirname, '..');

// Change to project root
process.chdir(projectRoot);

console.log('Starting from directory:', process.cwd());
console.log('Looking for dist/main.js at:', path.join(process.cwd(), 'dist', 'main.js'));

// Start the application
const child = spawn('node', ['dist/main.js'], {
  stdio: 'inherit',
  cwd: projectRoot
});

child.on('exit', (code) => {
  process.exit(code);
});
