# Extension-specific engine for AI extension Tool
# Pure MCP tool - no UI components
import json
import os
from pathlib import Path

def process_extension_request(message: str, attached_files: list = None, attached_images: list = None, workspace: str = None, continue_chat: bool = False):
    """
    Process a request from the VS Code extension through MCP.
    This is a pure processing function without any UI.
    
    Args:
        message: The user's message text
        attached_files: List of file paths to attach
        attached_images: List of image paths to attach
        workspace: Current workspace path
        continue_chat: Whether to continue the conversation
    
    Returns:
        Formatted message string ready for AI processing
    """
    
    # Start with the user's message
    full_response_text = message
    
    # Process attached files if any
    if attached_files or attached_images:
        full_response_text += "\n\n<AI_EXTENSION_ATTACHED_FILES>\n"
        
        workspace_name = None
        if workspace:
            workspace_name = os.path.basename(workspace)
        
        # Process attached files
        if attached_files:
            folders = []
            files = []
            
            for file_path in attached_files:
                if os.path.exists(file_path):
                    # Calculate relative path from workspace
                    if workspace and file_path.startswith(workspace):
                        relative_path = os.path.relpath(file_path, workspace)
                    else:
                        relative_path = os.path.basename(file_path)
                    
                    if os.path.isdir(file_path):
                        folders.append(relative_path)
                    else:
                        files.append(relative_path)
            
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
        
        # Process attached images
        if attached_images:
            full_response_text += "IMAGES:\n"
            for image_path in attached_images:
                if workspace and image_path.startswith(workspace):
                    relative_path = os.path.relpath(image_path, workspace)
                else:
                    relative_path = os.path.basename(image_path)
                full_response_text += f"- {relative_path}\n"
            full_response_text += "\n"
        
        full_response_text += "</AI_EXTENSION_ATTACHED_FILES>\n"
        
        # Add workspace information
        if workspace_name:
            full_response_text += f"\n<AI_EXTENSION_WORKSPACE>{workspace_name}</AI_EXTENSION_WORKSPACE>"
    
    # Add continue chat flag
    full_response_text += f"\n\n<AI_EXTENSION_CONTINUE_CHAT>{str(continue_chat).lower()}</AI_EXTENSION_CONTINUE_CHAT>"
    
    return full_response_text

def run_ui(*args, **kwargs):
    """
    Legacy function name maintained for compatibility.
    For extension mode, this processes the request without UI.
    """
    # Extract parameters from kwargs
    message = kwargs.get('message', '')
    attached_files = kwargs.get('attached_files', [])
    attached_images = kwargs.get('attached_images', [])
    workspace = kwargs.get('workspace', None)
    continue_chat = kwargs.get('continue_chat', False)
    
    return process_extension_request(
        message=message,
        attached_files=attached_files,
        attached_images=attached_images,
        workspace=workspace,
        continue_chat=continue_chat
    )