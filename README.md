# Browser Console Tap

A powerful CLI tool to capture browser console logs from any URL using headless Chrome. Perfect for debugging, monitoring, and testing web applications.

## Features

- 🚀 **Fast & Lightweight**: Uses Playwright for reliable browser automation
- 🎨 **Beautiful Output**: Colored console output with emojis and formatting
- ⚡ **Flexible Timing**: Customizable delay after page load
- 🔧 **Advanced Options**: Custom user agents, headers, timeouts, and verbose logging
- 🌐 **Network Monitoring**: Track requests, responses, headers, and timing with `--network` and `--network-verbose`
- 🧪 **Tested**: Comprehensive test suite included
- 📦 **Easy Installation**: Simple npm package

## Use Cases

### AI Agent Pipelines

This tool is particularly valuable in AI Agent pipelines where automated testing and validation of web applications is required. AI agents can use this script to:

- **Test Site Functionality**: Verify that a deployed website is working correctly and all dependencies are functioning
- **Monitor Console Errors**: Capture JavaScript errors, warnings, and logs to identify issues in production
- **Validate Dependencies**: Ensure that all external libraries, APIs, and resources are loading properly
- **Automated Health Checks**: Run scheduled checks to monitor site health and alert on issues
- **CI/CD Integration**: Integrate into deployment pipelines to verify successful deployments
- **Debug Remote Issues**: Troubleshoot problems on sites that are difficult to access or reproduce locally
- **Authenticated Testing**: Test protected endpoints and APIs with authentication headers
- **Network Analysis**: Monitor API calls, resource loading, and network performance
- **Security Auditing**: Track request/response headers to identify security issues
- **Performance Monitoring**: Measure load times and identify slow resources

The script's headless browser automation makes it perfect for server environments where GUI browsers aren't available, and its structured output format allows AI agents to parse and analyze results programmatically.

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Install Playwright Browsers

Before using the tool, you need to install the Playwright browsers:

```bash
npx playwright install chromium
```

### Global Installation

To install the tool globally and use it from anywhere on your system:

#### Option 1: Install from Local Directory

```bash
# Clone the repository first
git clone <repository-url>
cd browser-console-tap

# Install globally from the local directory
npm install -g .
```

#### Option 2: Install from Git Repository

```bash
npm install -g <repository-url>
```

After global installation, you can run the tool from any directory:

```bash
browser-console-tap https://example.com
```

**Note**: This package is not yet published to npm. Use one of the installation methods above until it's available on the npm registry.

### Local Development Installation

#### Install Dependencies

```bash
npm install
```

### Install Playwright Browsers

```bash
npx playwright install chromium
```

### Make Executable (Optional)

```bash
chmod +x src/index.js
```

## Usage

### Basic Usage

```bash
# Capture console logs from a URL with default 3-second delay
browser-console-tap https://example.com

# Or run directly with node
node src/index.js https://example.com
```

### Advanced Usage

```bash
# Custom delay (in milliseconds)
browser-console-tap --delay 5000 https://example.com

# Verbose logging
browser-console-tap --verbose https://example.com

# Custom timeout
browser-console-tap --timeout 60000 https://example.com

# Non-headless mode (for debugging)
browser-console-tap --no-headless https://example.com

# Custom user agent
browser-console-tap --user-agent "MyBot/1.0" https://example.com

# With authentication headers
browser-console-tap --headers '{"Authorization": "Bearer your-token"}' https://api.example.com

# With multiple custom headers
browser-console-tap --headers '{"Authorization": "Bearer token", "X-API-Key": "your-key", "Content-Type": "application/json"}' https://example.com

# Combine multiple options
browser-console-tap --delay 4000 --verbose --timeout 30000 https://example.com
```

### Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--delay <ms>` | `-d` | Delay in milliseconds after page load | `3000` |
| `--timeout <ms>` | `-t` | Page load timeout in milliseconds | `30000` |
| `--verbose` | `-v` | Enable verbose logging | `false` |
| `--no-headless` | | Run browser in non-headless mode | `true` |
| `--user-agent <agent>` | | Custom user agent string | Browser default |
| `--headers <headers>` | | Custom HTTP headers in JSON format | None |
| `--network` | | Track and display network requests and responses | `false` |
| `--network-verbose` | | Track network requests with detailed headers (implies --network) | `false` |

## Examples

### Debugging a React App

```bash
browser-console-tap --delay 2000 --verbose https://my-react-app.com
```

### Monitoring Production Errors

```bash
browser-console-tap --delay 10000 --timeout 60000 https://myapp.com
```

### Testing with Custom User Agent

```bash
browser-console-tap --user-agent "TestBot/1.0" --delay 5000 https://example.com
```

### Testing with Authentication Headers

