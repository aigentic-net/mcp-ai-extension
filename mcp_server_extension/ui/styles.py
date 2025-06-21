# Modern styling for AI extension Tool UI components
from PyQt5 import QtGui, QtCore
import base64

class ModernTheme:
    """Modern dark theme based on Catppuccin Mocha with enhancements"""
    
    # Base colors (Catppuccin Mocha inspired)
    COLORS = {
        # Background colors
        'background': QtGui.QColor(24, 24, 37),         # #181825 - Main background
        'surface0': QtGui.QColor(49, 50, 68),           # #313244 - Secondary background
        'surface1': QtGui.QColor(69, 71, 90),           # #45475a - Tertiary background
        'surface2': QtGui.QColor(88, 91, 112),          # #585b70 - Card background
        
        # extension colors
        'hover': QtGui.QColor(49, 50, 68),              # #313244 - Hover state
        'selected': QtGui.QColor(137, 180, 250, 40),    # rgba(137, 180, 250, 0.15) - Selection
        'selected_border': QtGui.QColor(137, 180, 250), # #89b4fa - Selection border
        'pressed': QtGui.QColor(137, 180, 250, 60),     # rgba(137, 180, 250, 0.23) - Pressed state
        
        # Text colors
        'text': QtGui.QColor(205, 214, 244),            # #cdd6f4 - Primary text
        'text_secondary': QtGui.QColor(166, 173, 200),  # #a6adc8 - Secondary text
        'text_disabled': QtGui.QColor(108, 112, 134),   # #6c7086 - Disabled text
        
        # Accent colors
        'accent_blue': QtGui.QColor(137, 180, 250),     # #89b4fa - Primary accent
        'accent_green': QtGui.QColor(166, 227, 161),    # #a6e3a1 - Success/files
        'accent_yellow': QtGui.QColor(249, 226, 175),   # #f9e2af - Folders/warning
        'accent_red': QtGui.QColor(243, 139, 168),      # #f38ba8 - Error/danger
        'accent_pink': QtGui.QColor(245, 194, 231),     # #f5c2e7 - Special
        'accent_mauve': QtGui.QColor(203, 166, 247),    # #cba6f7 - Purple accent
        
        # Semantic colors
        'success': QtGui.QColor(166, 227, 161),         # #a6e3a1
        'warning': QtGui.QColor(249, 226, 175),         # #f9e2af
        'error': QtGui.QColor(243, 139, 168),           # #f38ba8
        'info': QtGui.QColor(137, 180, 250),            # #89b4fa
    }
    
    # Typography
    FONTS = {
        'default_size': 13,
        'small_size': 11,
        'large_size': 15,
        'icon_size': 16,
        'family': 'Segoe UI, Arial, sans-serif',
    }
    
    # Spacing and dimensions
    SPACING = {
        'small': 4,
        'medium': 8,
        'large': 12,
        'xlarge': 16,
        'border_radius': 6,
        'item_height': 28,
        'icon_size': 20,
        'checkmark_size': 18,
    }
    
    @classmethod
    def get_tree_view_stylesheet(cls):
        """Get stylesheet for QTreeView with modern dark theme"""
        return f"""
        QTreeView {{
            background-color: {cls.COLORS['surface0'].name()};
            border: 1px solid {cls.COLORS['surface1'].name()};
            border-radius: {cls.SPACING['border_radius']}px;
            outline: none;
            color: {cls.COLORS['text'].name()};
            font-family: {cls.FONTS['family']};
            font-size: {cls.FONTS['default_size']}px;
            selection-background-color: transparent;
        }}
        
        QTreeView::item {{
            height: {cls.SPACING['item_height']}px;
            padding: {cls.SPACING['small']}px;
            border: none;
            margin: 1px 4px;
            border-radius: {cls.SPACING['border_radius']}px;
        }}
        
        QTreeView::item:hover {{
            background-color: {cls.COLORS['hover'].name()};
        }}
        
        QTreeView::item:selected {{
            background-color: transparent;
        }}
        
        QTreeView::branch {{
            background: transparent;
            width: 16px;
        }}
        

        
        QScrollBar:vertical {{
            background-color: {cls.COLORS['surface0'].name()};
            width: 12px;
            border-radius: 6px;
            margin: 0;
        }}
        
        QScrollBar::handle:vertical {{
            background-color: {cls.COLORS['surface2'].name()};
            border-radius: 6px;
            min-height: 30px;
        }}
        
        QScrollBar::handle:vertical:hover {{
            background-color: {cls.COLORS['text_secondary'].name()};
        }}
        
        QScrollBar::add-line:vertical,
        QScrollBar::sub-line:vertical {{
            height: 0;
        }}
        
        QScrollBar:horizontal {{
            background-color: {cls.COLORS['surface0'].name()};
            height: 12px;
            border-radius: 6px;
            margin: 0;
        }}
        
        QScrollBar::handle:horizontal {{
            background-color: {cls.COLORS['surface2'].name()};
            border-radius: 6px;
            min-width: 30px;
        }}
        
        QScrollBar::handle:horizontal:hover {{
            background-color: {cls.COLORS['text_secondary'].name()};
        }}
        
        QScrollBar::add-line:horizontal,
        QScrollBar::sub-line:horizontal {{
            width: 0;
        }}
        """
    
    @classmethod
    def _get_chevron_right_svg(cls):
        """Get base64 encoded chevron right SVG"""
        svg = f"""<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 4L10 8L6 12" stroke="{cls.COLORS['text'].name()}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>"""
        return base64.b64encode(svg.encode()).decode()
    
    @classmethod 
    def _get_chevron_down_svg(cls):
        """Get base64 encoded chevron down SVG"""
        svg = f"""<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6L8 10L12 6" stroke="{cls.COLORS['text'].name()}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>"""
        return base64.b64encode(svg.encode()).decode()

