import * as vscode from 'vscode';
import { MCPClient, AttachedFile, AttachedImage } from './mcp-client';
import { FileManager } from './file-manager';

export class ChatPanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'aiextensionChat';
    private _view?: vscode.WebviewView;
    private _context: vscode.ExtensionContext;
    private _fileManager: FileManager;
    private _mcpClient: MCPClient;

    constructor(
        context: vscode.ExtensionContext,
        mcpClient: MCPClient,
        fileManager: FileManager
    ) {
        this._context = context;
        this._fileManager = fileManager;
        this._mcpClient = mcpClient;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._context.extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
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
            },
            undefined,
            this._context.subscriptions
        );

        // Update initial state
        this.updateAttachments();
    }

    private async _handleSendMessage(text: string): Promise<void> {
        if (!text.trim() && this._fileManager.getAttachmentCount() === 0) {
            vscode.window.showWarningMessage('No message or attachments to send.');
            return;
        }

        try {
            const formattedMessage = this._formatMessageForAI(text);
            
            await vscode.env.clipboard.writeText(formattedMessage);
            
            vscode.window.showInformationMessage(
                'AI context copied to clipboard. Paste it into the main chat.',
                'Focus Chat'
            ).then(selection => {
                if (selection === 'Focus Chat') {
                    vscode.commands.executeCommand('workbench.action.chat.focus');
                }
            });

            this._postMessage({
                type: 'messageSent',
                message: 'Context copied!' 
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(`Error preparing message: ${errorMessage}`);
            this._postMessage({ 
                type: 'showError', 
                message: `Error: ${errorMessage}` 
            });
        }
    }

    private _formatMessageForAI(text: string): string {
        let formattedMessage = text;

        const attachedFiles = this._fileManager.getAttachedFiles();
        
        if (attachedFiles.length > 0) {
            formattedMessage += "\n\n<AI_INTERACTIVE_ATTACHED_FILES>\n";
            let workspaceName: string | undefined;
            
            const folders = attachedFiles.filter(f => f.type === 'folder').map(f => f.relativePath);
            const files = attachedFiles.filter(f => f.type === 'file').map(f => f.relativePath);
            
            const firstFile = attachedFiles[0];
            if (firstFile) {
                const parts = firstFile.relativePath.split('/');
                if (parts.length > 1) {
                    workspaceName = parts[0];
                }
            }
            
            if (folders.length > 0) {
                formattedMessage += "FOLDERS:\n";
                folders.forEach(folder => {
                    formattedMessage += `- ${folder}\n`;
                });
            }
            
            if (files.length > 0) {
                formattedMessage += "FILES:\n";
                files.forEach(file => {
                    formattedMessage += `- ${file}\n`;
                });
            }
            
            formattedMessage += "</AI_INTERACTIVE_ATTACHED_FILES>\n";
            
            if (workspaceName) {
                formattedMessage += `\n<AI_INTERACTIVE_WORKSPACE>${workspaceName}</AI_INTERACTIVE_WORKSPACE>`;
            }
        }

        formattedMessage += `\n\n<AI_INTERACTIVE_CONTINUE_CHAT>false</AI_INTERACTIVE_CONTINUE_CHAT>`;
        return formattedMessage;
    }

    private async _handleAttachFile(): Promise<void> {
        const options: vscode.OpenDialogOptions = {
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

    private async _handleAttachImage(): Promise<void> {
        const options: vscode.OpenDialogOptions = {
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

    private _handleClearAttachments(): void {
        this._fileManager.clearAllAttachments();
        this.updateAttachments();
        vscode.window.showInformationMessage('All attachments cleared');
    }

    private _handleNewConversation(): void {
        this._postMessage({ type: 'clearConversation' });
        vscode.window.showInformationMessage('Ready for new conversation');
    }

    private async _handleCopyToClipboard(text: string): Promise<void> {
        if (!text.trim()) {
            return;
        }

        try {
            const formattedMessage = this._formatMessageForAI(text);
            await vscode.env.clipboard.writeText(formattedMessage);
            vscode.window.showInformationMessage('Message copied to clipboard!');
        } catch (error) {
            vscode.window.showErrorMessage('Failed to copy to clipboard');
        }
    }

    private _getCurrentWorkspace(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].uri.fsPath;
        }
        return undefined;
    }

    public updateAttachments(): void {
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

    public newConversation(): void {
        this._handleNewConversation();
    }

    private _postMessage(message: any): void {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'main.js'));
        const stylesResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'reset.css'));
        const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'main.css'));
        const nonce = this._getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${stylesResetUri}" rel="stylesheet">
                <link href="${stylesMainUri}" rel="stylesheet">
                <title>AI Context Builder</title>
            </head>
            <body>
                <div class="chat-container">
                    <div class="info-section">
                        <p>📝 Build context with text and attachments.</p>
                        <p>📋 Click "Copy Context" to send to the main chat.</p>
                    </div>
                    
                    <div class="attachments-section">
                        <div class="attachment-buttons">
                            <button id="attachFileBtn" class="attach-btn">Attach File/Folder</button>
                        </div>
                        <div id="attachmentsList" class="attachments-list"></div>
                    </div>

                    <div class="input-section">
                            <textarea id="messageInput" placeholder="Type your message..." rows="4"></textarea>
                        <button id="sendBtn" class="send-btn">Copy Context</button>
                    </div>

                    <div id="statusArea" class="status-area"></div>
                </div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }

    private _getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
} 