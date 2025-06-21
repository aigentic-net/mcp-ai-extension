"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClient = void 0;
const vscode = require("vscode");
class MCPClient {
    constructor() {
        this.isConnected = false;
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
    async sendMessage(message, attachedFiles = [], attachedImages = [], continueChat = false) {
        if (!this.isConnected) {
            throw new Error('MCP client not initialized');
        }
        try {
            // Format the message according to the AI extension Tool specification
            let formattedMessage = message;
            // Add attached files section if there are any
            if (attachedFiles.length > 0) {
                formattedMessage += '\n\n<AI_EXTENSION_ATTACHED_FILES>\n';
                const folders = attachedFiles.filter(f => f.type === 'folder');
                const files = attachedFiles.filter(f => f.type === 'file');
                if (folders.length > 0) {
                    formattedMessage += 'FOLDERS:\n';
                    folders.forEach(folder => {
                        formattedMessage += `- ${folder.relativePath}\n`;
                    });
                    formattedMessage += '\n';
                }
                if (files.length > 0) {
                    formattedMessage += 'FILES:\n';
                    files.forEach(file => {
                        formattedMessage += `- ${file.relativePath}\n`;
                    });
                    formattedMessage += '\n';
                }
                formattedMessage += '</AI_EXTENSION_ATTACHED_FILES>\n\n';
                // Add workspace information
                const workspace = this.getCurrentWorkspace();
                if (workspace) {
                    const workspaceName = workspace.split('/').pop() || 'workspace';
                    formattedMessage += `<AI_EXTENSION_WORKSPACE>${workspaceName}</AI_EXTENSION_WORKSPACE>\n`;
                }
            }
            // Add continue chat flag
            formattedMessage += `<AI_EXTENSION_CONTINUE_CHAT>${continueChat}</AI_EXTENSION_CONTINUE_CHAT>\n`;
            // Use the MCP AI_EXTENSION_tool that's available through the ai-extension server
            // The tool will process the message and return a formatted response
            return new Promise((resolve) => {
                // Simulate processing delay
                setTimeout(() => {
                    resolve("Extension: Message formatted and ready! The AI_EXTENSION_tool from ai-extension server will process this through the MCP protocol.");
                }, 1000);
            });
        }
        catch (error) {
            throw new Error(`Failed to send message to MCP server: ${error}`);
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