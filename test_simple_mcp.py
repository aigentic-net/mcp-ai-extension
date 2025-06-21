#!/usr/bin/env python3
"""
Simple MCP protocol test following the official specification
"""

import json
import subprocess
import sys
import time

def send_message(process, message):
    """Send a JSON-RPC message to the process"""
    message_json = json.dumps(message) + "\n"
    print(f"SENDING: {message_json.strip()}", file=sys.stderr)
    process.stdin.write(message_json)
    process.stdin.flush()

def read_response(process):
    """Read a JSON-RPC response from the process"""
    line = process.stdout.readline()
    if line:
        print(f"RECEIVED: {line.strip()}", file=sys.stderr)
        try:
            return json.loads(line)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}", file=sys.stderr)
            return None
    return None

def test_mcp_step_by_step():
    """Test MCP protocol step by step"""
    
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
        print("=== STEP 1: Initialize ===", file=sys.stderr)
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
        send_message(process, init_request)
        init_response = read_response(process)
        
        if not init_response or "result" not in init_response:
            print("Initialize failed!", file=sys.stderr)
            return False
        print("Initialize successful!", file=sys.stderr)
        
        # Step 2: Send initialized notification
        print("\n=== STEP 2: Send initialized notification ===", file=sys.stderr)
        initialized_notification = {
            "jsonrpc": "2.0",
            "method": "notifications/initialized"
        }
        send_message(process, initialized_notification)
        
        # Step 3: List tools
        print("\n=== STEP 3: List tools ===", file=sys.stderr)
        list_request = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tools/list",
            "params": {}
        }
        send_message(process, list_request)
        list_response = read_response(process)
        
        if not list_response or "result" not in list_response:
            print("Tools list failed!", file=sys.stderr)
            return False
        
        tools = list_response["result"].get("tools", [])
        print(f"Found {len(tools)} tools", file=sys.stderr)
        for tool in tools:
            print(f"  - {tool.get('name')}: {tool.get('description', '')}", file=sys.stderr)
        
        # Step 4: Call the tool
        print("\n=== STEP 4: Call tool ===", file=sys.stderr)
        call_request = {
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tools/call",
            "params": {
                "name": "AI_EXTENSION_tool",
                "arguments": {
                    "random_string": "test"
                }
            }
        }
        send_message(process, call_request)
        call_response = read_response(process)
        
        if call_response:
            if "result" in call_response:
                print("Tool call successful!", file=sys.stderr)
                print(f"Result: {call_response['result']}", file=sys.stderr)
                return True
            elif "error" in call_response:
                print(f"Tool call error: {call_response['error']}", file=sys.stderr)
                return False
        else:
            print("No response to tool call", file=sys.stderr)
            return False
            
    except Exception as e:
        print(f"Test failed with exception: {e}", file=sys.stderr)
        return False
        
    finally:
        process.terminate()
        process.wait()

if __name__ == "__main__":
    success = test_mcp_step_by_step()
    sys.exit(0 if success else 1) 