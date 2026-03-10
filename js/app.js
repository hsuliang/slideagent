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
        if (els.copyPromptBtn) {
            els.copyPromptBtn.addEventListener('click', () => {
                const promptText = "請依據來源內容生成簡報";
                navigator.clipboard.writeText(promptText).then(() => {
                    UI.showToast("已複製提示詞", "success");
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    UI.showToast("複製失敗，請手動複製", "error");
                });
            });
        }
        if (els.cancelGenBtn) els.cancelGenBtn.addEventListener('click', () => AI.stopGeneration());

        // Clear Button & Actions
        if (els.clearBtn) {
            els.clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                UI.openConfirmModal();
            });
        }
        if (els.addFileActionBtn) {
            els.addFileActionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (els.fileUpload) els.fileUpload.click();
            });
        }
        if (els.confirmOkBtn) els.confirmOkBtn.addEventListener('click', () => UI.executeClear());
        if (els.confirmCancelBtn) els.confirmCancelBtn.addEventListener('click', () => UI.closeConfirmModal());

        // Magic Wand Actions
        if (els.magicWandCancelBtn) els.magicWandCancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            UI.closeMagicWandModal();
        });
        if (els.magicWandSubmitBtn) els.magicWandSubmitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            AI.regenerateSingleSlide();
        });

        // Output Actions
        if (els.outputOutline) {
            els.outputOutline.addEventListener('input', () => {
                Data.syncToYaml();
                Data.saveLocalHistory();
            });

            // Handle Up/Down Slide Reordering Buttons
            els.outputOutline.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;

                const action = btn.getAttribute('data-action');
                if (action !== 'up' && action !== 'down') return;

                const currentSlide = btn.closest('.slide-block');
                if (!currentSlide) return;

                if (action === 'up') {
                    const prevSlide = currentSlide.previousElementSibling;
                    if (prevSlide && prevSlide.classList.contains('slide-block')) {
                        // Prevent moving above the Cover slide
                        if (prevSlide.getAttribute('data-type') === 'cover') {
                            UI.showToast('封面頁必須固定在第一頁', 'warning');
                            return;
                        }
                        currentSlide.parentNode.insertBefore(currentSlide, prevSlide);
                        UI.updateSlideNumbers();
                        Data.syncToYaml();
                    }
                } else if (action === 'down') {
                    const nextSlide = currentSlide.nextElementSibling;
                    if (nextSlide && nextSlide.classList.contains('slide-block')) {
                        // Unlikely to move a cover down since it has no buttons, but just in case
                        if (currentSlide.getAttribute('data-type') === 'cover') {
                            UI.showToast('封面頁不能移動', 'warning');
                            return;
                        }
                        currentSlide.parentNode.insertBefore(nextSlide, currentSlide);
                        UI.updateSlideNumbers();
                        Data.syncToYaml();
                    }
                }
            });

            // Handle Magic Wand Click
            els.outputOutline.addEventListener('click', (e) => {
                const btn = e.target.closest('.magic-wand-btn');
                if (!btn) return;

                e.preventDefault();
                e.stopPropagation();

                const slideBlock = btn.closest('.slide-block');
                if (!slideBlock) return;

                // Get the current slide index based on its position
                const slides = Array.from(els.outputOutline.querySelectorAll('.slide-block'));
                const slideIndex = slides.indexOf(slideBlock);

                // Identify slide title for the modal
                const titleEl = slideBlock.querySelector('[data-field="title"]');
                const slideTitle = titleEl ? titleEl.textContent : `Slide ${slideIndex + 1}`;

                // Open the modal
                UI.openMagicWandModal(slideIndex, slideTitle);
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
                if (SlideAgentState.generationMode === 'direct') {
                    UI.showToast("現有大綱模式較精簡，不支援語音對談指令", "warning");
                    return;
                }

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

                const prompt = `
請讓兩位主持人化身為「${myPersona}」。語氣必須是「${myTone}」，彼此自然地聊天互動，並請依照上傳文稿的順序進行討論與說明。
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
