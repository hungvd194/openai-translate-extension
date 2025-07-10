document.addEventListener('DOMContentLoaded', () => {
  // Set checked radio from lastLang
  chrome.storage.local.get('lastLang', (data) => {
    if (data.lastLang) {
      const radios = document.getElementsByName('targetLanguage');
      radios.forEach(radio => {
        radio.checked = (radio.value === data.lastLang);
      });
    }
  });
  // Khởi tạo API key section lần đầu
  loadApiKeySection();
});

// ----- API Key UI (bảo mật, không hiện lại) -----
function renderApiKeySection(hasKey) {
  const section = document.getElementById('apiKeySection');
  if (hasKey) {
    section.innerHTML = `
      <span style="color: green;">API Key has been saved.</span>
      <br><span style="color:#666;font-size:12px;">The API Key will never be shown again for security reasons.</span><br>
      <button id="editApiKeyBtn" class="btn" class="font-size:0.8rem;margin-top:0.5rem;">Re-enter API Key</button>
      <button id="removeApiKeyBtn" style="margin-left:8px;border:none;background:transparent;color:red;">Delete API Key</button>
      <span id="saveStatus" style="margin-left: 8px;"></span>
      <div id="apiKeyInputArea" style="display:none; margin-top:10px;">
        <input type="password" id="apiKeyInput" placeholder="Enter new API Key" class="apikey-input">
        <button id="saveApiKeyBtn" class="translate-btn" style="margin-top:0.5rem;font-size: 1rem;">Lưu</button>
      </div>
    `;
    document.getElementById('editApiKeyBtn').onclick = () => {
      document.getElementById('apiKeyInputArea').style.display = '';
      document.getElementById('apiKeyInput').focus();
    };
    document.getElementById('removeApiKeyBtn').onclick = () => {
      chrome.storage.local.remove('openaiApiKey', () => {
        renderApiKeySection(false);
      });
    };
    document.getElementById('saveApiKeyBtn').onclick = () => {
      const apiKey = document.getElementById('apiKeyInput').value.trim();
      if (!apiKey) {
        document.getElementById('saveStatus').textContent = "API Key cannot be empty";
        document.getElementById('saveStatus').style.color = "red";
        return;
      }
      chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
        document.getElementById('saveStatus').textContent = "Saved!";
        document.getElementById('saveStatus').style.color = "green";
        setTimeout(() => {
          document.getElementById('saveStatus').textContent = "";
          renderApiKeySection(true);
        }, 1000);
      });
    };
  } else {
    section.innerHTML = `
      <input type="password" id="apiKeyInput" class="apikey-input" placeholder="Enter OpenAI API Key">
      <button id="saveApiKeyBtn" class="translate-btn" style="margin-top:0.5rem;font-size: 0.8rem;">Lưu</button>
      <span id="saveStatus" style="margin-left: 8px; color: green;"></span>
    `;
    document.getElementById('saveApiKeyBtn').onclick = () => {
      const apiKey = document.getElementById('apiKeyInput').value.trim();
      if (!apiKey) {
        document.getElementById('saveStatus').textContent = "API Key not set!";
        document.getElementById('saveStatus').style.color = "red";
        return;
      }
      chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
        document.getElementById('saveStatus').textContent = "Saved!";
        document.getElementById('saveStatus').style.color = "green";
        setTimeout(() => {
          document.getElementById('saveStatus').textContent = "";
          renderApiKeySection(true);
        }, 1000);
      });
    };
  }
}

function loadApiKeySection() {
  chrome.storage.local.get('openaiApiKey', (data) => {
    renderApiKeySection(!!data.openaiApiKey);
  });
}

// ----- Tab logic -----
document.getElementById('tab-translate-btn').addEventListener('click', function () {
  document.getElementById('tab-translate').style.display = '';
  document.getElementById('tab-settings').style.display = 'none';
  this.classList.add('active');
  document.getElementById('tab-settings-btn').classList.remove('active');
});
document.getElementById('tab-settings-btn').addEventListener('click', function () {
  document.getElementById('tab-translate').style.display = 'none';
  document.getElementById('tab-settings').style.display = '';
  this.classList.add('active');
  document.getElementById('tab-translate-btn').classList.remove('active');
  // Load trạng thái API Key mỗi khi chuyển sang tab Settings
  loadApiKeySection();
});

// ----- Dịch -----
document.getElementById('translateBtn').addEventListener('click', async () => {
  // Lấy API key
  const apiKey = await new Promise((resolve) => {
    chrome.storage.local.get('openaiApiKey', (data) => {
      resolve(data.openaiApiKey || '');
    });
  });

  if (!apiKey) {
      document.getElementById('outputText').value = 'API Key not set!!';
      return;
  }

  const inputText = document.getElementById('inputText').value;
  const targetLang = document.querySelector('input[name="targetLanguage"]:checked').value;

  if (!inputText) {
    alert('Please enter text to translate.');
    return;
  }

  // Lưu lại lựa chọn
  chrome.storage.local.set({ lastLang: targetLang });

  document.getElementById('outputText').value = 'Translating...';

  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const systemPrompt = `
You are a professional translator and language expert. Your sole task is to translate text into the specified target language with absolute accuracy and natural flow. Always follow these rules:

1. Output only the translated text—do not include any comments, explanations, instructions, or extra formatting.
2. Translate meaning faithfully and precisely, preserving all nuances and tone of the original.
3. The translation must be smooth, natural, and read as if originally written in the target language.
4. Maintain the original line breaks, punctuation, and basic structure.
5. Adapt vocabulary, idioms, and expressions to suit the norms of the target language and context.
6. Do not add, omit, or modify information unless required by grammar or clarity in the target language.
7. If the source includes clear names, technical terms, or context-specific terms, translate them with accuracy and appropriateness.

You will receive a request structured as:
Source Language: <language name>
Target Language: <language name>
Text: <text to translate>

Translate only. Return nothing but the translated result.
`.trim();

  const userPrompt = `
Source Language: Auto
Target Language: ${targetLang}
Text: ${inputText}
`.trim();

  const prompt = `Translate the following text into ${targetLang}:\n\n${inputText}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
         messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      const translation = data.choices[0].message.content.trim();
      document.getElementById('outputText').value = translation;
    } else {
      document.getElementById('outputText').value = '	Error: No response from API.';
    }
  } catch (error) {
    document.getElementById('outputText').value = 'Error connecting to OpenAI API.';
    console.error(error);
  }
});