class FileTypeIcons:
    """Modern file type icons using Unicode with better categorization"""
    
    ICONS = {
        # Folders
        'folder_closed': '📁',
        'folder_open': '📂',
        
        # Programming languages
        'python': '🐍',
        'javascript': '🟨', 
        'typescript': '🔷',
        'html': '🌐',
        'css': '🎨',
        'json': '📋',
        'xml': '📄',
        'yaml': '📄',
        'cpp': '⚙️',
        'java': '☕',
        'csharp': '🔷',
        'go': '🐹',
        'rust': '🦀',
        'php': '🐘',
        'ruby': '💎',
        'swift': '🕊️',
        'kotlin': '📱',
        
        # Data and config
        'database': '🗃️',
        'config': '⚙️',
        'env': '🔐',
        'dockerfile': '🐳',
        'makefile': '🔨',
        
        # Documents
        'text': '📄',
        'markdown': '📝',
        'pdf': '📕',
        'word': '📘',
        'excel': '📊',
        'powerpoint': '📰',
        
        # Media
        'image': '🖼️',
        'video': '🎬',
        'audio': '🎵',
        'font': '🔤',
        
        # Archives
        'archive': '📦',
        'zip': '🗜️',
        
        # Default
        'file': '📄',
        'unknown': '❓',
    }
    
    # File extension mappings
    EXTENSION_MAP = {
        # Programming
        'py': 'python',
        'js': 'javascript', 
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'scss': 'css',
        'sass': 'css',
        'less': 'css',
        'json': 'json',
        'xml': 'xml',
        'yml': 'yaml',
        'yaml': 'yaml',
        'cpp': 'cpp',
        'c': 'cpp',
        'cc': 'cpp',
        'cxx': 'cpp',
        'h': 'cpp',
        'hpp': 'cpp',
        'java': 'java',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',
        'php': 'php',
        'rb': 'ruby',
        'swift': 'swift',
        'kt': 'kotlin',
        
        # Data
        'sql': 'database',
        'db': 'database',
        'sqlite': 'database',
        'conf': 'config',
        'config': 'config',
        'ini': 'config',
        'toml': 'config',
        'env': 'env',
        'dockerfile': 'dockerfile',
        'makefile': 'makefile',
        
        # Documents
        'txt': 'text',
        'md': 'markdown',
        'markdown': 'markdown',
        'rst': 'markdown',
        'pdf': 'pdf',
        'doc': 'word',
        'docx': 'word',
        'xls': 'excel',
        'xlsx': 'excel',
        'ppt': 'powerpoint',
        'pptx': 'powerpoint',
        
        # Media
        'jpg': 'image',
        'jpeg': 'image',
        'png': 'image',
        'gif': 'image',
        'svg': 'image',
        'bmp': 'image',
        'webp': 'image',
        'ico': 'image',
        'mp4': 'video',
        'avi': 'video',
        'mkv': 'video',
        'mov': 'video',
        'wmv': 'video',
        'webm': 'video',
        'mp3': 'audio',
        'wav': 'audio',
        'flac': 'audio',
        'aac': 'audio',
        'm4a': 'audio',
        'ogg': 'audio',
        'ttf': 'font',
        'otf': 'font',
        'woff': 'font',
        'woff2': 'font',
        
        # Archives
        'zip': 'zip',
        'rar': 'archive',
        '7z': 'archive',
        'tar': 'archive',
        'gz': 'archive',
        'bz2': 'archive',
        'xz': 'archive',
    }
    
    @classmethod
    def get_icon(cls, filename, is_directory=False):
        """Get appropriate icon for file or directory"""
        if is_directory:
            return cls.ICONS['folder_closed']
        
        if not filename or '.' not in filename:
            return cls.ICONS['file']
        
        extension = filename.lower().split('.')[-1]
        icon_type = cls.EXTENSION_MAP.get(extension, 'file')
        return cls.ICONS.get(icon_type, cls.ICONS['file'])

