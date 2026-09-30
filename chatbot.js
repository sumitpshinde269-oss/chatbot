// Respondr Emergency Intelligence AI Copilot Widget
(function () {
  const CHAT_ENDPOINT = '/api/chat';
  let conversationHistory = [];

  function formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    // Simple bullet and list handler
    html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/\n\n/g, '<br><br>');
    return html;
  }

  function initChatWidget() {
    // Check if already injected
    if (document.getElementById('respondrAiWidget')) return;

    // Trigger button
    const triggerBtn = document.createElement('button');
    triggerBtn.id = 'respondrAiTrigger';
    triggerBtn.className = 'respondr-ai-trigger';
    triggerBtn.setAttribute('aria-label', 'Open Respondr AI Copilot');
    triggerBtn.innerHTML = `
      <span class="pulse-dot"></span>
      <i class="fas fa-robot"></i>
      <span>Respondr AI</span>
    `;

    // Modal
    const modal = document.createElement('div');
    modal.id = 'respondrAiModal';
    modal.className = 'respondr-chat-modal';
    modal.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-info">
          <div class="chat-avatar"><i class="fas fa-shield-alt"></i></div>
          <div class="chat-title">
            <h3>Respondr AI Copilot</h3>
            <span><span class="status-beacon"></span>Gemini Emergency AI</span>
          </div>
        </div>
        <div class="chat-actions">
          <button class="chat-header-btn" id="respondrChatClear" title="Clear chat"><i class="fas fa-trash-alt"></i></button>
          <button class="chat-header-btn" id="respondrChatClose" title="Close"><i class="fas fa-times"></i></button>
        </div>
      </div>

      <div class="chat-quick-actions">
        <button class="chip-btn" data-query="What is the standard START triage protocol for mass casualties?">🚨 Triage Protocol</button>
        <button class="chip-btn" data-query="How should emergency evacuation routes be established?">📍 Evacuation Routes</button>
        <button class="chip-btn" data-query="What are priority safety measures for structural fire containment?">🔥 Hazard Mitigation</button>
        <button class="chip-btn" data-query="Generate an incident commander situation report template.">📋 SitRep Briefing</button>
      </div>

      <div class="chat-body" id="respondrChatBody">
        <div class="chat-msg bot">
          <div class="msg-bubble">
            <h3>🛡️ Respondr AI Intelligence Active</h3>
            <p>Welcome to the <strong>Respondr Emergency Copilot</strong>. I am trained to assist incident commanders, field responders, and dispatchers with live triage advice, evacuation planning, and hazard mitigation protocols.</p>
            <br>
            <p>Select a quick action chip above or type any emergency query below.</p>
          </div>
          <div class="msg-meta">System • Just now</div>
        </div>
      </div>

      <div class="chat-footer">
        <div class="chat-input-wrapper">
          <input type="text" id="respondrChatInput" class="chat-input" placeholder="Ask Respondr AI about emergency triage, routes..." autocomplete="off">
          <button id="respondrChatSend" class="chat-send-btn" title="Send message"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>
    `;

    document.body.appendChild(triggerBtn);
    document.body.appendChild(modal);

    const body = document.getElementById('respondrChatBody');
    const input = document.getElementById('respondrChatInput');
    const sendBtn = document.getElementById('respondrChatSend');
    const closeBtn = document.getElementById('respondrChatClose');
    const clearBtn = document.getElementById('respondrChatClear');

    function toggleChat(open) {
      if (open) {
        modal.classList.add('open');
        input.focus();
      } else {
        modal.classList.remove('open');
      }
    }

    triggerBtn.addEventListener('click', () => toggleChat(!modal.classList.contains('open')));
    closeBtn.addEventListener('click', () => toggleChat(false));

    clearBtn.addEventListener('click', () => {
      conversationHistory = [];
      body.innerHTML = `
        <div class="chat-msg bot">
          <div class="msg-bubble">
            <p>Conversation cleared. Ready for your next emergency query.</p>
          </div>
          <div class="msg-meta">System • Just now</div>
        </div>
      `;
    });

    document.querySelectorAll('.chat-quick-actions .chip-btn').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        if (query) {
          sendMessage(query);
        }
      });
    });

    async function sendMessage(text) {
      const msg = (text || input.value || '').trim();
      if (!msg) return;

      input.value = '';
      sendBtn.disabled = true;

      // Append user bubble
      appendMessage('user', msg);
      conversationHistory.push({ role: 'user', text: msg });

      // Append typing indicator
      const typingElem = document.createElement('div');
      typingElem.className = 'chat-msg bot';
      typingElem.id = 'respondrTypingIndicator';
      typingElem.innerHTML = `
        <div class="typing-bubble">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      `;
      body.appendChild(typingElem);
      body.scrollTop = body.scrollHeight;

      try {
        const response = await fetch(CHAT_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msg,
            history: conversationHistory
          })
        });

        const data = await response.json();
        const indicator = document.getElementById('respondrTypingIndicator');
        if (indicator) indicator.remove();

        if (data.reply) {
          appendMessage('bot', data.reply);
          conversationHistory.push({ role: 'assistant', text: data.reply });
        } else if (data.error) {
          appendMessage('bot', `⚠️ Error: ${data.error}`);
        } else {
          appendMessage('bot', '⚠️ No response received from server.');
        }
      } catch (err) {
        const indicator = document.getElementById('respondrTypingIndicator');
        if (indicator) indicator.remove();
        appendMessage('bot', `⚠️ Network connection failure: ${err.message}`);
      } finally {
        sendBtn.disabled = false;
        input.focus();
      }
    }

    function appendMessage(role, text) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-msg ${role}`;
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formatted = role === 'bot' ? formatMarkdown(text) : text;

      msgDiv.innerHTML = `
        <div class="msg-bubble">${formatted}</div>
        <div class="msg-meta">${role === 'bot' ? 'Respondr AI' : 'You'} • ${now}</div>
      `;

      body.appendChild(msgDiv);
      body.scrollTop = body.scrollHeight;
    }

    sendBtn.addEventListener('click', () => sendMessage());
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // Load stylesheet dynamically if not present
  if (!document.querySelector('link[href*="chatbot.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'chatbot.css';
    document.head.appendChild(link);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatWidget);
  } else {
    initChatWidget();
  }
})();
