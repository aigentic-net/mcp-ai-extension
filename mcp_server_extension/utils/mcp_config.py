"""
MCP Configuration Manager for AI extension Tool
Auto-detects and inherits MCP server configurations from VS Code and Cursor IDE
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, Optional, List, Tuple


class MCPConfigManager:
    """
    Manages MCP server configuration with auto-detection from VS Code and Cursor IDE
    """
    
    def __init__(self):
        """Initialize the MCP config manager"""
        self.home_dir = Path.home()
        self.vscode_mcp_path = self.home_dir / '.vscode' / 'mcp.json'
        self.cursor_mcp_path = self.home_dir / '.cursor' / 'mcp.json'
        self.local_mcp_path = Path(__file__).parent.parent / 'mcp_config.json'
        
        self.config = self._load_mcp_config()
    
    def _load_mcp_config(self) -> Dict:
        """
        Load MCP configuration with priority: local -> Cursor -> VS Code -> default
        
        Returns:
            Dict: MCP configuration
        """
        config_sources = [
            (self.local_mcp_path, "Local AI extension"),
            (self.cursor_mcp_path, "Cursor IDE"),
            (self.vscode_mcp_path, "VS Code")
        ]
        
        for config_path, source_name in config_sources:
            if config_path.exists():
                try:
                    config = self._read_mcp_file(config_path)
                    if config and 'mcpServers' in config:
                        print(f"[MCPConfig] Loaded MCP configuration from {source_name}: {config_path}", file=sys.stderr)
                        return config
                except Exception as e:
                    print(f"[MCPConfig] Error reading {source_name} config at {config_path}: {e}", file=sys.stderr)
                    continue
        
        # Return default configuration if no valid config found
        print("[MCPConfig] No valid MCP configuration found, using default", file=sys.stderr)
        return self._get_default_config()
    
    def _read_mcp_file(self, config_path: Path) -> Optional[Dict]:
        """
        Read and parse MCP configuration file
        
        Args:
            config_path: Path to the MCP configuration file
            
        Returns:
            Dict or None: Parsed configuration or None if invalid
        """
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
                
            # Validate basic structure
            if not isinstance(config, dict):
                print(f"[MCPConfig] Invalid config format in {config_path}: not a dictionary", file=sys.stderr)
                return None
                
            return config
            
        except json.JSONDecodeError as e:
            print(f"[MCPConfig] JSON decode error in {config_path}: {e}", file=sys.stderr)
            return None
        except Exception as e:
            print(f"[MCPConfig] Error reading {config_path}: {e}", file=sys.stderr)
            return None
    
    def _get_default_config(self) -> Dict:
        """
        Get default MCP configuration
        
        Returns:
            Dict: Default MCP configuration
        """
        return {
            "mcpServers": {
                "ai-extension": {
                    "command": "python",
                    "args": ["-m", "ai_extension_tool.server"],
                    "env": {},
                    "disabled": False,
                    "timeout": 60
                }
            }
        }
    
    def get_ai_extension_server_config(self) -> Optional[Dict]:
        """
        Get AI extension server configuration
        
        Returns:
            Dict or None: Server configuration for ai-extension
        """
        servers = self.config.get('mcpServers', {})
        
        # Look for ai-extension server with various possible names
        possible_names = ['ai-extension', 'ai_extension', 'aiextension', 'AI extension']
        
        for name in possible_names:
            if name in servers:
                server_config = servers[name]
                if not server_config.get('disabled', False):
                    return server_config
        
        # If not found, return default
        return self._get_default_config()['mcpServers']['ai-extension']
    
    def get_all_servers(self) -> Dict:
        """
        Get all MCP server configurations
        
        Returns:
            Dict: All server configurations
        """
        return self.config.get('mcpServers', {})
    
    def get_server_command_and_args(self, server_name: str = 'ai-extension') -> Tuple[str, List[str]]:
        """
        Get command and arguments for a specific server
        
        Args:
            server_name: Name of the MCP server
            
        Returns:
            Tuple[str, List[str]]: (command, args)
        """
        server_config = self.get_ai_extension_server_config()
        
        if server_config:
            command = server_config.get('command', 'mcp-server-ai-extension')
            args = server_config.get('args', [])
            return command, args
        
        # Fallback to default
        return 'mcp-server-ai-extension', []
    
    def create_local_config(self, force: bool = False) -> bool:
        """
        Create a local MCP configuration file
        
        Args:
            force: Whether to overwrite existing config
            
        Returns:
            bool: True if created successfully
        """
        if self.local_mcp_path.exists() and not force:
            print(f"[MCPConfig] Local config already exists at {self.local_mcp_path}", file=sys.stderr)
            return True
        
        try:
            # Create directory if it doesn't exist
            self.local_mcp_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Create optimized config for AI extension Tool
            local_config = {
                "mcpServers": {
                    "ai-extension": {
                        "command": "python",
                        "args": [
                            "-m", "ai_extension_tool.server"
                        ],
                        "env": {
                            "PYTHONPATH": str(Path(__file__).parent.parent.parent)
                        },
                        "disabled": False,
                        "timeout": 60,
                        "description": "AI extension Tool - Rich UI for AI interactions"
                    }
                }
            }
            
            with open(self.local_mcp_path, 'w', encoding='utf-8') as f:
                json.dump(local_config, f, indent=2, ensure_ascii=False)
            
            print(f"[MCPConfig] Created local MCP config at {self.local_mcp_path}", file=sys.stderr)
            return True
            
        except Exception as e:
            print(f"[MCPConfig] Error creating local config: {e}", file=sys.stderr)
            return False
    
    def update_vscode_config(self) -> bool:
        """
        Update VS Code MCP configuration to include ai-extension server
        
        Returns:
            bool: True if updated successfully
        """
        return self._update_ide_config(self.vscode_mcp_path, "VS Code")
    
    def update_cursor_config(self) -> bool:
        """
        Update Cursor MCP configuration to include ai-extension server
        
        Returns:
            bool: True if updated successfully
        """
        return self._update_ide_config(self.cursor_mcp_path, "Cursor")
    
    def _update_ide_config(self, config_path: Path, ide_name: str) -> bool:
        """
        Update IDE MCP configuration
        
        Args:
            config_path: Path to the IDE's MCP config
            ide_name: Name of the IDE for logging
            
        Returns:
            bool: True if updated successfully
        """
        try:
            # Create directory if it doesn't exist
            config_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Read existing config or create new
            if config_path.exists():
                config = self._read_mcp_file(config_path)
                if not config:
                    config = {"mcpServers": {}}
            else:
                config = {"mcpServers": {}}
            
            # Ensure mcpServers exists
            if 'mcpServers' not in config:
                config['mcpServers'] = {}
            
            # Add or update ai-extension server
            config['mcpServers']['ai-extension'] = {
                "command": "python",
                "args": [
                    "-m", "ai_extension_tool.server"
                ],
                "env": {
                    "PYTHONPATH": str(Path(__file__).parent.parent.parent)
                },
                "disabled": False,
                "timeout": 60,
                "description": "AI extension Tool - Rich UI for AI interactions"
            }
            
            # Write back to file
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            print(f"[MCPConfig] Updated {ide_name} MCP config at {config_path}", file=sys.stderr)
            return True
            
        except Exception as e:
            print(f"[MCPConfig] Error updating {ide_name} config: {e}", file=sys.stderr)
            return False
    
    def get_config_status(self) -> Dict[str, bool]:
        """
        Get status of different configuration files
        
        Returns:
            Dict[str, bool]: Status of each config file
        """
        return {
            'local': self.local_mcp_path.exists(),
            'vscode': self.vscode_mcp_path.exists(),
            'cursor': self.cursor_mcp_path.exists()
        }
    
    def auto_setup(self) -> bool:
        """
        Automatically set up MCP configuration
        
        Returns:
            bool: True if setup was successful
        """
        print("[MCPConfig] Starting auto-setup...", file=sys.stderr)
        
        success = True
        
        # Create local config
        if not self.create_local_config():
            success = False
        
        # Update IDE configs if they exist or if directories exist
        if self.vscode_mcp_path.parent.exists():
            if not self.update_vscode_config():
                success = False
        
        if self.cursor_mcp_path.parent.exists():
            if not self.update_cursor_config():
                success = False
        
        if success:
            print("[MCPConfig] Auto-setup completed successfully", file=sys.stderr)
        else:
            print("[MCPConfig] Auto-setup completed with some errors", file=sys.stderr)
        
        return success


# Global instance
mcp_config_manager = MCPConfigManager()


def get_mcp_server_config() -> Dict:
    """
    Get the current MCP server configuration
    
    Returns:
        Dict: MCP server configuration
    """
    return mcp_config_manager.get_ai_extension_server_config()


def setup_mcp_config() -> bool:
    """
    Set up MCP configuration automatically
    
    Returns:
        bool: True if setup was successful
    """
    return mcp_config_manager.auto_setup()


def get_server_command() -> tuple[str, list[str]]:
    """
    Get the MCP server command and arguments
    
    Returns:
        tuple: (command, args) for running the MCP server
    """
    return mcp_config_manager.get_server_command_and_args() 