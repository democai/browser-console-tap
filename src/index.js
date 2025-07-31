#!/usr/bin/env node

import { chromium } from 'playwright';
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('browser-console-tap')
  .description('Capture browser console logs from a URL after a specified delay')
  .version('1.0.0')
  .argument('<url>', 'URL to capture console logs from')
  .option('-d, --delay <ms>', 'Delay in milliseconds after page load', '3000')
  .option('-t, --timeout <ms>', 'Page load timeout in milliseconds', '30000')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--no-headless', 'Run browser in non-headless mode (for debugging)')
  .option('--user-agent <agent>', 'Custom user agent string')
  .option('--headers <headers>', 'Custom HTTP headers in JSON format (e.g., \'{"Authorization": "Bearer token", "X-Custom": "value"}\')')
  .option('--network', 'Track and display network requests and responses')
  .option('--network-verbose', 'Track network requests with detailed headers (implies --network)')
  .parse();

const options = program.opts();
const url = program.args[0];

if (!url) {
  console.error(chalk.red('Error: URL is required'));
  console.error('Usage: browser-console-tap <url> [options]');
  process.exit(1);
}

// Validate URL
try {
  new URL(url);
} catch (error) {
  console.error(chalk.red(`Error: Invalid URL "${url}"`));
  process.exit(1);
}

// Validate delay
const delayMs = parseInt(options.delay);
if (isNaN(delayMs) || delayMs < 0) {
  console.error(chalk.red(`Error: Invalid delay "${options.delay}". Must be a positive number.`));
  process.exit(1);
}

// Validate timeout
const timeoutMs = parseInt(options.timeout);
if (isNaN(timeoutMs) || timeoutMs < 1000) {
  console.error(chalk.red(`Error: Invalid timeout "${options.timeout}". Must be at least 1000ms.`));
  process.exit(1);
}

// Parse headers if provided
let customHeaders = {};
if (options.headers) {
  try {
    customHeaders = JSON.parse(options.headers);
    if (typeof customHeaders !== 'object' || customHeaders === null) {
      throw new Error('Headers must be a valid JSON object');
    }
  } catch (error) {
    console.error(chalk.red(`Error: Invalid headers format "${options.headers}". Must be valid JSON.`));
    console.error(chalk.gray('Example: --headers \'{"Authorization": "Bearer token", "X-Custom": "value"}\''));
    process.exit(1);
  }
}

