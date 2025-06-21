"""
VS Code specific engine for AI extension Tool
Handles integration with VS Code extension UI
"""

def run_vscode_ui():
    """
    Run the VS Code extension UI version of the tool
    This function integrates with the VS Code webview panel
    
    Returns:
        Dict containing the response data from the VS Code UI
    """
    # The actual UI is handled by the VS Code extension
    # This function just returns an empty response to allow the extension to take over
    return {
        'text': '',
        'attached_files': [],
        'attached_images': [],
        'continue_chat': True,  # Default to true to keep the conversation going
        'language': 'en'  # Default to English
    } 