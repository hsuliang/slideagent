/**
 * SlideAgent - AI Module
 * Handles Google Gemini API Interaction
 */
import { SlideAgentState } from './config.js';
import { UI } from './ui.js';
import { Data } from './data.js';
import { FileHandler } from './files.js';

export const AI = {

  async startGeneration() {
    const { identity, stage, pages, style, mainInput } = UI.elements;
    const userInput = mainInput ? mainInput.value.trim() : '';
    const files = SlideAgentState.uploadedFiles;

    if (!userInput && files.length === 0) {
      UI.showToast('請輸入文字或上傳檔案', 'error');
      return;
    }

    SlideAgentState.isGenerating = true;
    SlideAgentState.abortController = new AbortController();

    const params = {
      identity: identity.value,
      stage: stage.value,
      goal: UI.elements.goal ? UI.elements.goal.value : "general",
      pages: parseInt(pages.value) || 8,
      style: style.value,
      customStyle: UI.elements.customStyleInput ? UI.elements.customStyleInput.value.trim() : "",
      userInput: userInput,
      deepOptimization: UI.elements.deepOptimization ? UI.elements.deepOptimization.checked : false
    };

    const hasKeys = SlideAgentState.apiKeys.length > 0;

    if (!hasKeys) {
      if (UI.elements.apikeyModal) {
        UI.elements.apikeyModal.classList.remove('hidden');
      } else {
        UI.showToast("請先設定 API Key 才能使用生成功能", "error");
        UI.toggleSettings(true);
      }
      SlideAgentState.isGenerating = false;
      SlideAgentState.abortController = null;
      return;
    }

    try {
      let result;
      // AI Generation Only
      UI.setLoading(true, "AI 正在原子化您的教材...", "正在進行深度語意分析與結構重組");
      const fileData = await FileHandler.readFiles(files);
      result = await this.generateWithGemini(params, fileData);


      // Store metadata for downloads
      if (result.filename) {
        SlideAgentState.currentFilename = result.filename;
        console.log("Filename stored:", result.filename);
      }

      UI.showResults(result);
      UI.showToast('生成成功！', 'success');
      Data.saveLocalHistory();

    } catch (error) {
      if (error.name === 'AbortError') {
        UI.showToast('已取消生成', 'info');
      } else {
        console.error(error);
        UI.showToast(error.message || '生成失敗，請重試', 'error');
      }
    } finally {
      SlideAgentState.isGenerating = false;
      UI.setLoading(false);
    }
  },

  stopGeneration() {
    if (SlideAgentState.abortController) {
      SlideAgentState.abortController.abort();
    }
  },

  async generateWithGemini(params, fileData) {
    // Retrieve Visual Keywords
    let visualKeywords = "Professional, clean, educational standard style.";
    if (params.style === 'custom' && params.customStyle) {
      visualKeywords = params.customStyle;
    } else {
      visualKeywords = SlideAgentState.StyleMap[params.style] || visualKeywords;
    }

    // Persona Specific Context
    const personaMap = {
      "teacher": "You are a Teacher. Your tone is educational, guiding, and encouraging. You break down complex topics.",
      "student": "You are a Student. Your tone is relatable, sharing discoveries, and presenting findings clearly to peers.",
      "executive": "You are an Executive. Your tone is professional, decisive, strategic, and focused on high-level impact and results."
    };
    const personaContext = personaMap[params.identity] || personaMap['teacher'];

    // Stage Specific Context
    const stageMap = {
      "elementary": "Target Audience: Elementary School Students (Age 7-12). Content: Simple, fun, engaging, uses storytelling and bright metaphors.",
      "junior": "Target Audience: Junior High Students (Age 13-15). Content: Exploratory, interactive, connects concepts to daily life, moderate depth.",
      "high": "Target Audience: High School Students (Age 15-18). Content: Academic, analytical, logical structure, college-preparatory depth, critical thinking.",
      "university": "Target Audience: University Students/Adults. Content: Professional, rigorous, theory-heavy, industry-standard terminology.",
      "adult": "Target Audience: General Adults. Content: Practical, solution-oriented, clear value proposition, efficient."
    };
    const stageContext = stageMap[params.stage] || stageMap['adult'];

    // Goal Specific Context (Narrative Structure)
    const goalMap = {
      "general": "Structure: Standard informational. Clear hierarchy of points.",
      "education": "Structure: Educational. MUST include 'Learning Objectives' early on, address 'Common Misconceptions' in the middle, and end with 'Pop Quiz / Reflection Questions'.",
      "business": "Structure: Business Report. MUST follow: Pain Point/Problem -> Proposed Solution -> Data Evidence -> Call to Action (CTA).",
      "ted": "Structure: TED Style Talk. MUST focus on storytelling: Set the Scene -> The Conflict/Turning Point -> The Core Insight. Avoid heavy bullet points, use narrative flow."
    };
    const goalContext = goalMap[params.goal] || goalMap['general'];


    let systemPrompt = '';

    if (SlideAgentState.generationMode === 'direct') {
      // --- STRICT CONVERTER MODE (SAFE TITLE LOGIC) ---
      systemPrompt = `
You are a "Strict YAML Converter".
The user will provide a presentation outline.

**CRITICAL RULES (MUST FOLLOW):**

1.  **Slide Separation & Title Extraction (SAFE MARKER RULE)**:
    -   **Step 1: Identify Marker**: Look for lines STARTING with "Slide", "Page", "投影片", "第X頁" (case insensitive).
    -   **Step 2: Check for Title in Marker Line**:
        -   IF the *Marker Line itself* contains a colon (： or :):
            -   The text **AFTER the colon** on that same line is the **TITLE**.
            -   Example: "投影片 2：開始之前" -> Title is "開始之前".
        -   IF the *Marker Line* does NOT contain a colon:
            -   The **NEXT non-empty line** is the **TITLE**.
    -   **Step 3: Content Protection**:
        -   Colons appearing in *content lines* (lines that do NOT start with a Slide Marker) must be treated as normal text. DO NOT treat them as title separators.

2.  **Cover Page Logic**:
    -   If the slide marker contains "Cover" or "封面", set \`type: "cover"\`.
    -   Set \`content.title\` to the main text found via the rule above.
    -   Set \`content.subtitle\` to any secondary text lines.
    -   **Subtitle Safety**: If NO subtitle is found, set \`subtitle: ""\` (Empty String). **DO NOT write "null", "undefined" or "None".**

3.  **Content Integrity**:
    -   Map all bullet points and text blocks verbatim to \`content.key_points\`.
    -   **Verbatim Copy**: Do not summarize. Do not rewrite. Do not omit context.

4.  **Visual Descriptions**:
    -   Generate a \`visual_description\` starting with the style keywords provided below.
    -   Style: ${params.style} (${visualKeywords}).

**Output Format (STRICT JSON SCHEMA):**
You must strictly follow this structure. 
⚠️ **CRITICAL: Every "content_page" MUST have a "title" field in the "content" block.**

{
  "presentation_data": {
    "suggested_filename": "GENERATE_A_FILENAME_HERE_MAX_10_CHARS",
    "global_design": {
      "style_name": "${params.style}",
      "visual_keywords": "${visualKeywords}",
      "total_pages": "DYNAMIC"
    },
    "slides": [
      {
        "type": "content_page",
        "layout_style": "Title Top-Left",
        "visual_description": "...",
        "content": {
          "title": "🔴 EXTRACTED TITLE GOES HERE (REQUIRED)", 
          "key_points": [
            "Bullet point 1",
            "Bullet point 2"
          ]
        }
      }${UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? `,
      {
        "type": "deep_reflection",
        "layout_style": "Discussion Panel",
        "visual_description": "Generate a metaphorical visual for reflection...",
          "rebuttal": "請針對簡報主題提出一個繁體中文的反駁觀點或省思。",
          "challenge": "請對聽眾拋出一個繁體中文的具挑戰性、引發深思的問題。",
          "persuasion": "請基於上述討論，給出一個繁體中文的專業總結或行動呼籲。"
        }
      }` : ''}
    ]
  }
}

**ANTI-LAZINESS RULES:**
1.  **NO GHOST TITLES**: It is NOT enough to mention the title in \`visual_description\`. You MUST write it into \`content.title\`.
2.  **FALLBACK**: If you cannot find a colon-separated title, use the first line of the slide as the \`title\`.
3.  **VERIFICATION**: Before outputting JSON, check: Does every content slide have a \`title\` field? If not, fix it.
4.  **MULTI-MEDIA FOCUS**: You have been provided with multiple files. You MUST scan and acknowledge ALL files provided (text, PDF, AND Images). Do NOT ignore images if a PDF is present, and vice versa. Integrate information from ALL sources.
**IGNORE UI SETTINGS**: Ignore total_pages parameter. Use exact number of slides from input. ${UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? "However, you MUST append EXACTLY ONE 'deep_reflection' slide at the very end of the 'slides' array, taking the total slides to N+1." : "Do NOT add any extra slides."}

`;
    } else {
      // --- STANDARD AI GENERATION MODE ---
      systemPrompt = `
You are an expert presentation architect (SlideAgent V10).
Action: Generate a "Construction Blueprint" JSON for a presentation.

**Context:**
- **Speaker Persona**: ${personaContext}
- **Goal Structure**: ${goalContext}
- **Style**: ${visualKeywords}
- **Stage Level**: ${stageContext}
- **Total Pages**: ${params.pages}

**Strict Output Format (JSON ONLY):**
{
  "presentation_data": {
    "suggested_filename": "10-char_max_chinese_filename",
    "global_design": {
      "style_name": "${params.style}",
      "visual_keywords": "${visualKeywords}",
      "target_audience": "${params.identity}",
      "learning_stage": "${params.stage}",
      "learning_stage": "${params.stage}",
      "total_pages": ${params.pages},
      "typography": {
        "title_font": "Font Name",
        "body_font": "Font Name",
        "title_size": "48pt",
        "body_size": "18pt"
      }
    },
    "slides": [
      {
        "type": "cover",
        "layout_style": "Title Centered",
        "visual_description": "Specific visual description...",
        "content": {
          "title": "Main Title",
          "subtitle": "Subtitle or Unit Name"
        }
      },
      {
        "type": "content_page",
        "layout_style": "Split Layout (Left Image / Right Text)",
        "visual_description": "Only describe the Subject Matter (characters, objects, actions). DO NOT include style keywords (e.g., do not write 'soft lighting' or '--ar 16:9'), as these will be added programmatically.",
        "content": {
          "title": "Slide Title",
          "key_points": ["Point 1 (Rich Detail)", "Point 2 (Rich Detail)"],
          "script": "Speaker notes for this slide..."
        }
      }
      ... REPEAT 'content_page' structure until total pages reaches target ...
      ${UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? `,
      {
        "type": "deep_reflection",
        "layout_style": "Discussion Panel",
        "visual_description": "Metaphorical visual for reflection...",
        "content": {
          "rebuttal": "繁體中文的反駁或盲點分析",
          "challenge": "繁體中文的提問或挑戰",
          "persuasion": "繁體中文的專業觀點或行動呼籲"
        }
      }` : ''}
    ]
  }
}

**Directives:**
1. **Filename**: Create a unique, descriptive filename (under 10 Traditional Chinese characters) representing the specific topic (e.g. "光合作用_國中生物"). Do not include extension.
2. **Page Discipline**: You MUST generate EXACTLY ${params.pages} slides.  (1 Cover + ${UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? params.pages - 2 + ' Content Pages + 1 Reflection' : params.pages - 1 + ' Content Pages'}).
3. **Content Depth**: 
   - **Adhere strictly to the Stage Level description above.**
   - "key_points" should be detailed and substantial (avoid short phrases).
   - "visual_description" should be vivid and suitable for AI image generation.
4. **Structure**: Slide 1 is 'cover', ${UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? "Last is 'deep_reflection', " : ""}Middle are 'content_page'${UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? "" : " (or all remaining are 'content_page')"}.
5. **Layout Strategy (Structured Variety)**:
    -   **Rule A: The Anchor (Fixed Title)**
        -   For ALL Content Pages, the Title MUST be aligned **Top-Left**.
        -   (Cover Page remains "Title Centered").
    
    -   **Rule B: The Body (Dynamic Content)**
        -   Choose the layout based on the content type, but keep the title fixed:
        -   **Concept 1 (Standard)**: "Title Top-Left + Text Left / Image Right" (For general explanation).
        -   **Concept 2 (Inverted)**: "Title Top-Left + Image Left / Text Right" (To reduce visual fatigue).
        -   **Concept 3 (Comparison)**: "Title Top-Left + 2-Column Grid" (For comparing two items).
        -   **Concept 4 (List)**: "Title Top-Left + 3-Column Icons" (For lists with 3+ items).
    
    -   **Rule C: Forbidden**
        -   DO NOT use layouts that center the title on content pages.
        -   DO NOT use "Auto Detected" (it is too random).
        -   ALWAYS explicitly name the layout style (e.g., "Split Right", "3-Col Grid").
`;
    } // End of ELSE block

    // Initialize parts array WITH ONLY user content (system prompt moved out)
    const parts = [];

    // Add User Input
    if (params.userInput) {
      parts.push({ text: `[CRITICAL INSTRUCTION: You are receiving multiple types of files (PDFs, Images, Text). You MUST analyze and extract information from EVERY SINGLE ATTACHED FILE before generating the response. Do not ignore images just because a PDF is present.]\n\n[USER INPUT]:\n${params.userInput}` });
    } else {
      parts.push({ text: `[CRITICAL INSTRUCTION: You are receiving multiple types of files (PDFs, Images, Text). You MUST analyze and extract information from EVERY SINGLE ATTACHED FILE before generating the response. Do not ignore images just because a PDF is present.]\n\nPlease generate the presentation based on the attached files.` });
    }

    // Add a unique random seed to bypass identical prompt caching
    const cacheBuster = `\n\n[SYSTEM_SEED: ${Date.now()}-${Math.random().toString(36).substring(2)}]`;
    parts.push({ text: cacheBuster });

    // Add File Data
    fileData.forEach(file => {
      if ((file.type === 'image' || file.type === 'pdf') && file.inlineData) {
        // Images and PDFs must be separate parts with inlineData
        parts.push({ text: `\n${file.type.toUpperCase()} File: ${file.name}\n` });
        parts.push({ inlineData: file.inlineData });
      } else {
        parts.push({ text: `\nFile (${file.name}):\n${(file.content || '').substring(0, 5000)}\n` });
      }
    });

    const apiKeys = [...SlideAgentState.apiKeys]; // Clone
    const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastError;

    // Random Logic: Shuffle the keys first
    for (let i = apiKeys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [apiKeys[i], apiKeys[j]] = [apiKeys[j], apiKeys[i]];
    }

    for (const apiKey of apiKeys) {
      for (const model of models) {
        if (SlideAgentState.abortController.signal.aborted) break;

        try {
          console.log(`Trying Key: ...${apiKey.slice(-4)} | Model: ${model}`);

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: {
                parts: [{ text: systemPrompt }]
              },
              contents: [{ parts: parts }],
              generationConfig: {
                response_mime_type: "application/json",
                temperature: 0.7 + Math.random() * 0.2
              }
            }),
            signal: SlideAgentState.abortController.signal
          });

          if (!response.ok) {
            const errData = await response.json();
            const errorMsg = errData.error?.message || response.statusText;
            if (response.status === 400 && (errorMsg.includes('API key') || errorMsg.includes('key not valid'))) {
              throw new Error(`INVALID_KEY: ${errorMsg}`);
            }
            if (response.status === 429) {
              throw new Error(`QUOTA_EXCEEDED: ${errorMsg}`);
            }
            throw new Error(`MODEL_ERROR: ${errorMsg}`);
          }

          const data = await response.json();
          if (!data.candidates || data.candidates.length === 0) throw new Error('No candidates returned');

          const rawText = data.candidates[0].content.parts[0].text;
          const jsonStr = rawText.replace(/^```json\s*|\s*```$/g, '').trim();
          let jsonData = JSON.parse(jsonStr);

          // NUCLEAR FALLBACK: Enforce Title Integrity Programmatically
          if (jsonData.presentation_data && jsonData.presentation_data.slides) {
            jsonData.presentation_data.slides.forEach((slide, idx) => {
              if (slide.type === 'content_page' && slide.content) {
                // If title is missing, empty, or placeholder, try to rescue it
                if (!slide.content.title || slide.content.title.includes("EXTRACTED TITLE") || slide.content.title.trim() === "") {
                  // Strategy: Grab first key point or use default
                  if (slide.content.key_points && slide.content.key_points.length > 0) {
                    slide.content.title = slide.content.key_points.shift();
                  } else {
                    slide.content.title = `Slide ${idx + 1}`;
                  }
                }
              }
            });
          }

          // DEEP OPTIMIZATION PASS (Self-Correction)
          if (params.deepOptimization) {
            UI.setLoading(true, "AI 深度優化中...", "正在進行邏輯校驗與文字潤飾");
            console.log("Starting Deep Optimization Pass...");

            const optimizationPrompt = `
You are a master presentation coach. Review the following JSON outline for a presentation.
Your Task:
1. Enhance clarity, impact, and logical flow of the 'title' and 'key_points'.
2. Make the language more engaging and professional according to the Speaker Persona: ${personaContext} and Target Stage: ${stageContext}.
3. Fix any structural inconsistencies.
4. YOU MUST RETURN THE EXACT SAME JSON STRUCTURE. DO NOT ADD OR REMOVE SLIDES. DO NOT CHANGE THE KEYS. Just optimize the text inside the structure.

JSON Outline to optimize:
${JSON.stringify(jsonData, null, 2)}
              `;

            const optResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: optimizationPrompt }] }],
                generationConfig: {
                  response_mime_type: "application/json",
                  temperature: 0.4
                }
              }),
              signal: SlideAgentState.abortController.signal
            });

            if (optResponse.ok) {
              const optData = await optResponse.json();
              if (optData.candidates && optData.candidates.length > 0) {
                const optRawText = optData.candidates[0].content.parts[0].text;
                const optJsonStr = optRawText.replace(/^```json\s*|\s*```$/g, '').trim();
                try {
                  jsonData = JSON.parse(optJsonStr);
                  console.log("Deep Optimization Pass completed successfully.");
                } catch (e) {
                  console.warn("Failed to parse optimized JSON, falling back to original.", e);
                }
              }
            } else {
              console.warn("Deep Optimization API call failed. Falling back to original.", await optResponse.text());
            }
          }

          return this.convertDataToArtifacts(jsonData);

        } catch (e) {
          lastError = e;
          console.warn(`Failed: ${model} - ${e.message}`);
          if (e.name === 'AbortError') throw e;

          // If Key is invalid or Quota exceeded, break inner model loop to force next KEY
          if (e.message.startsWith('INVALID_KEY') || e.message.startsWith('QUOTA_EXCEEDED')) {
            break; // Breaks model loop, continues outer key loop
          }
        }
      }
    }
    const finalError = lastError?.message || 'Unknown Error';
    throw new Error(`生成失敗: 請檢查 API Keys。\n(${finalError})`);
  },

  convertDataToArtifacts(jsonData) {
    const data = jsonData.presentation_data;
    if (!data) throw new Error("Invalid format: missing presentation_data");

    let html = '';

    data.slides.forEach((slide, index) => {
      // Style Injection Logic
      const currentStyleKey = UI.elements.style.value;
      let stylePrefix = "";
      if (currentStyleKey === 'custom' && UI.elements.customStyleInput) {
        stylePrefix = UI.elements.customStyleInput.value.trim();
      } else {
        stylePrefix = SlideAgentState.StyleMap[currentStyleKey] || "";
      }

      // Clean and Combine
      let cleanDescription = (slide.visual_description || "")
        .replace(/^[:\s]+/, '') // Remove leading colon/space
        .replace(new RegExp(stylePrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '') // Remove duplicate style prompt if AI added it
        .trim();

      // Final assembly
      slide.visual_description = `${stylePrefix}, ${cleanDescription}`;

      const typeLabel = {
        cover: '封面頁 (Cover)',
        content_page: '內容頁 (Content)',
        deep_reflection: '深度省思'
      }[slide.type] || slide.type;

      html += `<div class="slide-block mb-12 p-6 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow" data-type="${slide.type}">`;

      // Header
      html += `<div class="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Slide ${index + 1} - ${typeLabel}</span>
                        <span class="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded">${slide.layout_style || 'Standard'}</span>
                     </div>`;

      // Content Editing Fields
      if (slide.type === 'cover') {
        html += `<div class="space-y-4">
                            <div><label class="block text-xs font-semibold text-slate-500 mb-1">主標題 (Title)</label>
                            <h2 class="text-2xl font-bold text-slate-800 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="title">${slide.content.title}</h2></div>
                            <div><label class="block text-xs font-semibold text-slate-500 mb-1">副標題 (Subtitle)</label>
                            <h3 class="text-xl text-slate-600 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="subtitle">${slide.content.subtitle}</h3></div>
                         </div>`;
      } else if (slide.type === 'deep_reflection') {
        html += `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-red-50 p-4 rounded-lg"><h4 class="font-bold text-red-800 mb-2">反駁</h4><p class="text-sm text-red-900 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="rebuttal">${slide.content.rebuttal}</p></div>
                            <div class="bg-yellow-50 p-4 rounded-lg"><h4 class="font-bold text-yellow-800 mb-2">挑戰</h4><p class="text-sm text-yellow-900 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="challenge">${slide.content.challenge}</p></div>
                            <div class="bg-green-50 p-4 rounded-lg"><h4 class="font-bold text-green-800 mb-2">說服</h4><p class="text-sm text-green-900 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="persuasion">${slide.content.persuasion}</p></div>
                         </div>`;
      } else {
        html += `<div class="space-y-4">
                            <div><label class="block text-xs font-semibold text-slate-500 mb-1">標題 (Title)</label>
                            <h3 class="text-xl font-bold text-slate-800 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="title">${slide.content.title || 'Slide Title'}</h3></div>
                            <div><label class="block text-xs font-semibold text-slate-500 mb-1">重點 (Key Points)</label>
                            <ul class="list-disc pl-5 space-y-2">`;

        (slide.content.key_points || []).forEach(point => {
          html += `<li class="text-slate-700 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="point">${point}</li>`;
        });

        html += `</ul></div>
                          ${slide.content.script ? `<div class="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-slate-500 font-mono">🗣️ Script: ${slide.content.script}</div>` : ''}
                          </div>`;
      }

      // Visual Description Footer
      html += `<div class="mt-6 pt-4 border-t border-slate-200">
                        <label class="block text-xs font-semibold text-indigo-500 mb-1">🎨 AI 繪圖提示 (Visual Prompt)</label>
                        <p class="text-sm text-slate-500 italic outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="visual">${slide.visual_description}</p>
                     </div>`;

      html += `</div>`;
    });

    // YAML for preview
    const yaml = ``; // The UI syncs this automatically later, or we can pre-generate. 
    // Actually, let's let the syncToYaml function handle the initial text based on the HTML we just built.

    return {
      html: html,
      yaml: "(系統將自動同步...)",
      filename: data.suggested_filename
    };
  }
};
