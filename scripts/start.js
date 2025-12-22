const { spawn } = require('child_process');
const path = require('path');

// Determine the main file path
const mainFile = path.join(__dirname, '..', 'dist', 'src', 'main.js');

console.log('Starting BeBrand server...');
console.log('Main file:', mainFile);

// Start the NestJS application
const child = spawn('node', [mainFile], {
  stdio: 'inherit',
  env: process.env,
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code || 0);
});

// Handle termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  child.kill('SIGTERM');
});
