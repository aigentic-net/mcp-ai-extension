"""
Response formatter utilities for AI extension Tool - Extension Version
"""

from typing import List, Dict, Any, Tuple, Union
from mcp.types import TextContent


def format_extension_response(
    text: str,
    attached_files: List[str] = None,
    workspace: str = None,
    continue_chat: bool = False
) -> str:
    """Format response in AI Interactive Tool style but with extension tags"""
    response_parts = []
    
    # Add text content
    response_parts.append(text)
    response_parts.append("")  # Empty line after text
    
    # Add attached files if any
    if attached_files:
        response_parts.append("<AI_EXTENSION_ATTACHED_FILES>")
        
        # Group by folders and files
        folders = []
        files = []
        for path in attached_files:
            if path.endswith('/'):
                folders.append(path)
            else:
                files.append(path)
                
        if folders:
            response_parts.append("FOLDERS:")
            for folder in folders:
                response_parts.append(f"- {folder}")
            response_parts.append("")
            
        if files:
            response_parts.append("FILES:")
            for file in files:
                response_parts.append(f"- {file}")
                
        response_parts.append("</AI_EXTENSION_ATTACHED_FILES>")
        response_parts.append("")
        
    # Add workspace if files are attached
    if attached_files and workspace:
        response_parts.append(f"<AI_EXTENSION_WORKSPACE>{workspace}</AI_EXTENSION_WORKSPACE>")
        response_parts.append("")
        
    # Add continue chat tag
    response_parts.append(f"<AI_EXTENSION_CONTINUE_CHAT>{str(continue_chat).lower()}</AI_EXTENSION_CONTINUE_CHAT>")
    
    return "\n".join(response_parts)


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
    Format mixed response with extension tags
    
    Args:
        response_data: Dictionary containing response data
        
    Returns:
        List containing TextContent object
    """
    formatted_text = format_extension_response(
        text=response_data.get('text', ''),
        attached_files=response_data.get('attached_files'),
        workspace=response_data.get('workspace'),
        continue_chat=response_data.get('continue_chat', False)
    )
    return format_text_only_response(formatted_text)


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