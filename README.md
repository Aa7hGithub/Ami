# Ami

Un site web de chat pour discuter avec ton ami IA, propulse par l'API Claude d'Anthropic.

## Installation

```bash
npm install
cp .env.example .env
```

Renseigne ta cle dans `.env` :

```
ANTHROPIC_API_KEY=ta-cle-api-anthropic
```

## Lancer le site

```bash
npm start
```

Puis ouvre [http://localhost:3000](http://localhost:3000).

## Comment ca marche

- `server.js` : serveur Express qui expose `/api/chat` et relaie la conversation a l'API Claude avec une personnalite d'ami decontracte (voir `SYSTEM_PROMPT`).
- `public/` : interface de chat (HTML/CSS/JS vanilla), style messagerie avec bulles.
- L'historique de conversation est garde dans le `localStorage` du navigateur (pas de base de donnees). Le bouton "Nouvelle conversation" l'efface.

## Personnaliser

- Change le ton ou la personnalite d'Ami dans `SYSTEM_PROMPT` (`server.js`).
- Change le modele utilise via la variable d'environnement `ANTHROPIC_MODEL`.
