"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPanelProvider = void 0;
const vscode = require("vscode");
class ChatPanelProvider {
    constructor(context, mcpClient, fileManager) {
        this._context = context;
        this._fileManager = fileManager;
    }
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._context.extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.type) {
                case 'sendMessage':
                    this._handleSendMessage(message.text);
                    break;
                case 'attachFile':
                    this._handleAttachFile();
                    break;
                case 'attachImage':
                    this._handleAttachImage();
                    break;
                case 'clearAttachments':
                    this._handleClearAttachments();
                    break;
                case 'newConversation':
                    this._handleNewConversation();
                    break;
                case 'copyToClipboard':
                    this._handleCopyToClipboard(message.text);
                    break;
            }
        }, undefined, this._context.subscriptions);
        // Update initial state
        this.updateAttachments();
    }
    async _handleSendMessage(text) {
        if (!text.trim()) {
            return;
        }
        try {
            // Format the message like the standalone UI does
            const formattedMessage = this._formatMessageForAI(text);
            // Copy to clipboard for easy pasting into Cursor AI chat
            await vscode.env.clipboard.writeText(formattedMessage);
            // Show success message
            vscode.window.showInformationMessage('Message formatted and copied to clipboard! Paste it into Cursor AI chat.', 'Open AI Chat').then(selection => {
                if (selection === 'Open AI Chat') {
                    // Try to open the AI chat in Cursor
                    vscode.commands.executeCommand('workbench.panel.chat.view.focus');
                }
            });
            // Update UI to show what was sent
            this._postMessage({
                type: 'messageSent',
                message: 'Message copied to clipboard! Paste it into Cursor AI chat to use the ai_extension_tool.'
            });
        }
        catch (error) {
            console.error('Error formatting message:', error);
            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    _formatMessageForAI(text) {
        let formattedMessage = text;
        // Get attachments
        const attachedFiles = this._fileManager.getAttachedFiles();
        const attachedImages = this._fileManager.getAttachedImages();
        // Add attached files section if there are any
        if (attachedFiles.length > 0 || attachedImages.length > 0) {
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
            const workspace = this._getCurrentWorkspace();
            if (workspace) {
                const workspaceName = workspace.split('/').pop() || 'workspace';
                formattedMessage += `<AI_extension_WORKSPACE>${workspaceName}</AI_extension_WORKSPACE>\n`;
            }
        }
        // Add continue chat flag (default to false for now)
        formattedMessage += `<AI_extension_CONTINUE_CHAT>false</AI_extension_CONTINUE_CHAT>\n`;
        return formattedMessage;
    }
    async _handleAttachFile() {
        const options = {
            canSelectMany: true,
            canSelectFiles: true,
            canSelectFolders: true,
            openLabel: 'Attach'
        };
        const fileUris = await vscode.window.showOpenDialog(options);
        if (fileUris && fileUris.length > 0) {
            for (const uri of fileUris) {
                this._fileManager.attachFile(uri.fsPath);
            }
            this.updateAttachments();
            vscode.window.showInformationMessage(`Attached ${fileUris.length} item(s)`);
        }
    }
    async _handleAttachImage() {
        const options = {
            canSelectMany: true,
            canSelectFiles: true,
            canSelectFolders: false,
            openLabel: 'Attach Images',
            filters: {
                'Images': ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'ico', 'svg']
            }
        };
        const fileUris = await vscode.window.showOpenDialog(options);
        if (fileUris && fileUris.length > 0) {
            for (const uri of fileUris) {
                this._fileManager.attachImage(uri.fsPath);
            }
            this.updateAttachments();
            vscode.window.showInformationMessage(`Attached ${fileUris.length} image(s)`);
        }
    }
    _handleClearAttachments() {
        this._fileManager.clearAllAttachments();
        this.updateAttachments();
        vscode.window.showInformationMessage('All attachments cleared');
    }
    _handleNewConversation() {
        this._postMessage({ type: 'clearConversation' });
        vscode.window.showInformationMessage('Ready for new conversation');
    }
    async _handleCopyToClipboard(text) {
        if (!text.trim()) {
            return;
        }
        try {
            const formattedMessage = this._formatMessageForAI(text);
            await vscode.env.clipboard.writeText(formattedMessage);
            vscode.window.showInformationMessage('Message copied to clipboard!');
        }
        catch (error) {
            vscode.window.showErrorMessage('Failed to copy to clipboard');
        }
    }
    _getCurrentWorkspace() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].uri.fsPath;
        }
        return undefined;
    }
    updateAttachments() {
        if (this._view) {
            const attachedFiles = this._fileManager.getAttachedFiles();
            const attachedImages = this._fileManager.getAttachedImages();
            this._postMessage({
                type: 'updateAttachments',
                attachedFiles,
                attachedImages,
                count: this._fileManager.getAttachmentCount()
            });
        }
    }
    newConversation() {
        this._handleNewConversation();
    }
    _postMessage(message) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }
    _getHtmlForWebview(webview) {
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'main.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'main.js'));
        const nonce = this._getNonce();
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleResetUri}" rel="stylesheet">
                <link href="${styleVSCodeUri}" rel="stylesheet">
                <link href="${styleMainUri}" rel="stylesheet">
                <title>AI extension Chat</title>
            </head>
            <body>
                <div class="chat-container">
                    <div class="chat-header">
                        <h3>AI extension Helper</h3>
                        <div class="header-buttons">
                            <button id="newConversationBtn" class="header-btn" title="New Conversation">
                                <span class="codicon codicon-add"></span>
                            </button>
                            <button id="clearAttachmentsBtn" class="header-btn" title="Clear Attachments">
                                <span class="codicon codicon-clear-all"></span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <p>📝 Compose messages with file attachments</p>
                        <p>📋 Copies formatted messages to clipboard</p>
                        <p>🤖 Paste into Cursor AI chat to use ai_extension_tool</p>
                    </div>
                    
                    <div class="attachments-section">
                        <div class="attachment-buttons">
                            <button id="attachFileBtn" class="attach-btn">
                                <span class="codicon codicon-file-add"></span>
                                Attach File
                            </button>
                            <button id="attachImageBtn" class="attach-btn">
                                <span class="codicon codicon-device-camera"></span>
                                Attach Image
                            </button>
                        </div>
                        <div id="attachmentsList" class="attachments-list"></div>
                    </div>

                    <div class="input-section">
                        <div class="input-container">
                            <textarea id="messageInput" placeholder="Type your message..." rows="4"></textarea>
                            <div class="input-controls">
                                <div class="button-group">
                                    <button id="copyBtn" class="copy-btn">
                                        <span class="codicon codicon-copy"></span>
                                        Copy to Clipboard
                                    </button>
                                    <button id="sendBtn" class="send-btn">
                                        <span class="codicon codicon-send"></span>
                                        Copy & Open AI Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="statusArea" class="status-area"></div>
                </div>

                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
    _getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
exports.ChatPanelProvider = ChatPanelProvider;
ChatPanelProvider.viewType = 'aiextensionChat';
//# sourceMappingURL=chat-panel.js.map