# Legacy functions for backward compatibility
def get_main_stylesheet():
    """Get main window stylesheet with AI Interactive Tool theme"""
    return """
        QDialog {
            background-color: #1a1b26;
            color: #ffffff;
        }
        
        QLabel {
            color: #ffffff;
            font-size: 14px;
        }
        
        QComboBox {
            background-color: #24283b;
            color: #ffffff;
            border: 1px solid #414868;
            border-radius: 4px;
            padding: 4px;
            min-width: 100px;
        }
        
        QComboBox::drop-down {
            border: none;
        }
        
        QComboBox::down-arrow {
            image: url(:/icons/down_arrow.png);
            width: 12px;
            height: 12px;
        }
        
        QComboBox QAbstractItemView {
            background-color: #24283b;
            color: #ffffff;
            selection-background-color: #414868;
        }
        
        QPushButton {
            background-color: #24283b;
            color: #ffffff;
            border: 1px solid #414868;
            border-radius: 4px;
            padding: 8px 16px;
            font-size: 14px;
        }
        
        QPushButton:hover {
            background-color: #414868;
        }
        
        QPushButton:pressed {
            background-color: #565f89;
        }
        
        QPushButton:disabled {
            background-color: #1a1b26;
            color: #565f89;
            border-color: #24283b;
        }
        
        QPushButton#attachBtn {
            background-color: #7aa2f7;
            border-color: #7aa2f7;
        }
        
        QPushButton#attachBtn:hover {
            background-color: #89b4fa;
            border-color: #89b4fa;
        }
        
        QPushButton#clearSelectedBtn {
            background-color: #f7768e;
            border-color: #f7768e;
        }
        
        QPushButton#clearSelectedBtn:hover {
            background-color: #ff7a93;
            border-color: #ff7a93;
        }
        
        QPushButton#clearAllBtn {
            background-color: #db4b4b;
            border-color: #db4b4b;
        }
        
        QPushButton#clearAllBtn:hover {
            background-color: #e64553;
            border-color: #e64553;
        }
        
        QPushButton#attachImageBtn {
            background-color: #9ece6a;
            border-color: #9ece6a;
        }
        
        QPushButton#attachImageBtn:hover {
            background-color: #a9e37c;
            border-color: #a9e37c;
        }
        
        QPushButton#clearImagesBtn {
            background-color: #f7768e;
            border-color: #f7768e;
        }
        
        QPushButton#clearImagesBtn:hover {
            background-color: #ff7a93;
            border-color: #ff7a93;
        }
        
        QPushButton#saveImageBtn {
            background-color: #bb9af7;
            border-color: #bb9af7;
        }
        
        QPushButton#saveImageBtn:hover {
            background-color: #c6a2ff;
            border-color: #c6a2ff;
        }
        
        QPushButton#sendBtn {
            background-color: #9ece6a;
            border-color: #9ece6a;
        }
        
        QPushButton#sendBtn:hover {
            background-color: #a9e37c;
            border-color: #a9e37c;
        }
        
        QPushButton#closeBtn {
            background-color: #414868;
            border-color: #565f89;
        }
        
        QPushButton#closeBtn:hover {
            background-color: #565f89;
            border-color: #414868;
        }
        
        QCheckBox {
            color: #ffffff;
            font-size: 14px;
        }
        
        QCheckBox::indicator {
            width: 16px;
            height: 16px;
            border: 1px solid #414868;
            border-radius: 3px;
            background-color: #24283b;
        }
        
        QCheckBox::indicator:checked {
            background-color: #7aa2f7;
            border-color: #7aa2f7;
        }
        
        QCheckBox::indicator:hover {
            border-color: #565f89;
        }
        
        #warningLabel {
            color: #e0af68;
            font-style: italic;
        }
        
        #infoLabel {
            color: #9aa5ce;
        }
    """

