import * as vscode from 'vscode';
import { MCPClient } from './mcp-client';
import { FileManager } from './file-manager';
import { ChatPanelProvider } from './chat-panel';

let mcpClient: MCPClient;
let fileManager: FileManager;
let chatPanelProvider: ChatPanelProvider;

export function activate(context: vscode.ExtensionContext) {
    // Initialize the MCP client with the default server URL
    mcpClient = new MCPClient('http://localhost:8000');
    
    // Initialize the file manager
    fileManager = new FileManager();
    
    // Create and register the chat panel provider
    chatPanelProvider = new ChatPanelProvider(context, mcpClient, fileManager);
    
    // Register the chat panel view
    const chatPanelRegistration = vscode.window.registerWebviewViewProvider(
        ChatPanelProvider.viewType,
        chatPanelProvider
    );
    
    // Add the registration to subscriptions
    context.subscriptions.push(chatPanelRegistration);
    
    // Register commands
    let newConversationCommand = vscode.commands.registerCommand('aiextension.newConversation', () => {
        chatPanelProvider.newConversation();
    });
    
    context.subscriptions.push(newConversationCommand);
}

export function deactivate() {
    // Clean up resources
    if (chatPanelProvider) {
        chatPanelProvider.dispose();
    }
    if (fileManager) {
        fileManager.dispose();
    }
} 