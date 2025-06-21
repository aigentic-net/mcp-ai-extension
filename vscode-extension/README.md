# AI extension - VS Code Extension

A powerful VS Code extension that brings rich AI interaction capabilities directly to your editor. Built to work seamlessly with the AI extension MCP server, this extension allows you to have context-aware conversations with AI while working on your code.

## Features

🤖 **Rich AI Chat Interface** - Native VS Code sidebar panel for AI conversations
📁 **Smart File Attachments** - Easily attach files and folders from your workspace
🖼️ **Image Support** - Attach and share images in your AI conversations
🔄 **Conversation Continuity** - Continue multi-turn conversations with full context
⚙️ **MCP Integration** - Works with the AI extension MCP server for maximum compatibility
🎨 **VS Code Native** - Follows VS Code design patterns and themes

## Installation

### Prerequisites

1. **VS Code** version 1.74.0 or higher
2. **AI extension MCP Server** - The backend server that handles AI communication
3. **Node.js** (for development) - version 16.x or higher

### Install from VSIX (Recommended)

1. Download the latest `.vsix` file from the releases page
2. Open VS Code
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the command palette
4. Type "Extensions: Install from VSIX" and select it
5. Browse to the downloaded `.vsix` file and install

### Development Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd vscode-extension
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Compile the extension:
   ```bash
   yarn compile
   ```

4. Open in VS Code and press `F5` to launch the Extension Development Host

## Configuration

After installation, configure the extension to connect to your MCP server:

1. Open VS Code Settings (`Ctrl+,` or `Cmd+,`)
2. Search for "AI extension"
3. Configure the following settings:

### Required Settings

- **`aiextension.mcpServerPath`**: Path to your AI extension MCP server executable
- **`aiextension.mcpServerPort`**: Port number for MCP server communication (default: 3000)

### Optional Settings

- **`aiextension.autoAttachOpenFiles`**: Automatically suggest open files for attachment (default: false)
- **`aiextension.maxFileSize`**: Maximum file size for attachments in bytes (default: 1MB)
- **`aiextension.enableImages`**: Enable image attachment support (default: true)

### Example Configuration

```json
{
  "aiextension.mcpServerPath": "/path/to/ai-extension-server",
  "aiextension.mcpServerPort": 3000,
  "aiextension.autoAttachOpenFiles": false,
  "aiextension.maxFileSize": 1048576,
  "aiextension.enableImages": true
}
```

## Usage

### Opening the Chat Panel

1. **Activity Bar**: Click the robot icon (🤖) in the VS Code activity bar
2. **Command Palette**: Press `Ctrl+Shift+P` and type "AI extension: Open Chat"
3. **Keyboard Shortcut**: Use the configured shortcut (if set)

### Basic Chat

1. Type your message in the text area at the bottom of the chat panel
2. Press `Enter` or click the "Send" button
3. View the AI response in the conversation area

### Attaching Files

**Method 1: Using Buttons**
1. Click the "Attach File" button in the chat panel
2. Select files or folders from the file dialog
3. Files will appear in the attachments list

**Method 2: Context Menu**
1. Right-click on any file in the Explorer panel
2. Select "Attach File to AI Chat"

**Method 3: Current File**
1. Open any file in the editor
2. Use `Ctrl+Shift+P` → "AI extension: Attach Current File"

### Attaching Images

1. Click the "Attach Image" button
2. Select image files (PNG, JPG, GIF, etc.)
3. Images will be processed and attached to your conversation

### Managing Conversations

- **New Conversation**: Click the "+" icon in the header to start fresh
- **Continue Chat**: Check the "Continue conversation" checkbox to maintain context
- **Clear Attachments**: Click the clear icon to remove all attached files

### Keyboard Shortcuts

- **Send Message**: `Enter` (or `Shift+Enter` for new line)
- **Attach Current File**: `Ctrl+Shift+A` (configurable)
- **Open Chat**: `Ctrl+Shift+I` (configurable)

## Commands

The extension provides the following commands:

| Command | Description |
|---------|-------------|
| `aiextension.openChat` | Open the AI Chat panel |
| `aiextension.attachFile` | Attach a file to the chat (context menu) |
| `aiextension.attachCurrentFile` | Attach the currently open file |
| `aiextension.newConversation` | Start a new conversation |
| `aiextension.clearAttachments` | Clear all file attachments |

## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to MCP server"
**Solution**: 
1. Verify the MCP server is running
2. Check the `mcpServerPath` and `mcpServerPort` settings
3. Ensure the server is accessible on the specified port

### File Attachment Issues

**Problem**: Files not appearing in attachments
**Solution**:
1. Check file size limits (`maxFileSize` setting)
2. Verify file permissions
3. Ensure the file path is accessible

### Performance Issues

**Problem**: Extension feels slow
**Solution**:
1. Reduce the number of attached files
2. Limit image file sizes
3. Check VS Code's output panel for error messages

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch

# Package for distribution
npm run package
```

### Project Structure

```
vscode-extension/
├── src/                    # TypeScript source files
│   ├── extension.ts        # Main extension entry point
│   ├── chat-panel.ts       # Chat panel webview provider
│   ├── mcp-client.ts       # MCP server communication
│   └── file-manager.ts     # File attachment management
├── media/                  # Webview assets
│   ├── main.css           # Chat interface styles
│   ├── main.js            # Chat interface JavaScript
│   ├── reset.css          # CSS reset
│   └── vscode.css         # VS Code specific styles
├── package.json           # Extension manifest
└── tsconfig.json          # TypeScript configuration
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: Check the main AI extension project documentation
- **Community**: Join our Discord/Slack community for help and discussions

## Changelog

### Version 0.1.0
- Initial release
- Basic chat functionality
- File and image attachment support
- MCP server integration
- VS Code native UI components 