import * as vscode from 'vscode';
import { ChatPanelProvider } from './chat-panel';
import { MCPClient } from './mcp-client';
import { FileManager } from './file-manager';

let chatPanelProvider: ChatPanelProvider;
let mcpClient: MCPClient;
let fileManager: FileManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('AI extension extension is now active!');

    // Initialize components
    mcpClient = new MCPClient();
    fileManager = new FileManager(context);
    chatPanelProvider = new ChatPanelProvider(context, mcpClient, fileManager);

    // Set context to show the view
    vscode.commands.executeCommand('setContext', 'aiextension.activated', true);

    // Register the chat panel provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'aiextensionChat',
            chatPanelProvider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

    // Register commands
    const commands = [
        vscode.commands.registerCommand('aiextension.openChat', () => {
            // Focus on the AI extension view in the sidebar
            vscode.commands.executeCommand('aiextensionChat.focus');
        }),

        vscode.commands.registerCommand('aiextension.attachFile', (uri: vscode.Uri) => {
            if (uri && uri.fsPath) {
                fileManager.attachFile(uri.fsPath);
                chatPanelProvider.updateAttachments();
            }
        }),

        vscode.commands.registerCommand('aiextension.attachCurrentFile', () => {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                fileManager.attachFile(activeEditor.document.uri.fsPath);
                chatPanelProvider.updateAttachments();
                vscode.window.showInformationMessage(
                    `Attached: ${activeEditor.document.fileName}`
                );
            } else {
                vscode.window.showWarningMessage('No active file to attach');
            }
        }),

        vscode.commands.registerCommand('aiextension.newConversation', () => {
            chatPanelProvider.newConversation();
        }),

        vscode.commands.registerCommand('aiextension.clearAttachments', () => {
            fileManager.clearAllAttachments();
            chatPanelProvider.updateAttachments();
            vscode.window.showInformationMessage('All attachments cleared');
        })
    ];

    context.subscriptions.push(...commands);

    // Initialize MCP client (no connection needed - uses existing MCP infrastructure)
    initializeMCPClient();

    // Show welcome message
    vscode.window.showInformationMessage(
        'AI extension extension activated! Use it to format messages with file attachments for Cursor AI chat.',
        'Open Chat'
    ).then(selection => {
        if (selection === 'Open Chat') {
            vscode.commands.executeCommand('aiextension.openChat');
        }
    });
}

async function initializeMCPClient() {
    try {
        // The MCP server is already managed by the IDE's mcp.json configuration
        // We just need to initialize our client to use the existing infrastructure
        await mcpClient.connect();
        vscode.window.showInformationMessage('AI extension ready - using existing MCP server');
    } catch (error) {
        console.error('Failed to initialize MCP client:', error);
        vscode.window.showErrorMessage(
            'Failed to initialize AI extension MCP client. Please check that the MCP server is configured in your IDE settings.'
        );
    }
}

export function deactivate() {
    if (mcpClient) {
        mcpClient.disconnect();
    }
} 