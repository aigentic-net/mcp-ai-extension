I'll help you find the UI launch script in the codebase. Let me explore the filesystem structure to locate the relevant files.

First, let's look in the `ai_interactive_tool` directory since it contains a `ui` folder:

Ran tool
Let's examine the contents of `dialog.py` as it seems most likely to contain the UI launch code:

Ran tool
Based on my analysis of the codebase, I can tell you where the UI gets launched and how it works:

1. The main UI is defined in `/Users/hildarayan/Projects/mcp-ai-extension/mcp-ai-interactive/ai_interactive_tool/core/dialog.py`. This file contains the `InputDialog` class which is the main UI dialog that gets launched.

2. The UI is built using PyQt5 and consists of several key components:
   - A text input area for messages
   - File attachment functionality
   - Image attachment functionality
   - Language selection (English/Vietnamese)
   - Continue chat checkbox
   - Submit and Close buttons

3. The UI gets launched through the static method `InputDialog.getText()` at the end of the file, which:
   - Creates a new instance of `InputDialog`
   - Shows the dialog modally (waits for user input)
   - Returns the result as a tuple containing:
     - The input text and attachments as JSON
     - Whether to continue the chat
     - Whether the result is ready

4. The UI is modular and uses several supporting components from the `ui` directory:
   - `file_dialog.py` - For file selection
   - `file_tree.py` - For file tree visualization
   - `image_attachment.py` - For handling image attachments
   - `image_viewer.py` - For viewing attached images
   - `styles.py` - For UI styling

5. The dialog integrates with a configuration manager (`ConfigManager`) to persist settings like:
   - Window size
   - Language preference
   - Last used workspace
   - Attached files
   - UI preferences

The UI is launched whenever the AI interactive tool needs user input, and it provides a rich interface for text input, file attachments, and image attachments, with support for both English and Vietnamese languages.
