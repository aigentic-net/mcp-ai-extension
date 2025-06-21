# Extension-specific engine for AI extension Tool
# Pure MCP tool - no UI components
import json
import os
from pathlib import Path

def process_extension_request(message: str, attached_files: list = None, attached_images: list = None, workspace: str = None, continue_chat: bool = False, language: str = 'en'):
    """
    Process a request from the VS Code extension through MCP.
    This is a pure processing function without any UI.
    
    Args:
        message: The user's message text
        attached_files: List of file objects from the extension
        attached_images: List of image objects from the extension
        workspace: Current workspace path
        continue_chat: Whether to continue the conversation
        language: The selected language
    
    Returns:
        Formatted message string ready for AI processing or a dictionary for image cases.
    """
    
    # If we have images, we will return structured data
    if attached_images:
        return {
            'text_content': message,
            'attached_files': attached_files or [],
            'attached_images': attached_images or [],
            'continue_chat': continue_chat,
            'language': language
        }

    # Start with the user's message
    full_response_text = message
    
    # Process attached files if any
    if attached_files:
        full_response_text += "\n\n<AI_EXTENSION_ATTACHED_FILES>\n"
        
        workspace_name = None
        if workspace:
            workspace_name = os.path.basename(workspace)

        folders = []
        files = []
        errors = []

        for file_info in attached_files:
            try:
                # In the extension, we receive objects with fullPath and relativePath
                full_path = file_info.get('fullPath')
                relative_path = file_info.get('relativePath')
                item_type = file_info.get('type')

                if not full_path or not relative_path or not item_type:
                    errors.append(f"{file_info.get('name', 'Unknown item')} - Missing path or type info")
                    continue

                if item_type.lower() == 'folder':
                    folders.append(relative_path)
                elif item_type.lower() == 'file':
                    files.append(relative_path)

            except Exception as e:
                errors.append(f"Processing error - {str(e)}")

        if folders:
            full_response_text += "FOLDERS:\n"
            for folder in folders:
                full_response_text += f"- {folder}\n"
            full_response_text += "\n"
        
        if files:
            full_response_text += "FILES:\n"
            for file in files:
                full_response_text += f"- {file}\n"
            full_response_text += "\n"

        if errors:
            full_response_text += "ERRORS:\n"
            for error in errors:
                full_response_text += f"- {error}\n"
            full_response_text += "\n"

        full_response_text += "</AI_EXTENSION_ATTACHED_FILES>\n"
        
        # Add workspace information
        if workspace_name:
            full_response_text += f"\n<AI_EXTENSION_WORKSPACE>{workspace_name}</AI_EXTENSION_WORKSPACE>"
    
    # Add continue chat flag and language
    full_response_text += f"\n\n<AI_EXTENSION_CONTINUE_CHAT>{str(continue_chat).lower()}</AI_EXTENSION_CONTINUE_CHAT>"
    full_response_text += f"\n<AI_EXTENSION_LANGUAGE>{language}</AI_EXTENSION_LANGUAGE>"

    return full_response_text

def run_ui(*args, **kwargs):
    """
    Legacy function name maintained for compatibility.
    For extension mode, this processes the request without UI.
    """
    # Extract parameters from kwargs, which are sent from the extension
    message = kwargs.get('message', '')
    attached_files = kwargs.get('files', []) # Note: key is 'files' from MCPClient
    attached_images = kwargs.get('images', []) # Note: key is 'images'
    workspace = kwargs.get('workspace', None)
    continue_chat = kwargs.get('continue_chat', False)
    language = kwargs.get('language', 'en')
    
    return process_extension_request(
        message=message,
        attached_files=attached_files,
        attached_images=attached_images,
        workspace=workspace,
        continue_chat=continue_chat,
        language=language
    )