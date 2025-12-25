
import { GoogleGenAI, Type } from "@google/genai";

export const getAiSuggestions = async (eventType: string, lang: 'fr' | 'ar') => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const isFrench = lang === 'fr';
    const modelName = 'gemini-3-flash-preview';

    const systemInstruction = isFrench 
      ? "Tu es un expert en design de filtres. Génère 3 suggestions de textes courts en FRANÇAIS. Style : chic, moderne."
      : "أنت خبير في تصميم الفلاتر. مهمتك هي إنشاء 3 اقتراحات نصوص قصيرة باللغة العربية حصراً. يمنع استخدام أي أحرف لاتينية. الأسلوب: أنيق، احتفالي.";

    const prompt = `Génère 3 variations de textes pour un filtre de type "${eventType}" en langue ${isFrench ? 'Français' : 'Arabe'}. Maximum 15 caractères par suggestion.`;
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              style: { type: Type.STRING }
            },
            required: ['text', 'style']
          }
        }
      }
    });

    const result = JSON.parse(response.text || '[]');
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Gemini Error:", error);
    return lang === 'fr' 
      ? [{ text: "Joyeux Mariage", style: "Classique" }] 
      : [{ text: "زفاف ميمون", style: "خط عربي" }];
  }
};
