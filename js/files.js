/**
 * SlideAgent - File Handler Module
 */
import { SlideAgentState } from './config.js';
import { UI } from './ui.js';
import { Data } from './data.js';

export const FileHandler = {
    handleFiles(fileList) {
        const files = Array.from(fileList);
        const validFiles = files.filter(f => {
            const isValidType = f.type.match('image.*|text.*|application/pdf|application/json') || f.name.toLowerCase().endsWith('.md');
            if (!isValidType) {
                UI.showToast(`檔案格式不支援: ${f.name}`, 'error');
                return false;
            }
            if (f.size > 20 * 1024 * 1024) {
                UI.showToast(`檔案超過 20MB 限制: ${f.name}`, 'error');
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            SlideAgentState.uploadedFiles = [...SlideAgentState.uploadedFiles, ...validFiles];
            UI.renderGallery();
            Data.saveLocalHistory();
        }
    },

    removeFile(fileToRemove) {
        SlideAgentState.uploadedFiles = SlideAgentState.uploadedFiles.filter(f => f !== fileToRemove);
        UI.renderGallery();
        Data.saveLocalHistory();
    },

    download(content, filename, contentType) {
        if (!content) {
            UI.showToast("下載失敗：無內容", "error");
            return;
        }

        let smartName = filename;
        if (Data.generateFilename) {
            const ext = filename.split('.').pop();
            smartName = Data.generateFilename(ext);
        }
        if (!smartName || smartName.trim() === "") {
            smartName = `presentation_${Date.now()}.${filename.split('.').pop() || 'yaml'}`;
        }

        smartName = smartName.replace(/[<>:"/\\|?*]/g, '_');
        console.log("Resolved Filename:", smartName);

        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = smartName;

        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 2000);
    },

    async readFiles(files) {
        return Promise.all(files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                    // Send images and PDFs as base64 inlineData
                    reader.onload = (e) => {
                        const base64Data = e.target.result.split(',')[1];
                        resolve({
                            name: file.name,
                            type: file.type.startsWith('image/') ? 'image' : 'pdf',
                            content: `[${file.type === 'application/pdf' ? 'PDF' : 'Image'} File]`,
                            inlineData: {
                                mimeType: file.type,
                                data: base64Data
                            }
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                } else {
                    // Text-based files (txt, md, json, csv, etc.)
                    reader.onload = (e) => resolve({ name: file.name, type: 'text', content: e.target.result });
                    reader.onerror = reject;
                    reader.readAsText(file);
                }
            });
        }));
    }
};
