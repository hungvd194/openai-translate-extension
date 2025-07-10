# 🌐 OpenAI Translate Extension

A simple Chrome extension for translating text using OpenAI's GPT API. Supports **Vietnamese**, **English**, and **Japanese**.

![Screenshot](bc5b536b-7a12-49cd-a664-1610422275d0.png)

## ✨ Features

- Translate any text directly via popup
- Supports **English ⇄ Vietnamese ⇄ Japanese**
- Clean, user-friendly UI
- Requires your own OpenAI API key (set once)

## 🛠 Installation

1. Download and unzip this repository.
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the unzipped folder.

## ⚙️ How to Use

1. Click the extension icon to open the popup.
2. Go to the **Settings** tab and paste your OpenAI API key.
3. Switch to the **Translate** tab.
4. Enter text → Choose the target language → Click **Translate now**.
5. Translation will appear below.

> Note: The model used is defined in code and cannot be changed via the UI.

## 📁 Folder Structure

openai-translate-extension/
├── manifest.json
├── popup.html
├── popup.js
├── style.css
└── icon.png


## 📝 License

MIT License.

## 🙌 Contributing

Suggestions and pull requests are welcome!

---

Built with ❤️ by hung.vd
