"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatPanelProvider = void 0;
const vscode = require("vscode");
class ChatPanelProvider {
    constructor(context, mcpClient, fileManager) {
        this._disposables = [];
        // State to persist
        this._lastMessage = '';
        this._continueChat = false;
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
    resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._context.extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Add the message listener to our disposables
        this._disposables.push(webviewView.webview.onDidReceiveMessage(message => {
            // Update state on every message or user action
            if (message.type === 'updateState') {
                this._lastMessage = message.text;
                this._continueChat = message.continueChat;
            }
            else {
                this._handleWebviewMessage(message);
            }
        }, undefined, this._disposables // Use our own disposables array
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
    restoreState() {
        if (this._view) {
            this._postMessage({
                type: 'restoreState',
                text: this._lastMessage,
                continueChat: this._continueChat
            });
        }
    }
    _handleWebviewMessage(message) {
        switch (message.type) {
            case 'sendMessage':
                this._handleSendMessage(message.text, message.continueChat);
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
    async _handleSendMessage(text, continueChat) {
        if (!text.trim() && this._fileManager.getAttachmentCount() === 0) {
            // No need to post a message back, the UI state doesn't change.
            vscode.window.showWarningMessage('No message or attachments to send.');
            return;
        }
        try {
            const files = this._fileManager.getAttachedFiles();
            const images = this._fileManager.getAttachedImages();
            const response = await this._mcpClient.sendMessage(text, files, images, continueChat);
            // On success, clear attachments and the persisted message state
            this._lastMessage = '';
            this._fileManager.clearAllAttachments();
            this._postMessage({ type: 'messageSentSuccess' });
            this.updateAttachments();
            vscode.window.showInformationMessage(`AI Response: ${response}`);
        }
        catch (error) {
            // On error, notify the UI to reset its sending state without clearing anything.
            this._postMessage({ type: 'messageSentError' });
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            vscode.window.showErrorMessage(vscode.l10n.t('Error sending message: {0}', errorMessage));
        }
    }
    _formatMessageForAI(text, continueChat) {
        let formattedMessage = text;
        const attachedFiles = this._fileManager.getAttachedFiles();
        if (attachedFiles.length > 0) {
            formattedMessage += "\n\n<AI_extension_ATTACHED_FILES>\n";
            let workspaceName;
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
    _postMessage(message) {
        if (this._view) {
            this._view.webview.postMessage(message);
        }
    }
    _getHtmlForWebview(webview) {
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
                        <button class="lang-btn active">English</button>
                    </div>

                    <p class="info-text">Type your message and press 'Send' or Ctrl+Enter to send. You can also attach files.</p>

                    <textarea id="message-input" class="message-input" placeholder="hello i am your pair programmer, this is what your ai_extension_tool user interface is supposed to look like view the attached image:" aria-label="Message Input"></textarea>

                    <div class="buttons-container">
                        <div class="file-buttons">
                            <button id="attach-file-btn" class="btn" aria-label="Attach file or folder">Attach file</button>
                            <button id="clear-selected-btn" class="btn" aria-label="Clear selected files">Clear Selected</button>
                            <button id="clear-all-btn" class="btn" aria-label="Clear all attachments">Clear All</button>
                        </div>
                        <div class="image-buttons">
                            <button id="attach-image-btn" class="btn" aria-label="Attach an image">Attach Image</button>
                            <button id="clear-images-btn" class="btn" aria-label="Clear all image attachments">Clear Images</button>
                            <button id="save-image-btn" class="btn" aria-label="Save attached image">Save Image</button>
                        </div>
                    </div>

                    <div class="drop-zones-container">
                        <div id="file-drop-zone" class="drop-zone" role="button" aria-label="Attach files and folders drop zone">
                            <span>Drag & drop files/folders here or click 'Attach File' button</span>
                            <div id="file-list" class="attachment-list"></div>
                        </div>
                        <div id="image-drop-zone" class="drop-zone image-drop-zone" role="button" aria-label="Attach images drop zone">
                            <span>Drag & drop images here or click here to select images</span>
                            <div id="image-list" class="attachment-list"></div>
                        </div>
                    </div>

                    <div class="continue-container">
                        <input type="checkbox" id="continue-checkbox" />
                        <label for="continue-checkbox">Continue conversation</label>
                    </div>
                    
                    <p class="note-text">NOTE: If continue conversation is checked, Agent MUST call this tool again!</p>

                    <div class="bottom-buttons">
                        <button id="send-btn" class="btn send-btn" aria-label="Send message to AI">Send</button>
                        <button id="close-btn" class="btn close-btn" aria-label="Close extension panel">Close</button>
                    </div>
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
    newConversation() {
        this._lastMessage = '';
        this._continueChat = false;
        this._fileManager.clearAllAttachments();
        // This will send the empty attachments list and the restored (empty) state
        this.updateAttachments();
        this.restoreState();
        vscode.window.showInformationMessage('New conversation started.');
    }
}
exports.ChatPanelProvider = ChatPanelProvider;
ChatPanelProvider.viewType = 'aiextensionChat';
//# sourceMappingURL=chat-panel.js.map