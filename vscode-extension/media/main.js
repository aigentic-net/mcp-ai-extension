// This script is intentionally minimal to test webview rendering.
console.log("AI Extension webview script loaded.");

(function () {
    const vscode = acquireVsCodeApi();

    // --- DOM Element Selectors ---
    const messageInput = document.getElementById('message-input');
    const languageSelect = document.getElementById('language-select');
    
    const attachFileBtn = document.getElementById('attach-file-btn');
    const clearSelectedBtn = document.getElementById('clear-selected-btn');
    const clearAllBtn = document.getElementById('clear-all-btn');
    
    const attachImageBtn = document.getElementById('attach-image-btn');
    const clearImagesBtn = document.getElementById('clear-images-btn');
    const saveImageBtn = document.getElementById('save-image-btn');

    const fileDropZone = document.getElementById('file-drop-zone');
    const imageDropZone = document.getElementById('image-drop-zone');
    
    const fileList = document.getElementById('file-list');
    const imageList = document.getElementById('image-list');

    const continueCheckbox = document.getElementById('continue-checkbox');

    const sendBtn = document.getElementById('send-btn');
    const closeBtn = document.getElementById('close-btn');

    // --- State ---
    let attachedFiles = [];
    let attachedImages = [];
    let isSending = false;
    let currentLanguage = 'en';

    // --- Event Listeners ---

    // Language Selector
    languageSelect.addEventListener('change', () => {
        currentLanguage = languageSelect.value;
        vscode.postMessage({ 
            type: 'languageChange',
            language: currentLanguage
        });
        updateBackendState();
    });

    // Bottom Action Buttons
    sendBtn.addEventListener('click', sendMessage);
    closeBtn.addEventListener('click', () => vscode.postMessage({ type: 'close' }));
    
    // Message Input
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            sendMessage();
        }
    });

    // File Buttons
    attachFileBtn.addEventListener('click', () => vscode.postMessage({ type: 'attachFile' }));
    clearAllBtn.addEventListener('click', () => vscode.postMessage({ type: 'clearAllFiles' }));
    clearSelectedBtn.addEventListener('click', () => {
        const selectedFiles = attachedFiles.filter(f => f.selected);
        if (selectedFiles.length > 0) {
            vscode.postMessage({ type: 'clearSelectedFiles', files: selectedFiles });
        }
    });

    // Image Buttons
    attachImageBtn.addEventListener('click', () => vscode.postMessage({ type: 'attachImage' }));
    clearImagesBtn.addEventListener('click', () => vscode.postMessage({ type: 'clearImages' }));
    saveImageBtn.addEventListener('click', () => vscode.postMessage({ type: 'saveImage' })); // Backend will handle this

    // Clickable Drop Zones
    fileDropZone.addEventListener('click', () => vscode.postMessage({ type: 'attachFile' }));
    imageDropZone.addEventListener('click', () => vscode.postMessage({ type: 'attachImage' }));

    // Drag and Drop - still useful for visual feedback
    setupDragAndDrop(fileDropZone);
    setupDragAndDrop(imageDropZone);

    // State-updating listeners
    messageInput.addEventListener('input', () => updateBackendState());
    continueCheckbox.addEventListener('change', () => updateBackendState());

    // --- Functions ---

    function sendMessage() {
        if (isSending) return; // Prevent duplicate sends

        const text = messageInput.value.trim();
        const continueChat = continueCheckbox.checked;
        
        setSendingState(true);

        vscode.postMessage({
            type: 'sendMessage',
            text: text,
            continueChat: continueChat,
            language: currentLanguage
        });
    }

    function setSendingState(sending) {
        isSending = sending;
        sendBtn.disabled = sending;
        sendBtn.textContent = sending ? 'Sending...' : 'Send';
    }
    
    function setupDragAndDrop(zone) {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add('active');
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('active');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove('active');
            vscode.postMessage({ type: 'showInfo', message: `For security, please use the 'Attach' buttons to add files.` });
        });
    }

    function renderAttachments() {
        // Render Files
        fileList.innerHTML = '';
        if (attachedFiles.length > 0) {
            const listEl = document.createElement('ul');
            attachedFiles.forEach((file, index) => {
                const itemEl = document.createElement('li');
                itemEl.textContent = `${file.type === 'folder' ? '📁' : '📄'} ${file.relativePath}`;
                itemEl.dataset.filePath = file.path;
                itemEl.addEventListener('click', () => {
                    file.selected = !file.selected;
                    itemEl.classList.toggle('selected');
                });
                listEl.appendChild(itemEl);
            });
            fileList.appendChild(listEl);
        }

        // Render Images
        imageList.innerHTML = '';
        if (attachedImages.length > 0) {
            attachedImages.forEach(image => {
                const imgEl = document.createElement('img');
                imgEl.src = `data:${image.mediaType};base64,${image.base64}`;
                imageList.appendChild(imgEl);
            });
        }
    }

    function updateBackendState() {
        vscode.postMessage({
            type: 'updateState',
            text: messageInput.value,
            continueChat: continueCheckbox.checked,
            language: currentLanguage
        });
    }

    function applyState(state) {
        messageInput.value = state.text || '';
        continueCheckbox.checked = state.continueChat || false;
        if (state.language) {
            currentLanguage = state.language;
            languageSelect.value = state.language;
        }
    }

    // --- VS Code Message Handling ---
    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'restoreState':
                applyState(message);
                break;
            case 'updateAttachments':
                attachedFiles = message.attachedFiles || [];
                attachedImages = message.attachedImages || [];
                renderAttachments();
                break;
            case 'messageSentSuccess': // Listen for specific success event
                setSendingState(false);
                messageInput.value = '';
                // Backend will send updated (empty) attachments
                break;
            case 'messageSentError': // Listen for specific error event
                setSendingState(false);
                // Optionally show an error message in the UI
                break;
        }
    });

}()); 