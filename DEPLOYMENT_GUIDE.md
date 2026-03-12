# SlideAgent 開發與發布工作流指南 (Vite 穩定版)

恭喜！您的專案現在已具備現代化的開發環境與自動化部署流程。為了確保往後更新順利，請遵循以下標準作業流程：

## 1. 本地開發 (Local Development)
當您想要修改程式碼或測試新功能時：

1.  **啟動開發環境**：在終端機執行 `npm run dev`。
2.  **即時預覽**：開啟介面進行開發，Vite 會在您存檔時同步更新網頁（Hot Reload）。
3.  **確認功能**：在本地端確認邏輯、樣式與通知功能皆運作正常。

## 2. 推送更新 (Push to GitHub)
當本地測試完成，準備上傳時：

1.  **開啟 GitHub Desktop**。
2.  **檢查變更**：確認左側列表中僅包含您修改的 `src/` 內檔案（請不要手動修改 `dist/` 內容）。
3.  **填寫資訊**：在左下角填寫 Summary (例如：`新增語音指令功能`)。
4.  **推送分支**：點擊 **Commit**，然後點擊 **Push origin**。
    *   *建議先推送到自己的開發分支（如 `sav2`），確認沒問題再合併。*

## 3. 正式發布 (Production Deploy)
這一步會讓全球使用者看到您的新版本：

1.  **發起合併 (Pull Request)**：
    *   到 GitHub 網頁版點擊 **"Compare & pull request"**。
    *   確認是從 `sav2` 合併到 `main`。
2.  **確認合併 (Merge)**：點擊 **"Merge pull request"** 並 **"Confirm merge"**。
3.  **機器人建置**：
    *   合併後，點擊頂部的 **"Actions"** 標籤。
    *   您會看到一個名為 **"Deploy static content to Pages"** 的任務正在跑。
4.  **檢查綠色勾勾**：當任務顯示綠色勾勾，代表發布成功！

## 4. 驗證線上版本 (Online Verification)
1.  開啟 [您的 GitHub Pages 網址](https://hsuliang.github.io/slideagent/)。
2.  **檢查重點**：
    *   分頁是否有 Logo 圖示。
    *   通知視窗是否為新版的彩色玻璃磨砂感。
    *   如果是舊版，請按 `Ctrl + F5` (或 `Cmd + Shift + R`) 強制刷新瀏覽器緩存。

## 5. 更換電腦後如何繼續開發？ (Switching Computers)
如果您換了一台電腦（例如從辦公室換到家裡），請按照以下步驟重建開發環境：

1.  **安裝必要工具**：
    *   **檢查 Node.js**：
        1.  在您的電腦打開「終端機」(Terminal) 或 「命令提示字元」(CMD)。
        2.  輸入 `node -v` 並按 Enter。
        3.  如果顯示 `v20.x.x` 或更高版本，代表已安裝，可跳過此步。
        4.  如果顯示「找不到指令」，請至 [Node.js 官網](https://nodejs.org/)。
        5.  下載 **LTS (長期支援)** 版本，按下一步直到安裝完成。
    *   **安裝 GitHub Desktop**：
        1.  前往 [desktop.github.com](https://desktop.github.com/) 下載並安裝。
2.  **複製專案 (Clone)**：
    *   開啟 GitHub Desktop，登入您的 GitHub 帳號。
    *   點擊 **File > Clone Repository**。
    *   在清單中找到 `slideagent` 並點擊下方 **Clone** 按鈕下載到新電腦。
3.  **詳細初始化環境 (重要！不可省略)**：
    1.  在 GitHub Desktop 的選單點擊 **Repository > Open in Terminal** (這會直接幫您定位到專案資料夾)。
    2.  在跳出的黑底視窗中，**輸入以下指令並按 Enter**：
        ```bash
        npm install
        ```
    3.  **等待進度條跑完**：此過程會根據 `package.json` 下載 Vite、Tailwind 等所有必要的引擎組件，這可能需要 30 秒到 1 分鐘。
    4.  確認視窗最後出現 `added xxx packages` 且沒有紅色報錯。
4.  **開始開發錄製**：
    1.  在同一個終端機視窗，輸入指令：
        ```bash
        npm run dev
        ```
    2.  看到 `Local: http://localhost:5173/` 網址後，點開它即可重回開發軌道！

---

> [!TIP]
> **黃金鐵律**：永遠只修改 `src/` 資料夾裡的檔案！
> 如果您發現網頁沒更新，第一個動作永遠是去看 GitHub 的 **Actions** 頁面有沒有「紅色叉叉」。

祝開發愉快！如果有任何新點子或是遇到 bug，隨時找我。
