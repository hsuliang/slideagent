/**
 * SlideAgent - Main Application Entry Point
 * v3.0 - Modular ES6 Architecture
 */
import { Data } from './data.js';
import { UI } from './ui.js';
import { AI } from './ai.js';
import { FileHandler } from './files.js';
import { SlideAgentState } from './config.js';

const App = {
    init() {
        console.log("Initializing SlideAgent v3.0 (Modular)...");
        Data.init();
        UI.init();
        this.bindEvents();

        // Auto-load
        setTimeout(() => {
            if (SlideAgentState.uploadedFiles.length > 0) UI.renderGallery();
        }, 100);
    },

    bindEvents() {
        const els = UI.elements;

        // Settings Modal
        if (els.settingsBtn) els.settingsBtn.addEventListener('click', () => UI.toggleSettings(true));
        if (els.closeSettingsBtn) els.closeSettingsBtn.addEventListener('click', () => UI.toggleSettings(false));
        if (els.settingsModal) els.settingsModal.addEventListener('click', (e) => {
            if (e.target === els.settingsModal) UI.toggleSettings(false);
        });

        // API Key Saving
        if (els.saveKeyBtn) els.saveKeyBtn.addEventListener('click', () => {
            Data.saveApiKeys(els.apiKeyInput.value);
            UI.toggleSettings(false);
        });

        // API Key Visibility Toggle
        if (els.toggleKeyBtn) {
            els.toggleKeyBtn.addEventListener('click', () => {
                const input = els.apiKeyInput;
                if (input.classList.contains('text-security-disc')) {
                    input.classList.remove('text-security-disc');
                } else {
                    input.classList.add('text-security-disc');
                }
            });
        }

        // Custom Style Toggle
        if (els.style && els.customStyleContainer) {
            els.style.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    els.customStyleContainer.classList.remove('hidden');
                    els.customStyleInput.focus();
                } else {
                    els.customStyleContainer.classList.add('hidden');
                }
            });
        }

        // File Upload & Drag-n-Drop
        if (els.dropZone) {
            els.dropZone.addEventListener('click', (e) => {
                if (e.target === els.mainInput || e.target.closest('.gallery-item')) return;
                if (els.fileUpload) els.fileUpload.click();
            });

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                els.dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }, false);
            });

            els.dropZone.addEventListener('dragenter', () => els.dropZone.classList.add('ring-2', 'ring-brand-500', 'bg-brand-50'));
            els.dropZone.addEventListener('dragleave', () => els.dropZone.classList.remove('ring-2', 'ring-brand-500', 'bg-brand-50'));
            els.dropZone.addEventListener('drop', (e) => {
                els.dropZone.classList.remove('ring-2', 'ring-brand-500', 'bg-brand-50');
                FileHandler.handleFiles(e.dataTransfer.files);
            });
        }

        if (els.fileUpload) {
            els.fileUpload.addEventListener('change', (e) => {
                FileHandler.handleFiles(e.target.files);
                e.target.value = ''; // Reset to allow re-selecting the same file
            });
        }

        // Input Text Handling
        if (els.mainInput) {
            els.mainInput.addEventListener('input', () => {
                UI.updateInputState();
                Data.saveLocalHistory();
            });
            els.mainInput.addEventListener('focus', () => els.dropZone.classList.add('ring-2', 'ring-brand-100'));
            els.mainInput.addEventListener('blur', () => els.dropZone.classList.remove('ring-2', 'ring-brand-100'));
        }

        // Core Actions
        if (els.generateBtn) els.generateBtn.addEventListener('click', () => AI.startGeneration());
        if (els.cancelGenBtn) els.cancelGenBtn.addEventListener('click', () => AI.stopGeneration());

        // Clear Button
        if (els.clearBtn) {
            els.clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                UI.openConfirmModal();
            });
        }
        if (els.confirmOkBtn) els.confirmOkBtn.addEventListener('click', () => UI.executeClear());
        if (els.confirmCancelBtn) els.confirmCancelBtn.addEventListener('click', () => UI.closeConfirmModal());

        // Output Actions
        if (els.outputOutline) {
            els.outputOutline.addEventListener('input', () => {
                Data.syncToYaml();
                Data.saveLocalHistory();
            });
        }

        if (els.copyYamlBtn) els.copyYamlBtn.addEventListener('click', () => UI.copyToClipboard(els.outputYaml.textContent));

        if (els.dlYamlBtn) {
            els.dlYamlBtn.addEventListener('click', () => {
                UI.handleYamlDownload();
            });
        }

        if (els.dlMarkdownBtn) {
            els.dlMarkdownBtn.addEventListener('click', () => {
                Data.downloadMarkdown();
            });
        }

        // --- NEW V11 FEATURE: Podcast Prompt & Transcript Generator ---
        if (els.podcastDownloadBtn) {
            els.podcastDownloadBtn.addEventListener('click', () => {
                Data.downloadPodcastTranscript();
            });
        }

        if (els.podcastCopyBtn) {
            els.podcastCopyBtn.addEventListener('click', () => {
                const settings = {
                    identity: UI.elements.identity ? UI.elements.identity.value : 'teacher',
                    tone: UI.elements.tone ? UI.elements.tone.value : 'standard'
                };

                const personas = {
                    "teacher": "專業且熱情引導的老師",
                    "student": "充滿好奇心且樂於分享的同學",
                    "executive": "講求效率與重點的高階主管"
                };

                const tones = {
                    "standard": "標準客觀、口齒清晰",
                    "humorous": "幽默風趣、會適時使用比喻、像說書人一樣生動",
                    "inspirational": "熱血激勵、充滿正能量、語氣高昂吸引人",
                    "academic": "學術嚴謹、用詞專業精確、論述合乎邏輯",
                    "friendly": "親切溫暖、像朋友聊天一樣沒有距離感"
                };

                const myPersona = personas[settings.identity] || "專業分享者";
                const myTone = tones[settings.tone] || "標準客觀";

                // --- NEW WORKFLOW (V11): Ask NotebookLM to read the CLEAN text file ---
                const prompt = `
請針對上傳的專案報告，生成一段 Audio Overview 雙人對談：

1. 角色與語氣設定：
請讓兩位主持人化身為「${myPersona}」。語氣必須是「${myTone}」，彼此熱情且自然地互動，像是在錄製一場精彩的專業廣播。

2. 對話核心：
請聚焦於文檔中的「深入解說內容」與「重點摘要」來展開討論，探討內容提到的關鍵挑戰與解決方案。建議依照文稿順序討論說明。

3. 深度反思：
除了介紹表面資訊，請深入探討這些內容背後的「核心價值」與「對未來的啟發」。請用最口語、放鬆的 Podcast 閒聊節奏串接資訊，自由延伸。
            `.trim();

                UI.copyToClipboard(prompt, '✅ 語音對談指令已複製！請至 NotebookLM 指令框貼上');
            });
        }

        // Custom Style Management
        if (els.saveCustomStyleBtn) {
            els.saveCustomStyleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const styleObj = {
                    version: "SlideAgent_V12_Style",
                    style_command: els.customStyleInput ? els.customStyleInput.value.trim() : ""
                };
                localStorage.setItem('slideAgent_customStyle', JSON.stringify(styleObj));
                UI.showToast('自訂風格已儲存至瀏覽器本機記憶', 'success');
            });
        }

        if (els.exportCustomStyleBtn) {
            els.exportCustomStyleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const styleObj = {
                    version: "SlideAgent_V12_Style",
                    name: "My Custom Style",
                    description: "Exported from SlideAgent",
                    style_command: els.customStyleInput ? els.customStyleInput.value.trim() : ""
                };
                FileHandler.download(JSON.stringify(styleObj, null, 2), 'custom_style.json', 'application/json');
            });
        }

        if (els.importCustomStyleInput) {
            els.importCustomStyleInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const styleObj = JSON.parse(event.target.result);
                        if (styleObj.version && styleObj.version.startsWith("SlideAgent_") && styleObj.style_command !== undefined) {
                            if (els.customStyleInput) {
                                els.customStyleInput.value = styleObj.style_command;
                                // Save it locally as well so it persists
                                localStorage.setItem('slideAgent_customStyle', JSON.stringify(styleObj));
                                UI.showToast('自訂風格匯入成功！', 'success');
                            }
                        } else {
                            throw new Error("Invalid style file format.");
                        }
                    } catch (error) {
                        console.error('Import Style Error:', error);
                        UI.showToast('匯入失敗：檔案格式不正確或損毀', 'error');
                    }
                    e.target.value = ''; // Reset input
                };
                reader.readAsText(file);
            });
        }

        if (els.downloadStyleTemplateBtn) {
            els.downloadStyleTemplateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const templateObj = {
                    version: "SlideAgent_V12_Style",
                    name: "您的風格名稱",
                    description: "請描述這個風格的適用情境",
                    style_command: "請在此輸入您的視覺咒語，例如：水彩畫法，暖色調，夢幻氛圍 --ar 16:9"
                };
                FileHandler.download(JSON.stringify(templateObj, null, 2), 'style_template.json', 'application/json');
            });
        }
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Security feature: Clear API keys when the user closes the tab
window.addEventListener('beforeunload', () => {
    Data.clearApiKeys(false);
});
