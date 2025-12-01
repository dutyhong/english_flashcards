import * as FileSystem from 'expo-file-system';
import { ReviewWord } from '../store/useStore';

// Mock data for demo mode
const MOCK_WORDS = ['apple', 'book', 'adventure', 'galaxy', 'silence'];

const MOCK_DETAILS: Record<string, Omit<ReviewWord, 'id' | 'dateAdded'>> = {
  apple: {
    word: 'Apple',
    meaning: '苹果',
    pronunciation: '/ˈæp.l/',
    sentences: [
      {
        english: 'I eat an apple every day.',
        chinese: '我每天吃一个苹果。',
        explanation: 'Apple is a common fruit.',
      },
      {
        english: 'The apple does not fall far from the tree.',
        chinese: '有其父必有其子。',
        explanation: 'A common idiom.',
      },
    ],
  },
  book: {
    word: 'Book',
    meaning: '书',
    pronunciation: '/bʊk/',
    sentences: [
      {
        english: 'She is reading a book.',
        chinese: '她正在读书。',
        explanation: 'Used as a noun here.',
      },
    ],
  },
};

const DEFAULT_MOCK = {
  meaning: '未知含义 (Demo)',
  pronunciation: '/.../',
  sentences: [
    {
      english: 'This is a demo sentence.',
      chinese: '这是一个演示句子。',
      explanation: 'Demo explanation.',
    },
  ],
};

// ⚠️ 安全警告：仅供个人开发调试使用。生产环境请务必通过后端代理调用，严禁将 Key 硬编码在前端！
const DEFAULT_API_KEY = 'sk-eff2128169cc440db8a76dc084bcc8ab'; // 请替换为你的真实 Key

export const AIService = {
  async recognizeText(imageUri: string, apiKey?: string, base64Image?: string | null): Promise<string[]> {
    // Use provided key OR fallback to default key
    const effectiveKey = apiKey || DEFAULT_API_KEY;
    
    // Fix: Check if key is valid (not empty and not placeholder)
    if (!effectiveKey || effectiveKey === 'sk-YOUR_KEY_HERE') {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return MOCK_WORDS;
    }

    try {
      // ... use effectiveKey instead of apiKey below ...
      // Convert image to base64
      let base64 = base64Image;
      if (!base64) {
          base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
      }

      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-vl-plus',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: '请识别下面图中的英语单词，识别结果进行去重。请返回纯 JSON 字符串数组，例如 ["apple", "banana"]，不要包含其他 Markdown 格式。' },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64}`
                  }
                }
              ]
            }
          ],
          stream: false
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("Qwen-VL API Error:", data.error);
        throw new Error(data.error.message || "Unknown DashScope API error");
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No content returned from Qwen-VL');

      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      // Sometimes models return "Here is the list: [...]", so we try to find the array brackets
      const jsonMatch = cleanContent.match(/\[.*\]/s);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanContent;
      
      const words = JSON.parse(jsonString);
      return Array.isArray(words) ? words : [];
      
    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    }
  },

  async enrichWord(word: string, apiKey?: string): Promise<Omit<ReviewWord, 'id' | 'dateAdded'>> {
    const effectiveKey = apiKey || DEFAULT_API_KEY;

    // Fix: Allow using DEFAULT_API_KEY if it's a real key (not the placeholder)
    if (!effectiveKey || effectiveKey === 'sk-YOUR_KEY_HERE') {
      // Only fallback to mock if NO API KEY is provided or it's still the placeholder
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const key = word.toLowerCase();
      return {
        word: word,
        ...(MOCK_DETAILS[key] || DEFAULT_MOCK),
      };
    }

    try {
      // Use Qwen-Turbo for text generation (faster and cheaper/free)
      const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful English tutor. Return JSON only.',
            },
            {
              role: 'user',
              content: `You are a helpful English tutor. Provide a detailed study card for the word "${word}".
              
              Required fields in JSON:
              1. "word": The word itself.
              2. "meaning": Chinese translation (concise but accurate). MUST BE IN CHINESE. DO NOT LEAVE EMPTY.
              3. "pronunciation": IPA phonetic symbol.
              4. "sentences": An array of 2 distinct example sentences. Each sentence object must have:
                 - "english": The English sentence.
                 - "chinese": Chinese translation.
                 - "explanation": A brief explanation of how the word is used in this context (in Chinese).
              
              Return strict JSON format only, no markdown code blocks:
              {
                "word": "${word}",
                "meaning": "...",
                "pronunciation": "...",
                "sentences": [
                    { "english": "...", "chinese": "...", "explanation": "..." },
                    { "english": "...", "chinese": "...", "explanation": "..." }
                ]
              }`,
            },
          ],
          stream: false
        }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("Qwen API Error:", data.error);
        throw new Error(data.error.message || "Unknown DashScope API error");
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No content returned from Qwen');

      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonMatch = cleanContent.match(/\{.*\}/s);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanContent;
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Enrich Error:', error);
      throw error;
    }
  },
};
