# AI extension Interface Modes

The AI extension VS Code extension now supports two interface modes to enhance your workflow:

## Interface Modes

### 1. Cursor Integration Mode (Default)
- **Description**: Integrates directly with Cursor chat for seamless workflow
- **Features**:
  - Copies content to clipboard for easy pasting into Cursor chat
  - Shows content in VS Code output channel
  - Inserts AI queries as comments in active editor
  - Supports file attachments with automatic file listing

### 2. Standalone UI Mode
- **Description**: Launches the rich PyQt5 interface with full features
- **Features**:
  - Complete standalone AI extension Tool interface
  - File and image drag-and-drop support
  - Rich text formatting and editing
  - Advanced attachment management
  - Continue conversation functionality

## Configuration

### Settings

Add these settings to your VS Code `settings.json`:

```json
{
  "aiextension.interfaceMode": "cursor-integration", // or "standalone"
  "aiextension.standaloneUIPath": "/path/to/ai_extension_tool/__main__.py",
  "aiextension.mcpServerPath": "/path/to/mcp/server"
}
```

### Configuration Options

- **`aiextension.interfaceMode`**: Choose between `"cursor-integration"` and `"standalone"`
- **`aiextension.standaloneUIPath`**: Path to the standalone AI extension Tool executable (required for standalone mode)
- **`aiextension.mcpServerPath`**: Path to the MCP server executable

## Commands

- **AI extension: Switch Interface Mode** - Quick switcher between modes
- **AI extension: Launch Standalone UI** - Directly launch the standalone interface
- **AI extension: Open Chat** - Opens the appropriate interface based on current mode

## Usage

### Cursor Integration Mode
1. Set mode to `"cursor-integration"` in settings
2. Use the AI extension panel to compose your query
3. Attach files as needed
4. Click "Send" or use "Inject to Cursor" button
5. Content will be copied to clipboard and shown in output
6. Paste into Cursor chat for AI processing

### Standalone Mode
1. Set mode to `"standalone"` in settings
2. Configure `standaloneUIPath` to point to your AI extension Tool
3. Click "Open Chat" or use the command palette
4. The rich PyQt5 interface will launch
5. Use all advanced features like drag-and-drop, image attachments, etc.

## Benefits

- **Flexibility**: Choose the interface that best fits your workflow
- **Seamless Integration**: Cursor mode integrates directly with your chat workflow
- **Full Features**: Standalone mode provides access to all advanced features
- **Easy Switching**: Change modes anytime through settings or quick switcher

## Troubleshooting

### Standalone Mode Issues
- Ensure Python is installed and accessible
- Verify the `standaloneUIPath` points to the correct file
- Check that all dependencies are installed (`PyQt5`, etc.)

### Cursor Integration Issues
- Content is automatically copied to clipboard if injection fails
- Check the output channel for detailed content
- Ensure active editor supports comment insertion

## Example Workflow

1. **Development**: Use Cursor integration for quick code questions
2. **Research**: Switch to standalone mode for complex queries with multiple attachments
3. **Documentation**: Use Cursor integration to insert AI-generated comments
4. **Analysis**: Use standalone mode for comprehensive file analysis with images 