import argparse
from mcp.server.fastmcp import FastMCP

# Import from the core module using relative import
from .core import ai_extension_tool, get_tool_description

def create_server():
    """Create and configure the MCP server instance"""
    mcp = FastMCP("AI extension Extension")
    mcp.add_tool(ai_extension_tool, name="ai_extension_tool", description=get_tool_description())
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