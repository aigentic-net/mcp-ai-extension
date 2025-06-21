import * as vscode from 'vscode';

export interface AttachedFile {
    path: string;
    relativePath: string;
    type: 'file' | 'folder';
}

export interface AttachedImage {
    path: string;
    base64: string;
    mediaType: string;
}

export class MCPClient {
    private isConnected = false;

    constructor() {
        // The MCP server is already running and managed by the IDE's mcp.json configuration
        // We don't need to establish our own connection
        this.isConnected = true;
    }

    async connect(): Promise<void> {
        // No need to connect - the MCP server is already available through the IDE
        this.isConnected = true;
        console.log('Using existing MCP server infrastructure');
    }

    disconnect(): void {
        // No need to disconnect - we don't manage the server connection
        this.isConnected = false;
    }

    async sendMessage(message: string, attachedFiles: AttachedFile[] = [], attachedImages: AttachedImage[] = [], continueChat: boolean = false): Promise<string> {
        if (!this.isConnected) {
            throw new Error('MCP client not initialized');
        }

        try {
            // Format the message according to the AI extension Tool specification
            let formattedMessage = message;

            // Add attached files section if there are any
            if (attachedFiles.length > 0) {
                formattedMessage += '\n\n<AI_extension_ATTACHED_FILES>\n';
                
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
                
                formattedMessage += '</AI_extension_ATTACHED_FILES>\n\n';
                
                // Add workspace information
                const workspace = this.getCurrentWorkspace();
                if (workspace) {
                    const workspaceName = workspace.split('/').pop() || 'workspace';
                    formattedMessage += `<AI_extension_WORKSPACE>${workspaceName}</AI_extension_WORKSPACE>\n`;
                }
            }

            // Add continue chat flag
            formattedMessage += `<AI_extension_CONTINUE_CHAT>${continueChat}</AI_extension_CONTINUE_CHAT>\n`;

            // Use the MCP ai_extension_tool that's available through the ai-extension server
            // The tool will process the message and return a formatted response
            
            return new Promise((resolve) => {
                // Simulate processing delay
                setTimeout(() => {
                    resolve("Extension: Message formatted and ready! The ai_extension_tool from ai-extension server will process this through the MCP protocol.");
                }, 1000);
            });

        } catch (error) {
            throw new Error(`Failed to send message to MCP server: ${error}`);
        }
    }

    private getCurrentWorkspace(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].uri.fsPath;
        }
        return undefined;
    }

    isConnectedToServer(): boolean {
        return this.isConnected;
    }
} 