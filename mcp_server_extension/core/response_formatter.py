"""
Response formatter utilities for AI extension Tool - Extension Version
Simplified version without UI dependencies
"""

from typing import List, Dict, Any, Tuple, Union
from mcp.types import TextContent


def format_text_only_response(text_content: str) -> List[TextContent]:
    """
    Format text-only response for MCP
    
    Args:
        text_content: The formatted text content
        
    Returns:
        List containing TextContent object
    """
    return [TextContent(type="text", text=str(text_content))]


def format_mixed_response(response_data: Dict[str, Any]) -> List[Union[TextContent]]:
    """
    Format mixed response (for compatibility, but extension mode uses text-only)
    
    Args:
        response_data: Dictionary containing response data
        
    Returns:
        List containing TextContent object
    """
    text_content = response_data.get('text_content', '')
    return format_text_only_response(text_content)


def build_error_response(error_message: str) -> List[TextContent]:
    """
    Build error response for MCP
    
    Args:
        error_message: Error message to return
        
    Returns:
        List containing error TextContent
    """
    return [TextContent(type="text", text=f"Error: {error_message}")]


def validate_response_data(data: Any) -> Tuple[bool, str]:
    """
    Validate response data
    
    Args:
        data: Data to validate
        
    Returns:
        Tuple of (is_valid: bool, error_message: str)
    """
    if data is None:
        return False, "Response data is None"
    
    if isinstance(data, str) and len(data.strip()) == 0:
        return False, "Response data is empty"
    
    return True, "" 