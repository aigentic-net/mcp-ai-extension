import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { AttachedFile, AttachedImage } from './mcp-client';

export class FileManager {
    private attachedFiles: AttachedFile[] = [];
    private attachedImages: AttachedImage[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    attachFile(filePath: string): boolean {
        try {
            const stat = fs.statSync(filePath);
            const workspaceFolder = this.getWorkspaceFolder();
            
            let relativePath = filePath;
            if (workspaceFolder && filePath.startsWith(workspaceFolder)) {
                relativePath = path.relative(workspaceFolder, filePath);
            }

            const attachedFile: AttachedFile = {
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
        } catch (error) {
            console.error('Error attaching file:', error);
            return false;
        }
    }

    attachImage(imagePath: string): boolean {
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

            const attachedImage: AttachedImage = {
                path: imagePath,
                base64: base64,
                mediaType: mediaType
            };

            this.attachedImages.push(attachedImage);
            return true;
        } catch (error) {
            console.error('Error attaching image:', error);
            return false;
        }
    }

    removeFile(filePath: string): boolean {
        const index = this.attachedFiles.findIndex(f => f.path === filePath);
        if (index !== -1) {
            this.attachedFiles.splice(index, 1);
            return true;
        }
        return false;
    }

    removeImage(imagePath: string): boolean {
        const index = this.attachedImages.findIndex(img => img.path === imagePath);
        if (index !== -1) {
            this.attachedImages.splice(index, 1);
            return true;
        }
        return false;
    }

    clearAllAttachments(): void {
        this.attachedFiles = [];
        this.attachedImages = [];
    }

    getAttachedFiles(): AttachedFile[] {
        return [...this.attachedFiles];
    }

    getAttachedImages(): AttachedImage[] {
        return [...this.attachedImages];
    }

    getAttachmentCount(): number {
        return this.attachedFiles.length + this.attachedImages.length;
    }

    private getWorkspaceFolder(): string | undefined {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].uri.fsPath;
        }
        return undefined;
    }

    private isImageFile(filePath: string): boolean {
        const ext = path.extname(filePath).toLowerCase();
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.ico', '.svg'];
        return imageExtensions.includes(ext);
    }

    private getImageMediaType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: { [key: string]: string } = {
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

    async validateFileAccess(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
            return true;
        } catch {
            return false;
        }
    }

    getFileSize(filePath: string): number {
        try {
            const stat = fs.statSync(filePath);
            return stat.size;
        } catch {
            return 0;
        }
    }

    isWithinSizeLimit(filePath: string): boolean {
        const config = vscode.workspace.getConfiguration('aiextension');
        const maxSize = config.get<number>('maxFileSize', 1048576); // 1MB default
        return this.getFileSize(filePath) <= maxSize;
    }
} 