def get_main_input_textedit_stylesheet():
    """Get input text edit stylesheet"""
    return """
        QTextEdit {
            background-color: #2d2d2d;
            color: #ffffff;
            border: 1px solid #3d3d3d;
        border-radius: 4px;
            padding: 8px;
            font-size: 14px;
            selection-background-color: #264f78;
        }
        
        QTextEdit:focus {
            border-color: #4d4d4d;
        }
    """

def get_file_container_stylesheet():
    """Get file container stylesheet"""
    return """
        QWidget {
            background-color: #2d2d2d;
            border: 2px dashed #3d3d3d;
            border-radius: 4px;
        }
    """

def get_file_placeholder_stylesheet():
    """Get file placeholder stylesheet"""
    return """
        QLabel {
            color: #8b949e;
            font-size: 14px;
            font-style: italic;
        }
    """

def get_file_list_stylesheet():
    """Get file list stylesheet"""
    return """
        QListWidget {
            background-color: #2d2d2d;
            color: #ffffff;
            border: none;
            border-radius: 4px;
            padding: 4px;
            font-size: 14px;
        }
        
        QListWidget::item {
            background-color: #2d2d2d;
            color: #ffffff;
            border-radius: 2px;
            padding: 4px;
        }
        
        QListWidget::item:selected {
            background-color: #264f78;
        }
        
        QListWidget::item:hover {
            background-color: #3d3d3d;
        }
        """ 

def get_context_menu_stylesheet():
    """Get context menu stylesheet"""
    return """
        QMenu {
            background-color: #2d2d2d;
            color: #ffffff;
            border: 1px solid #3d3d3d;
            border-radius: 4px;
            padding: 4px;
        }
        
        QMenu::item {
            background-color: transparent;
            padding: 4px 8px;
        }
        
        QMenu::item:selected {
            background-color: #264f78;
        }
        
        QMenu::separator {
            height: 1px;
            background-color: #3d3d3d;
            margin: 4px 0;
        }
    """

def get_image_container_stylesheet():
    """Get stylesheet for image container (darker purple theme for better image contrast)"""
    return f"""
    QFrame {{
        background-color: #4c1d95;
        border: 1px solid #6d28d9;
        border-radius: {ModernTheme.SPACING['border_radius'] * 2}px;
        margin: 4px 2px;
    }}
    """

def get_image_placeholder_stylesheet():
    """Get stylesheet for image placeholder label"""
    return f"""
    QLabel {{
        color: #c4b5fd;
        font-style: italic;
        font-size: {ModernTheme.FONTS['default_size']}px;
        font-weight: 500;
        padding: 2px;
        border: 2px dashed #8b5cf6;
        border-radius: 10px;
        background-color: rgba(76, 29, 149, 0.3);
        margin: 2px;
    }}
    QLabel:hover {{
        color: #ddd6fe;
        border-color: #a855f7;
        background-color: rgba(109, 40, 217, 0.4);
    }}
    """

def get_image_scroll_stylesheet():
    """Get stylesheet for image scroll area and widget"""
    return f"""
    QScrollArea {{
        background-color: transparent;
        border: none;
    }}
    QWidget {{
        background-color: #4c1d95;
    }}
    QScrollBar:horizontal {{
        background-color: #6d28d9;
        height: 16px;
        border-radius: 8px;
        margin: 2px;
        border: 1px solid #8b5cf6;
    }}
    QScrollBar::handle:horizontal {{
        background-color: #a855f7;
        border-radius: 6px;
        min-width: 40px;
        margin: 2px;
        border: 1px solid #c084fc;
    }}
    QScrollBar::handle:horizontal:hover {{
        background-color: #c084fc;
        border: 1px solid #ddd6fe;
    }}
    QScrollBar::handle:horizontal:pressed {{
        background-color: #e879f9;
    }}
    QScrollBar::add-line:horizontal, 
    QScrollBar::sub-line:horizontal {{
        width: 0px;
        height: 0px;
    }}
    QScrollBar::add-page:horizontal,
    QScrollBar::sub-page:horizontal {{
        background: transparent;
    }}
    """

