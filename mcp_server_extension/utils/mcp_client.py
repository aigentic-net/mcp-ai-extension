"""
MCP Client for AI extension Tool
Connects to MCP servers using auto-detected configuration
"""

import asyncio
import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, Any, Optional, List
from .mcp_config import get_mcp_server_config, get_server_command


class MCPClient:
    """
    MCP Client for connecting to AI extension servers
    """
    
    def __init__(self):
        """Initialize the MCP client"""
        self.process = None
        self.server_config = get_mcp_server_config()
        self.is_connected = False
        
    def start_server(self) -> bool:
        """
        Start the MCP server process
        
        Returns:
            bool: True if server started successfully
        """
        try:
            command, args = get_server_command()
            
            print(f"[MCPClient] Starting MCP server: {command} {' '.join(args)}", file=sys.stderr)
            
            # Start the server process
            self.process = subprocess.Popen(
                [command] + args,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=0
            )
            
            # Give the server a moment to start
            time.sleep(1)
            
            # Check if process is still running
            if self.process.poll() is None:
                self.is_connected = True
                print("[MCPClient] MCP server started successfully", file=sys.stderr)
                return True
            else:
                stderr_output = self.process.stderr.read() if self.process.stderr else "No error output"
                print(f"[MCPClient] MCP server failed to start: {stderr_output}", file=sys.stderr)
                return False
                
        except Exception as e:
            print(f"[MCPClient] Error starting MCP server: {e}", file=sys.stderr)
            return False
    
    def stop_server(self) -> bool:
        """
        Stop the MCP server process
        
        Returns:
            bool: True if server stopped successfully
        """
        try:
            if self.process and self.process.poll() is None:
                self.process.terminate()
                
                # Wait for graceful shutdown
                try:
                    self.process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    # Force kill if not responding
                    self.process.kill()
                    self.process.wait()
                
                print("[MCPClient] MCP server stopped", file=sys.stderr)
            
            self.is_connected = False
            self.process = None
            return True
            
        except Exception as e:
            print(f"[MCPClient] Error stopping MCP server: {e}", file=sys.stderr)
            return False
    
    def send_request(self, method: str, params: Dict[str, Any] = None) -> Optional[Dict]:
        """
        Send a JSON-RPC request to the MCP server
        
        Args:
            method: The method name
            params: Parameters for the method
            
        Returns:
            Dict or None: Response from server
        """
        if not self.is_connected or not self.process:
            print("[MCPClient] Not connected to MCP server", file=sys.stderr)
            return None
        
        try:
            request = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": method,
                "params": params or {}
            }
            
            request_json = json.dumps(request) + "\n"
            print(f"[MCPClient] Sending request: {request_json.strip()}", file=sys.stderr)
            
            # Send request
            self.process.stdin.write(request_json)
            self.process.stdin.flush()
            
            # Read response
            response_line = self.process.stdout.readline()
            if not response_line:
                print("[MCPClient] No response from server", file=sys.stderr)
                return None
            
            print(f"[MCPClient] Received response: {response_line.strip()}", file=sys.stderr)
            response = json.loads(response_line.strip())
            return response
            
        except Exception as e:
            print(f"[MCPClient] Error sending request: {e}", file=sys.stderr)
            return None
    
    def send_notification(self, method: str, params: Dict[str, Any] = None) -> bool:
        """
        Send a JSON-RPC notification to the MCP server (no response expected)
        
        Args:
            method: The method name
            params: Parameters for the method
            
        Returns:
            bool: True if sent successfully
        """
        if not self.is_connected or not self.process:
            print("[MCPClient] Not connected to MCP server", file=sys.stderr)
            return False
        
        try:
            notification = {
                "jsonrpc": "2.0",
                "method": method,
                "params": params or {}
            }
            
            notification_json = json.dumps(notification) + "\n"
            print(f"[MCPClient] Sending notification: {notification_json.strip()}", file=sys.stderr)
            
            # Send notification
            self.process.stdin.write(notification_json)
            self.process.stdin.flush()
            
            return True
            
        except Exception as e:
            print(f"[MCPClient] Error sending notification: {e}", file=sys.stderr)
            return False
    
    def call_AI_EXTENSION_tool(self, dummy_param: str = "activate") -> Optional[List]:
        """
        Call the AI_EXTENSION_tool function
        
        Args:
            dummy_param: Dummy parameter (MCP tools require at least one parameter)
            
        Returns:
            List or None: Response from the tool
        """
        response = self.send_request(
            "tools/call",
            {
                "name": "AI_EXTENSION_tool",
                "arguments": {
                    "random_string": dummy_param
                }
            }
        )
        
        if response and "result" in response:
            # The server returns: {"result": {"content": [...], "isError": false}}
            result = response["result"]
            if not result.get("isError", True):  # Check it's not an error
                return result.get("content", [])
            else:
                print(f"[MCPClient] Tool returned error: {result}", file=sys.stderr)
                return None
        
        return None
    
    def list_tools(self) -> Optional[List]:
        """
        List available tools from the MCP server
        
        Returns:
            List or None: List of available tools
        """
        # Make sure server is initialized first
        if not hasattr(self, '_initialized'):
            self.get_server_info()
            self._initialized = True
        
        response = self.send_request("tools/list", {})
        
        if response and "result" in response:
            return response["result"].get("tools", [])
        
        return None
    
    def get_server_info(self) -> Optional[Dict]:
        """
        Get server information and initialize the connection
        
        Returns:
            Dict or None: Server information
        """
        # First, send initialize request
        init_response = self.send_request("initialize", {
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": {}
            },
            "clientInfo": {
                "name": "ai-extension-client",
                "version": "1.0.0"
            }
        })
        
        if init_response and "result" in init_response:
            # Send initialized notification
            self.send_notification("notifications/initialized", {})
            
        return init_response
    
    def __enter__(self):
        """Context manager entry"""
        self.start_server()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.stop_server()


