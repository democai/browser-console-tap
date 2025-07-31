#!/usr/bin/env node

/**
 * Example: Using browser-console-tap with authentication headers
 * 
 * This example shows how to use the browser-console-tap tool
 * with custom headers for authentication and API testing.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test scenarios with different header configurations
const testScenarios = [
  {
    name: 'Basic Authentication',
    url: 'https://httpbin.org/headers',
    headers: '{"Authorization": "Bearer demo-token-123"}',
    description: 'Testing with Bearer token authentication'
  },
  {
    name: 'API Key Authentication',
    url: 'https://httpbin.org/headers',
    headers: '{"X-API-Key": "demo-api-key-456", "Accept": "application/json"}',
    description: 'Testing with API key and custom Accept header'
  },
  {
    name: 'Multiple Headers',
    url: 'https://httpbin.org/headers',
    headers: '{"Authorization": "Bearer token", "X-Client-ID": "client123", "X-Request-ID": "req456", "Content-Type": "application/json"}',
    description: 'Testing with multiple custom headers'
  },
  {
    name: 'Custom User Agent with Headers',
    url: 'https://httpbin.org/headers',
    headers: '{"X-Custom-Header": "custom-value"}',
    userAgent: 'MyCustomBot/1.0',
    description: 'Testing with custom user agent and headers'
  }
];

async function runConsoleTapWithHeaders(scenario) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testing: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);
    console.log(`🌐 URL: ${scenario.url}`);
    console.log(`📋 Headers: ${scenario.headers}`);
    if (scenario.userAgent) {
      console.log(`🤖 User Agent: ${scenario.userAgent}`);
    }
    
    const args = [
      join(__dirname, '../src/index.js'),
      scenario.url,
      '--delay', '2000',
      '--timeout', '10000',
      '--headers', scenario.headers
    ];
    
    if (scenario.userAgent) {
      args.push('--user-agent', scenario.userAgent);
    }
    
    const child = spawn('node', args, {
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
        scenario: scenario.name,
        url: scenario.url,
        code,
        stdout,
        stderr,
        success: code === 0
      };
      
      if (result.success) {
        console.log(`✅ Success: ${scenario.name}`);
        // Check if headers were properly set
        if (stdout.includes('Headers:')) {
          console.log(`📊 Headers were set successfully`);
        }
      } else {
        console.log(`❌ Failed: ${scenario.name}`);
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
  console.log('🚀 Browser Console Tap - Authentication Headers Demo');
  console.log('Testing various header configurations...\n');
  
  const results = [];
  
  for (const scenario of testScenarios) {
    try {
      const result = await runConsoleTapWithHeaders(scenario);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error testing ${scenario.name}:`, error.message);
    }
  }
  
  console.log('\n📋 Summary:');
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful > 0) {
    console.log('\n🎉 Authentication headers demo completed successfully!');
    console.log('\n💡 Tips for using headers:');
    console.log('   • Use single quotes around the JSON string in bash');
    console.log('   • Escape quotes properly in your shell');
    console.log('   • Common headers: Authorization, X-API-Key, Content-Type');
    console.log('   • Example: --headers \'{"Authorization": "Bearer token"}\'');
  } else {
    console.log('\n⚠️  No successful captures. Check your internet connection.');
  }
}

// Run the demo
main().catch(console.error); 