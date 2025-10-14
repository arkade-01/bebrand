

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the project root (where package.json is)
const projectRoot = path.resolve(__dirname, '..');

// Change to project root
process.chdir(projectRoot);


// List files in current directory
console.log('\nFiles in project root:');
try {
  const files = fs.readdirSync(projectRoot);
  files.forEach(file => {
    const stat = fs.statSync(path.join(projectRoot, file));
    console.log(`  ${stat.isDirectory() ? '[DIR]' : '[FILE]'} ${file}`);
  });
} catch (err) {
  console.error('Error listing files:', err.message);
}

// Check if dist directory exists
const distPath = path.join(projectRoot, 'dist');
if (fs.existsSync(distPath)) {
  console.log('\nFiles in dist directory:');
  try {
    const distFiles = fs.readdirSync(distPath);
    distFiles.slice(0, 10).forEach(file => {
      console.log(`  ${file}`);
    });
    if (distFiles.length > 10) {
      console.log(`  ... and ${distFiles.length - 10} more files`);
    }
  } catch (err) {
    console.error('Error listing dist files:', err.message);
  }
} else {
  console.log('\n❌ ERROR: dist directory does not exist!');
  console.log('Build may have failed or output to wrong location.');
  process.exit(1);
}

const mainPath = path.join(projectRoot, 'dist', 'main.js');
const mainPathAlt = path.join(projectRoot, 'dist', 'src', 'main.js');

if (fs.existsSync(mainPath)) {
  console.log('\n✅ Found dist/main.js, starting application...\n');
  startApp('dist/main.js');
} else if (fs.existsSync(mainPathAlt)) {
  console.log('\n✅ Found dist/src/main.js, starting application...\n');
  startApp('dist/src/main.js');
} else {
  console.log('\n❌ ERROR: Could not find main.js in dist/ or dist/src/');
  process.exit(1);
}

function startApp(mainFile) {
  const child = spawn('node', [mainFile], {
    stdio: 'inherit',
    cwd: projectRoot
  });

  child.on('exit', (code) => {
    process.exit(code);
  });
}
