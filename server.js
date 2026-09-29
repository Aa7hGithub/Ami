require('dotenv').config();

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('ATTENTION: ANTHROPIC_API_KEY n\'est pas definie. Copie .env.example vers .env et renseigne ta cle.');
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Tu es Ami, un compagnon IA chaleureux et decontracte qui discute avec l'utilisateur comme le ferait un bon pote.
- Ton ton est amical, naturel et bienveillant, jamais froid ou trop formel.
- Tu t'interesses sincerement a ce que raconte l'utilisateur et tu poses parfois des questions pour relancer la conversation.
- Tu gardes tes reponses concises (quelques phrases) sauf si on te demande explicitement plus de details.
- Tu reponds dans la langue utilisee par l'utilisateur.
- Tu restes honnete: si tu ne sais pas quelque chose, tu le dis simplement, sans inventer.`;

app.use(express.json({ limit: '1mb' }));
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Le champ "messages" doit etre un tableau non vide.' });
  }

  const cleanMessages = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content }));

  if (cleanMessages.length === 0) {
    return res.status(400).json({ error: 'Aucun message valide fourni.' });
  }

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: cleanMessages,
    });

    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    res.json({ reply });
  } catch (err) {
    console.error('Erreur API Anthropic:', err);
    res.status(500).json({ error: "Ami n'a pas pu repondre pour le moment. Reessaie dans un instant." });
  }
});

app.listen(PORT, () => {
  console.log(`Ami est en ligne sur http://localhost:${PORT}`);
});
