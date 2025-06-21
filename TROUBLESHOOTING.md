# AI extension Tool - Troubleshooting Guide

## Issues Resolved

### 1. Standalone Tool Not Launching
**Problem**: The AI extension Tool didn't launch in standalone mode as expected.

**Root Cause**: The `python -m ai_extension_tool` command was calling the MCP server instead of the UI.

**Solution Applied**:
- Created a direct launcher script: `launch_standalone.py`
- Use the command: `python launch_standalone.py` to launch the standalone UI
- Or use: `python -c "from ai_extension_tool.engine import run_ui; run_ui()"`

**Verification**: The PyQt5 interface should now open with the full AI extension Tool UI.

### 2. VS Code Extension Blank Screen
**Problem**: The VS Code extension panel was showing a blank screen.

**Root Cause**: Missing "Inject to Cursor" button and functionality in the webview.

**Solutions Applied**:
- Added "Inject to Cursor" button to the webview HTML
- Implemented JavaScript handler for the button
- Added CSS styles for the new button and feedback messages
- Compiled TypeScript to apply all changes

**Verification**: The VS Code extension should now show:
- AI extension Chat panel with proper UI
- "Inject to Cursor" button next to "Send" button
- Proper styling and functionality

## Current Status

### ✅ Fixed Issues
1. **Standalone UI**: Now launches properly using `launch_standalone.py`
2. **VS Code Extension**: Now displays properly with Cursor integration functionality
3. **Interface Modes**: Both standalone and Cursor integration modes are working

### 🎯 How to Use

#### Standalone Mode
```bash
# Method 1: Using the launcher script
python launch_standalone.py

# Method 2: Direct import
python -c "from ai_extension_tool.engine import run_ui; run_ui()"
```

#### VS Code Extension
1. Open the AI extension panel in VS Code
2. Type your message
3. Attach files if needed
4. Choose between:
   - **Send**: Processes through MCP server
   - **Inject to Cursor**: Copies to clipboard and injects into Cursor chat

#### Interface Mode Switching
- Use Command Palette: "AI extension: Switch Interface Mode"
- Or configure in settings: `aiextension.interfaceMode`

## Configuration

### VS Code Settings
```json
{
  "aiextension.interfaceMode": "cursor-integration",
  "aiextension.standaloneUIPath": "/Users/hildarayan/Projects/mcp-ai-extension/launch_standalone.py",
  "aiextension.mcpServerPath": "/Users/hildarayan/Projects/mcp-ai-extension/ai_extension_tool/server.py"
}
```

### Environment Requirements
- Python 3.12+ with PyQt5 installed
- VS Code with the AI extension extension
- MCP server dependencies

## Testing Commands

### Test Standalone Launch
```bash
cd /Users/hildarayan/Projects/mcp-ai-extension
python launch_standalone.py
```

### Test VS Code Extension
1. Open VS Code in the project directory
2. Open Command Palette (Cmd+Shift+P)
3. Run "AI extension: Open Chat"
4. Verify the panel loads with buttons

### Test Cursor Integration
1. Type a message in the AI extension panel
2. Click "Inject to Cursor"
3. Check clipboard content
4. Check VS Code Output channel

## Advanced Troubleshooting

### If Standalone Still Doesn't Launch
```bash
# Check Python and PyQt5
python -c "import PyQt5; print('PyQt5 OK')"

# Check module import
python -c "from ai_extension_tool.engine import run_ui; print('Import OK')"

# Run with error output
python -c "
import sys
try:
    from ai_extension_tool.engine import run_ui
    run_ui()
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
"
```

### If VS Code Extension Still Blank
1. Check browser console in VS Code Developer Tools
2. Verify media files exist in `vscode-extension/media/`
3. Recompile TypeScript: `cd vscode-extension && npm run compile`
4. Restart VS Code

### If MCP Server Issues
```bash
# Test MCP server directly
cd /Users/hildarayan/Projects/mcp-ai-extension
python -m ai_extension_tool.server
```

## Success Indicators

### Standalone Tool Working
- PyQt5 window opens with dark theme
- File attachment drag-and-drop works
- Image attachment functionality available
- "Continue conversation" checkbox present

### VS Code Extension Working
- Panel shows "AI extension Chat" header
- Attach File and Attach Image buttons visible
- Message input area with Send and "Inject to Cursor" buttons
- Attachments section shows attached files

### Cursor Integration Working
- "Inject to Cursor" button copies content to clipboard
- Content appears in VS Code Output channel
- Notification shows successful injection
- Content can be pasted into Cursor chat

## Next Steps

1. **Test Both Modes**: Try both standalone and Cursor integration
2. **Configure Paths**: Set up the VS Code settings with correct paths
3. **Workflow Integration**: Use the appropriate mode for different tasks
4. **Feedback**: Report any remaining issues for further troubleshooting 