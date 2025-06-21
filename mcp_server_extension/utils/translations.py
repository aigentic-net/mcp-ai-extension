"""
Translation utilities for AI extension Tool - Extension Version
"""

TRANSLATIONS = {
    "en": {
        "window_title": "AI Interactive Tool",
        "language_label": "Language:",
        "info_label": "Type your message and press 'Send' or Ctrl+Enter to send. You can also attach files.",
        "input_placeholder": "Type your message...",
        "attach_btn": "Attach file",
        "clear_selected_btn": "Clear Selected",
        "clear_all_btn": "Clear All",
        "attach_image_btn": "Attach Image",
        "clear_images_btn": "Clear Images",
        "save_image_btn": "Save Image",
        "file_drop_placeholder": "Drag & drop files/folders here or click 'Attach File' button",
        "image_drop_placeholder": "Drag & drop images here or click here to select images",
        "continue_checkbox": "Continue conversation",
        "continue_warning": "NOTE: If continue conversation is checked, Agent MUST call this tool again!",
        "send_btn": "Send",
        "close_btn": "Close"
    },
    "vi": {
        "window_title": "AI Interactive Tool",
        "language_label": "Ngôn ngữ:",
        "info_label": "Nhập tin nhắn và nhấn 'Gửi' hoặc Ctrl+Enter để gửi. Bạn cũng có thể đính kèm tệp.",
        "input_placeholder": "Nhập tin nhắn của bạn...",
        "attach_btn": "Đính kèm tệp",
        "clear_selected_btn": "Xóa đã chọn",
        "clear_all_btn": "Xóa tất cả",
        "attach_image_btn": "Đính kèm ảnh",
        "clear_images_btn": "Xóa ảnh",
        "save_image_btn": "Lưu ảnh",
        "file_drop_placeholder": "Kéo & thả tệp/thư mục vào đây hoặc nhấn nút 'Đính kèm tệp'",
        "image_drop_placeholder": "Kéo & thả ảnh vào đây hoặc nhấn vào đây để chọn ảnh",
        "continue_checkbox": "Tiếp tục trò chuyện",
        "continue_warning": "LƯU Ý: Nếu chọn tiếp tục trò chuyện, Agent PHẢI gọi lại công cụ này!",
        "send_btn": "Gửi",
        "close_btn": "Đóng"
    }
}

def get_translations():
    """Get all translations"""
    return TRANSLATIONS

def get_translation(key: str, language: str = "en") -> str:
    """Get translation for a specific key and language"""
    if language not in TRANSLATIONS:
        language = "en"
    return TRANSLATIONS[language].get(key, key) 