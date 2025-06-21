"""
MCP handler utilities for AI Interactive Tool
Contains the main MCP tool function logic
"""

from typing import List
from ..engine import run_ui
from .response_formatter import (
    format_mixed_response, 
    format_text_only_response, 
    build_error_response,
    validate_response_data
)


def AI_EXTENSION_tool() -> List:
    """
    Main AI Interactive tool function with image support
    Returns mixed content using modular response formatting
    
    This function handles:
    - Running the UI dialog
    - Validating response data
    - Formatting mixed (text + images) or text-only responses
    - Error handling
    
    Returns:
        List containing TextContent and/or MCPImage objects
    """
    try:
        result = run_ui()
        
        # Validate response data
        is_valid, error_msg = validate_response_data(result)
        if not is_valid:
            return build_error_response(error_msg)
        
        # Check if result has images (structured data)
        if isinstance(result, dict) and 'attached_images' in result:
            return format_mixed_response(result)
        else:
            # Standard text-only response
            return format_text_only_response(result)
            
    except Exception as e:
        return build_error_response(str(e))


def get_tool_description() -> str:
    """
    Get the AI Interactive tool description for MCP registration
    
    Returns:
        String containing the tool description
    """
    from ..description import AI_EXTENSION_DESCRIPTION
    return AI_EXTENSION_DESCRIPTION 