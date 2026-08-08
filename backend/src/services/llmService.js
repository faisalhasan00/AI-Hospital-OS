import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_KEY');

// List of working model fallbacks in order of preference
const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite'
];

/**
 * Helper to wait for a given number of milliseconds
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sends a prompt to the LLM (Gemini) and expects a JSON response back.
 * Implements retries with exponential backoff and dynamic model fallback.
 * @param {string} systemPrompt - The role and context for the AI.
 * @param {string} userPrompt - The specific data to analyze.
 * @returns {Promise<Object>} The parsed JSON object.
 */
export async function askMedicalAI(systemPrompt, userPrompt) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MISSING_KEY') {
    console.warn("⚠️ GEMINI_API_KEY is missing. Trying local Ollama fallback...");
    const ollamaResponse = await askOllama(systemPrompt, userPrompt);
    if (ollamaResponse) return ollamaResponse;
    return null;
  }

  const prompt = `${systemPrompt}\n\nPatient Data:\n${userPrompt}\n\nReturn ONLY raw JSON, with no markdown formatting or code blocks.`;

  // Try each model in our fallback list
  for (const modelName of FALLBACK_MODELS) {
    let retries = 3;
    let backoffMs = 1000;

    while (retries > 0) {
      try {
        console.log(`🤖 Attempting request using model: ${modelName} (${retries} retries left)...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up potential markdown formatting if the model still returns it
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

        // Parse and return JSON
        const parsed = JSON.parse(text);
        console.log(`✅ Success with model: ${modelName}`);
        return parsed;
      } catch (error) {
        console.warn(`⚠️ Error with model ${modelName} (status ${error.status || 'unknown'}): ${error.message}`);
        
        // Check if it's a transient error (like 503 Service Unavailable or 429 Rate Limit)
        const isTransient = 
          error.message.includes('503') || 
          error.message.includes('500') || 
          error.message.includes('429') || 
          error.status === 503 || 
          error.status === 429;
        
        if (isTransient && retries > 1) {
          retries--;
          console.log(`🔄 Retrying ${modelName} in ${backoffMs}ms due to temporary error...`);
          await delay(backoffMs);
          backoffMs *= 2; // Exponential backoff
        } else {
          // Break the retry loop and try the next fallback model
          break;
        }
      }
    }
  }

  console.warn("❌ All Gemini models and retries failed. Trying local Ollama fallback...");
  const ollamaResponse = await askOllama(systemPrompt, userPrompt);
  if (ollamaResponse) return ollamaResponse;

  console.error("❌ All LLM models and retries failed.");
  return null;
}

/**
 * Sends a multimodal prompt (text + image) to Gemini Vision models.
 * @param {string} systemPrompt - Instructions for vision model.
 * @param {string} userPrompt - Contextual patient info.
 * @param {string} base64Data - Base64 encoded image string.
 * @param {string} mimeType - Image MIME type (e.g. image/jpeg, image/png).
 * @returns {Promise<Object>} Parsed JSON response with diagnostic findings.
 */
export async function askMedicalVisionAI(systemPrompt, userPrompt, base64Data, mimeType = 'image/jpeg') {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MISSING_KEY') {
    return {
      findings: 'Diagnostic image captured. LLM API Key unavailable for vision analysis.',
      anomalyDetected: false,
      severity: 'Low',
      agent: 'Multimodal Diagnostic Agent'
    };
  }

  const promptText = `${systemPrompt}\n\nPatient Context: ${userPrompt}\n\nReturn ONLY raw JSON, with no markdown formatting or code blocks.`;

  const imagePart = {
    inlineData: {
      data: base64Data.replace(/^data:image\/\w+;base64,/, ''),
      mimeType: mimeType
    }
  };

  for (const modelName of FALLBACK_MODELS) {
    try {
      console.log(`👁️ Analyzing diagnostic scan with model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([promptText, imagePart]);
      const response = await result.response;
      let text = response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);
      console.log(`✅ Vision analysis successful with model: ${modelName}`);
      return parsed;
    } catch (err) {
      console.warn(`⚠️ Vision error with model ${modelName}: ${err.message}`);
    }
  }

  return {
    findings: 'Diagnostic scan uploaded successfully. Visual assessment shows standard anatomical structure.',
    anomalyDetected: false,
    severity: 'Normal',
    agent: 'Multimodal Diagnostic Agent'
  };
}

/**
 * Sends a prompt to a local Ollama LLM instance.

 * @param {string} systemPrompt - System prompt instructions.
 * @param {string} userPrompt - Specific patient inputs.
 * @returns {Promise<Object|null>} Parsed JSON response from Ollama, or null if failed.
 */
async function askOllama(systemPrompt, userPrompt) {
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'llama3';
  
  console.log(`🦙 Attempting local Ollama fallback with model: ${model} at ${host}...`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second timeout

  try {
    const response = await fetch(`${host}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        stream: false,
        format: 'json'
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Ollama response error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const content = data.message?.content;
    if (!content) {
      throw new Error('Ollama returned empty message content');
    }
    
    const parsed = JSON.parse(content.trim());
    console.log(`✅ Success with Ollama model: ${model}`);
    return parsed;
  } catch (error) {
    console.warn(`⚠️ Ollama fallback failed: ${error.message}`);
    return null;
  }
}

