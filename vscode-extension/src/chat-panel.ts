import * as vscode from 'vscode';
import { MCPClient, AttachedFile, AttachedImage } from './mcp-client';
import { FileManager } from './file-manager';
import { Disposable } from 'vscode';

export class ChatPanelProvider implements vscode.WebviewViewProvider, Disposable {
    public static readonly viewType = 'aiextensionChat';
    private _view?: vscode.WebviewView;
    private _context: vscode.ExtensionContext;
    private _fileManager: FileManager;
    private _mcpClient: MCPClient;
    private _disposables: Disposable[] = [];

    // State to persist
    private _lastMessage: string = '';
    private _continueChat: boolean = false;

    constructor(
        context: vscode.ExtensionContext,
        mcpClient: MCPClient,
        fileManager: FileManager
    ) {
        this._context = context;
        this._fileManager = fileManager;
        this._mcpClient = mcpClient;

        this._context.subscriptions.push(this);
    }

    dispose() {
        // Dispose of our disposables
        this._disposables.forEach(d => d.dispose());
        
        // Also dispose of the file manager
        this._fileManager.dispose();
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

        // Add the message listener to our disposables
        this._disposables.push(webviewView.webview.onDidReceiveMessage(
            message => {
                // Update state on every message or user action
                if (message.type === 'updateState') {
                    this._lastMessage = message.text;
                    this._continueChat = message.continueChat;
                } else {
                    this._handleWebviewMessage(message);
                }
            },
            undefined,
            this._disposables // Use our own disposables array
        ));

        // Restore state when webview becomes visible
        this._disposables.push(webviewView.onDidChangeVisibility(() => {
            if (webviewView.visible) {
                this.updateAttachments();
                this.restoreState();
            }
        }));
        
        // Initial state update
        this.updateAttachments();
        this.restoreState();
    }

    private restoreState() {
        if (this._view) {
            const selectedLanguage = this._context.workspaceState.get('selectedLanguage', 'en');
            this._postMessage({
                type: 'restoreState',
                text: this._lastMessage,
                continueChat: this._continueChat,
                language: selectedLanguage
            });
        }
    }

    private _handleWebviewMessage(message: any) {
        switch (message.type) {
            case 'sendMessage':
                this._handleSendMessage(message.text, message.continueChat, message.language);
                break;
            case 'languageChange':
                // Store the selected language in workspace state
                this._context.workspaceState.update('selectedLanguage', message.language);
                break;
            case 'attachFile':
                this._handleAttachFile();
                break;
            case 'clearSelectedFiles':
                this._fileManager.clearSelectedFiles(message.files);
                this.updateAttachments();
                break;
            case 'clearAllFiles':
                this._fileManager.clearAllAttachments();
                this.updateAttachments();
                break;
            case 'attachImage':
                this._handleAttachImage();
                break;
            case 'clearImages':
                this._fileManager.clearImages();
                this.updateAttachments();
                break;
            case 'saveImage':
                vscode.window.showInformationMessage('Save Image functionality is not implemented yet.');
                break;
            case 'close':
                vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                break;
        }
    }

    private async _handleSendMessage(text: string, continueChat: boolean, language: string = 'en'): Promise<void> {
        if (!text.trim() && this._fileManager.getAttachmentCount() === 0) {
            vscode.window.showWarningMessage('No message or attachments to send.');
            return;
        }

        try {
            const files = this._fileManager.getAttachedFiles();
            const images = this._fileManager.getAttachedImages();
            
            const response = await this._mcpClient.sendMessage(text, files, images, continueChat, language);

            // On success, clear attachments and the persisted message state
            this._lastMessage = ''; 
            this._fileManager.clearAllAttachments();
            this._postMessage({ type: 'messageSentSuccess' });
            this.updateAttachments();
            
            vscode.window.showInformationMessage(`AI Response: ${response}`);

        } catch (error) {
            this._postMessage({ type: 'messageSentError' });
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(vscode.l10n.t('Error sending message: {0}', errorMessage));
        }
    }

