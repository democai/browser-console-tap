# Browser Console Tap

A powerful CLI tool to capture browser console logs from any URL using headless Chrome. Perfect for debugging, monitoring, and testing web applications.

## Features

- 🚀 **Fast & Lightweight**: Uses Playwright for reliable browser automation
- 🎨 **Beautiful Output**: Colored console output with emojis and formatting
- ⚡ **Flexible Timing**: Customizable delay after page load
- 🔧 **Advanced Options**: Custom user agents, timeouts, and verbose logging
- 🧪 **Tested**: Comprehensive test suite included
- 📦 **Easy Installation**: Simple npm package

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Install Dependencies

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

## Output Format

The tool captures and formats console output with color coding:

- 🟢 **Green**: `console.log()` messages
- 🟡 **Yellow**: `console.warn()` messages  
- 🔴 **Red**: `console.error()` messages and page errors

Example output:
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