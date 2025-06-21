import argparse
import os
from mcp.server.fastmcp import FastMCP

# Import from the core module using relative import
from .core import AI_EXTENSION_tool, get_tool_description

def is_running_in_vscode():
    """Detect if we're running in VS Code"""
    return bool(os.environ.get('VSCODE_PID') or os.environ.get('VSCODE_CWD'))

def create_server():
    """Create and configure the MCP server instance"""
    mcp = FastMCP("AI extension Extension")
    
    # Create a wrapper that sets use_vscode_ui based on context
    def tool_wrapper(*args, **kwargs):
        kwargs['use_vscode_ui'] = is_running_in_vscode()
        return AI_EXTENSION_tool(*args, **kwargs)
    
    # Register the wrapped tool
    mcp.add_tool(
        tool_wrapper, 
        name="mcp_ai-extension_ai_extension_tool", 
        description=get_tool_description()
    )
    return mcp

def main():
    """Main entry point for the MCP server"""
    parser = argparse.ArgumentParser(description="AI extension MCP Server - Extension Version")
    parser.add_argument(
        "--transport", 
        default="stdio", 
        help="Transport mechanism (default: stdio)"
    )
    args = parser.parse_args()
    
    # Create and run the server
    server = create_server()
    server.run(transport=args.transport)

if __name__ == "__main__":
    main() 