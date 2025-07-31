#!/usr/bin/env node

import { spawn } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('🌐 Network Monitoring Demo'));
console.log(chalk.gray('This demo shows the network tracking features of browser-console-tap\n'));

// Test URLs that will generate various network requests
const testUrls = [
  'https://httpbin.org/get',
  'https://httpbin.org/status/404',
  'https://httpbin.org/status/500'
];

async function runDemo() {
  for (const url of testUrls) {
    console.log(chalk.yellow(`\n🔍 Testing: ${url}`));
    console.log(chalk.gray('='.repeat(50)));
    
    // Run with basic network tracking
    console.log(chalk.cyan('\n📡 Basic Network Tracking:'));
    await runCommand(['node', 'src/index.js', '--network', '--delay', '2000', url]);
    
    // Run with verbose network tracking
    console.log(chalk.cyan('\n📡 Verbose Network Tracking:'));
    await runCommand(['node', 'src/index.js', '--network-verbose', '--delay', '2000', url]);
  }
  
  console.log(chalk.green('\n✅ Network demo complete!'));
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    const child = spawn(command[0], command.slice(1), {
      stdio: 'inherit',
      shell: false
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

runDemo().catch((error) => {
  console.error(chalk.red(`❌ Demo failed: ${error.message}`));
  process.exit(1);
}); 