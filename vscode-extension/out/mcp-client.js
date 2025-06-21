"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClient = void 0;
const vscode = require("vscode");
class MCPClient {
    constructor(baseUrl) {
        this.isConnected = false;
        this.baseUrl = baseUrl;
        // The MCP server is already running and managed by the IDE's mcp.json configuration
        // We don't need to establish our own connection
        this.isConnected = true;
    }
    async connect() {
        // No need to connect - the MCP server is already available through the IDE
        this.isConnected = true;
        console.log('Using existing MCP server infrastructure');
    }
    async disconnect() {
        // No need to disconnect - we don't manage the server connection
        this.isConnected = false;
    }
    async sendMessage(message, files, images, continueChat, language = 'en' // Default to English if not specified
    ) {
        if (!this.isConnected) {
            throw new Error('MCP client not initialized');
        }
        const endpoint = `${this.baseUrl}/run_tool`;
        const payload = {
            tool_name: 'mcp_ai_extension',
            params: {
                message,
                files,
                images,
                continue_chat: continueChat,
                language: language,
                workspace: this.getCurrentWorkspace()
            }
        };
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (typeof result === 'string') {
                return result;
            }
            if (typeof result === 'object' && result !== null) {
                if ('error' in result) {
                    const errorResult = result;
                    throw new Error(`Tool returned an error: ${errorResult.error}`);
                }
                return result; // Return the object as-is if it's a valid response
            }
            throw new Error(`Received unexpected response type from tool: ${typeof result}`);
        }
        catch (error) {
            console.error(`Failed to execute MCP tool call: ${error}`);
            if (error instanceof Error) {
                if (error.message.includes('not found')) {
                    const toolName = vscode.workspace.getConfiguration('aiextension').get('mcpToolName');
                    vscode.window.showErrorMessage(`AI tool '${toolName}' not found. Please ensure the MCP server is running and the tool is correctly registered.`);
                    throw new Error(`Configured AI tool not found: ${toolName}`);
                }
                throw new Error(`Failed to send message to MCP server: ${error.message}`);
            }
            throw new Error(`Failed to send message to MCP server: Unknown error`);
        }
    }
    getCurrentWorkspace() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].uri.fsPath;
        }
        return undefined;
    }
    isConnectedToServer() {
        return this.isConnected;
    }
    async callAIExtensionTool(message, attachedFiles, attachedImages, workspace) {
        // In a real implementation, this would make a request to the MCP server
        // For this example, we'll simulate the tool's behavior
        console.log('Calling AI_EXTENSION_tool with:', { message, attachedFiles, attachedImages, workspace });
        // Simulate a network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Simulate a successful response
        const response = `
            <p><strong>Tool Executed Successfully</strong></p>
            <p>Your message: "${message}"</p>
            <p>This is a simulated response from the <code>AI_EXTENSION_tool</code>. 
            In a real scenario, this would contain the actual output of the tool running on the server.</p>
            <p>Attachments:</p>
            <ul>
                ${attachedFiles.map(f => `<li>${f.relativePath} (${f.type})</li>`).join('')}
                ${attachedImages.map(i => `<li>${i.path} (image)</li>`).join('')}
            </ul>
        `;
        return response;
    }
}
exports.MCPClient = MCPClient;
//# sourceMappingURL=mcp-client.js.map