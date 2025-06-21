def main():
    """Main CLI entry point for the MCP server"""
    from .server import main as server_main
    server_main()

if __name__ == "__main__":
    main()