    private _formatMessageForAI(text: string, continueChat: boolean): string {
        let formattedMessage = text;

        const attachedFiles = this._fileManager.getAttachedFiles();
        
        if (attachedFiles.length > 0) {
            formattedMessage += "\n\n<AI_extension_ATTACHED_FILES>\n";
            let workspaceName: string | undefined;
            
            const folders = attachedFiles.filter(f => f.type === 'folder').map(f => f.relativePath);
            const files = attachedFiles.filter(f => f.type === 'file').map(f => f.relativePath);
            
            const firstFile = attachedFiles[0];
            if (firstFile) {
                const ws = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(firstFile.fullPath));
                if (ws) {
                    workspaceName = ws.name;
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
            
            formattedMessage += "</AI_extension_ATTACHED_FILES>\n";
            
            if (workspaceName) {
                formattedMessage += `\n<AI_extension_WORKSPACE>${workspaceName}</AI_extension_WORKSPACE>`;
            }
        }

        formattedMessage += `\n\n<AI_EXTENSION_CONTINUE_CHAT>${continueChat}</AI_EXTENSION_CONTINUE_CHAT>`;
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

    private _postMessage(message: any): void {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'main.js'));
        const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._context.extensionUri, 'media', 'main.css'));
        const nonce = this._getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${stylesMainUri}" rel="stylesheet">
                <title>AI Chat</title>
            </head>
            <body>
                <div class="container">
                    <div class="language-selector">
                        <label>Language:</label>
                        <select id="language-select" class="language-select">
                            <option value="en" selected>English</option>
                            <option value="vi">Vietnamese</option>
                        </select>
                    </div>

                    <textarea id="message-input" class="message-input" placeholder="Type your message here..." aria-label="Message Input"></textarea>

                    <div class="buttons-container">
                        <div class="file-buttons">
                            <button id="attach-file-btn" class="btn">Attach file</button>
                            <button id="clear-selected-btn" class="btn">Clear Selected</button>
                            <button id="clear-all-btn" class="btn">Clear All</button>
                        </div>
                        <div class="image-buttons">
                            <button id="attach-image-btn" class="btn">Attach Image</button>
                            <button id="clear-images-btn" class="btn">Clear Images</button>
                            <button id="save-image-btn" class="btn">Save Image</button>
                        </div>
                    </div>

                    <div class="drop-zones-container">
                        <div class="drop-zone-wrapper">
                            <div id="file-drop-zone" class="drop-zone" role="button">
                                <div class="drop-zone-content">
                                    <span class="drop-zone-text">Drag & drop files/folders here or click 'Attach File' button</span>
                                    <div id="file-list" class="attachment-list"></div>
                                </div>
                            </div>
                        </div>
                        <div class="drop-zone-wrapper">
                            <div id="image-drop-zone" class="drop-zone" role="button">
                                <div class="drop-zone-content">
                                    <span class="drop-zone-text">Drag & drop images here or click here to select images</span>
                                    <div id="image-list" class="attachment-list"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="continue-container">
                        <label class="continue-label">
                            <input type="checkbox" id="continue-checkbox" class="continue-checkbox" />
                            <span>Continue conversation</span>
                        </label>
                        <div class="note">NOTE: If continue conversation is checked, Agent MUST call this tool again!</div>
                    </div>

                    <div class="bottom-buttons">
                        <button id="send-btn" class="btn primary">Send</button>
                        <button id="close-btn" class="btn secondary">Close</button>
                    </div>
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

    public newConversation(): void {
        this._lastMessage = '';
        this._continueChat = false;
        this._fileManager.clearAllAttachments();
        
        // This will send the empty attachments list and the restored (empty) state
        this.updateAttachments(); 
        this.restoreState();
        
        vscode.window.showInformationMessage('New conversation started.');
    }
} 