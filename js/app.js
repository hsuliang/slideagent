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

        // Load Logo Settings
        const savedUseLogo = localStorage.getItem('slideAgent_useLogo') === 'true';
        const savedLogoName = localStorage.getItem('slideAgent_logoName');
        if (savedUseLogo) {
            SlideAgentState.useLogo = true;
            if (UI.elements.useLogo) {
                UI.elements.useLogo.checked = true;
                const container = document.getElementById('logo-input-container');
                if (container) container.classList.remove('hidden');
            }
        }
        if (savedLogoName) {
            SlideAgentState.logoName = savedLogoName;
            if (UI.elements.logoName) UI.elements.logoName.value = savedLogoName;
        }
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
                const val = e.target.value;
                if (val === 'custom') {
                    els.customStyleContainer.classList.remove('hidden');
                    if (els.customStyleInput) {
                        els.customStyleInput.value = '';
                        els.customStyleInput.readOnly = false;
                        els.customStyleInput.focus();
                    }
                    if (els.customStyleName) {
                        els.customStyleName.value = '';
                        els.customStyleName.readOnly = false;
                    }
                    if (els.addFavoriteStyleBtn) els.addFavoriteStyleBtn.classList.remove('hidden');
                    if (els.deleteFavoriteStyleBtn) els.deleteFavoriteStyleBtn.classList.add('hidden');
                } else if (val.startsWith('fav_')) {
                    els.customStyleContainer.classList.remove('hidden');
                    const favs = Data.getFavoriteStyles();
                    const target = favs.find(f => f.id === val);
                    if (target) {
                        if (els.customStyleInput) {
                            els.customStyleInput.value = target.prompt;
                            els.customStyleInput.readOnly = true;
                        }
                        if (els.customStyleName) {
                            els.customStyleName.value = target.name;
                            els.customStyleName.readOnly = true;
                        }
                        if (els.addFavoriteStyleBtn) els.addFavoriteStyleBtn.classList.add('hidden');
                        if (els.deleteFavoriteStyleBtn) els.deleteFavoriteStyleBtn.classList.remove('hidden');
                    }
                } else {
                    els.customStyleContainer.classList.add('hidden');
                }
            });
        }

        // Logo Toggle & Input
        if (els.useLogo) {
            els.useLogo.addEventListener('change', (e) => {
                SlideAgentState.useLogo = e.target.checked;
                localStorage.setItem('slideAgent_useLogo', e.target.checked);
            });
        }
        if (els.logoName) {
            els.logoName.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                SlideAgentState.logoName = val;
                localStorage.setItem('slideAgent_logoName', val);
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
        if (els.historyBtn) {
            els.historyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (els.historyMenu) {
                    els.historyMenu.classList.toggle('hidden');
                    if (!els.historyMenu.classList.contains('hidden')) {
                        UI.renderHistoryMenu();
                    }
                }
            });
        }
        
        // Close history menu when clicking outside
        document.addEventListener('click', (e) => {
            if (els.historyMenu && !els.historyMenu.classList.contains('hidden')) {
                if (!els.historyBtn.contains(e.target) && !els.historyMenu.contains(e.target)) {
                    els.historyMenu.classList.add('hidden');
                }
            }
        });

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

            // --- Selection AI Toolbar ---
            // Detect text selection inside the outline
            let selectionTimeout = null;

            const handleTextSelection = () => {
                // Add a micro-delay to allow browser to finish selection painting
                clearTimeout(selectionTimeout);
                selectionTimeout = setTimeout(() => {
                    const selection = window.getSelection();
                    const selectedText = selection.toString().trim();

                    // Only show toolbar if there's actual text selected and it's inside the outline
                    if (selectedText.length > 0 && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        let node = range.commonAncestorContainer;
                        // If it's a text node, get its parent element
                        if (node.nodeType === 3) {
                            node = node.parentNode;
                        }

                        let targetElement = null;
                        
                        // Check if selection is within the output outline
                        if (els.outputOutline && els.outputOutline.contains(node)) {
                            targetElement = els.outputOutline;
                        }

                        // Also check if selection is inside the main-input textarea
                        if (document.activeElement === els.mainInput && els.mainInput.value.substring(els.mainInput.selectionStart, els.mainInput.selectionEnd).trim().length > 0) {
                            targetElement = els.mainInput;
                        }

                        if (targetElement) {
                            let rect;
                            if (targetElement === els.mainInput) {
                                // Textboxes don't have getBoundingClientRect for text selections natively easily, 
                                // so we position the toolbar near the mouse or at the top of the textarea.
                                // We will use a fixed offset near the textarea's top center for simplicity
                                const taRect = els.mainInput.getBoundingClientRect();
                                rect = {
                                    top: taRect.top + 20, // slightly down from the top
                                    left: taRect.left + (taRect.width / 2) - 100,
                                    width: 200,
                                    height: 0
                                };
                            } else {
                                rect = range.getBoundingClientRect();
                            }
                            
                            // fallback for empty rect in Safari
                            if (rect.width === 0 && rect.height === 0 && targetElement !== els.mainInput) {
                                const rects = range.getClientRects();
                                if (rects.length > 0) rect = rects[0];
                            }

                            UI.showSelectionToolbar(rect);
                            
                            // Store current context so AI knows where to replace
                            SlideAgentState.activeSelectionContext = targetElement === els.mainInput ? 'input' : 'outline';
                            
                            return;
                        }
                    }
                    UI.hideSelectionToolbar();
                }, 100);
            };

            document.addEventListener('selectionchange', handleTextSelection);

            // Hide toolbar when clicking outside of the outline or toolbar
            document.addEventListener('mousedown', (e) => {
                const toolbar = els.selectionToolbar;
                if (!els.outputOutline.contains(e.target) && e.target !== els.mainInput && (!toolbar || !toolbar.contains(e.target))) {
                    UI.hideSelectionToolbar();
                }
            });

            // Prevent text selection from clearing when interacting with the toolbar
            if (els.selectionToolbar) {
                els.selectionToolbar.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                });
            }

            // Bind Toolbar Buttons
            const bindToolbarAction = (btnElement, actionType) => {
                if (!btnElement) return;
                btnElement.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    let selectedText = '';
                    
                    if (SlideAgentState.activeSelectionContext === 'input') {
                        selectedText = els.mainInput.value.substring(els.mainInput.selectionStart, els.mainInput.selectionEnd).trim();
                    } else {
                        const selection = window.getSelection();
                        selectedText = selection.toString().trim();
                    }
                    
                    if (selectedText) {
                        AI.refineSelectedText(selectedText, actionType);
                    }
                });
            };

            bindToolbarAction(els.toolbarExpandBtn, 'expand');
            bindToolbarAction(els.toolbarShortenBtn, 'shorten');
            bindToolbarAction(els.toolbarProfessionalBtn, 'professional');
            bindToolbarAction(els.toolbarCasualBtn, 'casual');
            
            if (els.toolbarCloseBtn) {
                els.toolbarCloseBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    UI.hideSelectionToolbar();
                    window.getSelection().removeAllRanges();
                });
            }
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
        // Custom Style Management (Favorites)
        if (els.addFavoriteStyleBtn) {
            els.addFavoriteStyleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const name = els.customStyleName ? els.customStyleName.value.trim() : "";
                const prompt = els.customStyleInput ? els.customStyleInput.value.trim() : "";
                
                if (!name || !prompt) {
                    UI.showToast('請輸入風格名稱與視覺風格指令', 'warning');
                    return;
                }
                
                const newId = Data.saveFavoriteStyle(name, prompt);
                UI.renderFavoriteStyles();
                els.style.value = newId; 
                
                // trigger change event manually to update UI state to viewing mode
                const event = new Event('change');
                els.style.dispatchEvent(event);
                
                UI.showToast('已加入最愛風格', 'success');
            });
        }

        if (els.deleteFavoriteStyleBtn) {
            els.deleteFavoriteStyleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentId = els.style.value;
                if (!currentId.startsWith('fav_')) return;
                
                Data.deleteFavoriteStyle(currentId);
                UI.renderFavoriteStyles();
                
                // reset to default style
                els.style.value = "custom";
                const event = new Event('change');
                els.style.dispatchEvent(event);
                
                UI.showToast('已刪除此最愛風格', 'success');
            });
        }

        if (els.exportCustomStyleBtn) {
            els.exportCustomStyleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const styles = Data.getFavoriteStyles();
                
                if (!styles || styles.length === 0) {
                     UI.showToast('目前沒有任何最愛風格可以匯出', 'warning');
                     return;
                }

                const exportData = {
                    version: "SlideAgent_V12_Library",
                    type: "favorite_styles",
                    styles: styles.map(s => ({ name: s.name, prompt: s.prompt }))
                };
                
                FileHandler.download(JSON.stringify(exportData, null, 2), 'slideagent_styles.json', 'application/json');
            });
        }

        if (els.importCustomStyleInput) {
            els.importCustomStyleInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const importedData = JSON.parse(event.target.result);
                        
                        // Check if it's the new library format
                        if (importedData.version && importedData.type === "favorite_styles" && Array.isArray(importedData.styles)) {
                            let count = 0;
                            importedData.styles.forEach(style => {
                                if (style.name && style.prompt) {
                                    Data.saveFavoriteStyle(style.name, style.prompt);
                                    count++;
                                }
                            });
                            UI.renderFavoriteStyles();
                            UI.showToast(`成功匯入 ${count} 個最愛風格！`, 'success');
                            
                        } else if (importedData.version && importedData.version.startsWith("SlideAgent_") && importedData.style_command !== undefined) {
                            // Legacy single style import support
                            let name = importedData.name || "匯入的舊版風格";
                            Data.saveFavoriteStyle(name, importedData.style_command);
                            UI.renderFavoriteStyles();
                            UI.showToast('成功匯入 1 個舊版自訂風格！', 'success');
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
