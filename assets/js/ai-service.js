/**
 * ChoiceBase Universal AI Service (ai-service.js)
 * -------------------------------------------------------------
 * A flexible, zero-dependency client to easily connect, import,
 * and execute tasks with ANY AI provider & model:
 * 
 * - Google Gemini (gemini-2.5-flash, gemini-1.5-flash, etc.)
 * - OpenAI (gpt-4o, gpt-4o-mini, o3-mini, etc.)
 * - Anthropic Claude (claude-3-5-sonnet, claude-3-5-haiku, etc.)
 * - Groq (llama-3.3-70b-versatile, etc.)
 * - DeepSeek (deepseek-chat, deepseek-reasoner)
 * - OpenRouter (Access 100+ models via unified API)
 * - Ollama / Local LLM (llama3, mistral, phi3 on localhost)
 * - HuggingFace Inference API
 * - Custom OpenAI-Compatible Endpoints
 */

class ChoiceBaseAI {
  /**
   * Default Provider Configuration Templates
   */
  static PROVIDERS = {
    gemini: {
      name: 'Google Gemini',
      defaultModel: 'gemini-1.5-flash',
      endpoint: (model, key) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      type: 'gemini'
    },
    openai: {
      name: 'OpenAI',
      defaultModel: 'gpt-4o-mini',
      endpoint: () => 'https://api.openai.com/v1/chat/completions',
      type: 'openai'
    },
    anthropic: {
      name: 'Anthropic Claude',
      defaultModel: 'claude-3-5-sonnet-20241022',
      endpoint: () => 'https://api.anthropic.com/v1/messages',
      type: 'anthropic'
    },
    groq: {
      name: 'Groq',
      defaultModel: 'llama-3.3-70b-versatile',
      endpoint: () => 'https://api.groq.com/openai/v1/chat/completions',
      type: 'openai'
    },
    deepseek: {
      name: 'DeepSeek',
      defaultModel: 'deepseek-chat',
      endpoint: () => 'https://api.deepseek.com/chat/completions',
      type: 'openai'
    },
    openrouter: {
      name: 'OpenRouter',
      defaultModel: 'meta-llama/llama-3.3-70b-instruct',
      endpoint: () => 'https://openrouter.ai/api/v1/chat/completions',
      type: 'openai'
    },
    ollama: {
      name: 'Ollama (Local)',
      defaultModel: 'llama3.2',
      endpoint: (model, key, baseUrl) => `${baseUrl || 'http://localhost:11434'}/api/chat`,
      type: 'ollama'
    }
  };

  /**
   * Initialize the AI Client
   * @param {Object} options Configuration options
   * @param {string} options.provider 'gemini' | 'openai' | 'anthropic' | 'groq' | 'deepseek' | 'openrouter' | 'ollama' | 'custom'
   * @param {string} [options.apiKey] API Key for the provider (can be read from localStorage if empty)
   * @param {string} [options.model] Specific model identifier (defaults to provider's recommended model)
   * @param {string} [options.baseUrl] Custom base URL for proxies / local runners / custom gateways
   * @param {string} [options.systemPrompt] System prompt for role guidance
   */
  constructor(options = {}) {
    this.provider = options.provider || 'gemini';
    this.apiKey = options.apiKey || this.loadStoredKey(this.provider) || '';
    
    const provConfig = ChoiceBaseAI.PROVIDERS[this.provider] || ChoiceBaseAI.PROVIDERS.gemini;
    this.model = options.model || provConfig.defaultModel;
    this.baseUrl = options.baseUrl || '';
    this.systemPrompt = options.systemPrompt || 'You are an intelligent AI assistant integrated into ChoiceBase, helping users discover resources, career pathways, and technical tools.';
    this.history = [];
  }

  /**
   * Store and retrieve API keys securely in browser localStorage
   */
  saveKey(key) {
    this.apiKey = key;
    try {
      localStorage.setItem(`cb_ai_key_${this.provider}`, key);
    } catch (e) {
      console.warn('Unable to persist API key to localStorage', e);
    }
  }

  loadStoredKey(provider) {
    try {
      return localStorage.getItem(`cb_ai_key_${provider}`) || '';
    } catch {
      return '';
    }
  }

  clearStoredKey() {
    try {
      localStorage.removeItem(`cb_ai_key_${this.provider}`);
      this.apiKey = '';
    } catch (e) {
      console.warn(e);
    }
  }

  /**
   * Clear multi-turn chat history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Unified Prompt Completion
   * @param {string} prompt User message or prompt
   * @param {Object} options Extra parameters: temperature, maxTokens, jsonMode, systemPrompt
   * @returns {Promise<string>} Model response text
   */
  async generate(prompt, options = {}) {
    const config = ChoiceBaseAI.PROVIDERS[this.provider] || { type: 'openai', endpoint: () => this.baseUrl };
    const temperature = options.temperature ?? 0.7;
    const maxTokens = options.maxTokens || 2048;
    const systemPrompt = options.systemPrompt || this.systemPrompt;

    if (config.type === 'gemini') {
      return this._callGemini(prompt, { temperature, maxTokens, systemPrompt, jsonMode: options.jsonMode });
    } else if (config.type === 'anthropic') {
      return this._callAnthropic(prompt, { temperature, maxTokens, systemPrompt });
    } else if (config.type === 'ollama') {
      return this._callOllama(prompt, { temperature, systemPrompt });
    } else {
      // Default: OpenAI Compatible (OpenAI, Groq, DeepSeek, OpenRouter, Custom)
      return this._callOpenAICompatible(prompt, { temperature, maxTokens, systemPrompt, jsonMode: options.jsonMode });
    }
  }

