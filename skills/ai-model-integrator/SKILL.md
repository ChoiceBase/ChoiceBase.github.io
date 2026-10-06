---
name: ai-model-integrator
description: Easily import and orchestrate any AI model (Google Gemini, OpenAI, Claude, Groq, Ollama, DeepSeek, OpenRouter) within the ChoiceBase project for resource classification, smart recommendations, career path intelligence, and semantic search.
---

# ChoiceBase AI Model Integrator Skill

This skill provides comprehensive instructions, code patterns, and workflows to easily import, configure, and orchestrate **any AI model** within the ChoiceBase ecosystem.

## 🌟 Supported Model Providers

ChoiceBase supports plug-and-play AI integrations via `assets/js/ai-service.js` and standalone Node/Python scripts:

| Provider | Recommended Models | Ideal Use Case |
| :--- | :--- | :--- |
| **Google Gemini** | `gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-2.5-pro` | Multimodal analysis, large context resource parsing, fast structured extraction |
| **OpenAI** | `gpt-4o-mini`, `gpt-4o`, `o3-mini` | High-precision reasoning, structured schema generation |
| **Anthropic** | `claude-3-5-sonnet`, `claude-3-5-haiku` | Nuanced career pathway analysis and complex code/ontology evaluation |
| **Groq** | `llama-3.3-70b-versatile`, `mixtral-8x7b-32768` | Ultra-low latency real-time search & interactive chat |
| **DeepSeek** | `deepseek-chat`, `deepseek-reasoner` | Affordable deep reasoning and dataset synthesis |
| **OpenRouter** | 100+ open & closed source models | Aggregator access with a single unified API key |
| **Ollama (Local)** | `llama3.2`, `mistral`, `phi3` | 100% offline, private, zero-cost AI execution |

---

## 🚀 Quick Start in Browser & ChoiceBase UI

### 1. Import the AI Service
Add the script tag to any HTML page:
```html
<script src="/assets/js/ai-service.js"></script>
```

### 2. Instantiate and Generate Content

#### Using Google Gemini:
```javascript
const ai = new ChoiceBaseAI({
  provider: 'gemini',
  apiKey: 'YOUR_GEMINI_API_KEY', // or load automatically from localStorage
  model: 'gemini-1.5-flash'
});

const reply = await ai.generate("Summarize the top 3 tools for learning Web Development from ChoiceBase data.");
console.log(reply);
```

#### Using OpenAI or Groq:
```javascript
const ai = new ChoiceBaseAI({
  provider: 'groq',
  apiKey: 'YOUR_GROQ_API_KEY',
  model: 'llama-3.3-70b-versatile'
});

const reply = await ai.generate("What are the next career milestones after Junior Frontend Developer?");
console.log(reply);
```

#### Using Local Ollama (Zero API Key, 100% Free):
```javascript
// Ensure Ollama is running: ollama run llama3.2
const ai = new ChoiceBaseAI({
  provider: 'ollama',
  model: 'llama3.2',
  baseUrl: 'http://localhost:11434'
});

const reply = await ai.generate("Suggest 5 key tags for a new Python data science course.");
console.log(reply);
```

---

## 🤖 Common ChoiceBase AI Tasks & Patterns

### 1. Structured Resource Auto-Tagging & JSON Extraction
When adding new entries to `data/ai-tools.json` or `data/programming.json`:

```javascript
const ai = new ChoiceBaseAI({ provider: 'gemini', apiKey: '...' });

const schema = `{
  "title": "string",
  "url": "string",
  "description": "string (1-2 sentences)",
  "tags": ["string", "string"]
}`;

const result = await ai.generateJSON(
  "Create a resource entry for Supabase - the open source Firebase alternative",
  schema
);

console.log(result);
// Output: { title: "Supabase", url: "https://supabase.com", description: "...", tags: ["Database", "Open Source", "Backend"] }
```

### 2. Streaming Real-Time Responses in UI
```javascript
const outputEl = document.getElementById('chat-output');

await ai.stream("Explain the difference between Full-Stack and DevOps roles.", (chunk, fullText) => {
  outputEl.textContent = fullText;
});
```

### 3. Smart Career Path Recommendation (Career Nexus)
```javascript
const careerPrompt = `
Given a user interested in transitioning from "Manual QA Tester" to "DevOps Engineer":
Suggest 3 intermediate roles, required skills, and recommended learning resources.
`;

const careerAdvice = await ai.generate(careerPrompt, { temperature: 0.3 });
```

---

## 🔒 Safe Credential Management

- Keys can be saved to browser storage via `ai.saveKey('your-key')`.
- Keys are never committed to git repositories (`.gitignore` excludes `.env` and local credentials).
- For public deployments on GitHub Pages, prompt the user to input their own API key via a modal or load local Ollama without requiring any cloud key.
