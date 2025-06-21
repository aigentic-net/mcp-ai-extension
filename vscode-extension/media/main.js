// This script is intentionally minimal to test webview rendering.
console.log("AI Extension webview script loaded.");

(function() {
    const vscode = acquireVsCodeApi();
    
    // DOM elements
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const attachFileBtn = document.getElementById('attachFileBtn');
    const attachmentsList = document.getElementById('attachmentsList');
    const statusArea = document.getElementById('statusArea');

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', handleKeyDown);
    attachFileBtn.addEventListener('click', () => {
        vscode.postMessage({ type: 'attachFile' });
    });

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    function sendMessage() {
        const text = messageInput.value.trim();
        vscode.postMessage({
            type: 'sendMessage',
            text: text
        });
    }

    function updateAttachments(files) {
        attachmentsList.innerHTML = '';
        if (!files || files.length === 0) {
            attachmentsList.innerHTML = '<div>No attachments</div>';
            return;
        }
        
        files.forEach(file => {
            const item = document.createElement('div');
            item.className = 'attachment-item';
            const icon = file.type === 'folder' ? '📁' : '📄';
            item.textContent = `${icon} ${file.relativePath}`;
            attachmentsList.appendChild(item);
        });
    }

    function showStatus(message, type = 'info') {
        statusArea.textContent = message;
        statusArea.className = `status-area ${type}`;
        setTimeout(() => {
            statusArea.textContent = '';
            statusArea.className = 'status-area';
        }, 3000);
    }

    window.addEventListener('message', event => {
        const message = event.data;
        
        switch (message.type) {
            case 'updateAttachments':
                updateAttachments(message.attachedFiles);
                break;
            case 'messageSent':
                showStatus(message.message, 'success');
                messageInput.value = '';
                break;
            case 'showError':
                showStatus(message.message, 'error');
                break;
        }
    });

    messageInput.focus();
})(); 