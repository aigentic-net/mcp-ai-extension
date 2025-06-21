import * as vscode from 'vscode';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

export interface InterfaceManagerOptions {
    context: vscode.ExtensionContext;
}

export class InterfaceManager {
    private context: vscode.ExtensionContext;
    private standaloneProcess: ChildProcess | null = null;

    constructor(options: InterfaceManagerOptions) {
        this.context = options.context;
    }

    /**
     * Get the current interface mode from configuration
     */
    public getInterfaceMode(): 'standalone' | 'cursor-integration' {
        const config = vscode.workspace.getConfiguration('aiextension');
        return config.get<'standalone' | 'cursor-integration'>('interfaceMode', 'cursor-integration');
    }

    /**
     * Launch the standalone UI
     */
    public async launchStandaloneUI(): Promise<void> {
        const config = vscode.workspace.getConfiguration('aiextension');
        const standaloneUIPath = config.get<string>('standaloneUIPath');

        if (!standaloneUIPath) {
            const result = await vscode.window.showErrorMessage(
                'Standalone UI path not configured. Please set aiextension.standaloneUIPath in settings.',
                'Open Settings'
            );
            if (result === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'aiextension.standaloneUIPath');
            }
            return;
        }

        try {
            // Kill existing process if running
            if (this.standaloneProcess && !this.standaloneProcess.killed) {
                this.standaloneProcess.kill();
            }

            // Launch the standalone UI
            this.standaloneProcess = spawn('python', [standaloneUIPath], {
                detached: true,
                stdio: 'ignore'
            });

            this.standaloneProcess.unref();

            vscode.window.showInformationMessage('Standalone AI extension UI launched');

        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to launch standalone UI: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Inject content into Cursor chat
     */
    public async injectIntoCursorChat(content: string, attachments?: string[]): Promise<void> {
        try {
            // Format the content for Cursor chat injection
            let formattedContent = content;

            // Add attachment information if present
            if (attachments && attachments.length > 0) {
                formattedContent += '\n\n**Attached Files:**\n';
                attachments.forEach(file => {
                    formattedContent += `- ${path.basename(file)}\n`;
                });
            }

            // Use VS Code API to insert text into active editor or show in output
            const activeEditor = vscode.window.activeTextEditor;
            
            if (activeEditor) {
                // If there's an active editor, we can insert a comment with the AI interaction
                const position = activeEditor.selection.active;
                const language = activeEditor.document.languageId;
                const commentPrefix = this.getCommentPrefix(language);
                
                const aiComment = `${commentPrefix} AI extension Query:\n${commentPrefix} ${formattedContent.replace(/\n/g, `\n${commentPrefix} `)}\n`;
                
                await activeEditor.edit(editBuilder => {
                    editBuilder.insert(position, aiComment);
                });

                vscode.window.showInformationMessage('AI extension query inserted as comment');
            } else {
                // Show in output channel or clipboard
                const outputChannel = vscode.window.createOutputChannel('AI extension');
                outputChannel.appendLine('=== AI extension Query ===');
                outputChannel.appendLine(formattedContent);
                outputChannel.appendLine('============================');
                outputChannel.show();

                // Also copy to clipboard for easy pasting into Cursor chat
                await vscode.env.clipboard.writeText(formattedContent);
                vscode.window.showInformationMessage(
                    'AI extension query copied to clipboard and shown in output. Paste into Cursor chat.',
                    'Open Output'
                ).then(selection => {
                    if (selection === 'Open Output') {
                        outputChannel.show();
                    }
                });
            }

        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to inject into Cursor chat: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    /**
     * Get comment prefix for different languages
     */
    private getCommentPrefix(language: string): string {
        const commentPrefixes: { [key: string]: string } = {
            'javascript': '//',
            'typescript': '//',
            'java': '//',
            'c': '//',
            'cpp': '//',
            'csharp': '//',
            'go': '//',
            'rust': '//',
            'python': '#',
            'ruby': '#',
            'bash': '#',
            'shell': '#',
            'yaml': '#',
            'html': '<!--',
            'xml': '<!--',
            'css': '/*',
            'scss': '//',
            'less': '//',
            'sql': '--',
            'lua': '--',
            'r': '#',
            'matlab': '%',
            'tex': '%'
        };

        return commentPrefixes[language] || '//';
    }

    /**
     * Handle interface mode selection
     */
    public async handleInterfaceAction(content: string, attachments?: string[]): Promise<void> {
        const mode = this.getInterfaceMode();

        if (mode === 'standalone') {
            await this.launchStandaloneUI();
        } else {
            await this.injectIntoCursorChat(content, attachments);
        }
    }

    /**
     * Show interface mode selector
     */
    public async showInterfaceModeSelector(): Promise<void> {
        const currentMode = this.getInterfaceMode();
        const items = [
            {
                label: '$(window) Standalone UI',
                description: 'Launch the rich PyQt5 interface with full features',
                mode: 'standalone' as const
            },
            {
                label: '$(comment-discussion) Cursor Integration',
                description: 'Inject directly into Cursor chat for seamless workflow',
                mode: 'cursor-integration' as const
            }
        ];

        const selected = await vscode.window.showQuickPick(items, {
            title: 'Choose AI extension Interface Mode',
            placeHolder: `Current mode: ${currentMode}`
        });

        if (selected) {
            const config = vscode.workspace.getConfiguration('aiextension');
            await config.update('interfaceMode', selected.mode, vscode.ConfigurationTarget.Global);
            
            vscode.window.showInformationMessage(
                `Interface mode changed to: ${selected.mode === 'standalone' ? 'Standalone UI' : 'Cursor Integration'}`
            );
        }
    }

    /**
     * Cleanup resources
     */
    public dispose(): void {
        if (this.standaloneProcess && !this.standaloneProcess.killed) {
            this.standaloneProcess.kill();
        }
    }
} 