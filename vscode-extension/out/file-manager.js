"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileManager = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class FileManager {
    constructor(context) {
        this.attachedFiles = [];
        this.attachedImages = [];
        this.context = context;
    }
    attachFile(filePath) {
        try {
            const stat = fs.statSync(filePath);
            const workspaceFolder = this.getWorkspaceFolder();
            let relativePath = filePath;
            if (workspaceFolder && filePath.startsWith(workspaceFolder)) {
                relativePath = path.relative(workspaceFolder, filePath);
            }
            const attachedFile = {
                path: filePath,
                relativePath: relativePath,
                type: stat.isDirectory() ? 'folder' : 'file'
            };
            // Check if already attached
            const exists = this.attachedFiles.some(f => f.path === filePath);
            if (!exists) {
                this.attachedFiles.push(attachedFile);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error attaching file:', error);
            return false;
        }
    }
    attachImage(imagePath) {
        try {
            if (!this.isImageFile(imagePath)) {
                return false;
            }
            // Check if already attached
            const exists = this.attachedImages.some(img => img.path === imagePath);
            if (exists) {
                return false;
            }
            const imageData = fs.readFileSync(imagePath);
            const base64 = imageData.toString('base64');
            const mediaType = this.getImageMediaType(imagePath);
            const attachedImage = {
                path: imagePath,
                base64: base64,
                mediaType: mediaType
            };
            this.attachedImages.push(attachedImage);
            return true;
        }
        catch (error) {
            console.error('Error attaching image:', error);
            return false;
        }
    }
    removeFile(filePath) {
        const index = this.attachedFiles.findIndex(f => f.path === filePath);
        if (index !== -1) {
            this.attachedFiles.splice(index, 1);
            return true;
        }
        return false;
    }
    removeImage(imagePath) {
        const index = this.attachedImages.findIndex(img => img.path === imagePath);
        if (index !== -1) {
            this.attachedImages.splice(index, 1);
            return true;
        }
        return false;
    }
    clearAllAttachments() {
        this.attachedFiles = [];
        this.attachedImages = [];
    }
    getAttachedFiles() {
        return [...this.attachedFiles];
    }
    getAttachedImages() {
        return [...this.attachedImages];
    }
    getAttachmentCount() {
        return this.attachedFiles.length + this.attachedImages.length;
    }
    getWorkspaceFolder() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].uri.fsPath;
        }
        return undefined;
    }
    isImageFile(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.ico', '.svg'];
        return imageExtensions.includes(ext);
    }
    getImageMediaType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.bmp': 'image/bmp',
            '.webp': 'image/webp',
            '.ico': 'image/x-icon',
            '.svg': 'image/svg+xml'
        };
        return mimeTypes[ext] || 'image/jpeg';
    }
    async validateFileAccess(filePath) {
        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    getFileSize(filePath) {
        try {
            const stat = fs.statSync(filePath);
            return stat.size;
        }
        catch {
            return 0;
        }
    }
    isWithinSizeLimit(filePath) {
        const config = vscode.workspace.getConfiguration('aiextension');
        const maxSize = config.get('maxFileSize', 1048576); // 1MB default
        return this.getFileSize(filePath) <= maxSize;
    }
}
exports.FileManager = FileManager;
//# sourceMappingURL=file-manager.js.map