```bash
# Basic authentication
browser-console-tap --headers '{"Authorization": "Bearer your-jwt-token"}' https://api.example.com

# API with custom headers
browser-console-tap --headers '{"X-API-Key": "your-api-key", "Accept": "application/json"}' https://api.example.com

# Multiple authentication headers
browser-console-tap --headers '{"Authorization": "Bearer token", "X-Client-ID": "client123", "X-Request-ID": "req456"}' https://secure-api.example.com

# Track network requests
browser-console-tap --network https://example.com

# Track network requests with detailed headers
browser-console-tap --network-verbose https://example.com

# Combine network tracking with other options
browser-console-tap --network --delay 5000 --verbose https://example.com
```

## Output Format

The tool captures and formats console output with color coding:

- 🟢 **Green**: `console.log()` messages
- 🟡 **Yellow**: `console.warn()` messages  
- 🔴 **Red**: `console.error()` messages and page errors

### Console Output Example:
```
🚀 Starting browser-console-tap
URL: https://example.com
Delay: 3000ms
Timeout: 30000ms
Headless: Yes

📄 Navigating to https://example.com...
✅ Page loaded successfully
⏳ Waiting 3000ms for console activity...
[console.log] Hello World
[console.warn] This is a warning
[console.error] This is an error
[pageerror] Uncaught TypeError: Cannot read property 'x' of undefined
✅ Capture complete!
📊 Captured 4 console messages
🔚 Browser closed
```

### Network Output Format

When using `--network` or `--network-verbose`, the tool also tracks network requests:

#### Basic Network Tracking (`--network`):
```
🌐 Network tracking: Basic
📄 Navigating to https://example.com...
✅ Page loaded successfully
📡 [200] https://example.com/ (245ms)
📡 [200] https://example.com/style.css (89ms)
📡 [200] https://example.com/script.js (156ms)
📡 [404] https://example.com/missing.js (12ms)
✅ Capture complete!
📊 Captured 2 console messages
🌐 Network: 3 successful, 1 failed requests
🔚 Browser closed
```

#### Verbose Network Tracking (`--network-verbose`):
```
🌐 Network tracking: Verbose
📄 Navigating to https://example.com...
✅ Page loaded successfully
🌐 [REQUEST] GET https://example.com/
   Headers: {
     "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
     "accept-language": "en-US,en;q=0.5",
     "user-agent": "Mozilla/5.0..."
   }
📡 [RESPONSE] 200 https://example.com/ (245ms)
   Response Headers: {
     "content-type": "text/html; charset=utf-8",
     "content-length": "12345",
     "server": "nginx/1.18.0"
   }
🌐 [REQUEST] GET https://example.com/style.css
📡 [RESPONSE] 200 https://example.com/style.css (89ms)
✅ Capture complete!
📊 Captured 2 console messages
🌐 Network: 2 successful, 0 failed requests

📋 Network Summary:
  1. GET https://example.com/ - 200 (245ms)
  2. GET https://example.com/style.css - 200 (89ms)
🔚 Browser closed
```

**Network Status Color Coding:**
- 🟢 **Green**: 2xx responses (success)
- 🟡 **Yellow**: 3xx responses (redirects)
- 🔴 **Red**: 4xx/5xx responses (client/server errors)
- 🔴 **Red**: Failed requests (network errors, timeouts, etc.)

## Testing

Run the test suite to verify functionality:

```bash
npm test
```

The test suite includes:
- Basic functionality testing
- Error handling validation
- Custom options testing
- Performance verification

## Development

### Project Structure

```
browser-console-tap/
├── src/
│   └── index.js          # Main CLI application
├── test/
│   └── test.js          # Test suite
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

### Available Scripts

```bash
npm start          # Run the application
npm test           # Run tests
npm run demo       # Run basic demo
npm run demo:auth  # Run authentication headers demo
npm run demo:network # Run network monitoring demo
npm run lint       # Lint code
npm run format     # Format code
```

### Adding Features

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## Troubleshooting

### Common Issues

**Playwright browser not found:**
```bash
npx playwright install chromium
```

**Permission denied:**
```bash
chmod +x src/index.js
```

**Timeout errors:**
- Increase the `--timeout` value
- Check your internet connection
- Verify the URL is accessible

**No console output:**
- Some sites may block headless browsers
- Try `--no-headless` mode
- Check if the site requires authentication

### Debug Mode

For debugging, use the `--no-headless` flag to see the browser window:

```bash
browser-console-tap --no-headless --delay 5000 https://example.com
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Playwright](https://playwright.dev/) - Browser automation library
- [Commander.js](https://github.com/tj/commander.js) - CLI framework
- [Chalk](https://github.com/chalk/chalk) - Terminal styling

---

Made with ❤️ for the developer community