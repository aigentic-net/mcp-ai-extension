"""
MCP handler utilities for AI extension Tool - Extension Version
Contains the main MCP tool function logic for VS Code extension
"""

from typing import List
from ..engine import process_extension_request
from .response_formatter import (
    format_mixed_response, 
    format_text_only_response, 
    build_error_response,
    validate_response_data
)


def ai_extension_tool(
    message: str = "",
    attached_files: List[str] = None,
    attached_images: List[str] = None,
    workspace: str = None,
    continue_chat: bool = False
) -> List:
    """
    Main AI extension tool function for VS Code extension
    
    This tool processes messages that have been formatted by the VS Code extension.
    The extension provides the UI in the sidebar, and this tool processes the data.
    
    Args:
        message: The user's message text (already formatted by extension)
        attached_files: List of file paths to attach
        attached_images: List of image paths to attach  
        workspace: Current workspace path
        continue_chat: Whether to continue the conversation
    
    Returns:
        List containing TextContent with the processed message
    """
    try:
        # Process the extension request (no UI needed - extension handles UI)
        result = process_extension_request(
            message=message,
            attached_files=attached_files or [],
            attached_images=attached_images or [],
            workspace=workspace,
            continue_chat=continue_chat
        )
        
        # Validate response data
        is_valid, error_msg = validate_response_data(result)
        if not is_valid:
            return build_error_response(error_msg)
        
        # Return the processed message for the AI to use
        return format_text_only_response(result)
            
    except Exception as e:
        return build_error_response(f"Extension processing error: {str(e)}")


def get_tool_description() -> str:
    """
    Get the AI extension tool description for MCP registration
    
    Returns:
        String containing the tool description
    """
    return """
AI extension Tool - VS Code Extension Integration

This tool processes messages formatted by the AI extension VS Code extension.
The extension provides a sidebar UI for composing messages and attaching files,
then this tool processes the formatted data through the MCP protocol.

Workflow:
1. Use the AI extension VS Code extension sidebar to compose messages
2. Attach files and images through the extension UI  
3. Extension formats the message with proper MCP tags
4. Paste the formatted message into Cursor AI chat
5. This tool processes the message and returns the result

The extension handles all UI interactions - this tool focuses on data processing.
""" 