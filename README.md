# 🚀 MCP Server AI extension

**Modern AI extension tool with advanced UI and powerful features for Model Context Protocol (MCP)**

## ✨ Features

- 🎨 **Modern Dark Theme UI** - Beautiful, responsive interface with PyQt5
- 📁 **Advanced File Management** - Browse, select, and attach files/folders with workspace support
- 🖼️ **Image Support** - Drag & drop images, paste from clipboard, with preview functionality
- 🌐 **Multi-language Support** - English and Vietnamese translations
- 💾 **Smart Persistence** - Remember your preferences, workspace, and attached files
- 🔄 **Continue Conversations** - Seamless chat continuation with smart state management
- 🎯 **Workspace-Aware** - Intelligent relative path handling for better code context
- ⚡ **Fast & Responsive** - Optimized performance with async operations

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Run the tool directly
python -m ai_extension_tool
```

### Usage with MCP

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "ai-extension": {
      "command": "python",
      "args": ["-m", "ai_extension_tool"],
      "cwd": "/path/to/mcp-ai-extension"
    }
  }
}
```

## 📋 How It Works

### Basic Workflow

1. **Launch Tool**: Call the MCP tool or run directly
2. **Enter Message**: Type your message in the text area
3. **Attach Files** (Optional): Use the file browser to select files/folders
4. **Attach Images** (Optional): Drag & drop or select images
5. **Configure Options**: Set continue conversation and other preferences
6. **Send**: Submit your message with all attachments

### Advanced Features

#### Workspace Management
- Set a workspace root directory for consistent relative paths
- All file attachments are relative to your workspace
- Workspace state is remembered between sessions

#### File Attachments
- Browse and select multiple files and folders
- Supports all file types with intelligent type detection
- Workspace-relative paths for better code context
- Multi-select with Ctrl+Click and Shift+Click

#### Image Attachments
- Drag & drop images directly into the interface
- Paste images from clipboard (Ctrl+V in text area)
- Support for PNG, JPG, GIF, BMP, WebP formats
- Image previews with click-to-enlarge functionality
- Smart duplicate detection

#### Continue Conversations
- Enable "Continue conversation" to keep the chat active
- Tool automatically reopens after AI responds
- Perfect for multi-step tasks and iterative development

## 🔧 Configuration

The tool automatically saves your preferences:
- Window size and position
- Language preference
- Workspace directory
- Attached files state
- Continue conversation setting
- Image save preferences

## 📖 Output Format

### AI extension Tool

The tool outputs structured data for AI processing:

```python
# Call "ai_extension" to launch the UI
```

#### With File Attachments

```
Your message content

<AI_extension_ATTACHED_FILES>
FOLDERS:
- src/components

FILES:
- src/utils/helper.js
- config/settings.json

</AI_extension_ATTACHED_FILES>

<AI_extension_WORKSPACE>my-project</AI_extension_WORKSPACE>
<AI_extension_CONTINUE_CHAT>true/false</AI_extension_CONTINUE_CHAT>
```

#### With Images

When images are attached, they're included as base64 data in the response for AI processing.

## 🏗️ Project Structure

```
mcp-ai-extension/
├── ai_extension_tool/       # Main package
│   ├── core/                  # Core functionality
│   │   ├── dialog.py         # Main UI dialog
│   │   ├── config.py         # Configuration management
│   │   └── mcp_handler.py    # MCP integration
│   ├── ui/                   # UI components
│   │   ├── file_dialog.py    # File selection dialog
│   │   ├── image_attachment.py # Image handling
│   │   └── styles.py         # UI styling
│   └── utils/                # Utilities
│       ├── translations.py   # Multi-language support
│       └── file_utils.py     # File operations
├── user_images/              # Stored images
├── pyproject.toml           # Package configuration
└── README.md               # This file
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all dependencies are installed
   ```bash
   pip install -r requirements.txt
   ```

2. **PyQt5 Issues**: Install PyQt5 system dependencies
   - Try `python -m ai_extension_tool` instead

3. **Permission Errors**: Ensure write access to the project directory

4. **Image Issues**: Check that image files are in supported formats (PNG, JPG, GIF, BMP, WebP)

### Debug Mode

Run with debug output:
```bash
python -m ai_extension_tool --debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with PyQt5 for the modern UI
- Uses Model Context Protocol (MCP) for AI integration
- Inspired by the need for better AI-developer extension tools

## 📧 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section above

---

**Happy coding with AI extension Tool! 🚀**

---

*Copyright (c) 2025 DemonVN - AI extension Tool*
