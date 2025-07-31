import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test server HTML that generates console logs
const testHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Console Test Page</title>
</head>
<body>
    <h1>Console Test Page</h1>
    <script>
        // Immediate console logs
        console.log('Immediate log message');
        console.warn('Immediate warning');
        console.error('Immediate error');
        
        // Delayed console logs
        setTimeout(() => {
            console.log('Delayed log message');
            console.warn('Delayed warning');
            console.error('Delayed error');
            console.log('Object test:', { key: 'value', number: 42 });
            console.log('Array test:', [1, 2, 3, 'test']);
        }, 1000);
        
            // Error that will be caught
    setTimeout(() => {
        try {
            throw new Error('Test error message');
        } catch (e) {
            console.error('Caught error:', e.message);
        }
    }, 2000);
    </script>
</body>
</html>
`;

// Create a simple HTTP server for testing
function createTestServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(testHtml);
    });
    
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, url: `http://localhost:${port}` });
    });
  });
}

// Run the CLI tool and capture output
function runCLI(args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [join(__dirname, '../src/index.js'), ...args], {
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
      resolve({ code, stdout, stderr });
    });
    
    child.on('error', reject);
  });
}

// Test helper function
function expect(condition, message) {
  if (!condition) {
    throw new Error(`Test failed: ${message}`);
  }
}

async function runTests() {
  console.log('🧪 Running browser-console-tap tests...\n');
  
  let testServer;
  
  try {
    // Test 1: Basic functionality
    console.log('📋 Test 1: Basic functionality');
    testServer = await createTestServer();
    
    const result1 = await runCLI([testServer.url, '--delay', '3000']);
    
    expect(result1.code === 0, 'CLI should exit with code 0');
    expect(result1.stdout.includes('Immediate log message'), 'Should capture immediate console.log');
    expect(result1.stdout.includes('Immediate warning'), 'Should capture immediate console.warn');
    expect(result1.stdout.includes('Immediate error'), 'Should capture immediate console.error');
    expect(result1.stdout.includes('Delayed log message'), 'Should capture delayed console.log');
    expect(result1.stdout.includes('Delayed warning'), 'Should capture delayed console.warn');
    expect(result1.stdout.includes('Delayed error'), 'Should capture delayed console.error');
    expect(result1.stdout.includes('Object test:'), 'Should capture object logging');
    expect(result1.stdout.includes('Array test:'), 'Should capture array logging');
    expect(result1.stdout.includes('Caught error:'), 'Should capture page errors');
    
    console.log('✅ Test 1 passed\n');
    
    // Test 2: Error handling - invalid URL
    console.log('📋 Test 2: Error handling - invalid URL');
    const result2 = await runCLI(['invalid-url']);
    
    expect(result2.code !== 0, 'CLI should exit with non-zero code for invalid URL');
    expect(result2.stderr.includes('Invalid URL'), 'Should show invalid URL error');
    
    console.log('✅ Test 2 passed\n');
    
    // Test 3: Error handling - invalid delay
    console.log('📋 Test 3: Error handling - invalid delay');
    const result3 = await runCLI([testServer.url, '--delay', 'invalid']);
    
    expect(result3.code !== 0, 'CLI should exit with non-zero code for invalid delay');
    expect(result3.stderr.includes('Invalid delay'), 'Should show invalid delay error');
    
    console.log('✅ Test 3 passed\n');
    
    // Test 4: Custom delay
    console.log('📋 Test 4: Custom delay');
    const startTime = Date.now();
    const result4 = await runCLI([testServer.url, '--delay', '1000']);
    const endTime = Date.now();
    
    expect(result4.code === 0, 'CLI should exit with code 0');
    expect(endTime - startTime >= 1000, 'Should respect custom delay');
    
    console.log('✅ Test 4 passed\n');
    
    // Test 5: Verbose mode
    console.log('📋 Test 5: Verbose mode');
    const result5 = await runCLI([testServer.url, '--delay', '1000', '--verbose']);
    
    expect(result5.code === 0, 'CLI should exit with code 0');
    expect(result5.stdout.includes('Starting browser-console-tap'), 'Should show verbose output');
    
    console.log('✅ Test 5 passed\n');
    
    // Test 6: Non-headless mode
    console.log('📋 Test 6: Non-headless mode');
    const result6 = await runCLI([testServer.url, '--delay', '1000', '--no-headless']);
    
    expect(result6.code === 0, 'CLI should exit with code 0');
    expect(result6.stdout.includes('Headless: No'), 'Should show non-headless mode');
    
    console.log('✅ Test 6 passed\n');
    
    // Test 7: Custom user agent
    console.log('📋 Test 7: Custom user agent');
    const result7 = await runCLI([testServer.url, '--delay', '1000', '--user-agent', 'TestBot/1.0']);
    
    expect(result7.code === 0, 'CLI should exit with code 0');
    
    console.log('✅ Test 7 passed\n');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    if (testServer) {
      testServer.server.close();
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}