#!/usr/bin/env python3
"""
MCP Setup Script for AI extension Tool
Automatically configures MCP settings for VS Code and Cursor IDE
"""

import sys
import os
from pathlib import Path

# Add the current directory to the path so we can import the module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    """Main setup function"""
    print("🚀 AI extension Tool - MCP Setup")
    print("=" * 50)
    
    try:
        from AI_EXTENSION_tool.utils.mcp_config import setup_mcp_config, mcp_config_manager
        
        # Show current status
        status = mcp_config_manager.get_config_status()
        print("\n📋 Current Configuration Status:")
        print(f"  Local config: {'✅' if status['local'] else '❌'}")
        print(f"  VS Code config: {'✅' if status['vscode'] else '❌'}")
        print(f"  Cursor config: {'✅' if status['cursor'] else '❌'}")
        
        # Run auto-setup
        print("\n🔧 Running auto-setup...")
        success = setup_mcp_config()
        
        if success:
            print("\n✅ MCP setup completed successfully!")
            
            # Show updated status
            status = mcp_config_manager.get_config_status()
            print("\n📋 Updated Configuration Status:")
            print(f"  Local config: {'✅' if status['local'] else '❌'}")
            print(f"  VS Code config: {'✅' if status['vscode'] else '❌'}")
            print(f"  Cursor config: {'✅' if status['cursor'] else '❌'}")
            
            # Show next steps
            print("\n🎯 Next Steps:")
            print("1. Restart VS Code or Cursor IDE")
            print("2. The ai-extension MCP server should now be available")
            print("3. Test the connection using: python test_mcp.py")
            
        else:
            print("\n❌ MCP setup completed with some errors")
            print("Check the output above for details")
            
    except ImportError as e:
        print(f"\n❌ Error importing AI extension Tool: {e}")
        print("Make sure you're in the correct directory and dependencies are installed.")
        return False
        
    except Exception as e:
        print(f"\n❌ Error during setup: {e}")
        return False
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 