def get_image_preview_card_stylesheet():
    """Get stylesheet for image preview cards"""
    return """
    QFrame {
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        margin: 2px;
    }
    QFrame:hover {
        border: 2px solid #2196F3;
        background-color: #f8f9ff;
    }
    """

def get_image_preview_label_stylesheet():
    """Get stylesheet for image preview labels"""
    return """
    QLabel {
        background-color: #fafafa;
        border: 1px solid #e8e8e8;
        border-radius: 6px;
        padding: 2px;
    }
    """

def get_image_filename_label_stylesheet():
    """Get stylesheet for image filename labels"""
    return """
    QLabel {
        color: #2d2d2d;
        font-size: 12px;
        font-weight: bold;
        background: transparent;
        border: none;
        letter-spacing: 0.2px;
    }
    """

def get_image_size_label_stylesheet():
    """Get stylesheet for image size labels"""
    return """
    QLabel {
        color: #666666;
        font-size: 10px;
        font-weight: normal;
        background: transparent;
        border: none;
    }
    """

def get_image_remove_button_stylesheet():
    """Get stylesheet for image remove buttons"""
    return """
    QPushButton {
        background-color: #ff4757;
        color: white;
        border: none;
        border-radius: 9px;
        font-size: 12px;
        font-weight: bold;
        font-family: Arial, sans-serif;
        padding: 3px;
        width: 18px;
        height: 18px;
        min-width: 18px;
        min-height: 18px;
        max-width: 18px;
        max-height: 18px;
    }
    QPushButton:hover {
        background-color: #ff3742;
    }
    QPushButton:pressed {
        background-color: #ff2f3a;
    }
    """

def apply_semantic_button_color(button, button_type):
    """
    Apply semantic color to a QPushButton
    
    Args:
        button: QPushButton instance
        button_type: str - One of 'success', 'warning', 'danger', 'info', 'special', 'secondary'
    """
    valid_types = ['success', 'warning', 'danger', 'info', 'special', 'secondary']
    if button_type not in valid_types:
        print(f"Warning: Unknown button type '{button_type}'. Valid types: {valid_types}")
        return
    
    button.setProperty("button-type", button_type)
    # Force style refresh
    button.style().unpolish(button)
    button.style().polish(button)
    button.update() 

def get_image_viewer_dialog_stylesheet():
    """Ultra-modern dark gradient background for image viewer dialog"""
    return """
        QDialog {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #1a1a2e, stop:0.5 #16213e, stop:1 #0f3460);
            border-radius: 15px;
            border: 2px solid rgba(255, 255, 255, 0.1);
        }
        QDialog::title {
            background: transparent;
            color: white;
            font-weight: bold;
            font-size: 14px;
        }
    """

def get_image_viewer_header_stylesheet():
    """Header title styling for image viewer"""
    return """
        QLabel {
            color: #ffffff;
            font-size: 18px;
            font-weight: 600;
            padding: 8px 0px;
            background: transparent;
            letter-spacing: 0.5px;
        }
    """

def get_image_viewer_zoom_container_stylesheet():
    """Glassmorphism container for zoom controls"""
    return """
        QFrame {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 8px;
            backdrop-filter: blur(20px);
        }
    """

def get_image_viewer_zoom_button_stylesheet():
    """Compact modern button styling for zoom controls"""
    return """
        QPushButton {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #667eea, stop:1 #764ba2);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 6px 10px;
            font-size: 12px;
            font-weight: 600;
            min-width: 32px;
            min-height: 28px;
            letter-spacing: 0.3px;
            box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }
        QPushButton:hover {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #5a67d8, stop:1 #6b46c1);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
        }
        QPushButton:pressed {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #4c51bf, stop:1 #553c9a);
            transform: translateY(0px);
        }
        QPushButton:disabled {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.5);
            box-shadow: none;
        }
    """

def get_image_viewer_zoom_label_stylesheet():
    """Zoom level display styling"""
    return """
        QLabel {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 rgba(255, 255, 255, 0.15), 
                stop:1 rgba(255, 255, 255, 0.05));
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            padding: 6px 8px;
            font-weight: 700;
            font-size: 12px;
            color: #ffffff;
            letter-spacing: 0.5px;
            min-height: 10px;
        }
    """

def get_image_viewer_zoom_icon_stylesheet():
    """Zoom icon styling"""
    return """
        QLabel {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            font-weight: 500;
            padding: 6px;
            background: transparent;
        }
    """

