const chatEl = document.getElementById('chat');
const composerEl = document.getElementById('composer');
const inputEl = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const resetBtn = document.getElementById('reset-btn');
const statusEl = document.getElementById('status');

const STORAGE_KEY = 'ami-conversation';

let messages = loadMessages();
renderAll();

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // stockage indisponible, on continue sans persister
  }
}

function renderAll() {
  chatEl.innerHTML = '';
  if (messages.length === 0) {
    addBubble('ai', "Salut ! Je suis Ami. Raconte-moi ta journee, ou demande-moi ce que tu veux :)");
  } else {
    messages.forEach((m) => addBubble(m.role === 'user' ? 'user' : 'ai', m.content));
  }
}

function addBubble(role, text) {
  const div = document.createElement('div');
  div.className = `bubble ${role}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}

composerEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;

  inputEl.value = '';
  messages.push({ role: 'user', content: text });
  addBubble('user', text);
  saveMessages();

  setLoading(true);
  const typingBubble = addBubble('ai typing', 'Ami ecrit...');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();
    typingBubble.remove();

    if (!res.ok) {
      addBubble('ai', data.error || "Une erreur est survenue.");
      return;
    }

    messages.push({ role: 'assistant', content: data.reply });
    addBubble('ai', data.reply);
    saveMessages();
  } catch (err) {
    typingBubble.remove();
    addBubble('ai', "Impossible de contacter le serveur. Verifie ta connexion et reessaie.");
  } finally {
    setLoading(false);
  }
});

resetBtn.addEventListener('click', () => {
  messages = [];
  saveMessages();
  renderAll();
});

function setLoading(isLoading) {
  sendBtn.disabled = isLoading;
  inputEl.disabled = isLoading;
  statusEl.textContent = isLoading ? 'en train d\'ecrire...' : 'en ligne';
  if (!isLoading) inputEl.focus();
}