  /**
   * Structured JSON Generation
   * Asks the AI model to return verified JSON matching a schema or structure
   */
  async generateJSON(prompt, schemaDescription = '') {
    const jsonPrompt = `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object/array matching this specification: ${schemaDescription}. Do not include markdown fences, backticks, or explanatory text.`;
    const response = await this.generate(jsonPrompt, { jsonMode: true, temperature: 0.2 });
    
    try {
      // Clean up accidental markdown backticks if returned
      const clean = response.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      return JSON.parse(clean);
    } catch (err) {
      console.error('Failed to parse AI JSON response:', response);
      throw new Error(`Invalid JSON returned from AI model: ${err.message}`);
    }
  }

  /**
   * Streaming response support
   * @param {string} prompt Prompt to send
   * @param {Function} onChunk Callback receiving each token/chunk string
   * @param {Object} options Extra options
   */
  async stream(prompt, onChunk, options = {}) {
    // For OpenAI-compatible streaming
    const prov = ChoiceBaseAI.PROVIDERS[this.provider];
    if (prov && prov.type === 'openai') {
      return this._streamOpenAICompatible(prompt, onChunk, options);
    } else {
      // Fallback to single completion if streaming not directly implemented for provider
      const res = await this.generate(prompt, options);
      if (onChunk) onChunk(res);
      return res;
    }
  }

  // --- Provider Implementations ---

  async _callGemini(prompt, opts) {
    if (!this.apiKey) throw new Error('Gemini API Key is required.');
    const url = ChoiceBaseAI.PROVIDERS.gemini.endpoint(this.model, this.apiKey);

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${opts.systemPrompt ? opts.systemPrompt + '\n\n' : ''}${prompt}` }]
        }
      ],
      generationConfig: {
        temperature: opts.temperature,
        maxOutputTokens: opts.maxTokens,
        ...(opts.jsonMode ? { responseMimeType: 'application/json' } : {})
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Gemini API Error: ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  async _callOpenAICompatible(prompt, opts) {
    const provConfig = ChoiceBaseAI.PROVIDERS[this.provider];
    const endpoint = this.baseUrl || (provConfig ? provConfig.endpoint() : 'https://api.openai.com/v1/chat/completions');

    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    if (this.provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://choicebase.github.io';
      headers['X-Title'] = 'ChoiceBase';
    }

    const messages = [];
    if (opts.systemPrompt) {
      messages.push({ role: 'system', content: opts.systemPrompt });
    }
    // Add past history if needed
    this.history.forEach(h => messages.push(h));
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: this.model,
      messages: messages,
      temperature: opts.temperature,
      max_tokens: opts.maxTokens,
      ...(opts.jsonMode && (this.provider === 'openai' || this.provider === 'groq') ? { response_format: { type: 'json_object' } } : {})
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`${this.provider.toUpperCase()} API Error: ${err.error?.message || err.message || res.statusText}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';

    // Save turn to history
    this.history.push({ role: 'user', content: prompt });
    this.history.push({ role: 'assistant', content: reply });

    return reply;
  }

  async _callAnthropic(prompt, opts) {
    if (!this.apiKey) throw new Error('Anthropic API Key is required.');
    const url = 'https://api.anthropic.com/v1/messages';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: opts.maxTokens,
        system: opts.systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Anthropic API Error: ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  async _callOllama(prompt, opts) {
    const provConfig = ChoiceBaseAI.PROVIDERS.ollama;
    const endpoint = provConfig.endpoint(this.model, '', this.baseUrl);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          ...(opts.systemPrompt ? [{ role: 'system', content: opts.systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        stream: false,
        options: { temperature: opts.temperature }
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama API Error (${res.status}): Make sure Ollama is running with OLLAMA_ORIGINS="*"`);
    }

    const data = await res.json();
    return data.message?.content || '';
  }

  async _streamOpenAICompatible(prompt, onChunk, opts) {
    const provConfig = ChoiceBaseAI.PROVIDERS[this.provider];
    const endpoint = this.baseUrl || (provConfig ? provConfig.endpoint() : 'https://api.openai.com/v1/chat/completions');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.model,
        messages: [
          ...(opts.systemPrompt ? [{ role: 'system', content: opts.systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        stream: true,
        temperature: opts.temperature ?? 0.7
      })
    });

    if (!res.ok) throw new Error(`Stream Error: ${res.statusText}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const dataStr = line.replace(/^data:\s*/, '').trim();
        if (dataStr === '[DONE]') break;
        try {
          const parsed = JSON.parse(dataStr);
          const textChunk = parsed.choices?.[0]?.delta?.content || '';
          if (textChunk) {
            fullText += textChunk;
            if (onChunk) onChunk(textChunk, fullText);
          }
        } catch {
          // Incomplete chunk parse
        }
      }
    }

    return fullText;
  }
}

// Global Browser Export
if (typeof window !== 'undefined') {
  window.ChoiceBaseAI = ChoiceBaseAI;
}

// Node / CommonJS Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChoiceBaseAI;
}
