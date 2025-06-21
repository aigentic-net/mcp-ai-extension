#!/usr/bin/env python3
"""
Test script for MCP AI extension Tool
Tests both connection and tool functionality
"""

from AI_EXTENSION_tool.utils.mcp_config import mcp_config_manager
from AI_EXTENSION_tool.utils.mcp_client import test_mcp_connection_and_tools

def main():
    """Main test function"""
    print("🧪 AI extension Tool - MCP Connection Test")
    print("=" * 50)
    
    # Display configuration information
    config_status = mcp_config_manager.get_config_status()
    print(f"[MCPConfig] Loaded MCP configuration")
    print()
    
    print("📋 Configuration Information:")
    print(f"  Local config: {'✅' if config_status['local'] else '❌'}")
    print(f"  VS Code config: {'✅' if config_status['vscode'] else '❌'}")
    print(f"  Cursor config: {'✅' if config_status['cursor'] else '❌'}")
    print()
    
    # Display server configuration
    server_config = mcp_config_manager.get_AI_EXTENSION_server_config()
    if server_config:
        print("🔧 Server Configuration:")
        print(f"  Command: {server_config.get('command', 'N/A')}")
        print(f"  Args: {server_config.get('args', 'N/A')}")
        print(f"  Disabled: {server_config.get('disabled', False)}")
        print()
    
    # Test MCP connection and tools in a single session
    print("🔌 Testing MCP Connection and Tools...")
    success = test_mcp_connection_and_tools()
    
    if success:
        print("🎉 All tests passed! The MCP server is working correctly.")
        return True
    else:
        print("❌ MCP tests failed")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 