#!/usr/bin/env python3
"""
Debug tool calling with different parameter formats
"""

import json
import subprocess
import sys
import time

def test_tool_call_format(process, format_name, params):
    """Test a specific tool call format"""
    print(f"\n=== Testing {format_name} ===", file=sys.stderr)
    
    request = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "tools/call",
        "params": params
    }
    
    request_json = json.dumps(request) + "\n"
    print(f"SENDING: {request_json.strip()}", file=sys.stderr)
    
    process.stdin.write(request_json)
    process.stdin.flush()
    
    # Read response
    try:
        response_line = process.stdout.readline()
        if response_line:
            print(f"RECEIVED: {response_line.strip()}", file=sys.stderr)
            response = json.loads(response_line)
            
            if "error" in response:
                print(f"❌ {format_name}: {response['error']['message']}", file=sys.stderr)
                return False
            else:
                print(f"✅ {format_name}: SUCCESS!", file=sys.stderr)
                return True
    except Exception as e:
        print(f"❌ {format_name}: Exception - {e}", file=sys.stderr)
        return False
    
    return False

def main():
    """Test different tool call formats"""
    print("Starting MCP server...", file=sys.stderr)
    
    process = subprocess.Popen(
        ["mcp-server-ai-extension"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=0
    )
    
    try:
        # Initialize
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {"tools": {}},
                "clientInfo": {"name": "debug-client", "version": "1.0.0"}
            }
        }
        
        process.stdin.write(json.dumps(init_request) + "\n")
        process.stdin.flush()
        process.stdout.readline()  # Read init response
        
        # Send initialized notification
        initialized_notification = {
            "jsonrpc": "2.0",
            "method": "notifications/initialized"
        }
        process.stdin.write(json.dumps(initialized_notification) + "\n")
        process.stdin.flush()
        
        # Test different parameter formats
        formats_to_test = [
            ("Current format", {
                "name": "AI_EXTENSION_tool",
                "arguments": {
                    "random_string": "activate"
                }
            }),
            ("Flattened arguments", {
                "name": "AI_EXTENSION_tool",
                "random_string": "activate"
            }),
            ("Arguments as array", {
                "name": "AI_EXTENSION_tool",
                "arguments": ["activate"]
            }),
            ("No arguments", {
                "name": "AI_EXTENSION_tool"
            }),
            ("Empty arguments", {
                "name": "AI_EXTENSION_tool",
                "arguments": {}
            }),
            ("Different method name", {
                "tool": "AI_EXTENSION_tool",
                "arguments": {
                    "random_string": "activate"
                }
            })
        ]
        
        for format_name, params in formats_to_test:
            success = test_tool_call_format(process, format_name, params)
            if success:
                print(f"\n🎉 FOUND WORKING FORMAT: {format_name}")
                print(f"Parameters: {json.dumps(params, indent=2)}")
                break
            time.sleep(0.1)  # Small delay between tests
        
    finally:
        process.terminate()
        process.wait()

if __name__ == "__main__":
    main() 