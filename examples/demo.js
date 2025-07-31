#!/usr/bin/env node

/**
 * Example: Using browser-console-tap programmatically
 * 
 * This example shows how to use the browser-console-tap tool
 * to capture console logs from multiple URLs.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// URLs to test
const testUrls = [
  'https://example.com',
  'https://httpbin.org/html',
  'https://jsonplaceholder.typicode.com/posts/1'
];

async function runConsoleTap(url, delay = 3000) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing: ${url}`);
    
    const child = spawn('node', [
      join(__dirname, '../src/index.js'),
      url,
      '--delay', delay.toString(),
      '--timeout', '10000'
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      const result = {
        url,
        code,
        stdout,
        stderr,
        success: code === 0
      };
      
      if (result.success) {
        console.log(`✅ Success: ${url}`);
        // Extract number of console messages
        const match = stdout.match(/Captured (\d+) console messages/);
        if (match) {
          console.log(`📊 Console messages: ${match[1]}`);
        }
      } else {
        console.log(`❌ Failed: ${url}`);
        if (stderr) {
          console.log(`Error: ${stderr.trim()}`);
        }
      }
      
      resolve(result);
    });
    
    child.on('error', reject);
  });
}

async function main() {
  console.log('🚀 Browser Console Tap Demo');
  console.log('Testing multiple URLs...\n');
  
  const results = [];
  
  for (const url of testUrls) {
    try {
      const result = await runConsoleTap(url, 2000);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error testing ${url}:`, error.message);
    }
  }
  
  console.log('\n📋 Summary:');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful > 0) {
    console.log('\n🎉 Demo completed successfully!');
  } else {
    console.log('\n⚠️  No successful captures. Check your internet connection.');
  }
}

// Run the demo
main().catch(console.error);