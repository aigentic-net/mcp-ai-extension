// JavaScript for AI extension Chat webview

(function() {
    try {
        const vscode = acquireVsCodeApi();
        
        // DOM elements
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        const copyBtn = document.getElementById('copyBtn');
        const attachFileBtn = document.getElementById('attachFileBtn');
        const attachImageBtn = document.getElementById('attachImageBtn');
        const clearAttachmentsBtn = document.getElementById('clearAttachmentsBtn');
        const newConversationBtn = document.getElementById('newConversationBtn');
        const attachmentsList = document.getElementById('attachmentsList');
        const statusArea = document.getElementById('statusArea');

        // Event listeners
        sendBtn.addEventListener('click', sendMessage);
        copyBtn.addEventListener('click', copyToClipboard);
        messageInput.addEventListener('keydown', handleKeyDown);
        attachFileBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'attachFile' });
        });
        attachImageBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'attachImage' });
        });
        clearAttachmentsBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'clearAttachments' });
        });
        newConversationBtn.addEventListener('click', () => {
            vscode.postMessage({ type: 'newConversation' });
        });

        // Handle Enter key in textarea
        function handleKeyDown(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        }

        // Send message function
        function sendMessage() {
            const text = messageInput.value.trim();
            if (!text) return;
            
            // Send to extension
            vscode.postMessage({
                type: 'sendMessage',
                text: text
            });

            // Clear input
            messageInput.value = '';
            
            // Show status
            showStatus('Formatting message and copying to clipboard...', 'info');
        }

        // Copy to clipboard function
        function copyToClipboard() {
            const text = messageInput.value.trim();
            if (!text) return;
            
            // Send to extension
            vscode.postMessage({
                type: 'copyToClipboard',
                text: text
            });
            
            // Show status
            showStatus('Copying to clipboard...', 'info');
        }

        // Update attachments display
        function updateAttachments(attachedFiles, attachedImages) {
            attachmentsList.innerHTML = '';
            
            // Add files
            attachedFiles.forEach(file => {
                const item = document.createElement('div');
                item.className = 'attachment-item';
                
                const icon = file.type === 'folder' ? '📁' : '📄';
                const name = file.relativePath || file.path;
                
                item.innerHTML = `
                    ${icon} ${name}
                    <button class="attachment-remove" onclick="removeAttachment('file', '${file.path}')">×</button>
                `;
                
                attachmentsList.appendChild(item);
            });
            
            // Add images
            attachedImages.forEach(image => {
                const item = document.createElement('div');
                item.className = 'attachment-item';
                
                const name = image.path.split('/').pop() || image.path;
                
                item.innerHTML = `
                    🖼️ ${name}
                    <button class="attachment-remove" onclick="removeAttachment('image', '${image.path}')">×</button>
                `;
                
                attachmentsList.appendChild(item);
            });
            
            // Show/hide attachments section
            if (attachedFiles.length === 0 && attachedImages.length === 0) {
                attachmentsList.innerHTML = '<div style="color: var(--vscode-descriptionForeground); font-size: 11px; padding: 4px;">No attachments</div>';
            }
        }

        // Remove attachment (called from HTML)
        window.removeAttachment = function(type, path) {
            // This would need to be implemented to communicate back to the extension
            // For now, we'll just post a message
            vscode.postMessage({
                type: 'removeAttachment',
                attachmentType: type,
                path: path
            });
        };

        // Show status message
        function showStatus(message, type = 'info') {
            statusArea.innerHTML = `<div class="status-message ${type}">${message}</div>`;
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                statusArea.innerHTML = '';
            }, 3000);
        }

        // Clear conversation
        function clearConversation() {
            messageInput.value = '';
            statusArea.innerHTML = '';
            showStatus('Ready for new conversation', 'success');
        }

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'updateAttachments':
                    updateAttachments(message.attachedFiles || [], message.attachedImages || []);
                    break;
                case 'clearConversation':
                    clearConversation();
                    break;
                case 'messageSent':
                    showStatus(message.message, 'success');
                    break;
                default:
                    console.log('Unknown message type:', message.type);
            }
        });

        // Initial focus
        messageInput.focus();
    } catch (e) {
        // If anything fails, display the error in the webview
        const body = document.querySelector('body');
        body.innerHTML = `
            <div style="padding: 20px; color: white;">
                <h1>An Error Occurred</h1>
                <p>The webview failed to load. Please report this error.</p>
                <hr>
                <h3>Error Details:</h3>
                <pre style="white-space: pre-wrap; word-wrap: break-word;">${e.stack || e.toString()}</pre>
            </div>
        `;
    }
})(); 