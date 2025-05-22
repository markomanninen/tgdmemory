// A simple utility to check if the .env file is formatted correctly
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('=== .env File Format Checker ===');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
console.log(`Checking .env file at: ${envPath}`);

if (!fs.existsSync(envPath)) {
  console.error('ERROR: .env file does not exist!');
  console.log('Please create a .env file based on .env.example');
  process.exit(1);
}

// Read the raw content of the file
const rawContent = fs.readFileSync(envPath, 'utf8');
console.log('\n--- Raw .env file content (API keys masked) ---');
console.log(rawContent
  .replace(/(GOOGLE_API_KEY=)(.+)/g, '$1[MASKED]')
  .replace(/(OPENAI_API_KEY=)(.+)/g, '$1[MASKED]')
);

// Check for common formatting issues
let hasIssues = false;

// Check for // filepath: comment line that shouldn't be in .env
if (rawContent.includes('// filepath:')) {
  console.error('\nERROR: Found "// filepath:" comment in .env file. This is not a valid format for .env files.');
  console.log('This should be removed as it may prevent proper loading of environment variables.');
  hasIssues = true;
}

// Check for missing equals signs in key-value pairs
const lines = rawContent.split('\n');
lines.forEach((line, index) => {
  // Skip empty lines and comment lines
  if (line.trim() === '' || line.trim().startsWith('#')) {
    return;
  }
  
  // Check if line contains an equals sign
  if (!line.includes('=')) {
    console.error(`\nERROR on line ${index + 1}: Missing equals sign in key-value pair:`);
    console.log(`  ${line}`);
    hasIssues = true;
  }
});

// Try to parse with dotenv
try {
  const parsed = dotenv.parse(rawContent);
  console.log('\n--- Parsed environment variables ---');
  console.log('GOOGLE_API_KEY:', parsed.GOOGLE_API_KEY ? '[PRESENT]' : '[MISSING]');
  console.log('OPENAI_API_KEY:', parsed.OPENAI_API_KEY ? '[PRESENT]' : '[MISSING]');
  console.log('OPENAI_MODEL:', parsed.OPENAI_MODEL || '[NOT SET]');
  console.log('GEMINI_MODEL:', parsed.GEMINI_MODEL || '[NOT SET]');
} catch (error) {
  console.error('\nERROR parsing .env file:', error.message);
  hasIssues = true;
}

// Load environment with dotenv
console.log('\n--- Testing environment loading with dotenv ---');
try {
  require('dotenv').config();
  console.log('GOOGLE_API_KEY loaded:', process.env.GOOGLE_API_KEY ? 'Yes' : 'No');
  console.log('OPENAI_API_KEY loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
} catch (error) {
  console.error('Error loading with dotenv:', error.message);
  hasIssues = true;
}

if (hasIssues) {
  console.log('\n=== ISSUES DETECTED IN .ENV FILE ===');
  console.log('Please fix the issues above and try again.');
} else {
  console.log('\n=== .ENV FILE FORMAT LOOKS GOOD ===');
  console.log('No formatting issues detected.');
}

console.log('\nFormat check complete!');
