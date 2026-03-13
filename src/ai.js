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
      pages: pages.value === 'auto' ? 'auto' : (parseInt(pages.value) || 8),
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

      // Clean up temp scraped style if desired (optional)
      // SlideAgentState.currentScrapedStyle = null; 


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
        console.error("Agent Error:", error);
        UI.handleSmartError(error);
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

  async refineSelectedText(selectedText, actionType) {
    if (SlideAgentState.apiKeys.length === 0) {
      UI.showToast("請先設定 Gemini API Key", "error");
      UI.switchTab('settings');
      return;
    }

    // Determine the modification prompt based on actionType
    let promptAction = "修改這段文字。";
    if (actionType === 'expand') {
      promptAction = "擴寫這段文字，增加細節與豐富度，使其更具體且具有說服力。";
    } else if (actionType === 'shorten') {
      promptAction = "縮寫這段文字，提取最核心的精華，使其簡潔有力，去掉冗詞贅字。";
    } else if (actionType === 'professional') {
      promptAction = "將這段文字替換為更正式、專業、具備商務語氣的表達方式。";
    } else if (actionType === 'casual') {
      promptAction = "將這段文字替換為更輕鬆、生動、白話且平易近人的口語表達方式。";
    }

    const systemPrompt = `你是一個專業的簡報文案編輯助理。
你的任務是根據使用者的要求局部修改一段文字。
要求：${promptAction}

**嚴格防呆規則 (CRITICAL RULES)：**
1. 你的回覆將會被程式直接取代對應的畫面文字。
2. 絕對不要回傳任何開頭問候語 (例如 "好的"、"這是一段修改後的文字:")。
3. 絕對不要使用 Markdown 引號或是程式碼區塊 (\`\`\`) 包覆文字。
4. 絕對不要加上引號 ("" 或 「」)。
5. 只回傳「修改完成後的純文字結果」，其他什麼都不要說。`;

    UI.setSelectionToolbarLoading(true);

    try {
      const apiKey = SlideAgentState.apiKeys[0];
      const model = 'gemini-2.5-flash';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: selectedText }] }],
          system_instruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.5,
            responseMimeType: "text/plain",
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'API 請求失敗');
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts.length > 0) {
        const newText = data.candidates[0].content.parts[0].text.trim();
        
        // Use UI method to safely replace text in DOM
        if (UI.replaceSelectedText(newText)) {
            // Trigger sync to YAML and history save
            Data.syncToYaml();
            Data.saveLocalHistory();
            UI.hideSelectionToolbar();
            UI.showToast("文字微調完成！", "success");
        } else {
            UI.showToast("無法替換文字，選取範圍可能已遺失", "warning");
        }
      } else {
         throw new Error("回傳格式異常或遭封鎖");
      }
    } catch (err) {
      console.error("Selection Refine Error:", err);
      UI.handleSmartError(err);
    } finally {
      UI.setSelectionToolbarLoading(false);
    }
  },

  async refineEntirePresentation(userPrompt, currentYamlData) {
    const systemPrompt = `你是一位專業的簡報架構師與內容優化專家。
任務：使用者對整份簡報提出了「全域修改指令」，請根據此指令，重新調整並優化整份簡報的內容。

【使用者指令】
${userPrompt}

【目前的簡報 JSON 資料】
${JSON.stringify(currentYamlData, null, 2)}

請嚴格遵守以下規則：
1. 必須完整回傳所有投影片（除非指令要求刪減），包含每一頁的 title、content、speaker_notes 以及 visual_description。
2. 保持原有的 JSON 欄位結構（包含 slides 陣列）。若原資料包含 global_visual_style 也請保留或依指令更新。
3. 根據使用者的指令，調整對應的內容（例如：語氣、字數、難度、重點增減、視覺風格等）。
4. [重要] 您回傳的結果必須與原先設定的格式完全一致，且只回傳純 JSON 字串，不可包含 markdown 代碼區塊 (\`\`\`json) 等標記，直接輸出 JSON 物件。`;

    console.log("Global Refine Request...");

    // Call Gemini API (using standard model without media constraint)
    const responseText = await this.generateWithGeminiRaw([{ text: systemPrompt }]);
    
    // Parse the JSON
    let cleanJsonString = responseText.replace(/```json\n?|\n?```/g, '').trim();
    // Sometimes there might be a prefix
    if (!cleanJsonString.startsWith('{')) {
       cleanJsonString = cleanJsonString.substring(cleanJsonString.indexOf('{'));
    }
    if (!cleanJsonString.endsWith('}')) {
       cleanJsonString = cleanJsonString.substring(0, cleanJsonString.lastIndexOf('}') + 1);
    }
    return JSON.parse(cleanJsonString);
  },

  async regenerateSingleSlide() {
    const targetIndex = SlideAgentState.magicWandTargetIndex;
    if (targetIndex === null || targetIndex === undefined) return;

    const uiInputEl = document.getElementById('magic-wand-prompt');
    const userPrompt = uiInputEl ? uiInputEl.value.trim() : "";
    if (!userPrompt) {
      UI.showToast("請輸入修改指示", "warning");
      return;
    }

    UI.setMagicWandLoading(true);

    try {
      // Find the specific slide element to extract current content
      const slideBlocks = document.querySelectorAll('.slide-block');
      const targetBlock = slideBlocks[targetIndex];
      if (!targetBlock) throw new Error("找不到目標投影片");

      // Context: We give the AI the *whole* YAML so it knows what the rest of the presentation is about,
      // but we ask it to only return the JSON for the *target* slide.
      const fullYamlContext = document.getElementById('output-yaml').textContent;
      const currentSlideType = targetBlock.getAttribute('data-type') || 'content_page';

      // Grab current text content of the slide to help the AI understand what it's replacing
      let currentSlideText = targetBlock.innerText.replace(/往上移|往下移|單頁魔法修改/g, '').trim();

      const systemPrompt = `
You are an expert presentation editor. 
Your task is to REWRITE EXACTLY ONE SLIDE based on the user's instructions and the context of the entire presentation.

CONTEXT OF ENTIRE PRESENTATION:
\`\`\`yaml
${fullYamlContext}
\`\`\`

CURRENT SLIDE CONTENT (Index ${targetIndex}):
"""
${currentSlideText}
"""

USER REVISION INSTRUCTIONS:
"${userPrompt}"

RULES:
1. ONLY return the JSON object for the REVISED slide.
2. DO NOT return an array of slides. DO NOT return the "presentation_data" wrapper. 
3. MUST keep the slide "type" as "${currentSlideType}".
4. All text MUST be in Traditional Chinese (繁體中文).
5. Must return valid, strictly formatted JSON matching this exact structure:
{
  "type": "${currentSlideType}",
  ${currentSlideType === 'cover' ?
          `"layout_style": "Title Centered",
  "visual_description": "...",
  "content": { "title": "...", "subtitle": "..." }` :
          `"layout_style": "...",
  "visual_description": "...",
  "content": { "title": "...", "key_points": ["..."], "script": "..." }`}
}
`;

      const apiKey = SlideAgentState.apiKeys[0];
      const model = 'gemini-2.5-flash';

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: "Please generate the revised slide JSON." }] }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const rawText = data.candidates[0].content.parts[0].text;
        const jsonStr = rawText.replace(/^```json\s*|\s*```$/g, '').trim();
        const revisedSlideJson = JSON.parse(jsonStr);

        // Generate HTML for just this one slide using the existing robust converter
        // We trick it by wrapping it in the expected root structure
        const tempWrapper = { presentation_data: { slides: [revisedSlideJson] } };
        const resultHtmlObj = this.convertDataToArtifacts(tempWrapper);

        let htmlStr = resultHtmlObj.html;
        // Fix the index numbers that convertDataToArtifacts hardcodes
        htmlStr = htmlStr.replace(/Slide 1 -/g, `Slide ${targetIndex + 1} -`);

        // Replace the block in the DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlStr;
        const newFinalNode = tempDiv.firstElementChild;

        if (newFinalNode) {
          targetBlock.replaceWith(newFinalNode);
          // Trigger full sync so the YAML viewer updates
          Data.syncToYaml();
          UI.showToast('✨ 該頁面已成功施展魔法', 'success');
          UI.closeMagicWandModal();
        } else {
          throw new Error("HTML generation failed for revised slide");
        }
      } else {
        throw new Error("AI did not return any candidates.");
      }

    } catch (err) {
      console.error("Magic Wand Error:", err);
      UI.handleSmartError(err);
    } finally {
      UI.setMagicWandLoading(false);
    }
  },

  async generateWithGemini(params, fileData) {
    // Retrieve Visual Keywords
    let visualKeywords = "Professional, clean, educational standard style.";
    if ((params.style === 'custom' || params.style.startsWith('fav_')) && params.customStyle) {
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

    // Tone Specific Context (New V11 Feature)
    const toneMap = {
      "standard": "Tone: Standard, objective, clear, and balanced. Avoids excessive emotion.",
      "humorous": "Tone: Humorous, witty, uses lighthearted anecdotes and engaging pacing like a storyteller. Keep it entertaining!",
      "inspirational": "Tone: Inspirational, energetic, passionate. Uses strong verbs and forward-looking optimism.",
      "academic": "Tone: Academic, precise, highly formal, and rigorous. Uses domain-specific vocabulary.",
      "friendly": "Tone: Friendly, warm, approachable, conversational. Makes the listener feel comfortable."
    };
    const toneContext = `★ CRITICAL TONE OVERRIDE: ${toneMap[params.tone] || toneMap['standard']} ★`;

    // Goal Specific Context (Narrative Structure)
    const goalMap = {
      "general": "Structure: Standard informational. Clear hierarchy of points.",
      "education": "Structure: Educational. MUST include 'Learning Objectives' early on, address 'Common Misconceptions' in the middle, and end with 'Pop Quiz / Reflection Questions'.",
      "business": "Structure: Business Report. MUST follow: Pain Point/Problem -> Proposed Solution -> Data Evidence -> Call to Action (CTA).",
      "ted": "Structure: TED Style Talk. MUST focus on storytelling: Set the Scene -> The Conflict/Turning Point -> The Core Insight. Avoid heavy bullet points, use narrative flow."
    };
    const goalContext = goalMap[params.goal] || goalMap['general'];

    let pageDisciplineRule = "";
    let totalPagesTemplate = "";
    if (params.pages === 'auto') {
      pageDisciplineRule = `3. **Page Discipline**: Determine the optimal, natural length and number of slides based on the density and structure of the provided content. Create as many 'content_page' slides as necessary to fully cover the topic without rushing or padding.${UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? " THEN, you MUST append EXACTLY ONE 'deep_reflection' slide at the very end." : ""}`;
      totalPagesTemplate = `"AI_Calculated_Number"`;
    } else {
      pageDisciplineRule = `3. **Page Discipline**: You MUST generate EXACTLY ${params.pages} CONTENT/COVER slides. (1 Cover + ${params.pages - 1} Content Pages). ${UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? "THEN, you MUST append EXACTLY ONE 'deep_reflection' slide at the very end, making the total final output " + (params.pages + 1) + " slides." : "Do NOT add any extra slides."}`;
      totalPagesTemplate = UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? params.pages + 1 : params.pages;
    }
    // Logo Rule
    const logoRule = (SlideAgentState.useLogo && SlideAgentState.logoName) 
      ? `\n[CRITICAL VISUAL RULE]: You MUST explicitly include instructions in EVERY single slide's \`visual_description\` to incorporate "${SlideAgentState.logoName}" as the background or a watermark logo to maintain brand consistency.` 
      : "";

    let systemPrompt = '';

    if (SlideAgentState.generationMode === 'direct') {
      // --- STRICT CONVERTER MODE (SAFE TITLE LOGIC) ---
      systemPrompt = `
You are a "Strict YAML Converter" with a specific persona.
${personaContext}
${stageContext}
${toneContext}

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

5.  **Script and Rebuttal Generation (TONE AWARE - NON NEGOTIABLE)**:
    -   When generating \`script\`, \`rebuttal\`, \`challenge\` and \`persuasion\` fields, you must STRICTLY adopt the requested Tone (${params.tone}).
    -   Current Tone Rule: ${toneContext}
    -   Make sure these fields sound like spoken words matching this exact style. Do not use generic AI speech. Violating this tone is a failure.

6.  **Language Policy (CRITICAL)**:
    -   ALL generated text MUST be in Traditional Chinese (繁體中文). Do not output English.

**Output Format (STRICT JSON SCHEMA):**
You must strictly follow this structure. 
{
  "presentation_data": {
    "suggested_filename": "擷取內容提到的關鍵字作為檔名_10字以內繁體中文",
    "global_design": {
      "style_name": "${params.style}",
      "visual_keywords": "${visualKeywords}",
      "target_audience": "從內容判斷(例如：一般大眾、專業人士、學生等)",
      "learning_stage": "從內容判斷",
      "total_pages": {extracted_slide_count},
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
        "visual_description": "Only describe the Subject Matter (characters, objects, actions). DO NOT include style keywords.",
        "content": {
          "title": "Slide Title",
          "key_points": [
            "Bullet point 1",
            "Bullet point 2"
          ]
        }
      }
    ]
  }
}

**ANTI-LAZINESS RULES:**
1.  **NO GHOST TITLES**: It is NOT enough to mention the title in \`visual_description\`. You MUST write it into \`content.title\`.
2.  **FALLBACK**: If you cannot find a colon-separated title, use the first line of the slide as the \`title\`.
3.  **VERIFICATION**: Before outputting JSON, check: Does every content slide have a \`title\` field? If not, fix it.
4.  **MULTI-MEDIA FOCUS**: You have been provided with multiple files. You MUST scan and acknowledge ALL files provided (text, PDF, AND Images). Do NOT ignore images if a PDF is present, and vice versa. Integrate information from ALL sources.${logoRule}
**IGNORE UI SETTINGS**: Ignore total_pages parameter. Use exact number of slides from input. Do NOT add any extra slides.
🛑 CRITICAL: DO NOT under any circumstances generate a "deep_reflection" slide. Only generate "content_page" slides exactly matching the input text blocks.

`;
    } else {
      // --- STANDARD AI GENERATION MODE ---
      const brandPrompt = `
      [BRAND ASSETS]
      - Brand Voice: ${SlideAgentState.brandVoice || "Professional & Balanced"}
      - Use Logo: ${SlideAgentState.useLogo ? "YES (" + SlideAgentState.logoName + ")" : "NO"}
      - Use Character IP: ${SlideAgentState.useCharacterIp ? "YES (" + SlideAgentState.characterIpName + ")" : "NO"}
      `;

      systemPrompt = `
You are an expert presentation architect (SlideAgent V10).
Action: Generate a "Construction Blueprint" JSON for a presentation.

${brandPrompt}

**Context:**
- **Speaker Persona**: ${personaContext}
- **Goal Structure**: ${goalContext}
- **Style**: ${visualKeywords}
- **Stage Level**: ${stageContext}
- **Tone**: ${toneContext}
- **Total Pages Target**: ${params.pages === 'auto' ? 'AI to determine optimal length' : params.pages}

**Directives:**
1. **Writing Style & Tone (CRITICAL & NON-NEGOTIABLE)**:
    -   You MUST strictly adopt the requested Tone (${params.tone}).
    -   Current Tone Rule: ${toneContext}
    -   Every single sentence in \`script\`, \`key_points\`, and \`deep_reflection\` MUST sound like spoken words matching this exact style. Do not use generic AI corporate speak. Violating this tone is a failure.
    -   **ALL generated text MUST be in Traditional Chinese (繁體中文). Do not output English.**
2. **Filename**: Create a unique, descriptive filename (under 10 Traditional Chinese characters) representing the specific topic (e.g. "光合作用_國中生物"). Do not include extension.
${pageDisciplineRule}
4. **Content Depth**: 
   - **Adhere strictly to the Stage Level description above.**
   - "key_points" should be detailed and substantial (avoid short phrases).
   - "visual_description" should be vivid and suitable for AI image generation.${logoRule}
5. **Structure**: Slide 1 is 'cover', ${UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? "Last is 'deep_reflection', " : ""}Middle are 'content_page'${UI.elements.autoConclusion && UI.elements.autoConclusion.checked ? "" : " (or all remaining are 'content_page')"}.
6. **Layout Strategy (Structured Variety)**:
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

**Strict Output Format (JSON ONLY):**
{
  "presentation_data": {
    "suggested_filename": "10-char_max_chinese_filename",
    "global_design": {
      "style_name": "${params.style}",
      "visual_keywords": "${visualKeywords}",
      "target_audience": "${params.identity}",
      "learning_stage": "${params.stage}",
      "tone": "${params.tone}",
      "total_pages": ${totalPagesTemplate},
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
    let lastError;

    for (const apiKey of apiKeys) {
      const model = 'gemini-2.5-flash';
      if (SlideAgentState.abortController?.signal?.aborted) break;

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
          signal: SlideAgentState.abortController?.signal
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errorMsg = errData.error?.message || response.statusText;
          if (response.status === 400 && (errorMsg.includes('API key') || errorMsg.includes('key not valid'))) {
            throw new Error(`INVALID_KEY: ${errorMsg}`);
          }
          if (response.status === 429) {
            throw new Error(`QUOTA_EXCEEDED: ${errorMsg}`);
          }
          throw new Error(`MODEL_ERROR: ${errorMsg}`);
        }

        const responseData = await response.json();
        let rawText = '';
        if (responseData.candidates && responseData.candidates.length > 0) {
          rawText = responseData.candidates[0].content.parts[0].text;
        } else {
          throw new Error("AI API failed to return any valid candidates.");
        }

        const jsonStr = rawText.replace(/^```json\s*|\s*```$/g, '').trim();
        let jsonData = JSON.parse(jsonStr);

        // NUCLEAR FALLBACK: Enforce Title Integrity Programmatically
        if (jsonData.presentation_data && jsonData.presentation_data.slides) {
          jsonData.presentation_data.slides.forEach((slide, idx) => {
            if (slide.type === 'content_page' && slide.content) {
              if (!slide.content.title || slide.content.title.includes("EXTRACTED TITLE") || slide.content.title.trim() === "") {
                if (slide.content.key_points && slide.content.key_points.length > 0) {
                  slide.content.title = slide.content.key_points.shift();
                } else {
                  slide.content.title = `Slide ${idx + 1} `;
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
            signal: SlideAgentState.abortController?.signal
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
            console.warn("Deep Optimization API call failed. Falling back to original.");
          }
        }

        return this.convertDataToArtifacts(jsonData);

      } catch (e) {
        lastError = e;
        console.warn(`Failed: ${model} - ${e.message}`);
        if (e.name === 'AbortError') throw e;

        if (e.message.startsWith('INVALID_KEY') || e.message.startsWith('QUOTA_EXCEEDED')) {
          continue; 
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

      html += `<div class="slide-block mb-12 p-6 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow relative" data-type="${slide.type}">`;

      // Header
      html += `<div class="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                        <div class="flex items-center gap-2">`;
      // Only show move and regen buttons if it's not a cover
      if (slide.type !== 'cover') {
        html += `         <div class="flex flex-col gap-0.5 mr-2">
                               <button class="move-up-btn text-slate-300 hover:text-brand-600 p-0.5 rounded transition-colors" title="往上移" data-action="up">
                                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                               </button>
                               <button class="move-down-btn text-slate-300 hover:text-brand-600 p-0.5 rounded transition-colors" title="往下移" data-action="down">
                                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                               </button>
                           </div>
                           <button class="magic-wand-btn text-brand-400 hover:text-brand-600 hover:bg-brand-50 p-1.5 rounded-lg transition-colors mr-2 flex items-center gap-1 border border-transparent hover:border-brand-200" title="單頁魔法修改">
                               🪄
                           </button>`;
      }

      html += `            <span class="slide-number text-xs font-bold text-slate-400 uppercase tracking-wider">Slide ${index + 1} - ${typeLabel}</span>
                        </div>
                        <span class="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded">${slide.layout_style || 'Standard'}</span>
                     </div>`;

      // Content Editing Fields
      const content = slide.content || {}; // Safety check for malformed JSON

      if (slide.type === 'cover') {
        html += `<div class="space-y-4">
                            <div><label class="block text-xs font-semibold text-slate-500 mb-1">主標題 (Title)</label>
                            <h2 class="text-2xl font-bold text-slate-800 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="title">${content.title || '無標題'}</h2></div>
                            <div><label class="block text-xs font-semibold text-slate-500 mb-1">副標題 (Subtitle)</label>
                            <h3 class="text-xl text-slate-600 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="subtitle">${content.subtitle || ''}</h3></div>
                         </div>`;
      } else if (slide.type === 'deep_reflection') {
        html += `<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="bg-red-50 p-4 rounded-lg"><h4 class="font-bold text-red-800 mb-2">反駁</h4><p class="text-sm text-red-900 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="rebuttal">${content.rebuttal || ''}</p></div>
                            <div class="bg-yellow-50 p-4 rounded-lg"><h4 class="font-bold text-yellow-800 mb-2">挑戰</h4><p class="text-sm text-yellow-900 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="challenge">${content.challenge || ''}</p></div>
                            <div class="bg-green-50 p-4 rounded-lg"><h4 class="font-bold text-green-800 mb-2">說服</h4><p class="text-sm text-green-900 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="persuasion">${content.persuasion || ''}</p></div>
                         </div>`;
      } else {
        html += `<div class="space-y-4">
                            <div><label class="block text-xs font-semibold text-slate-500 mb-1">標題 (Title)</label>
                            <h3 class="text-xl font-bold text-slate-800 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="title">${content.title || 'Slide Title'}</h3></div>
                            <div><label class="block text-xs font-semibold text-slate-500 mb-1">重點 (Key Points)</label>
                            <ul class="list-disc pl-5 space-y-2">`;

        (content.key_points || []).forEach(point => {
          html += `<li class="text-slate-700 outline-none focus:bg-white p-1 rounded" contenteditable="true" data-field="point">${point}</li>`;
        });

        html += `</ul></div>
                          ${slide.content.script ? `<div class="mt-4"><label class="block text-xs font-semibold text-slate-500 mb-1">🗣️ 講者備忘 (Script)</label><div class="p-3 bg-slate-100 rounded-lg text-xs text-slate-600 font-mono outline-none focus:bg-white" contenteditable="true" data-field="script">${slide.content.script}</div></div>` : ''}
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
  },

  /**
   * Style Scraper AI Logic (Enhanced 4.1)
   */
  async analyzeStyleFromUrl(url) {
    if (!url) return null;
    
    UI.setLoading(true, "正在分析美學連結...", "AI 正在進行連結逆向美學深度掃描");
    
    try {
      // Robust prompting with clearer failover
      const prompt = `
        你是一個資深前瞻美學分析師。請針對以下連結進行視覺設計「逆向工程」分析。
        連結：${url}
        
        請根據網域品牌特徵或連結中蘊含的美學線索，推導出適配的簡報視覺參數。
        請輸出一個包含以下參數的 JSON 物件：
        
        1. primaryColor: 主色 (HEX)
        2. secondaryColor: 輔助色 (HEX)
        3. fontVibe: 字體氛圍 (如: 現代無襯線, 報紙排版感, 未來主義風)
        4. backgroundColor: 背景建色 (HEX)
        5. styleDescriptor: 給生成 AI 的風格詳細描述 (包含佈局節奏、光影感、邊框特徵等)
        
        請僅輸出 JSON 回覆。若該網域未知，請基於連結關鍵字推測一個最有質感的風格。
      `;

      const response = await this.generateWithGeminiRaw([{ text: prompt }], "application/json");
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
          const styleData = JSON.parse(jsonMatch[0]);
          SlideAgentState.currentScrapedStyle = styleData;
          return styleData;
      }
      throw new Error("AI failed to extract aesthetic JSON from URL analysis.");
    } catch (error) {
      console.error("Scrape URL Error:", error);
      throw error;
    } finally {
      UI.setLoading(false);
    }
  },

  /**
   * Image-based Style Scraper (New 4.1 Vision Logic)
   */
  async analyzeStyleFromImage(imageBase64) {
    if (!imageBase64) return null;

    UI.setLoading(true, "正在解析圖片美學...", "AI 正在從圖片中提取色彩分佈與排版節奏");

    try {
      const prompt = `你是一個資深美學總監。請分析這張圖片的視覺特徵。
      請識別其：
      1. 配色方案 (HEX)
      2. 畫風/材質/光影特有氛圍
      3. 字體建議類型
      
      請輸出一個包含以下參數的 JSON 物件：
      {
        "primaryColor": "HEX",
        "secondaryColor": "HEX",
        "fontVibe": "描述",
        "backgroundColor": "HEX",
        "styleDescriptor": "給 AI 的視覺生成咒語 (詳細)"
      }
      請僅輸出 JSON。`;

      const mimeMatch = imageBase64.match(/^data:([^;]+);/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      
      const parts = [
        { text: prompt },
        { inlineData: { mimeType: mimeType, data: imageBase64.split(',')[1] } }
      ];

      // Use Gemini 1.5 Pro or Flash (Vision enabled)
      const response = await this.generateWithGeminiRaw(parts, "application/json");
      const jsonStr = response.replace(/^```json\s*|\s*```$/g, '').trim();
      const styleData = JSON.parse(jsonStr);
      
      SlideAgentState.currentScrapedStyle = styleData;
      return styleData;
    } catch (error) {
      console.error("Scrape Image Error:", error);
      throw error;
    } finally {
      UI.setLoading(false);
    }
  },

  /**
   * Helper for generic JSON generation
   */
  async generateWithGeminiRaw(parts, mimeType = "text/plain") {
    let apiKeys = [...SlideAgentState.apiKeys];
    
    // Auto-recovery: If memory state is empty, try to reload from localStorage
    if (apiKeys.length === 0) {
      const stored = localStorage.getItem('slideAgent_apiKeys');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            apiKeys = parsed;
            SlideAgentState.apiKeys = parsed; // Sync back to singleton
            console.log("AI Module: Successfully recovered API Keys from localStorage.");
          }
        } catch (e) {
          console.warn("AI Module: Failed to recover keys from localStorage", e);
        }
      }
    }

    if (apiKeys.length === 0) throw new Error("API Key Missing");

    let lastError;
    for (const apiKey of apiKeys) {
      const model = 'gemini-2.5-flash';
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: parts }],
            generationConfig: { response_mime_type: mimeType }
          }),
          signal: SlideAgentState.abortController?.signal
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || response.statusText);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      } catch (e) {
        lastError = e;
        console.warn(`Raw call failed for gemini-2.5-flash: ${e.message}`);
        if (e.name === 'AbortError') throw e;
      }
    }
    throw lastError || new Error("AI Request Failed after multiple attempts");
  }
};