def test_mcp_connection() -> bool:
    """
    Test MCP server connection
    
    Returns:
        bool: True if connection successful
    """
    try:
        with MCPClient() as client:
            if not client.is_connected:
                print("[MCPClient] Failed to connect to server", file=sys.stderr)
                return False
            
            # Test server info
            info = client.get_server_info()
            if info:
                print(f"[MCPClient] Server info: {info}", file=sys.stderr)
            else:
                print("[MCPClient] Failed to get server info", file=sys.stderr)
                return False
            
            # Test tool listing
            print("[MCPClient] Requesting tool list...", file=sys.stderr)
            tools = client.list_tools()
            if tools:
                print(f"[MCPClient] Available tools: {[tool['name'] for tool in tools]}", file=sys.stderr)
                print(f"[MCPClient] Tool count: {len(tools)}", file=sys.stderr)
                if tools:
                    print(f"[MCPClient] First tool details: {tools[0]}", file=sys.stderr)
            else:
                print("[MCPClient] No tools available or failed to list tools", file=sys.stderr)
                return False
            
            print("[MCPClient] MCP connection test passed!", file=sys.stderr)
            return True
            
    except Exception as e:
        print(f"[MCPClient] Connection test failed: {e}", file=sys.stderr)
        return False


def test_AI_EXTENSION_tool() -> bool:
    """
    Test calling the AI extension Tool
    
    Returns:
        bool: True if tool call successful
    """
    try:
        with MCPClient() as client:
            if not client.is_connected:
                print("[MCPClient] Failed to connect to server", file=sys.stderr)
                return False
            
            # Call the tool
            result = client.call_AI_EXTENSION_tool("activate")
            if result:
                print(f"[MCPClient] Tool call successful! Result: {result}", file=sys.stderr)
                return True
            else:
                print("[MCPClient] Tool call failed or returned no result", file=sys.stderr)
                return False
                
    except Exception as e:
        print(f"[MCPClient] Tool call test failed: {e}", file=sys.stderr)
        return False


def test_mcp_connection_and_tools() -> bool:
    """
    Test MCP server connection and tool calling in a single session
    
    Returns:
        bool: True if both connection and tool calling successful
    """
    try:
        with MCPClient() as client:
            if not client.is_connected:
                print("[MCPClient] Failed to connect to server", file=sys.stderr)
                return False
            
            # Test server info
            info = client.get_server_info()
            if info:
                print(f"[MCPClient] Server info: {info}", file=sys.stderr)
            else:
                print("[MCPClient] Failed to get server info", file=sys.stderr)
                return False
            
            # Test tool listing
            print("[MCPClient] Requesting tool list...", file=sys.stderr)
            tools = client.list_tools()
            if tools:
                print(f"[MCPClient] Available tools: {[tool['name'] for tool in tools]}", file=sys.stderr)
                print(f"[MCPClient] Tool count: {len(tools)}", file=sys.stderr)
                if tools:
                    print(f"[MCPClient] First tool details: {tools[0]}", file=sys.stderr)
            else:
                print("[MCPClient] No tools available or failed to list tools", file=sys.stderr)
                return False
            
            print("[MCPClient] MCP connection test passed!", file=sys.stderr)
            
            # Now test tool calling in the same session
            print("[MCPClient] Testing tool call in same session...", file=sys.stderr)
            result = client.call_AI_EXTENSION_tool("activate")
            if result:
                print(f"[MCPClient] Tool call successful! Result: {result}", file=sys.stderr)
                return True
            else:
                print("[MCPClient] Tool call failed or returned no result", file=sys.stderr)
                return False
            
    except Exception as e:
        print(f"[MCPClient] Test failed: {e}", file=sys.stderr)
        return False


def call_AI_EXTENSION_tool_via_mcp() -> Optional[List]:
    """
    Call the AI extension Tool via MCP
    
    Returns:
        List or None: Result from the tool
    """
    try:
        with MCPClient() as client:
            if not client.is_connected:
                print("[MCPClient] Failed to connect to server", file=sys.stderr)
                return None
            
            result = client.call_AI_EXTENSION_tool()
            return result
            
    except Exception as e:
        print(f"[MCPClient] Error calling AI extension Tool: {e}", file=sys.stderr)
        return None 