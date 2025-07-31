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

async function main() {
  let browser;
  
  try {
    console.log(chalk.blue(`🚀 Starting browser-console-tap`));
    console.log(chalk.gray(`URL: ${url}`));
    console.log(chalk.gray(`Delay: ${delayMs}ms`));
    console.log(chalk.gray(`Timeout: ${timeoutMs}ms`));
    console.log(chalk.gray(`Headless: ${options.headless ? 'Yes' : 'No'}`));
    console.log('');

    // Launch browser
    browser = await chromium.launch({ 
      headless: options.headless 
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set custom user agent if provided
    if (options.userAgent) {
      await page.setExtraHTTPHeaders({
        'User-Agent': options.userAgent
      });
    }

    // Capture console messages
    const consoleMessages = [];
    page.on('console', async (msg) => {
      try {
        const args = await Promise.all(
          msg.args().map(async (arg) => {
            try {
              return await arg.jsonValue();
            } catch {
              return arg.toString();
            }
          })
        );

        const message = {
          type: msg.type(),
          text: msg.text(),
          args: args,
          timestamp: new Date().toISOString()
        };

        consoleMessages.push(message);
        
        // Format and output the message
        const typeColor = msg.type() === 'error' ? 'red' : 
                         msg.type() === 'warning' ? 'yellow' : 'green';
        
        const formattedArgs = args.map(arg => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg);
          }
          return String(arg);
        }).join(' ');

        console.log(chalk[typeColor](`[console.${msg.type()}] ${formattedArgs}`));
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
      if (options.verbose) {
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