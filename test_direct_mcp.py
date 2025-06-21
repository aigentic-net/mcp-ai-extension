#!/usr/bin/env python3
"""
Direct MCP server communication test
"""

import json
import subprocess
import sys

def test_mcp_direct():
    """Test direct communication with MCP server"""
    
    # Start the server
    process = subprocess.Popen(
        ["mcp-server-ai-extension"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=0
    )
    
    try:
        # Step 1: Initialize
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "clientInfo": {"name": "test-client", "version": "1.0.0"}
            }
        }
        
        print("Sending initialize request...")
        process.stdin.write(json.dumps(init_request) + "\n")
        process.stdin.flush()
        
        response = process.stdout.readline()
        print(f"Initialize response: {response.strip()}")
        
        # Step 2: Send initialized notification
        init_notification = {
            "jsonrpc": "2.0",
            "method": "notifications/initialized",
            "params": {}
        }
        
        print("Sending initialized notification...")
        process.stdin.write(json.dumps(init_notification) + "\n")
        process.stdin.flush()
        
        # Step 3: List tools
        list_request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list",
            "params": {}
        }
        
        print("Sending tools/list request...")
        process.stdin.write(json.dumps(list_request) + "\n")
        process.stdin.flush()
        
        response = process.stdout.readline()
        print(f"Tools list response: {response.strip()}")
        
        # Step 4: Try different tool call methods
        methods_to_try = [
            "tools/call",
            "call_tool", 
            "callTool",
            "tool/call"
        ]
        
        for method in methods_to_try:
            call_request = {
                "jsonrpc": "2.0",
                "id": 3,
                "method": method,
                "params": {
                    "name": "AI_EXTENSION_tool",
                    "arguments": {
                        "random_string": "test"
                    }
                }
            }
            
            print(f"\nTrying method: {method}")
            process.stdin.write(json.dumps(call_request) + "\n")
            process.stdin.flush()
            
            response = process.stdout.readline()
            print(f"Response: {response.strip()}")
        
    finally:
        process.terminate()
        process.wait()

if __name__ == "__main__":
    test_mcp_direct() 