def get_image_viewer_fit_button_stylesheet():
    """Fit button with pink gradient"""
    base_style = get_image_viewer_zoom_button_stylesheet()
    return base_style.replace(
        "stop:0 #667eea, stop:1 #764ba2",
        "stop:0 #f093fb, stop:1 #f5576c"
    ).replace(
        "rgba(102, 126, 234, 0.3)",
        "rgba(240, 147, 251, 0.3)"
    ).replace(
        "rgba(102, 126, 234, 0.5)",
        "rgba(240, 147, 251, 0.5)"
    )

def get_image_viewer_reset_button_stylesheet():
    """Reset button with cyan gradient"""
    base_style = get_image_viewer_zoom_button_stylesheet()
    return base_style.replace(
        "stop:0 #667eea, stop:1 #764ba2",
        "stop:0 #4facfe, stop:1 #00f2fe"
    ).replace(
        "rgba(102, 126, 234, 0.3)",
        "rgba(79, 172, 254, 0.3)"
    ).replace(
        "rgba(102, 126, 234, 0.5)",
        "rgba(79, 172, 254, 0.5)"
    )

def get_image_viewer_scroll_area_stylesheet():
    """Ultra-modern scroll area with glassmorphism and no white backgrounds"""
    return """
        QScrollArea {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 rgba(255, 255, 255, 0.03),
                stop:1 rgba(255, 255, 255, 0.01));
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 20px;
            padding: 5px;
        }
        QScrollArea > QWidget > QWidget {
            background: transparent;
        }
        QScrollArea::corner {
            background: transparent;
            border: none;
        }
        QScrollArea QWidget {
            background: transparent;
        }
        QScrollBar:vertical {
            background: rgba(255, 255, 255, 0.1);
            width: 10px;
            border-radius: 5px;
            margin: 0;
            border: none;
        }
        QScrollBar::handle:vertical {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 #667eea, stop:1 #764ba2);
            border-radius: 5px;
            min-height: 15px;
            border: none;
        }
        QScrollBar::handle:vertical:hover {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 #5a67d8, stop:1 #6b46c1);
        }
        QScrollBar:horizontal {
            background: rgba(255, 255, 255, 0.1);
            height: 10px;
            border-radius: 5px;
            margin: 0;
            border: none;
        }
        QScrollBar::handle:horizontal {
            background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                stop:0 #667eea, stop:1 #764ba2);
            border-radius: 5px;
            min-width: 15px;
            border: none;
        }
        QScrollBar::handle:horizontal:hover {
            background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                stop:0 #5a67d8, stop:1 #6b46c1);
        }
        QScrollBar::add-line, QScrollBar::sub-line {
            background: transparent;
            border: none;
            width: 0px;
            height: 0px;
        }
        QScrollBar::add-page, QScrollBar::sub-page {
            background: transparent;
            border: none;
        }
    """

def get_image_viewer_image_label_stylesheet():
    """Image label with completely transparent background"""
    return """
        QLabel {
            background: transparent;
            border: none;
            padding: 20px;
            margin: 10px;
        }
    """

def get_image_viewer_footer_container_stylesheet():
    """Footer container with glassmorphism"""
    return """
        QFrame {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 18px;
            padding: 5px;
            margin-top: 10px;
        }
    """

def get_image_viewer_info_label_stylesheet():
    """Image info label styling"""
    return """
        QLabel {
            color: rgba(255, 255, 255, 0.8);
            font-size: 13px;
            font-weight: 500;
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            letter-spacing: 0.3px;
        }
    """

def get_image_viewer_shortcuts_label_stylesheet():
    """Keyboard shortcuts info styling"""
    return """
        QLabel {
            color: rgba(255, 255, 255, 0.6);
            font-size: 11px;
            font-weight: 400;
            padding: 4px 8px;
            background: transparent;
            letter-spacing: 0.2px;
        }
    """

def get_image_viewer_close_button_stylesheet():
    """Compact modern close button with red gradient"""
    return """
        QPushButton {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #ff6b6b, stop:1 #ee5a52);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 700;
            min-width: 32px;
            min-height: 28px;
            letter-spacing: 0.3px;
            box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
        }
        QPushButton:hover {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #ff5252, stop:1 #e53e3e);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.5);
        }
        QPushButton:pressed {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #e53e3e, stop:1 #c53030);
            transform: translateY(0px);
    }
    """ 