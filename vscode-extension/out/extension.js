"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const chat_panel_1 = require("./chat-panel");
const mcp_client_1 = require("./mcp-client");
const file_manager_1 = require("./file-manager");
let chatPanelProvider;
let mcpClient;
let fileManager;
function activate(context) {
    console.log('AI extension extension is now active!');
    // Initialize components
    mcpClient = new mcp_client_1.MCPClient();
    fileManager = new file_manager_1.FileManager(context);
    chatPanelProvider = new chat_panel_1.ChatPanelProvider(context, mcpClient, fileManager);
    // Set context to show the view
    vscode.commands.executeCommand('setContext', 'aiextension.activated', true);
    // Register the chat panel provider
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('aiextensionChat', chatPanelProvider, {
        webviewOptions: {
            retainContextWhenHidden: true
        }
    }));
    // Register commands
    const commands = [
        vscode.commands.registerCommand('aiextension.openChat', () => {
            // Focus on the AI extension view in the sidebar
            vscode.commands.executeCommand('aiextensionChat.focus');
        }),
        vscode.commands.registerCommand('aiextension.attachFile', (uri) => {
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
                vscode.window.showInformationMessage(`Attached: ${activeEditor.document.fileName}`);
            }
            else {
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
    vscode.window.showInformationMessage('AI extension extension activated! Use it to format messages with file attachments for Cursor AI chat.', 'Open Chat').then(selection => {
        if (selection === 'Open Chat') {
            vscode.commands.executeCommand('aiextension.openChat');
        }
    });
}
exports.activate = activate;
async function initializeMCPClient() {
    try {
        // The MCP server is already managed by the IDE's mcp.json configuration
        // We just need to initialize our client to use the existing infrastructure
        await mcpClient.connect();
        vscode.window.showInformationMessage('AI extension ready - using existing MCP server');
    }
    catch (error) {
        console.error('Failed to initialize MCP client:', error);
        vscode.window.showErrorMessage('Failed to initialize AI extension MCP client. Please check that the MCP server is configured in your IDE settings.');
    }
}
function deactivate() {
    if (mcpClient) {
        mcpClient.disconnect();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map