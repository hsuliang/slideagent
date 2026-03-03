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
            customStyleContainer: document.getElementById('custom-style-container'),
            customStyleInput: document.getElementById('custom-style-input'),
            saveCustomStyleBtn: document.getElementById('save-custom-style-btn'),
            exportCustomStyleBtn: document.getElementById('export-custom-style-btn'),
            importCustomStyleInput: document.getElementById('import-custom-style-input'),
            downloadStyleTemplateBtn: document.getElementById('download-style-template-btn'),
            deepOptimization: document.getElementById('deep-optimization'),
            exportMode: document.getElementById('export-mode'),
            autoConclusion: document.getElementById('auto-conclusion'),
            useCharacterIp: document.getElementById('use-character-ip'),
            characterIpName: document.getElementById('character-ip-name'),

            // Smart Input Area
            dropZone: document.getElementById('drop-zone'),
            fileUpload: document.getElementById('file-upload'),
            mainInput: document.getElementById('main-input'),
            previewGallery: document.getElementById('preview-gallery'),
            inputPlaceholder: document.getElementById('input-placeholder'),

            // Actions
            clearBtn: document.getElementById('clear-btn'),
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
        if (this.elements.resultsArea) this.elements.resultsArea.classList.add('hidden');
        this.renderGallery();
        this.updateInputState();
        localStorage.removeItem('slideAgent_localHistory');

        setTimeout(() => this.showToast('內容已清空', 'success'), 300);
    },

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
            info: '<svg class="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
        };

        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            ${icons[type] || icons.info}
            <div>
                <h4 class="font-bold text-sm">${type === 'error' ? '發生錯誤' : (type === 'success' ? '成功' : '提示')}</h4>
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
        if (this.elements.outputOutline) this.elements.outputOutline.innerHTML = content.html;
        // Immediate Sync to update YAML preview from the generated HTML
        Data.syncToYaml();
    },

    copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => this.showToast('已複製到剪貼簿', 'success'))
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
            } else {
                els.tabAuto.className = "px-6 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 focus:outline-none transition-colors";
                els.tabDirect.className = "px-6 py-3 text-sm font-medium text-brand-600 border-b-2 border-brand-600 focus:outline-none transition-colors";
                placeholderText = '拖曳檔案至此,支援PDF、TXT、MD 或點擊文字框貼上簡報大綱';
                if (contentGroup) contentGroup.classList.add('hidden');
                if (visualGroup) visualGroup.setAttribute('open', '');
            }
            if (els.inputPlaceholder) els.inputPlaceholder.innerHTML = `
                <div id="upload-trigger-btn" class="p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-sm mb-3 cursor-pointer pointer-events-auto hover:bg-white hover:scale-105 transition-all">
                    <svg class="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </div>
                <p class="text-sm text-slate-500 font-medium text-center">${placeholderText}</p>
            `;

            // Re-bind is handled by delegation in init()
        };

        els.tabAuto.addEventListener('click', () => updateTabs('auto'));
        els.tabDirect.addEventListener('click', () => updateTabs('direct'));
    }
};
