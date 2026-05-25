# AWS 中文題庫 GitHub Pages 網站

這是一個純靜態網站，不需要後端，也不需要 npm build。可以直接部署到 GitHub Pages。

## 檔案說明

- `index.html`：網站入口，GitHub Pages 會從這個檔案開始載入。
- `styles.css`：網站樣式。
- `app.js`：題庫互動邏輯，包含搜尋、跳題、顯示答案、本機進度。
- `questions.json`：中文題庫資料。
- `.nojekyll`：避免 GitHub Pages 用 Jekyll 處理靜態檔案。

## 部署流程

1. 在 GitHub 建立一個新的 repository，例如 `aws-quiz`。
2. 把本資料夾內所有檔案放到 repository 根目錄。
3. 推送到 GitHub：

```bash
git init
git add .
git commit -m "Add GitHub Pages quiz site"
git branch -M main
git remote add origin https://github.com/<你的帳號>/aws-quiz.git
git push -u origin main
```

4. 到 GitHub repository 的 `Settings` → `Pages`。
5. Source 選 `Deploy from a branch`。
6. Branch 選 `main`，Folder 選 `/root`，按 Save。
7. 等 GitHub Pages 部署完成後，網站會出現在：

```text
https://<你的帳號>.github.io/aws-quiz/
```

## 本機測試

因為瀏覽器直接打開 `index.html` 可能會擋掉 `fetch('questions.json')`，建議在資料夾內執行：

```bash
python3 -m http.server 8000
```

然後開啟：

```text
http://localhost:8000
```
