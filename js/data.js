/**
 * SlideAgent - Data Module
 * Handles LocalStorage, YAML Sync, and Filename Generation
 */
import { SlideAgentState } from './config.js';
import { UI } from './ui.js';

export const Data = {
    init() {
        const stored = localStorage.getItem('slideAgent_apiKeys');
        const timestamp = localStorage.getItem('slideAgent_apiKeys_timestamp');

        if (stored && timestamp) {
            const now = Date.now();
            const elapsed = now - parseInt(timestamp, 10);
            const TWO_HOURS = 2 * 60 * 60 * 1000;

            if (elapsed > TWO_HOURS) {
                // Expired
                this.clearApiKeys(false); // don't show toast on silent load clear
            } else {
                SlideAgentState.apiKeys = JSON.parse(stored);
                // Start a background timer to clear them when time is exactly up
                setTimeout(() => {
                    this.clearApiKeys(true);
                }, TWO_HOURS - elapsed);
            }
        } else if (stored && !timestamp) {
            // Legacy keys without timestamp, assign one now or clear them? Better to assign now.
            localStorage.setItem('slideAgent_apiKeys_timestamp', Date.now().toString());
            SlideAgentState.apiKeys = JSON.parse(stored);
        }

        // Load Custom Style if exists
        const storedStyle = localStorage.getItem('slideAgent_customStyle');
        if (storedStyle) {
            try {
                const styleObj = JSON.parse(storedStyle);
                if (styleObj.style_command && UI.elements.customStyleInput) {
                    UI.elements.customStyleInput.value = styleObj.style_command;
                }
            } catch (e) {
                console.warn("Failed to parse stored custom style");
            }
        }
    },

    clearApiKeys(showToast = false) {
        SlideAgentState.apiKeys = [];
        localStorage.removeItem('slideAgent_apiKeys');
        localStorage.removeItem('slideAgent_apiKeys_timestamp');
        if (UI.elements.apiKeyInput) UI.elements.apiKeyInput.value = '';
        if (showToast) UI.showToast('基於安全機制，您的 API Keys 已自動登出移除', 'info');
    },

    saveApiKeys(text) {
        const keys = text.split('\n').map(k => k.trim()).filter(k => k);
        SlideAgentState.apiKeys = keys;
        if (keys.length > 0) {
            localStorage.setItem('slideAgent_apiKeys', JSON.stringify(keys));
            localStorage.setItem('slideAgent_apiKeys_timestamp', Date.now().toString());
            UI.showToast(`已儲存 ${keys.length} 組 API Keys (2小時後自動清除)`, 'success');

            // Restart exact timer
            setTimeout(() => {
                this.clearApiKeys(true);
            }, 2 * 60 * 60 * 1000);
        } else {
            this.clearApiKeys(true);
        }
    },

    saveLocalHistory() {
        if (!UI.elements.mainInput) return;
        const data = {
            input: UI.elements.mainInput.value,
            outline: UI.elements.outputOutline ? UI.elements.outputOutline.innerHTML : '',
            yaml: UI.elements.outputYaml ? UI.elements.outputYaml.textContent : ''
        };
        localStorage.setItem('slideAgent_localHistory', JSON.stringify(data));
    },

    loadLocalHistory() {
        const stored = localStorage.getItem('slideAgent_localHistory');
        return stored ? JSON.parse(stored) : null;
    },

    // Sync HTML Outline to YAML
    syncToYaml() {
        const container = UI.elements.outputOutline;
        if (!container) return;

        const blocks = container.querySelectorAll('.slide-block');
        const { identity, stage, pages, style } = UI.elements;

        // Retrieve Visual Keywords if possible (Need to import AI or pass it in? 
        // Circular dependency risk. For now, simple string or pass from AI module if needed.
        // Actually, we can just use the mapping here or simplified.)
        // Let's copy the StyleMap logic or just leave a placeholder if strict refactor.
        // To avoid circular dependency with AI module, we will just use a default or strict lookup if simple.
        // Better: We can move StyleMap to config or a separate constants file if shared.
        // For now, let's hardcode the lookup here or allow it to be empty/synced.

        let visualKeywords = "";
        if (style.value === 'custom' && UI.elements.customStyleInput) {
            visualKeywords = UI.elements.customStyleInput.value.trim();
        } else {
            visualKeywords = SlideAgentState.StyleMap[style.value] || "";
        }

        let globalDesign = `  global_design:
    style_name: "${style.value}"
    visual_keywords: "${visualKeywords}"
    target_audience: "${identity.value}"
    learning_stage: "${stage.value}"
    total_pages: ${blocks.length}`;

        const exportMode = UI.elements.exportMode ? UI.elements.exportMode.value : 'rich';

        if (exportMode === 'rich') {

            // Typography and Color injection (V13.2)
            const fonts = SlideAgentState.FontMap[style.value] || { title: "Noto Sans TC", body: "Noto Sans TC", weight: "Bold" };
            const colors = SlideAgentState.ColorMap[style.value] || {
                background: { hex: "#FFFFFF", role: "純淨背景，提供最高的閱讀清晰度" },
                primary_text: { hex: "#1A1A1A", role: "取代純黑的深灰，柔和但對比強烈的主骨架與文字" },
                primary_accent: { hex: "#E5E5E5", role: "極簡的淺灰，用於細微的區塊劃分與次要元素" },
                secondary_accent: { hex: "#737373", role: "中性灰，用於輔助說明與去焦點化資訊" },
                surface: { hex: "#F5F5F5", role: "用於卡片背景，創造極微弱的層次感" }
            };

            globalDesign += `
    typography:
      title_font: "${fonts.title}"
      body_font: "${fonts.body}"
      title_size: "48pt"
      subtitle_size: "32pt"
      body_size: "18pt"
      font_weight: "${fonts.weight}"
    color_palette:
      background:
        hex: "${colors.background.hex}"
        semantic_role: "${colors.background.role}"
      primary_text:
        hex: "${colors.primary_text.hex}"
        semantic_role: "${colors.primary_text.role}"
      primary_accent:
        hex: "${colors.primary_accent.hex}"
        semantic_role: "${colors.primary_accent.role}"
      secondary_accent:
        hex: "${colors.secondary_accent.hex}"
        semantic_role: "${colors.secondary_accent.role}"
      surface:
        hex: "${colors.surface.hex}"
        semantic_role: "${colors.surface.role}"`;
        }

        let slidesYaml = `\n  slides:`;

        blocks.forEach(block => {
            const type = block.getAttribute('data-type') || 'content_page';
            const layout = block.querySelector('.font-mono')?.textContent || 'Default Layout';
            const visual = block.querySelector('[data-field="visual"]')?.innerText.trim() || '';

            slidesYaml += `\n    - type: "${type}"`;

            if (exportMode === 'rich') {
                slidesYaml += `\n      layout_style: "${layout}"`;
                slidesYaml += `\n      visual_description: "${visual.replace(/"/g, '\\"')}"`;
            }

            slidesYaml += `\n      content:`;

            if (type === 'cover') {
                const title = block.querySelector('[data-field="title"]')?.innerText.trim() || '';
                const subtitle = block.querySelector('[data-field="subtitle"]')?.innerText.trim() || '';
                slidesYaml += `\n        title: "${title.replace(/"/g, '\\"')}"`;
                slidesYaml += `\n        subtitle: "${subtitle.replace(/"/g, '\\"')}"`;
            } else if (type === 'deep_reflection') {
                const rebuttal = block.querySelector('[data-field="rebuttal"]')?.innerText.trim() || '';
                const challenge = block.querySelector('[data-field="challenge"]')?.innerText.trim() || '';
                const persuasion = block.querySelector('[data-field="persuasion"]')?.innerText.trim() || '';
                slidesYaml += `\n        rebuttal: "${rebuttal.replace(/"/g, '\\"')}"`;
                slidesYaml += `\n        challenge: "${challenge.replace(/"/g, '\\"')}"`;
                slidesYaml += `\n        persuasion: "${persuasion.replace(/"/g, '\\"')}"`;
            } else {
                // FIXED: Extract Title for Content Pages
                const title = block.querySelector('[data-field="title"]')?.innerText.trim() || '';
                if (title) {
                    slidesYaml += `\n        title: "${title.replace(/"/g, '\\"')}"`;
                }

                slidesYaml += `\n        key_points:`;
                const points = block.querySelectorAll('[data-field="point"]');
                points.forEach(p => {
                    slidesYaml += `\n          - "${p.innerText.trim().replace(/"/g, '\\"')}"`;
                });

            }
        });

        // 定義防篡改指令與 V13 視覺防護網 (加入 [META] 標籤與隱藏警語)
        let ipRule = "";
        const useIp = UI.elements.useCharacterIp && UI.elements.useCharacterIp.checked;
        const ipName = UI.elements.characterIpName ? UI.elements.characterIpName.value.trim() : "";
        if (useIp) {
            ipRule = `\n    1. 隨機在每張簡報適當的地方加上人物IP${ipName ? `，參考 [${ipName}]` : ''}`;
        }

        let ruleCounter = useIp ? 2 : 1;

        const systemInstructions = `
  system_instructions: |
    [⚠️ SYSTEM META - STRICT TRANSCRIPTION MODE & DESIGN SYSTEM]
    
    【NotebookLM 簡報生成絕對守則】${ipRule}
    ${ruleCounter++}. 頁數與結構鐵律：必須嚴格依照 'slides' 陣列的長度製作，嚴禁自行增減頁數、合併頁面或省略任何內容。
    ${ruleCounter++}. 標題識別：YAML 中 'title' 欄位即為該頁標題。
    ${ruleCounter++}. 內容忠實性 (CRITICAL)：'content' 內的文字為核心文案，您必須「100% 逐字照抄」。絕對禁止縮寫、改寫、潤飾或發揮創意。
    ${ruleCounter++}. 佈局與邏輯視覺化（推薦）：若內容包含平行重點或步驟流程，強烈建議捨棄傳統條列式，改用語意清晰的「多欄卡片式網格 (Multi-column Card Grid)」或高對比色塊進行水平排版。
    ${ruleCounter++}. 視覺美學絕對禁令 (Negative Prompts)：為確保現代高級感，生成設計時絕對禁止使用「漸層(Gradient)」、「發光(Glow)」、「立體浮雕(Bevel)」。禁止高飽和度純色與純黑(#000000)。所有文字方塊邊緣必須保持至少 20% 的呼吸留白。
    ${ruleCounter++}. 特殊空白保留限制：若 title 或 key_points 內為特殊空白符號 (如 Braille Pattern Blank)，請原封不動地轉錄該符號，絕對不可因為該頁空白而自行「額外新增」任何總結、結語或補充說明。
    (End of System Instructions)
    --------------------------------------------------`;

        const safeFilename = SlideAgentState.currentFilename || "presentation";

        let finalYaml = `presentation_data:\n  suggested_filename: "${safeFilename}"\n`;

        // Always include NotebookLM System Instructions, even in Clean Mode, to ensure structural strictness
        finalYaml += `${systemInstructions}\n`;

        finalYaml += `${globalDesign}\n${slidesYaml}`;

        if (UI.elements.outputYaml) {
            UI.elements.outputYaml.textContent = finalYaml;
            UI.elements.outputYaml.classList.add('flash-green');
            setTimeout(() => UI.elements.outputYaml.classList.remove('flash-green'), 500);
        }

        // --- UPDATE STATS DASHBOARD ---
        if (UI.elements.statsDashboard) {
            const stats = this.calculateStats(finalYaml);
            if (UI.elements.statPages) UI.elements.statPages.innerText = stats.pages;
            if (UI.elements.statWords) UI.elements.statWords.innerText = stats.words;
            if (UI.elements.statTime) UI.elements.statTime.innerText = stats.time;
            UI.elements.statsDashboard.classList.remove('hidden');
        }

        // --- UPDATE STATE ---
        SlideAgentState.yamlGenerated = true;
    },

    generateMarkdownValues() {
        const { style } = UI.elements;
        const container = UI.elements.outputOutline;
        if (!container) return "";

        const safeFilename = SlideAgentState.currentFilename ? SlideAgentState.currentFilename.split('.')[0] : "AI 生成簡報大綱";

        const blocks = container.querySelectorAll('.slide-block');
        let md = `# ${safeFilename}\n\n`;
        md += `> 全域設計風格：${style.value}\n\n---\n\n`;

        blocks.forEach((block, index) => {
            const type = block.getAttribute('data-type') || 'content_page';
            const layout = block.getAttribute('data-layout') || '';
            const visual = block.querySelector('[data-field="visual"]')?.innerText.trim() || '';

            if (type === 'cover') {
                const title = block.querySelector('[data-field="title"]')?.innerText.trim() || '封面標題';
                const subtitle = block.querySelector('[data-field="subtitle"]')?.innerText.trim() || '';
                md += `## 第 ${index + 1} 頁：${title}\n\n`;
                if (subtitle) md += `**副標題**：${subtitle}\n\n`;
            } else if (type === 'deep_reflection') {
                md += `## 第 ${index + 1} 頁：深度省思\n\n`;
                const rebuttal = block.querySelector('[data-field="rebuttal"]')?.innerText.trim() || '';
                const challenge = block.querySelector('[data-field="challenge"]')?.innerText.trim() || '';
                const persuasion = block.querySelector('[data-field="persuasion"]')?.innerText.trim() || '';
                if (rebuttal) md += `**反駁與盲點**：${rebuttal}\n\n`;
                if (challenge) md += `**挑戰與提問**：${challenge}\n\n`;
                if (persuasion) md += `**行動呼籲**：${persuasion}\n\n`;
            } else {
                const title = block.querySelector('.font-bold.text-slate-800')?.innerText.trim() || `第 ${index + 1} 頁`;
                md += `## ${title}\n\n`;
                const points = block.querySelectorAll('[data-field="point"]');
                if (points.length > 0) {
                    points.forEach(p => {
                        md += `- ${p.innerText.trim()}\n`;
                    });
                    md += `\n`;
                }
            }

            // Add Style and Visual Context
            if (layout) md += `*排版設定：${layout}*\n`;
            if (visual) md += `*畫面提示：${visual}*\n\n`;

            const script = block.querySelector('[data-field="script"]')?.innerText.trim();
            if (script) {
                md += `> 講者備忘：${script}\n\n`;
            }
            md += `---\n\n`;
        });

        return md;
    },

    generateFilename(ext) {
        if (SlideAgentState.currentFilename) {
            const clearName = SlideAgentState.currentFilename.replace(/\.[^/.]+$/, "");
            return `${clearName}.${ext}`;
        }
        let title = "presentation";
        const yamlText = UI.elements.outputYaml ? UI.elements.outputYaml.textContent : '';
        const nameMatch = yamlText.match(/suggested_filename:\s*"([^"]+)"/);
        const titleMatch = yamlText.match(/主題:\s*"?([^"\n]+)"?/);

        if (nameMatch && nameMatch[1]) {
            title = nameMatch[1].trim();
        } else if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].trim().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '_');
        }
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `${title}_${date}.${ext}`;
    },

    downloadYaml() {
        const content = UI.elements.outputYaml ? UI.elements.outputYaml.textContent : '';
        if (!content) return;
        const filename = this.generateFilename('txt');
        const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // downloadSplitYaml has been officially removed. Full downloads only from now on.

    downloadMarkdown() {
        const yamlText = UI.elements.outputYaml ? UI.elements.outputYaml.textContent : '';
        if (!yamlText) {
            UI.showToast("沒有可下載的內容", "warning");
            return;
        }

        try {
            let mdContent = "";
            let baseFilename = "presentation_outline";

            // Extract title
            const nameMatch = yamlText.match(/suggested_filename:\s*"([^"]+)"/);
            if (nameMatch && nameMatch[1]) {
                baseFilename = nameMatch[1].trim();
                mdContent += `# ${baseFilename}\n\n`;
            } else {
                mdContent += `# 簡報大綱\n\n`;
            }

            // Extract System Instructions
            const sysInstMatch = yamlText.match(/system_instructions:\s*\|([\s\S]*?)(?=\n\s*global_design:|\n\s*slides:)/);
            if (sysInstMatch) {
                // Clean up indentation for markdown
                const instructions = sysInstMatch[1].replace(/^\s+/gm, '').trim();
                mdContent += `> **【系統指令與守則】**\n> \n> ${instructions.split('\n').join('\n> ')}\n\n---\n\n`;
            }

            // Extract Global Design
            const globalMatch = yamlText.match(/global_design:([\s\S]*?)(?=\n\s*slides:)/);
            if (globalMatch) {
                const styleName = globalMatch[1].match(/style_name:\s*"([^"]+)"/);
                const keywords = globalMatch[1].match(/visual_keywords:\s*"([^"]+)"/);
                if (styleName) mdContent += `**全域視覺風格**：${styleName[1]}\n`;
                if (keywords) mdContent += `**全域視覺關鍵字**：${keywords[1]}\n`;
                mdContent += `\n---\n\n`;
            }

            // Extract Slides from DOM directly
            const container = UI.elements.outputOutline;
            if (container) {
                const blocks = container.querySelectorAll('.slide-block');
                blocks.forEach((block, idx) => {
                    const type = block.getAttribute('data-type') || 'content_page';

                    if (type === 'cover') {
                        const title = block.querySelector('[data-field="title"]')?.innerText.trim() || '封面標題';
                        mdContent += `## 封面：${title}\n\n`;
                        const subtitle = block.querySelector('[data-field="subtitle"]')?.innerText.trim() || '';
                        if (subtitle) mdContent += `**副標題**：${subtitle}\n\n`;
                    } else if (type === 'deep_reflection') {
                        mdContent += `## 結語與省思\n\n`;
                        const rebuttal = block.querySelector('[data-field="rebuttal"]')?.innerText.trim() || '';
                        if (rebuttal) mdContent += `**反駁與盲點**：${rebuttal}\n\n`;
                        const challenge = block.querySelector('[data-field="challenge"]')?.innerText.trim() || '';
                        if (challenge) mdContent += `**挑戰與提問**：${challenge}\n\n`;
                        const persuasion = block.querySelector('[data-field="persuasion"]')?.innerText.trim() || '';
                        if (persuasion) mdContent += `**行動呼籲**：${persuasion}\n\n`;
                    } else {
                        const title = block.querySelector('[data-field="title"]')?.innerText.trim() || `第 ${idx + 1} 頁`;
                        mdContent += `## ${title}\n\n`;

                        const layout = block.querySelector('.font-mono')?.textContent || block.getAttribute('data-layout') || '';
                        const visual = block.querySelector('[data-field="visual"]')?.innerText.trim() || '';
                        if (layout) mdContent += `*排版設定：${layout}*\n`;
                        if (visual) mdContent += `*畫面提示：${visual}*\n\n`;

                        const points = block.querySelectorAll('[data-field="point"]');
                        if (points.length > 0) {
                            points.forEach(p => mdContent += `- ${p.innerText.trim()}\n`);
                            mdContent += '\n';
                        }

                        const scriptText = block.querySelector('[data-field="script"]')?.innerText.trim() || '';
                        if (scriptText) {
                            mdContent += `> 講者備忘：\n> ${scriptText.split('\n').join('\n> ')}\n\n`;
                        }
                    }

                    mdContent += `---\n\n`;
                });
            }

            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const finalFilename = `${baseFilename}_${date}.md`;

            const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = finalFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (UI.showToast) UI.showToast("Markdown 下載成功", "success");

        } catch (e) {
            console.error("MD Export Error:", e);
            if (UI.showToast) UI.showToast("轉換 Markdown 失敗", "error");
        }
    },

    downloadPodcastTranscript() {
        const container = UI.elements.outputOutline;
        if (!container) {
            UI.showToast("沒有可用內容下載！", "warning");
            return;
        }

        try {
            let scriptContent = "";
            let baseFilename = SlideAgentState.currentFilename ? SlideAgentState.currentFilename.split('.')[0] : "podcast_script";

            scriptContent += `【專案報告主題】\n${baseFilename}\n\n`;
            scriptContent += `===============================================\n\n`;

            const blocks = container.querySelectorAll('.slide-block');
            blocks.forEach((block, idx) => {
                const type = block.getAttribute('data-type') || 'content_page';

                if (type === 'cover') {
                    const titleNode = block.querySelector('[data-field="title"]');
                    const titleText = titleNode ? titleNode.innerText.trim() : `引言介紹`;
                    scriptContent += `## 章節：${titleText}\n\n`;
                } else if (type === 'deep_reflection') {
                    scriptContent += `## 章節：專案總結與反思\n\n`;
                    const rebuttal = block.querySelector('[data-field="rebuttal"]')?.innerText.trim() || '';
                    if (rebuttal) scriptContent += `潛在挑戰分析：\n${rebuttal}\n\n`;
                    const persuasion = block.querySelector('[data-field="persuasion"]')?.innerText.trim() || '';
                    if (persuasion) scriptContent += `建議行動方案：\n${persuasion}\n\n`;
                } else {
                    const titleNode = block.querySelector('[data-field="title"]');
                    const titleText = titleNode ? titleNode.innerText.trim() : `第 ${idx + 1} 節`;
                    scriptContent += `## 章節：${titleText}\n\n`;

                    const points = block.querySelectorAll('[data-field="point"]');
                    if (points.length > 0) {
                        scriptContent += `重點摘要：\n`;
                        points.forEach(p => scriptContent += `- ${p.innerText.trim()}\n`);
                        scriptContent += '\n';
                    }

                    const scriptNode = block.querySelector('[data-field="script"]');
                    if (scriptNode) {
                        scriptContent += `深入解說內容：\n${scriptNode.innerText.trim()}\n\n`;
                    }
                }

                scriptContent += `-----------------------------------------------\n\n`;
            });

            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const finalFilename = `${baseFilename}_廣播稿_${date}.txt`;

            const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = finalFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (UI.showToast) UI.showToast("廣播稿下載成功", "success");

        } catch (e) {
            console.error("Podcast Transcript Export Error:", e);
            if (UI.showToast) UI.showToast("轉換廣播稿失敗", "error");
        }
    },

    calculateStats(yamlText) {
        if (!yamlText) return { pages: 0, words: 0, time: 0 };

        // Count pages: count occurrences of '- type:' inside the slides array
        const pageMatches = yamlText.match(/-\s*type:/g);
        const pages = pageMatches ? pageMatches.length : 0;

        // Count words: strip yaml keys and syntax, count CJK characters + English words
        // Simple approach: strip common yaml keys
        let cleanText = yamlText
            .replace(/title:|subtitle:|content:|key_points:|speaker_notes:|visual_description:|layout_style:|style_name:|suggested_filename:|visual_keywords:|system_instructions:|typography:|global_design:|audience:|presentation_data:|slides:/gi, '')
            .replace(/\[.*SYSTEM META.*\]/g, '')
            .replace(/-\s+/g, '')
            .replace(/[#":\{\}\[\]]/g, '');

        // Count Chinese characters
        const cjkRegex = /[\u4e00-\u9fa5]/g;
        const cjkMatches = cleanText.match(cjkRegex);
        const cjkCount = cjkMatches ? cjkMatches.length : 0;

        // Count English words roughly
        const engClean = cleanText.replace(cjkRegex, ' ').trim();
        const engWords = engClean ? engClean.split(/\s+/).filter(w => w.length > 0).length : 0;

        const totalWords = cjkCount + engWords;

        // Estimate time: Avg speaking rate is ~150-180 words per min. We use 180.
        // Also add ~10 seconds per slide for transitions/visuals
        const speakingTimeMinutes = totalWords / 180;
        const transitionTimeMinutes = pages * (10 / 60);
        const totalTime = Math.ceil(speakingTimeMinutes + transitionTimeMinutes);

        return {
            pages,
            words: totalWords,
            time: totalTime
        };
    }
};
