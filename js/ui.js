/**
 * SlideAgent - UI Module
 */
import { SlideAgentState } from './config.js';
import { FileHandler } from './files.js';
import { Data } from './data.js';

export const UI = {
    elements: {}, // Will be populated in init()

    init() {
        this.elements = {
            settingsBtn: document.getElementById('settings-btn'),
            settingsModal: document.getElementById('settings-modal'),
            settingsPanel: document.getElementById('settings-panel'),
            closeSettingsBtn: document.getElementById('close-settings'),
            apiKeyInput: document.getElementById('api-key'),
            saveKeyBtn: document.getElementById('save-key-btn'),
            toggleKeyBtn: document.getElementById('toggle-key-visibility'),

            // Layout Inputs
            identity: document.getElementById('identity'),
            stage: document.getElementById('stage'),
            pages: document.getElementById('pages'),
            style: document.getElementById('style'),
            goal: document.getElementById('goal'),
            tone: document.getElementById('tone'), // Added by instruction
            customStyleContainer: document.getElementById('custom-style-container'),
            customStyleInput: document.getElementById('custom-style-input'),
            favoriteStylesGroup: document.getElementById('favorite-styles-group'),
            customStyleName: document.getElementById('custom-style-name'),
            addFavoriteStyleBtn: document.getElementById('add-favorite-style-btn'),
            deleteFavoriteStyleBtn: document.getElementById('delete-favorite-style-btn'),
            exportCustomStyleBtn: document.getElementById('export-custom-style-btn'),
            importCustomStyleInput: document.getElementById('import-custom-style-input'),
            deepOptimization: document.getElementById('deep-optimization'),
            exportMode: document.getElementById('export-mode'),
            autoConclusion: document.getElementById('auto-conclusion'),
            useCharacterIp: document.getElementById('use-character-ip'),
            characterIpName: document.getElementById('character-ip-name'),
            useLogo: document.getElementById('use-logo'),
            logoName: document.getElementById('logo-name'),

            // Smart Input Area
            dropZone: document.getElementById('drop-zone'),
            fileUpload: document.getElementById('file-upload'),
            
            // Selection Toolbar Elements
            selectionToolbar: document.getElementById('selection-toolbar'),
            selectionToolbarLoader: document.getElementById('selection-toolbar-loader'),
            toolbarExpandBtn: document.getElementById('toolbar-expand-btn'),
            toolbarShortenBtn: document.getElementById('toolbar-shorten-btn'),
            toolbarProfessionalBtn: document.getElementById('toolbar-professional-btn'),
            toolbarCasualBtn: document.getElementById('toolbar-casual-btn'),
            toolbarCloseBtn: document.getElementById('toolbar-close-btn'),

            // Magic Wand Elements
            magicWandModal: document.getElementById('magic-wand-modal'),
            magicWandSlideTitle: document.getElementById('magic-wand-slide-title'),
            magicWandPrompt: document.getElementById('magic-wand-prompt'),
            magicWandSubmitBtn: document.getElementById('magic-wand-submit-btn'),
            magicWandCancelBtn: document.getElementById('magic-wand-cancel-btn'),
            mainInput: document.getElementById('main-input'),
            previewGallery: document.getElementById('preview-gallery'),
            inputPlaceholder: document.getElementById('input-placeholder'),

            // Actions
            clearBtn: document.getElementById('clear-btn'),
            addFileActionBtn: document.getElementById('add-file-action-btn'),
            generateBtn: document.getElementById('generate-btn'),
            loader: document.getElementById('loader'),
            cancelGenBtn: document.getElementById('cancel-gen-btn'),

            // Results
            resultsArea: document.getElementById('results-area'),
            outputOutline: document.getElementById('output-outline'),
            outputYaml: document.getElementById('output-yaml'),
            copyYamlBtn: document.getElementById('copy-yaml'),
            dlYamlBtn: document.getElementById('dl-yaml'),
            dlMarkdownBtn: document.getElementById('dl-markdown'),
            podcastDownloadBtn: document.getElementById('download-podcast-txt-btn'), // Added for Transcript
            podcastCopyBtn: document.getElementById('podcast-copy-prompt-btn'), // Added by instruction
            copyPromptBtn: document.getElementById('copy-prompt-btn'), // Added for basic copy prompt
            historyBtn: document.getElementById('history-btn'),
            historyMenu: document.getElementById('history-menu'),

            // Estimator Dashboard
            statsDashboard: document.getElementById('stats-dashboard'),
            statPages: document.getElementById('stat-pages'),
            statWords: document.getElementById('stat-words'),
            statTime: document.getElementById('stat-time'),

            // Containers
            toastContainer: document.getElementById('toast-container'),
            confirmModal: document.getElementById('confirm-modal'),
            confirmOkBtn: document.getElementById('confirm-ok-btn'),
            confirmCancelBtn: document.getElementById('confirm-cancel-btn'),

            // Split Modal
            splitConfirmModal: document.getElementById('split-confirm-modal'),
            splitTotalPages: document.getElementById('split-total-pages'),
            splitPagesInput: document.getElementById('split-pages-input'),
            splitCancelBtn: document.getElementById('split-cancel-btn'),
            splitOkBtn: document.getElementById('split-ok-btn'),

            // API Key Warning Modal
            apikeyModal: document.getElementById('apikey-modal'),
            setupKeyBtn: document.getElementById('setup-key-btn'),
            fastEnterBtn: document.getElementById('fast-enter-btn'), // Keep if exists, else ignore

            // Mode Tabs
            tabAuto: document.getElementById('tab-auto'),
            tabDirect: document.getElementById('tab-direct'),
            tabAuto: document.getElementById('tab-auto'),
            tabDirect: document.getElementById('tab-direct'),
            uploadTriggerBtn: document.getElementById('upload-trigger-btn'),
        };

        this.initTabs();
        this.renderGallery();
        this.renderFavoriteStyles();

        // Event Delegation for Upload Trigger (Robust handling for dynamic button)
        if (this.elements.inputPlaceholder) {
            this.elements.inputPlaceholder.addEventListener('click', (e) => {
                const btn = e.target.closest('#upload-trigger-btn');
                if (btn && this.elements.fileUpload) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.elements.fileUpload.click();
                }
            });
        }

        // Auto-load logic if needed, but App.js handles high-level init
    },

    renderFavoriteStyles() {
        const els = this.elements;
        if (!els.favoriteStylesGroup) return;

        const styles = Data.getFavoriteStyles();
        els.favoriteStylesGroup.innerHTML = '';
        
        if (styles.length === 0) {
            els.favoriteStylesGroup.innerHTML = '<option disabled>目前沒有最愛風格</option>';
            return;
        }

        styles.forEach(style => {
            const option = document.createElement('option');
            option.value = style.id;
            option.textContent = `❤️ ${style.name}`;
            els.favoriteStylesGroup.appendChild(option);
        });
    },

    toggleSettings(show) {
        const els = this.elements;
        if (show) {
            els.settingsModal.classList.remove('hidden');
            void els.settingsModal.offsetWidth;
            els.settingsModal.classList.remove('opacity-0');
            els.settingsPanel.classList.remove('scale-95');
            if (els.apiKeyInput) els.apiKeyInput.value = SlideAgentState.apiKeys.join('\n');
        } else {
            els.settingsModal.classList.add('opacity-0');
            els.settingsPanel.classList.add('scale-95');
            setTimeout(() => els.settingsModal.classList.add('hidden'), 300);
        }
    },

    openConfirmModal() {
        const els = this.elements;
        if (els.confirmModal) {
            els.confirmModal.classList.remove('hidden');
            void els.confirmModal.offsetWidth;
            els.confirmModal.classList.remove('opacity-0');
            els.confirmModal.querySelector('div').classList.remove('scale-95');
        }
    },

    closeConfirmModal() {
        const els = this.elements;
        if (els.confirmModal) {
            els.confirmModal.classList.add('opacity-0');
            els.confirmModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => els.confirmModal.classList.add('hidden'), 300);
        }
    },

    executeClear() {
        this.closeConfirmModal();
        SlideAgentState.uploadedFiles = [];
        if (this.elements.mainInput) this.elements.mainInput.value = '';
        if (this.elements.previewGallery) this.elements.previewGallery.innerHTML = '';
        if (this.elements.dropZone) this.elements.dropZone.classList.remove('has-files');

        this.updateInputState();

        if (this.elements.resultsArea) this.elements.resultsArea.classList.add('hidden');
        if (this.elements.outputOutline) this.elements.outputOutline.innerHTML = '';
        if (this.elements.outputYaml) this.elements.outputYaml.textContent = '';
        if (this.elements.statsDashboard) this.elements.statsDashboard.classList.add('hidden');

        SlideAgentState.yamlGenerated = false;

        this.showToast('內容已完全清除', 'success');
    },

    showSplitConfirmModal(totalPages) {
        const els = this.elements;
        if (!els.splitConfirmModal) {
            Data.downloadYaml(); // Fallback if modal missing
            return;
        }

        els.splitTotalPages.innerText = totalPages;

        // Show modal
        els.splitConfirmModal.classList.remove('hidden');
        void els.splitConfirmModal.offsetWidth;
        els.splitConfirmModal.classList.remove('opacity-0');
        els.splitConfirmModal.querySelector('div').classList.remove('scale-95');

        // Copy Prompt Action
        const copyBtn = document.getElementById('split-copy-prompt-btn');
        if (copyBtn) {
            copyBtn.onclick = () => {
                const promptText = "依據來源內容生成第 XX 頁到第 XX 頁";
                navigator.clipboard.writeText(promptText).then(() => {
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<span class="text-green-600">✓ 已儲存至剪貼簿</span>`;
                    copyBtn.classList.replace('bg-slate-200', 'bg-green-100');
                    setTimeout(() => {
                        copyBtn.innerHTML = originalText;
                        copyBtn.classList.replace('bg-green-100', 'bg-slate-200');
                    }, 2000);
                });
            };
        }

        // OK Action - Just download the full file
        els.splitOkBtn.onclick = () => {
            this.closeSplitConfirmModal();
            Data.downloadYaml();
        };

        // Cancel Action
        els.splitCancelBtn.onclick = () => {
            this.closeSplitConfirmModal();
        };
    },

    closeSplitConfirmModal() {
        const els = this.elements;
        if (els.splitConfirmModal) {
            els.splitConfirmModal.classList.add('opacity-0');
            els.splitConfirmModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => els.splitConfirmModal.classList.add('hidden'), 300);
        }
    },

    // Magic Wand Modal Methods
    openMagicWandModal(slideIndex, slideTitle) {
        const els = this.elements;
        if (!els.magicWandModal) return;

        // Store index so AI knows which one to replace
        SlideAgentState.magicWandTargetIndex = slideIndex;

        if (els.magicWandSlideTitle) els.magicWandSlideTitle.textContent = `第 ${slideIndex + 1} 頁：${slideTitle}`;
        if (els.magicWandPrompt) els.magicWandPrompt.value = '';

        // Reset button state
        this.setMagicWandLoading(false);

        // Show modal
        els.magicWandModal.classList.remove('hidden');
        void els.magicWandModal.offsetWidth;
        els.magicWandModal.classList.remove('opacity-0');
        els.magicWandModal.querySelector('div').classList.remove('scale-95');

        if (els.magicWandPrompt) els.magicWandPrompt.focus();
    },

    closeMagicWandModal() {
        const els = this.elements;
        if (els.magicWandModal) {
            els.magicWandModal.classList.add('opacity-0');
            els.magicWandModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => els.magicWandModal.classList.add('hidden'), 300);
        }
    },

    setMagicWandLoading(isLoading) {
        const els = this.elements;
        if (!els.magicWandSubmitBtn || !els.magicWandCancelBtn || !els.magicWandPrompt) return;

        const btnText = els.magicWandSubmitBtn.querySelector('.btn-text');
        const btnLoader = els.magicWandSubmitBtn.querySelector('.btn-loader');

        if (isLoading) {
            if (btnText) btnText.classList.add('hidden');
            if (btnLoader) btnLoader.classList.remove('hidden');
            els.magicWandSubmitBtn.disabled = true;
            els.magicWandSubmitBtn.classList.add('opacity-70', 'cursor-not-allowed');
            els.magicWandCancelBtn.disabled = true;
            els.magicWandPrompt.disabled = true;
        } else {
            if (btnText) btnText.classList.remove('hidden');
            if (btnLoader) btnLoader.classList.add('hidden');
            els.magicWandSubmitBtn.disabled = false;
            els.magicWandSubmitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
            els.magicWandCancelBtn.disabled = false;
            els.magicWandPrompt.disabled = false;
        }
    },

    // --- Selection Toolbar Methods ---
    showSelectionToolbar(rect) {
        if (!this.elements.selectionToolbar) return;
        const tb = this.elements.selectionToolbar;
        
        // Remove structural hidden class, keep opacity 0 for transition
        tb.classList.remove('hidden');
        
        // Calculate position above the selection
        // Use window relative coordinates and apply scroll offset
        const topPos = rect.top + window.scrollY - tb.offsetHeight - 10;
        const leftPos = rect.left + window.scrollX + (rect.width / 2) - (tb.offsetWidth / 2);

        // Prevent toolbar from going off-screen horizontally
        const maxLeft = window.innerWidth - tb.offsetWidth - 10;
        const safeLeftPos = Math.max(10, Math.min(leftPos, maxLeft));

        tb.style.top = `${topPos}px`;
        tb.style.left = `${safeLeftPos}px`;
        
        // Trigger reflow
        void tb.offsetWidth;
        
        // Transition in
        tb.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
        tb.classList.add('opacity-100', 'scale-100');
    },

    hideSelectionToolbar() {
        if (!this.elements.selectionToolbar) return;
        const tb = this.elements.selectionToolbar;
        
        tb.classList.remove('opacity-100', 'scale-100');
        tb.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
        
        // Wait for transition before actual hide
        setTimeout(() => {
            if (tb.classList.contains('opacity-0')) {
                tb.classList.add('hidden');
                // Reset loader state for next time
                if (this.elements.selectionToolbarLoader) {
                    this.elements.selectionToolbarLoader.classList.add('hidden');
                }
            }
        }, 200);
    },
    
    setSelectionToolbarLoading(isLoading) {
        if (this.elements.selectionToolbarLoader) {
            if (isLoading) {
                this.elements.selectionToolbarLoader.classList.remove('hidden');
            } else {
                this.elements.selectionToolbarLoader.classList.add('hidden');
            }
        }
    },

    replaceSelectedText(newText) {
        if (SlideAgentState.activeSelectionContext === 'input') {
            const ta = this.elements.mainInput;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            if (start !== end) {
                const val = ta.value;
                ta.value = val.substring(0, start) + newText + val.substring(end);
                
                // Select the new text exactly like the original selection
                ta.setSelectionRange(start, start + newText.length);
                
                // Trigger input event to re-evaluate state (like hide placeholder)
                ta.dispatchEvent(new Event('input'));
                return true;
            }
            return false;
        } else {
            const selection = window.getSelection();
            if (!selection.rangeCount) return false;
            
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            // Assuming we are replacing inside output-outline, simple text node insert is fine
            const textNode = document.createTextNode(newText);
            range.insertNode(textNode);
            
            // Collapse selection to end of inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
            
            return true;
        }
    },
    // ------------------------------------

    updateInputState() {
        const els = this.elements;
        const hasText = els.mainInput.value.trim().length > 0;
        const hasFiles = SlideAgentState.uploadedFiles.length > 0;

        if (hasText || hasFiles) {
            els.inputPlaceholder.classList.add('hidden'); // Use hidden to avoid hover conflicts
        } else {
            els.inputPlaceholder.classList.remove('hidden');
        }

        if (hasFiles) {
            els.previewGallery.classList.remove('hidden');
        } else {
            els.previewGallery.classList.add('hidden');
        }

        if (hasText && !hasFiles) {
            if (els.addFileActionBtn) els.addFileActionBtn.classList.remove('hidden');
        } else {
            if (els.addFileActionBtn) els.addFileActionBtn.classList.add('hidden');
        }

        this.autoResizeInput();
    },

    autoResizeInput() {
        // Disabled fixed inline height resizing to allow flex-1 to naturally fill 
        // the right column and balance the layout height with the left settings column.
    },

    renderGallery() {
        const container = this.elements.previewGallery;
        if (!container) return;
        container.innerHTML = '';

        SlideAgentState.uploadedFiles.forEach(file => {
            const div = document.createElement('div');
            div.className = 'gallery-item relative group w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all cursor-default';

            const contentDiv = document.createElement('div');
            contentDiv.className = "w-full h-full";

            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                const img = document.createElement('img');
                img.src = url;
                img.className = "w-full h-full object-cover";
                img.onload = () => URL.revokeObjectURL(url);
                contentDiv.appendChild(img);
            } else {
                contentDiv.innerHTML = `
                <div class="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-slate-50">
                    <span class="text-2xl mb-1">📄</span>
                    <span class="text-[10px] text-slate-500 line-clamp-2 leading-tight break-all">${file.name}</span>
                </div>`;
            }
            div.appendChild(contentDiv);

            const overlay = document.createElement('div');
            overlay.className = "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center";

            const btn = document.createElement('button');
            btn.className = "bg-white/20 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors";
            btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                FileHandler.removeFile(file);
            });

            overlay.appendChild(btn);
            div.appendChild(overlay);

            container.appendChild(div);
        });

        // Re-append the "+" Upload Button at the end of the gallery
        const addBtnContainer = document.createElement('div');
        addBtnContainer.className = 'w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-brand-400 transition-colors group add-file-btn';
        addBtnContainer.innerHTML = `<svg class="w-8 h-8 text-slate-400 group-hover:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>`;

        // Bind the click event to open the file uploader
        addBtnContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (UI.elements.fileUpload) UI.elements.fileUpload.click();
        });

        container.appendChild(addBtnContainer);

        this.updateInputState();
    },

    showToast(message, type = 'info') {
        const container = this.elements.toastContainer;
        if (!container) return alert(message);

        const toast = document.createElement('div');
        const icons = {
            success: '<svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
            error: '<svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
            info: '<svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
            warning: '<svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>'
        };

        toast.className = `toast toast-${type}`;

        let title = '提示';
        if (type === 'error') title = '發生錯誤';
        if (type === 'success') title = '成功';
        if (type === 'warning') title = '注意';

        toast.innerHTML = `
            ${icons[type] || icons.info}
            <div>
                <h4 class="font-bold text-sm">${title}</h4>
                <p class="text-sm opacity-90">${message}</p>
            </div>
        `;

        toast.addEventListener('click', () => toast.remove());
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentElement) toast.remove();
                }, 300);
            }
        }, 5000);
    },

    loadingInterval: null,

    setLoading(isLoading, mainText = '', subText = '') {
        const loader = this.elements.loader;
        const genBtn = this.elements.generateBtn;

        // Clear any existing interval
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }

        if (isLoading) {
            if (loader) {
                const h3 = loader.querySelector('h3');
                const p = loader.querySelector('p');
                if (h3) h3.textContent = mainText;
                if (p) {
                    p.textContent = subText || "正在啟動 AI 核心程序...";

                    // Thinking Typewriter Animation (Messages)
                    const phrases = [
                        "正在分析提供的文本核心...",
                        "正在規劃整體簡報的邏輯架構...",
                        "正在設計重點分頁內容與視覺提示...",
                        "正在生成排版設定與最終格式校對...",
                        "即將完成，請稍候..."
                    ];

                    let phraseIndex = 0;
                    this.loadingInterval = setInterval(() => {
                        if (phraseIndex < phrases.length) {
                            p.textContent = phrases[phraseIndex];
                            phraseIndex++;
                        }
                    }, 3000); // Change phrase every 3 seconds
                }
                loader.classList.remove('hidden');
            }
            if (genBtn) {
                genBtn.disabled = true;
                genBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        } else {
            if (loader) loader.classList.add('hidden');
            if (genBtn) {
                genBtn.disabled = false;
                genBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    },

    showResults(content) {
        if (this.elements.resultsArea) {
            this.elements.resultsArea.classList.remove('hidden');
            this.elements.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (this.elements.outputOutline) {
            // Progressive Rendering Logic
            const container = this.elements.outputOutline;
            container.innerHTML = ''; // Clear previous

            // Parse HTML string into DOM elements
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content.html;
            const blocks = Array.from(tempDiv.children);

            if (blocks.length === 0) {
                Data.syncToYaml();
                return;
            }

            let i = 0;
            // Disable generate button while streaming
            const genBtn = this.elements.generateBtn;
            if (genBtn) {
                genBtn.disabled = true;
                genBtn.classList.add('opacity-50', 'cursor-not-allowed');
                genBtn.innerHTML = '<span class="animate-pulse">正在打字輸出中...</span>';
            }

            const streamInterval = setInterval(() => {
                if (i < blocks.length) {
                    const block = blocks[i];
                    block.classList.add('streaming-char'); // Apply CSS animation
                    container.appendChild(block);

                    // Auto scroll down smoothly as content grows
                    window.scrollTo({
                        top: document.body.scrollHeight,
                        behavior: 'smooth'
                    });

                    // Sync YAML progressively
                    Data.syncToYaml();

                    i++;
                } else {
                    clearInterval(streamInterval);

                    // Re-enable button
                    if (genBtn) {
                        genBtn.disabled = false;
                        genBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                        genBtn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> 產出簡報結構';
                    }
                    
                    // Save to history when completely done
                    if (UI.elements.outputYaml) {
                        Data.saveGenerationHistory(container.innerHTML, UI.elements.outputYaml.textContent);
                    }
                }
            }, 400); // 400ms delay between each slide block appearing
        }
    },

    updateSlideNumbers() {
        const container = this.elements.outputOutline;
        if (!container) return;

        const blocks = container.querySelectorAll('.slide-block');
        let counter = 1;
        blocks.forEach(block => {
            const numberEl = block.querySelector('.slide-number');
            if (numberEl) {
                // Replace the old number with the new one, keeping the type label
                numberEl.innerHTML = numberEl.innerHTML.replace(/Slide \d+ -/, `Slide ${counter} -`);
            }
            counter++;
        });
    },

    copyToClipboard(text, successMsg = '已複製到剪貼簿') {
        navigator.clipboard.writeText(text)
            .then(() => this.showToast(successMsg, 'success'))
            .catch(() => this.showToast('複製失敗', 'error'));
    },

    loadLocalHistory() {
        const history = Data.loadLocalHistory();
        if (history) {
            if (this.elements.mainInput && history.input) this.elements.mainInput.value = history.input;

            const hasOutline = history.outline && history.outline.trim().length > 50;
            if (this.elements.outputOutline && hasOutline) {
                this.elements.outputOutline.innerHTML = history.outline;
                if (this.elements.resultsArea) this.elements.resultsArea.classList.remove('hidden');
            } else {
                if (this.elements.resultsArea) this.elements.resultsArea.classList.add('hidden');
            }

            if (this.elements.outputYaml && history.yaml) this.elements.outputYaml.textContent = history.yaml;
            this.updateInputState();
        } else {
            if (this.elements.resultsArea) this.elements.resultsArea.classList.add('hidden');
        }
    },

    renderHistoryMenu() {
        const historyContainer = document.getElementById('history-menu-items');
        if (!historyContainer) return;
        const history = Data.getGenerationHistory();
        if (history.length === 0) {
            historyContainer.innerHTML = '<div class="px-4 py-3 text-sm text-slate-500 text-center">暫無歷史紀錄</div>';
            return;
        }

        let html = '';
        history.forEach((item) => {
            html += `<button class="history-item w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors" data-id="${item.id}">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-bold text-slate-800 truncate pr-2">${item.title}</span>
                            <span class="text-xs text-slate-400 shrink-0">${item.timeStr}</span>
                        </div>
                        <div class="text-xs text-slate-500 line-clamp-1">恢復此版本的大綱與 YAML</div>
                     </button>`;
        });
        historyContainer.innerHTML = html;

        // Bind clicks
        historyContainer.querySelectorAll('.history-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                const target = Data.getGenerationHistory().find(h => h.id === id);
                if (target) {
                    UI.restoreHistory(target);
                }
            });
        });
    },

    restoreHistory(historyItem) {
        if (this.elements.outputOutline) {
            this.elements.outputOutline.innerHTML = historyItem.outline;
            this.updateSlideNumbers();
        }
        if (this.elements.outputYaml) {
            this.elements.outputYaml.textContent = historyItem.yaml;
        }
        if (this.elements.resultsArea) {
            this.elements.resultsArea.classList.remove('hidden');
        }
        // Force update the stats based on the unified output
        Data.syncToYaml();

        this.showToast(`已恢復歷史紀錄：${historyItem.title}`, 'success');
        
        // Hide menu
        const menu = document.getElementById('history-menu');
        if (menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    },

    handleYamlDownload() {
        if (!SlideAgentState.yamlGenerated) {
            UI.showToast("請先產出 YAML 內容！", "warning");
            return;
        }

        const slidesPerFile = 15;
        const slideBlocks = document.querySelectorAll('#output-outline .slide-block');

        if (slideBlocks.length > slidesPerFile) {
            this.showSplitConfirmModal(slideBlocks.length, slidesPerFile);
        } else {
            Data.downloadYaml();
        }
    },

    initTabs() {
        const els = this.elements;
        console.log("Initializing Tabs...", els.tabAuto, els.tabDirect);
        if (!els.tabAuto || !els.tabDirect) {
            console.error("Tabs not found!");
            return;
        }

        const updateTabs = (mode) => {
            console.log("Switching to mode:", mode);
            SlideAgentState.generationMode = mode;

            // Clear content when switching
            els.mainInput.value = '';
            UI.updateInputState();

            // Visual Update
            let placeholderText = '';
            const contentGroup = document.getElementById('content-structure-group');
            const visualGroup = document.getElementById('visual-design-group');

            if (mode === 'auto') {
                els.tabAuto.className = "px-6 py-3 text-sm font-medium text-brand-600 border-b-2 border-brand-600 focus:outline-none transition-colors";
                els.tabDirect.className = "px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 focus:outline-none transition-colors";
                placeholderText = '拖曳檔案至此，支援 PDF、TXT、MD<br>或點擊文字框開始打字';
                if (contentGroup) contentGroup.classList.remove('hidden');
                if (visualGroup) visualGroup.removeAttribute('open');

                // Show Auto Conclusion in Auto mode
                if (els.autoConclusion) {
                    const autoConcContainer = els.autoConclusion.closest('.flex.items-center.justify-between');
                    if (autoConcContainer) autoConcContainer.classList.remove('hidden');
                }
            } else {
                els.tabAuto.className = "px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 focus:outline-none transition-colors";
                els.tabDirect.className = "px-6 py-3 text-sm font-medium text-brand-600 border-b-2 border-brand-600 focus:outline-none transition-colors";
                placeholderText = '拖曳檔案至此,支援PDF、TXT、MD 或點擊文字框貼上簡報大綱';
                if (contentGroup) contentGroup.classList.add('hidden');
                if (visualGroup) visualGroup.setAttribute('open', '');

                // Hide Auto Conclusion in Direct mode
                if (els.autoConclusion) {
                    const autoConcContainer = els.autoConclusion.closest('.flex.items-center.justify-between');
                    if (autoConcContainer) autoConcContainer.classList.add('hidden');
                }
            }
            if (els.inputPlaceholder) {
                const textEl = els.inputPlaceholder.querySelector('p');
                if (textEl) {
                    textEl.innerHTML = placeholderText;
                }
            }

            // Re-bind is handled by delegation in init()
        };

        els.tabAuto.addEventListener('click', () => updateTabs('auto'));
        els.tabDirect.addEventListener('click', () => updateTabs('direct'));
    }
};
