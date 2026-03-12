/**
 * SlideAgent - Config & State
 */
export const SlideAgentState = {
    apiKeys: [],
    uploadedFiles: [],
    isGenerating: false,
    abortController: null,
    abortController: null,
    currentFilename: null, // Added to track filename from AI
    generationMode: 'auto', // 'auto' | 'direct'
    useLogo: false,
    logoName: '', // Used for global logo/watermark injection

    // AI Visual Keyword Mapping (StyleMap)
    StyleMap: {
        // 一、 專業與商務邏輯
        "minimalist": "Extreme minimalist editorial design, vast breathing white space, razor-sharp monochrome tones, high-end architectural photography style, mathematically precise composition --ar 16:9",
        "warm_pro": "Soft enveloping studio lighting, warm oat and slate grey tones, clean Scandinavian corporate aesthetic, high quality professional photography, shallow depth of field --ar 16:9",
        "executive": "Executive C-suite presentation style, subtle metallic gradients, premium matte textures, sophisticated low-key lighting, high-end professional photography --ar 16:9",
        "data_driven": "Data visualization system, interactive UI charts, glowing isometric infographic elements, professional graphs on cool grey background, modern fintech corporate aesthetic --ar 16:9",
        "monochrome": "Strict monochrome color palette, varying shades of a single defining color, elegant geometric unity, dramatic high contrast lighting, museum exhibit minimalism --ar 16:9",
        "high_contrast": "Aggressive high contrast, bold brutalist black typography against pure white and hazard yellow, striking offset composition, highly legible and tense --ar 16:9",
        "flat_design": "Modern flat UI illustration style, pure solid colored blocks, crisp vector shapes, absolutely no shadows or gradients, clean Swiss design grid --ar 16:9",

        // 二、 現代科技與未來派
        "modern": "Modern sleek technology launch, holographic 3D gradients, flowing organic lines against deep dark background, cutting-edge futuristic product presentation style --ar 16:9",
        "apple_style": "Apple-esque product design language, pure light grey background, extreme uncluttered minimalism, perfectly centered heroic composition, premium studio rim lighting --ar 16:9",
        "dark_mode": "Premium dark mode UI, glowing metallic accents on Vantablack, subtle luminous neon edges, professional and sleek developer aesthetic --ar 16:9",
        "minimal_tech": "Futuristic clean laboratory aesthetic, neon cyan and violet wireframe lines, isometric 3D vector art, complex data mesh visualization, sterile white background --ar 16:9",
        "cyberpunk": "Cyberpunk dystopia style, neon magenta and turquoise extreme contrast, glowing CRT elements on pitch dark background, gritty synthwave hacker aesthetic --ar 16:9",
        "neon_glow": "Intense neon glow effect, absolute black background with bright luminous borders, glowing typography, highly energetic light painting, striking visual impact --ar 16:9",

        // 三、 UI 介面與材質質感
        "glassmorphism": "Glassmorphism UI style, frosted glass card effect, macro photography blur, semi-transparent overlapping layers, soft colorful background bokeh, modern app interface depth --ar 16:9",
        "liquid_glass": "Liquid glass organic texture, fluid semi-transparent 3D shapes, smooth pastel water gradients, futuristic UI concept, clean glossy caustics --ar 16:9",
        "neumorphism": "Neumorphism style, soft UI elements extruded from the background, matte soft plastic look, low contrast subtle shadows, highly tactile and smooth surface --ar 16:9",
        "material_design": "Google Material design physical paper style, layered card-based layout, bold solid ink colors, realistic physical drop shadows, clear structural hierarchy --ar 16:9",

        // 四、 敘事與資訊視覺化
        "visual_story": "Cinematic documentary photography, full-frame high resolution, evocative narrative storytelling composition, emotional lighting depth, photorealistic --ar 16:9",
        "timeline": "Timeline visualization, clear ascending chronological flow, glowing milestone markers, structured data presentation, clean architectural lines and nodes --ar 16:9",
        "infographic": "Complex infographic diagram spread, clean flat vector data visualization, isometric interconnected flowcharts, educational and informative modular flat art --ar 16:9",

        // 五、 藝術美學與次文化潮流
        "luxury_aesthetic": "Luxury prestige aesthetic, deep velvet black and antique gold palette, subtle rose gold foil accents, elegant serif typography layouts, premium high-end expensive look --ar 16:9",
        "retro_poster": "Vintage mid-century minimalist poster design, Swiss Bauhaus style, bold typography, limited offset printing palette (red, cream, blue), grain texture paper --ar 16:9",
        "neo_brutalism": "Neo-brutalism web design, bold raw primary color blocks, thick Sharpie black outlines, intentionally unpolished look, high tension flat colors, anti-design --ar 16:9",
        "memphis_design": "Memphis Group 80s design style, bold clashing colors, irregular geometric floating shapes, squiggly lines & halftone dots patterns, playful and energetic retro --ar 16:9",
        "y2k_aesthetic": "Y2K millennium aesthetic, liquid metallic textures, bubble typography, low-res pixel graphic elements, retro-futuristic early 2000s cyber vibe, holographic colors --ar 16:9",
        "retro_collage": "Mixed media analog collage art, vintage yellowed paper textures, cut-out black-and-white photos from the 1950s, dadaism style, grainy film texture --ar 16:9",
        "punk_collage": "Punk rock DIY collage, torn paper edges, rough grunge textures, mixed media cut-outs, halftone dots, high tension rebellious underground zine style --ar 16:9",

        // 六、 溫馨生活與插畫風格
        "scandinavian": "Scandinavian interior design style, warm raw wood tones, minimal beige and earthy neutral hue palette, natural soft daylighting, relaxing and cozy hygge lifestyle --ar 16:9",
        "vintage": "Vintage nostalgia aesthetic, warm sepia and brown tones, heavy 35mm film grain, aged parchment paper texture, sentimental atmosphere, classic retro photography --ar 16:9",
        "soft_pastel": "Soft baby pastel colors, ultra-low saturation macaron palette, dreamy and gentle nursery atmosphere, light and airy composition, ethereal volumetric lighting --ar 16:9",
        "watercolor": "Watercolor wash painting, artistic fluid brush strokes, bleeding wet-on-wet technique, soft pastel pigments, thick textured watercolor paper background, dreamy atmosphere --ar 16:9",
        "playful": "Playful and fun kindergarten design, vibrant primary colors, bouncy cartoonish geometric elements, highly energetic and cheerful pure vector illustration --ar 16:9",
        "cute_q": "3D cute render, chibi style characters, soft pillowed rounded shapes, bright primary colors, matte plasticine texture, Pixar-inspired studio lighting, vinyl blind box toy style --ar 16:9",
        "hand_drawn": "One-line drawing and crayon shading texture on rough sketchbook paper, soft pastel colors, naive emotional art style, cute and friendly, child-like organic imagination --ar 16:9",
        "clay_3d": "Stop-motion claymation style, thick plasticine texture, physical fingerprints visible on clay surface, soft macro studio lighting, rounded edges, playful crafted look --ar 16:9",
        "edu_comic": "Educational comic strip layout, bold crisp black ink outlines, flat vibrant screen-tone colors, dynamic speech bubbles, retro comic ben-day dots background --ar 16:9",
        "paper_cut": "Layered diorama paper cut-out art, physical depth of field, sharp cast shadows between distinct layers, clean origami style, rich craft paper texture board --ar 16:9"
    },

    // Typography Mapping
    FontMap: {
        // 一、 專業與商務邏輯
        "minimalist": { title: "Helvetica Neue", body: "Helvetica", weight: "300" },
        "warm_pro": { title: "Noto Sans TC", body: "Noto Sans TC", weight: "Bold" }, // 專業黑體
        "executive": { title: "Cinzel", body: "Open Sans", weight: "700" },
        "data_driven": { title: "Inter", body: "Inter", weight: "600" },
        "monochrome": { title: "Arial", body: "Arial", weight: "Normal" },
        "high_contrast": { title: "Impact", body: "Verdana", weight: "900" },
        "flat_design": { title: "Lato", body: "Lato", weight: "Bold" },

        // 二、 現代科技與未來派
        "modern": { title: "Montserrat", body: "Montserrat", weight: "800" },
        "apple_style": { title: "-apple-system, BlinkMacSystemFont", body: "-apple-system", weight: "500" },
        "dark_mode": { title: "Roboto", body: "Roboto", weight: "Medium" },
        "minimal_tech": { title: "Roboto Mono", body: "Roboto", weight: "700" }, // 科技等寬
        "cyberpunk": { title: "Share Tech Mono", body: "Open Sans", weight: "Bold" },
        "neon_glow": { title: "VT323", body: "Courier New", weight: "Normal" },

        // 三、 UI 介面與材質質感
        "glassmorphism": { title: "Outfit", body: "Outfit", weight: "300" },
        "liquid_glass": { title: "Nunito", body: "Nunito", weight: "400" },
        "neumorphism": { title: "Poppins", body: "Poppins", weight: "500" },
        "material_design": { title: "Roboto", body: "Roboto", weight: "500" },

        // 四、 敘事與資訊視覺化
        "visual_story": { title: "Playfair Display", body: "Lora", weight: "Bold" },
        "timeline": { title: "Ubuntu", body: "Ubuntu", weight: "Medium" },
        "infographic": { title: "PT Sans", body: "PT Sans", weight: "Bold" },

        // 五、 藝術美學與次文化潮流
        "luxury_aesthetic": { title: "Cormorant Garamond", body: "Montserrat", weight: "600" },
        "retro_poster": { title: "Oswald", body: "Open Sans", weight: "Bold" }, // 海報粗體
        "neo_brutalism": { title: "Bebas Neue", body: "Space Mono", weight: "900" },
        "memphis_design": { title: "Righteous", body: "Quicksand", weight: "Bold" },
        "y2k_aesthetic": { title: "Silkscreen", body: "Comic Sans MS", weight: "Normal" },
        "retro_collage": { title: "Times New Roman", body: "Courier New", weight: "Bold" }, // 復古襯線
        "punk_collage": { title: "Permanent Marker", body: "Courier New", weight: "Bold" },

        // 六、 溫馨生活與插畫風格
        "scandinavian": { title: "Quicksand", body: "Quicksand", weight: "300" },
        "vintage": { title: "Merriweather", body: "Lora", weight: "Normal" },
        "soft_pastel": { title: "Delius", body: "Patrick Hand", weight: "Normal" },
        "watercolor": { title: "Noto Serif TC", body: "Noto Sans TC", weight: "600" }, // 藝術宋體
        "playful": { title: "Fredoka", body: "Fredoka", weight: "600" },
        "cute_q": { title: "Varela Round", body: "Varela Round", weight: "Bold" }, // 圓潤字體
        "hand_drawn": { title: "Caveat", body: "Comic Sans MS", weight: "Normal" }, // 手寫風
        "clay_3d": { title: "Varela Round", body: "Nunito", weight: "800" }, // 童趣圓體
        "edu_comic": { title: "Bangers", body: "Comic Sans MS", weight: "Regular" }, // 漫畫字體
        "paper_cut": { title: "Montserrat", body: "Roboto", weight: "Bold" } // 剪紙幾何
    },

    // Color Palette Mapping (V13.2 Semantic 5-Color System)
    ColorMap: {
        // 一、 專業與商務邏輯
        "minimalist": {
            background: { hex: "#FFFFFF", role: "純淨背景，提供最高的閱讀清晰度" },
            primary_text: { hex: "#1A1A1A", role: "取代純黑的深灰，柔和但對比強烈的主骨架與文字" },
            primary_accent: { hex: "#E5E5E5", role: "極簡的淺灰，用於細微的區塊劃分與次要元素" },
            secondary_accent: { hex: "#737373", role: "中性灰，用於輔助說明與去焦點化資訊" },
            surface: { hex: "#F5F5F5", role: "用於卡片背景，創造極微弱的層次感" }
        },
        "warm_pro": {
            background: { hex: "#FDFBF7", role: "溫暖的米白底色，降低視覺疲勞並增加親和力" },
            primary_text: { hex: "#2C3E50", role: "深藍灰的主視覺與標題，展現沉穩專業" },
            primary_accent: { hex: "#D68C5E", role: "溫暖的赤土色，用於熱情而克制的視覺強調" },
            secondary_accent: { hex: "#8BA1B1", role: "冷靜的灰藍，用於圖表與數據的輔助說明" },
            surface: { hex: "#FFFFFF", role: "純白卡片面，讓內容在暖底上浮現出來" }
        },
        "executive": {
            background: { hex: "#FAFAFA", role: "極簡明亮的執行長報告底片" },
            primary_text: { hex: "#0F2027", role: "極深的午夜藍，帶來無庸置疑的權威感" },
            primary_accent: { hex: "#C5A880", role: "內斂的香檳金，用於高級質感的點綴與高亮" },
            secondary_accent: { hex: "#5C6B73", role: "沉穩的鐵灰，支撐數據與次要資訊" },
            surface: { hex: "#FFFFFF", role: "銳利的白色卡片區塊" }
        },
        "data_driven": {
            background: { hex: "#F3F4F6", role: "清晰乾淨的儀表板冷灰背景" },
            primary_text: { hex: "#1F2937", role: "高對比的深灰標題與內文" },
            primary_accent: { hex: "#3B82F6", role: "充滿活力的數據藍，用於強調核心指標" },
            secondary_accent: { hex: "#10B981", role: "正向代表成長的翡翠綠，用於趨勢圖與次重點" },
            surface: { hex: "#FFFFFF", role: "承載圖表的獨立純白區塊" }
        },
        "monochrome": {
            background: { hex: "#FFFFFF", role: "無瑕疵的純白空間" },
            primary_text: { hex: "#000000", role: "極致對比的純黑，產生強烈的幾何切割感" },
            primary_accent: { hex: "#808080", role: "中性灰，作為畫面黑白之間的唯一緩衝" },
            secondary_accent: { hex: "#404040", role: "深灰，用於次級結構的搭建" },
            surface: { hex: "#F0F0F0", role: "微灰的層次表面" }
        },
        "high_contrast": {
            background: { hex: "#FFD700", role: "極具侵略性與警示意味的危險黃背景" },
            primary_text: { hex: "#000000", role: "不容忽視的純黑粗體字" },
            primary_accent: { hex: "#FFFFFF", role: "高亮度的純白，用於切出黑與黃之間的空間" },
            secondary_accent: { hex: "#E5C100", role: "暗黃色色階，用於背景圖案與暗部" },
            surface: { hex: "#000000", role: "黑色卡片搭配反白文字，創造劇烈落差" }
        },
        "flat_design": {
            background: { hex: "#F5F6FA", role: "現代 UI 的經典淺雪白底色" },
            primary_text: { hex: "#2D3436", role: "扁平化設計常用的深邃灰黑" },
            primary_accent: { hex: "#0984E3", role: "明亮活潑的數位藍，引導視覺焦點" },
            secondary_accent: { hex: "#00B894", role: "鮮明的薄荷綠，用於狀態、流程的第二維度" },
            surface: { hex: "#FFFFFF", role: "扁平的純白卡片區塊" }
        },

        // 二、 現代科技與未來派
        "modern": {
            background: { hex: "#1E1E24", role: "深邃的科技暗色系，不是純黑的太空灰" },
            primary_text: { hex: "#FFFFFF", role: "發光的純白文字，在暗色背景上最為醒目" },
            primary_accent: { hex: "#00E5FF", role: "未來感十足的青色霓虹光，用於線條與核心亮點" },
            secondary_accent: { hex: "#7E57C2", role: "深紫色，提供科技感的深度與神祕感" },
            surface: { hex: "#2B2D42", role: "比背景稍微浮起的深灰藍卡片" }
        },
        "apple_style": {
            background: { hex: "#F5F5F7", role: "極簡的蘋果產品展示用淺灰白底色" },
            primary_text: { hex: "#1D1D1F", role: "深沉克制的高質感鈦黑" },
            primary_accent: { hex: "#0071E3", role: "經典的蘋果按鈕藍，用於唯一的互動與重點色" },
            secondary_accent: { hex: "#86868B", role: "冷峻的金屬灰，用於次要說明文字" },
            surface: { hex: "#FFFFFF", role: "圓角純白展示區塊" }
        },
        "dark_mode": {
            background: { hex: "#121212", role: "嚴格遵守深色模式規範的近黑底層" },
            primary_text: { hex: "#E0E0E0", role: "舒適的不刺眼淺灰文字" },
            primary_accent: { hex: "#BB86FC", role: "Material Dark 經典的高明度紫，抓住眼球" },
            secondary_accent: { hex: "#03DAC6", role: "鮮明的藍綠輔助色，用於次重點標示" },
            surface: { hex: "#1E1E1E", role: "輕微提升亮度的次級深黑色區塊" }
        },
        "minimal_tech": {
            background: { hex: "#FAFAFA", role: "乾淨無菌的實驗室白" },
            primary_text: { hex: "#333333", role: "理性的深灰色線條與小字體" },
            primary_accent: { hex: "#4A90E2", role: "冷靜分析的科技藍色" },
            secondary_accent: { hex: "#D3D3D3", role: "極淺的網格與裝飾線灰" },
            surface: { hex: "#FFFFFF", role: "與背景邊界模糊的純白區塊" }
        },
        "cyberpunk": {
            background: { hex: "#0B0C10", role: "反烏托邦的底層黑暗" },
            primary_text: { hex: "#FCEE0A", role: "高飽和度、極具張力的警告黃文字" },
            primary_accent: { hex: "#FF003C", role: "具備攻擊性與未來感的霓虹紅" },
            secondary_accent: { hex: "#00F0FF", role: "賽博空間的電子青色" },
            surface: { hex: "#1F2833", role: "帶有金屬粗糙感的深色鋼鐵區塊" }
        },
        "neon_glow": {
            background: { hex: "#050505", role: "吸收所有光線的深邃黑洞" },
            primary_text: { hex: "#FFFFFF", role: "如燈管般發亮的核心文字" },
            primary_accent: { hex: "#39FF14", role: "極度飽和的螢光綠光暈" },
            secondary_accent: { hex: "#FF00FF", role: "充滿迷幻感的洋紅光線" },
            surface: { hex: "#1A1A1A", role: "無光澤的黑色底座" }
        },

        // 三、 UI 介面與材質質感
        "glassmorphism": {
            background: { hex: "#F0F0F3", role: "充滿光影變化的淺色毛玻璃環境背景" },
            primary_text: { hex: "#1F2937", role: "清晰的深灰前景色，保證在模糊背景上的閱讀性" },
            primary_accent: { hex: "#8B5CF6", role: "作為玻璃透射出的生動紫色主色調" },
            secondary_accent: { hex: "#EC4899", role: "融入環境的粉色次要光暈色" },
            surface: { hex: "#FFFFFF", role: "模擬高透明度毛玻璃的白色卡片表面" }
        },
        "liquid_glass": {
            background: { hex: "#A2C2E1", role: "充滿流動感的水藍色環境底色" },
            primary_text: { hex: "#FFFFFF", role: "明亮乾淨的純白文字，如水面反光" },
            primary_accent: { hex: "#D1E8E2", role: "清透的薄荷綠，增添水波的層次感" },
            secondary_accent: { hex: "#4682B4", role: "較深的鋼青色，用於勾勒液體的深度" },
            surface: { hex: "#EAF3F8", role: "高反光面的平滑淺色區塊" }
        },
        "neumorphism": {
            background: { hex: "#E0E5EC", role: "新擬物化專用的完美中性偏冷灰背景" },
            primary_text: { hex: "#4B5563", role: "如同刻在素麵上的深灰色文字" },
            primary_accent: { hex: "#9CA3AF", role: "用於描繪內外陰影邊緣的中性點綴" },
            secondary_accent: { hex: "#3B82F6", role: "低調的深藍色，僅用於最關鍵的指示燈號" },
            surface: { hex: "#E0E5EC", role: "與背景同色的隆起表面，純靠陰影辨識" }
        },
        "material_design": {
            background: { hex: "#FAFAFA", role: "標準 Material 設計的底層紙張質感白" },
            primary_text: { hex: "#212121", role: "高對比的接近純黑主要文字" },
            primary_accent: { hex: "#6200EE", role: "強烈且統一的 Material 經典紫色，引導操作" },
            secondary_accent: { hex: "#03DAC6", role: "清脆的青綠色，用於狀態切換與輔助說明" },
            surface: { hex: "#FFFFFF", role: "漂浮在 Z 軸上的純白紙片卡" }
        },

        // 四、 敘事與資訊視覺化
        "visual_story": {
            background: { hex: "#F9F6F0", role: "帶有羊皮紙溫度的米黃敘事底色" },
            primary_text: { hex: "#2C3E50", role: "穩重且充滿墨水質感的深藍黑色" },
            primary_accent: { hex: "#E74C3C", role: "如印章或硃砂般的情緒轉折紅色" },
            secondary_accent: { hex: "#D35400", role: "溫暖的南瓜橘，增加故事插圖的豐富度" },
            surface: { hex: "#FFFFFF", role: "純淨的畫面留白區塊" }
        },
        "timeline": {
            background: { hex: "#ECF0F1", role: "乾淨、能拉長時空感的淺冰灰背景" },
            primary_text: { hex: "#34495E", role: "冷靜客觀的深藍灰紀實文字" },
            primary_accent: { hex: "#2ECC71", role: "代表進展與生命力的鮮豔綠色軌道" },
            secondary_accent: { hex: "#F1C40F", role: "用來標記歷史亮點的暖黃色" },
            surface: { hex: "#FFFFFF", role: "承載單一事件的純白卡片節點" }
        },
        "infographic": {
            background: { hex: "#DFE6E9", role: "適合放置大量數據模組的微藍灰色空間" },
            primary_text: { hex: "#2D3436", role: "強烈但不過度銳利的深色資訊文字" },
            primary_accent: { hex: "#00CEC9", role: "清新引人注目的綠松石焦點色" },
            secondary_accent: { hex: "#FD79A8", role: "明顯的對比粉色，用於分類數據與反差圓餅圖" },
            surface: { hex: "#FFFFFF", role: "框住各種獨立圖表的乾淨白底板" }
        },

        // 五、 藝術美學與次文化潮流
        "luxury_aesthetic": {
            background: { hex: "#1C1C1C", role: "頂級會員制俱樂部般深邃無邊的消光黑" },
            primary_text: { hex: "#D4AF37", role: "象徵尊爵與歷史底蘊的古董金屬金色" },
            primary_accent: { hex: "#8B0000", role: "低調奢華的深酒紅色天鵝絨質感色" },
            secondary_accent: { hex: "#C0C0C0", role: "優雅冷冽的白銀色，作為第二點綴" },
            surface: { hex: "#2C2C2C", role: "帶有微弱絲帶質感的深鐵灰色底盤" }
        },
        "retro_poster": {
            background: { hex: "#F5E6CC", role: "存放多年、帶有泛黃顆粒感的粗糙海報紙底" },
            primary_text: { hex: "#2B2B2B", role: "老式印刷機壓印的粗墨黑字" },
            primary_accent: { hex: "#D32F2F", role: "強烈飽和、用來呼籲口號的革命紅色" },
            secondary_accent: { hex: "#1976D2", role: "經典而略帶褪色的復古水手藍" },
            surface: { hex: "#FFF3E0", role: "保留給大量文字的溫暖淺橘底框" }
        },
        "neo_brutalism": {
            background: { hex: "#FFFFFF", role: "刻意暴力的毫無修飾的慘白背景" },
            primary_text: { hex: "#000000", role: "粗壯、壓迫感極重的純黑墨水線條與文字" },
            primary_accent: { hex: "#FF0000", role: "刺激眼球、破壞原有平衡的純紅塊面" },
            secondary_accent: { hex: "#0066FF", role: "與純紅對立的強烈純藍，製造視覺噪音" },
            surface: { hex: "#E6E6E6", role: "像是粗糙水泥粉刷的淺粗糙灰色塊" }
        },
        "memphis_design": {
            background: { hex: "#F4F0EB", role: "能襯托強烈對比色的溫和燕麥米底色" },
            primary_text: { hex: "#1A1A1A", role: "幾乎是純黑的高反差主體字，穩定畫面骨架" },
            primary_accent: { hex: "#FF4757", role: "活潑具跳躍感的西瓜紅幾何圖形色" },
            secondary_accent: { hex: "#FFA502", role: "不講理且高飽和的亮橘黃色點綴色" },
            surface: { hex: "#FFFFFF", role: "具有粗黑邊框的搶眼白卡片表面" }
        },
        "y2k_aesthetic": {
            background: { hex: "#16003B", role: "兩千年初期帶有未來神祕感的紫黑色太空底" },
            primary_text: { hex: "#FFFFFF", role: "反光面極度清晰的高亮純白字型" },
            primary_accent: { hex: "#FF00FF", role: "代表俗氣又迷離的極限洋紅螢光色" },
            secondary_accent: { hex: "#00FFFF", role: "如早期電腦螢幕發出的銳利青綠射線色" },
            surface: { hex: "#2A0054", role: "閃耀著液態金屬光澤的深紫色果凍光表面" }
        },
        "retro_collage": {
            background: { hex: "#EFEBE1", role: "老舊剪報簿或手札的厚實米灰紙質" },
            primary_text: { hex: "#3E2723", role: "如同過期黑白報紙般褪色的深褐色墨印" },
            primary_accent: { hex: "#FF8A65", role: "復古廣告單剪下來的溫暖鮭魚亮粉橘色" },
            secondary_accent: { hex: "#607D8B", role: "帶有歲月痕跡的藍灰冷色調點綴" },
            surface: { hex: "#FAFAFA", role: "模擬邊緣撕裂感的粗糙白色拍立得底片" }
        },
        "punk_collage": {
            background: { hex: "#111111", role: "地下樂團塗鴉牆般粗糙的極暗黑背景" },
            primary_text: { hex: "#FFFFFF", role: "如噴漆般噴在黑色牆面上粗獷隨意的白字" },
            primary_accent: { hex: "#E60000", role: "極度反叛、如同破壞般撕裂畫面的血紅色" },
            secondary_accent: { hex: "#FFEA00", role: "警告膠帶般的刺眼毒黃色" },
            surface: { hex: "#222222", role: "由無數張黑色膠帶貼疊出來的層次底盤" }
        },

        // 六、 溫馨生活與插畫風格
        "scandinavian": {
            background: { hex: "#F7F5F0", role: "北歐日光感、極度自然舒適的溫暖白底" },
            primary_text: { hex: "#4A4A4A", role: "低對比的碳灰字體，保持畫面的柔和呼吸感" },
            primary_accent: { hex: "#82937B", role: "如寧靜森林與植物的灰霧鼠尾草綠" },
            secondary_accent: { hex: "#D6C0B3", role: "溫暖如原木傢俱的淺咖大地色" },
            surface: { hex: "#FFFFFF", role: "無瑕、不帶侵略性的純淨留白區塊" }
        },
        "vintage": {
            background: { hex: "#F4ECD8", role: "像是用紅茶染過的舊書頁般的柔軟泛黃色" },
            primary_text: { hex: "#5C4033", role: "充滿歷史感的古老羊皮紙深棕色墨水字" },
            primary_accent: { hex: "#A0522D", role: "經歲月沉澱後依然濃郁的赭紅色圖騰" },
            secondary_accent: { hex: "#8FBC8B", role: "有點褪色的復古暗海綠色邊框" },
            surface: { hex: "#FDFBF7", role: "較為明亮的一張復古明信片白底" }
        },
        "soft_pastel": {
            background: { hex: "#FDF6E3", role: "極度夢幻、毫無稜角的寶寶粉膚色做基底" },
            primary_text: { hex: "#5D5D5D", role: "溫文儒雅的中度灰色文字，絕對不刺眼" },
            primary_accent: { hex: "#FFB6C1", role: "宛如棉花糖般輕盈柔軟的櫻花淺粉紅色" },
            secondary_accent: { hex: "#B0E0E6", role: "如寧靜海洋般舒緩放鬆的粉藍色" },
            surface: { hex: "#FFFFFF", role: "飄浮如雲朵般的乾淨白板" }
        },
        "watercolor": {
            background: { hex: "#FDFBF7", role: "高等級、表面有細微紋理的厚實水彩紙色" },
            primary_text: { hex: "#2F4F4F", role: "充滿藝術家憂鬱氣質的深石板冷灰藍字" },
            primary_accent: { hex: "#66CDAA", role: "隨意揮灑、邊緣因飽含水份而暈開的碧綠透明彩" },
            secondary_accent: { hex: "#F08080", role: "柔和不搶眼、但帶來生氣的淡珊瑚粉暈染" },
            surface: { hex: "#FFFFFF", role: "讓水彩顏料能夠盡情留白的畫布區塊" }
        },
        "playful": {
            background: { hex: "#FFF9E6", role: "充滿童樂氛圍、猶如幼兒園塗鴉牆的暖鵝黃色" },
            primary_text: { hex: "#2D3436", role: "如同大麥克筆寫出的厚實黑色字體" },
            primary_accent: { hex: "#FF6B6B", role: "充滿活蹦亂跳能量的高飽和活力鮮紅" },
            secondary_accent: { hex: "#48DBFB", role: "令人心情愉悅、像藍天一般的糖果藍" },
            surface: { hex: "#FFFFFF", role: "切割出圓潤厚實邊緣的白色學習卡片" }
        },
        "cute_q": {
            background: { hex: "#FFF0F5", role: "甜美得像草莓牛奶糖一般的薰衣草粉色背景" },
            primary_text: { hex: "#5C4B51", role: "不會過度僵硬的深栗子可可色文字" },
            primary_accent: { hex: "#8FC1E3", role: "如同寶寶用品般柔和療癒的嬰兒粉藍" },
            secondary_accent: { hex: "#F3D8C7", role: "可愛粉嫩的膚蜜桃色點綴裝飾" },
            surface: { hex: "#FFFFFF", role: "圓滾滾、毫無銳角的純白雲朵卡" }
        },
        "hand_drawn": {
            background: { hex: "#F7F5E6", role: "溫馨粗糙、如同手作筆記本的米白紙底" },
            primary_text: { hex: "#3B3A36", role: "帶有筆觸斷層感的鉛筆碳灰素描感文字" },
            primary_accent: { hex: "#E8A87C", role: "如色鉛筆輕輕塗抹上去的溫和暖橘色光" },
            secondary_accent: { hex: "#C38D9E", role: "帶一點髒色但不失優雅的灰豆沙紫插畫" },
            surface: { hex: "#FFFFFF", role: "像是隨手撕下的不規則白紙條區塊" }
        },
        "clay_3d": {
            background: { hex: "#F2EBE5", role: "溫潤霧面、帶有漫反射光澤的無毒黏土底桌" },
            primary_text: { hex: "#4F4F4F", role: "像是用模具壓印在黏土上的軟深灰色字" },
            primary_accent: { hex: "#E09E50", role: "Q彈可愛、烤得剛剛好的南瓜橘胖黏土塊" },
            secondary_accent: { hex: "#87A8A4", role: "低飽和度但存在感強烈的莫蘭迪青綠色黏土小球" },
            surface: { hex: "#FAFAFA", role: "作為主體展示、稍微隆起的厚實白色黏土底盤" }
        },
        "edu_comic": {
            background: { hex: "#FFFFFF", role: "乾淨標準的印刷漫畫雜誌白紙底" },
            primary_text: { hex: "#111111", role: "強而有力、帶有速度線與黑體張力的黑色網點字" },
            primary_accent: { hex: "#FFD166", role: "引人注目、如同對話框爆音效的強烈漫畫黃" },
            secondary_accent: { hex: "#EF476F", role: "用於熱血表達與強調動詞的激情桃紅色" },
            surface: { hex: "#F4F4F4", role: "填滿漫畫對話氣泡的極淺網點灰" }
        },
        "paper_cut": {
            background: { hex: "#264653", role: "充滿神秘感與深度的深海青色底層厚紙板" },
            primary_text: { hex: "#FFFFFF", role: "清晰得如同刀片俐落刻穿底版後透出的純白字" },
            primary_accent: { hex: "#E9C46A", role: "對比極強的亮眼暖黃色紙張圖騰層" },
            secondary_accent: { hex: "#F4A261", role: "帶有漸進暖意、襯托黃色的日落橘色紙浮雕" },
            surface: { hex: "#2A9D8F", role: "在背景與前景之間搭建空間層次的湖水綠中層卡紙" }
        }
    }
};