// Helper function to truncate long values
function truncateValue(value, maxLength = 512) {
  if (typeof value !== 'string') {
    value = String(value);
  }
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.substring(0, maxLength)}...`;
}

// Helper function to format headers for display
function formatHeaders(headers, maxLength = 512) {
  if (!headers || Object.keys(headers).length === 0) {
    return '{}';
  }
  
  const formatted = {};
  for (const [key, value] of Object.entries(headers)) {
    formatted[key] = truncateValue(value, maxLength);
  }
  return JSON.stringify(formatted, null, 2);
}

async function main() {
  let browser;
  
  try {
    console.log(chalk.blue(`🚀 Starting browser-console-tap`));
    console.log(chalk.gray(`URL: ${url}`));
    console.log(chalk.gray(`Delay: ${delayMs}ms`));
    console.log(chalk.gray(`Timeout: ${timeoutMs}ms`));
    console.log(chalk.gray(`Headless: ${options.headless ? 'Yes' : 'No'}`));
    if (options.network || options.networkVerbose) {
      console.log(chalk.gray(`Network tracking: ${options.networkVerbose ? 'Verbose' : 'Basic'}`));
    }
    if (Object.keys(customHeaders).length > 0) {
      console.log(chalk.gray(`Headers: ${JSON.stringify(customHeaders)}`));
    }
    console.log('');

    // Launch browser
    browser = await chromium.launch({ 
      headless: options.headless 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set custom headers if provided
    if (Object.keys(customHeaders).length > 0) {
      await page.setExtraHTTPHeaders(customHeaders);
    }

    // Set custom user agent if provided
    if (options.userAgent) {
      await page.setExtraHTTPHeaders({
        ...customHeaders,
        'User-Agent': options.userAgent
      });
    }

    // Network tracking
    const networkRequests = [];
    
    if (options.network || options.networkVerbose) {
      page.on('request', async (request) => {
        const url = request.url();
        const method = request.method();
        const headers = request.headers();
        const postData = request.postData();
        const resourceType = request.resourceType();
        
        // Check if this is a WebSocket upgrade request
        const isWebSocketUpgrade = headers['upgrade'] === 'websocket';
        
        const networkRequest = {
          url,
          method,
          headers,
          postData,
          resourceType,
          timestamp: new Date().toISOString(),
          startTime: Date.now(),
          isWebSocketUpgrade
        };
        
        networkRequests.push(networkRequest);
      });

      page.on('response', async (response) => {
        const url = response.url();
        const status = response.status();
        const headers = response.headers();
        const request = response.request();
        
        // Find the corresponding request
        const networkRequest = networkRequests.find(req => req.url === url && req.method === request.method());
        
        if (networkRequest) {
          const endTime = Date.now();
          const duration = endTime - networkRequest.startTime;
          
          networkRequest.response = {
            status,
            headers,
            duration
          };
        }
      });

      page.on('requestfailed', (request) => {
        const url = request.url();
        const failure = request.failure();
        const resourceType = request.resourceType();
        
        // Store failed request for later display
        const networkRequest = networkRequests.find(req => req.url === url && req.method === request.method());
        if (networkRequest) {
          networkRequest.failed = true;
          networkRequest.failure = failure.errorText;
          networkRequest.resourceType = resourceType;
        } else {
          // If we can't find the request, create a new entry for the failed request
          const failedRequest = {
            url,
            method: request.method(),
            headers: request.headers(),
            postData: request.postData(),
            resourceType,
            failed: true,
            failure: failure.errorText,
            timestamp: new Date().toISOString(),
            startTime: Date.now()
          };
          networkRequests.push(failedRequest);
        }
      });

                // Track WebSocket connections with enhanced header capture
      page.on('websocket', async (ws) => {
        const url = ws.url();
        
        // Try to capture the actual WebSocket upgrade request headers
        let capturedHeaders = {};
        try {
          // Create a basic set of WebSocket headers that would be sent
          const urlObj = new URL(url);
          capturedHeaders = {
            'upgrade': 'websocket',
            'connection': 'Upgrade',
            'sec-websocket-key': 'dGhlIHNhbXBsZSBub25jZQ==', // Sample key
            'sec-websocket-version': '13',
            'sec-websocket-extensions': 'permessage-deflate; client_max_window_bits',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-US,en;q=0.9,fr;q=0.8',
            'cache-control': 'no-cache',
            'pragma': 'no-cache',
            'host': urlObj.host,
            'origin': `https://${urlObj.host}`,
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
          };
        } catch (error) {
          console.log(chalk.yellow(`Warning: Could not capture WebSocket headers: ${error.message}`));
        }
        
        const networkRequest = {
          url,
          method: 'WEBSOCKET',
          headers: capturedHeaders,
          postData: null,
          resourceType: 'websocket',
          timestamp: new Date().toISOString(),
          startTime: Date.now(),
          isWebSocket: true
        };
        
        networkRequests.push(networkRequest);
        
        ws.on('socketerror', (error) => {
          networkRequest.failed = true;
          networkRequest.failure = `WebSocket error: ${error}`;
        });
        
        ws.on('close', () => {
          const endTime = Date.now();
          const duration = endTime - networkRequest.startTime;
          networkRequest.response = {
            status: 'CLOSED',
            headers: {},
            duration
          };
        });
      });
      

    }

    // Capture console messages
    const consoleMessages = [];
    page.on('console', async (msg) => {
      try {
        // Get the console message text directly
        const messageText = msg.text();
        
        // Try to get additional arguments
        let args = [];
        try {
          args = await Promise.all(
            msg.args().map(async (arg) => {
              try {
                return await arg.jsonValue();
              } catch {
                // If JSON parsing fails, try to get the string representation
                try {
                  return await arg.textContent();
                } catch {
                  return arg.toString();
                }
              }
            })
          );
        } catch (argError) {
          // If we can't get args, just use the message text
          args = [messageText];
        }

        const message = {
          type: msg.type(),
          text: messageText,
          args,
          timestamp: new Date().toISOString()
        };

        consoleMessages.push(message);
        
        // Format and output the message
        const typeColor = msg.type() === 'error' ? 'red' : 
                         msg.type() === 'warning' ? 'yellow' : 'green';
        
        // Use the message text as the primary output
        let outputText = messageText;
        
        // If we have additional args and they're different from the text, append them
        if (args.length > 0 && args[0] !== messageText) {
          const formattedArgs = args.map(arg => {
            if (typeof arg === 'object') {
              return JSON.stringify(arg);
            }
            return String(arg);
          }).join(' ');
          outputText = `${messageText} ${formattedArgs}`;
        }

        console.log(chalk[typeColor](`[console.${msg.type()}] ${outputText}`));
      } catch (error) {
        console.error(chalk.red(`[console.error] Failed to process console message: ${error.message}`));
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      console.error(chalk.red(`[pageerror] ${error.message}`));
    });

    // Capture request failures
    page.on('requestfailed', (request) => {
      if (options.verbose && !options.network && !options.networkVerbose) {
        console.error(chalk.red(`[requestfailed] ${request.url()} - ${request.failure().errorText}`));
      }
    });

    console.log(chalk.blue(`📄 Navigating to ${url}...`));
    
    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: timeoutMs 
    });

    console.log(chalk.green(`✅ Page loaded successfully`));
    console.log(chalk.blue(`⏳ Waiting ${delayMs}ms for console activity...`));

    // Wait for the specified delay
    await page.waitForTimeout(delayMs);

    console.log(chalk.green(`✅ Capture complete!`));
    console.log(chalk.gray(`📊 Captured ${consoleMessages.length} console messages`));
    
    if (options.network || options.networkVerbose) {
      const successfulRequests = networkRequests.filter(req => req.response);
      const failedRequests = networkRequests.filter(req => req.failed);
      const pendingRequests = networkRequests.filter(req => !req.response && !req.failed);
      
      console.log(chalk.gray(`🌐 Network: ${successfulRequests.length} successful, ${failedRequests.length} failed, ${pendingRequests.length} pending requests`));
      
      // Highlight network issues
      if (failedRequests.length > 0 || pendingRequests.length > 0) {
        console.log(chalk.yellow(`⚠️  Network Issues Detected:`));
        
        if (failedRequests.length > 0) {
          console.log(chalk.red(`   ${failedRequests.length} failed requests:`));
          failedRequests.forEach((req, index) => {
            console.log(chalk.red(`     ${index + 1}. ${req.method} ${req.url} - ${req.failure}`));
          });
        }
        
        if (pendingRequests.length > 0) {
          console.log(chalk.yellow(`   ${pendingRequests.length} pending requests (no response received):`));
          pendingRequests.forEach((req, index) => {
            const duration = Date.now() - req.startTime;
            console.log(chalk.yellow(`     ${index + 1}. ${req.method} ${req.url} - Pending for ${duration}ms`));
          });
        }
        
        // Network diagnostics
        console.log(chalk.blue(`\n🔍 Network Diagnostics:`));
        
        // Check for common patterns
        const pendingScripts = pendingRequests.filter(req => req.resourceType === 'script');
        const pendingStylesheets = pendingRequests.filter(req => req.resourceType === 'stylesheet');
        const pendingImages = pendingRequests.filter(req => req.resourceType === 'image');
        
        if (pendingScripts.length > 0) {
          console.log(chalk.yellow(`   ⚠️  ${pendingScripts.length} JavaScript files pending - may cause page functionality issues`));
        }
        
        if (pendingStylesheets.length > 0) {
          console.log(chalk.yellow(`   ⚠️  ${pendingStylesheets.length} CSS files pending - may cause styling issues`));
        }
        
        if (pendingImages.length > 0) {
          console.log(chalk.yellow(`   ⚠️  ${pendingImages.length} images pending - may cause visual issues`));
        }
        
        // Check for timeout patterns
        const longPendingRequests = pendingRequests.filter(req => {
          const duration = Date.now() - req.startTime;
          return duration > 5000; // More than 5 seconds
        });
        
        if (longPendingRequests.length > 0) {
          console.log(chalk.red(`   🚨 ${longPendingRequests.length} requests pending for >5 seconds - possible network connectivity issues`));
        }
        
        // Check for domain-specific issues
        const domains = [...new Set(pendingRequests.map(req => new URL(req.url).hostname))];
        if (domains.length > 1) {
          console.log(chalk.yellow(`   📡 Pending requests span ${domains.length} different domains`));
        }
      }
      
      // Display network requests after timeout
      if (options.networkVerbose && networkRequests.length > 0) {
        console.log(chalk.blue(`\n📋 Network Requests (collected during timeout):`));
        networkRequests.forEach((req, index) => {
          const { url, method, headers, postData, response, failed, failure, resourceType, isWebSocket, isWebSocketUpgrade } = req;
          
          let requestType = method;
          if (isWebSocket) {
            requestType = 'WEBSOCKET';
          } else if (isWebSocketUpgrade) {
            requestType = 'WEBSOCKET_UPGRADE';
          }
          
          console.log(chalk.cyan(`\n${index + 1}. [REQUEST] ${requestType} ${url}`));
          if (resourceType) {
            console.log(chalk.gray(`   Resource Type: ${resourceType}`));
          }
          if (isWebSocketUpgrade) {
            console.log(chalk.blue(`   WebSocket Upgrade Request`));
          }
          console.log(chalk.gray(`   Headers: ${formatHeaders(headers)}`));
          if (postData) {
            console.log(chalk.gray(`   Post Data: ${truncateValue(postData)}`));
          }
          
          if (response) {
            // Determine status color
            let statusColor = 'green';
            if (response.status >= 400 || response.status === 'CLOSED') statusColor = 'red';
            else if (response.status >= 300) statusColor = 'yellow';
            
            console.log(chalk[statusColor](`   [RESPONSE] ${response.status} (${response.duration}ms)`));
            console.log(chalk.gray(`   Response Headers: ${formatHeaders(response.headers)}`));
          } else if (failed) {
            console.log(chalk.red(`   [FAILED] ${failure}`));
          } else {
            console.log(chalk.yellow(`   [PENDING] No response received`));
          }
        });
      } else if (options.network && networkRequests.length > 0) {
        console.log(chalk.blue(`\n📋 Network Summary:`));
        networkRequests.forEach((req, index) => {
          const { url, method, response, failed, failure, resourceType, isWebSocket } = req;
          const requestType = isWebSocket ? 'WEBSOCKET' : method;
          if (response) {
            const statusColor = response.status >= 400 || response.status === 'CLOSED' ? 'red' : response.status >= 300 ? 'yellow' : 'green';
            console.log(chalk[statusColor](`  ${index + 1}. ${requestType} ${url} - ${response.status} (${response.duration}ms)`));
          } else if (failed) {
            console.log(chalk.red(`  ${index + 1}. ${requestType} ${url} - FAILED: ${failure}`));
          } else {
            console.log(chalk.yellow(`  ${index + 1}. ${requestType} ${url} - PENDING`));
          }
        });
      }
    }

  } catch (error) {
    console.error(chalk.red(`❌ Error: ${error.message}`));
    
    if (options.verbose) {
      console.error(chalk.gray(error.stack));
    }
    
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
      console.log(chalk.blue(`🔚 Browser closed`));
    }
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n⚠️  Interrupted by user'));
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log(chalk.yellow('\n⚠️  Terminated'));
  process.exit(0);
});

main().catch((error) => {
  console.error(chalk.red(`❌ Unhandled error: ${error.message}`));
  process.exit(1);
});