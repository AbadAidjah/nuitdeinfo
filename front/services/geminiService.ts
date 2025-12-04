import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const GeminiService = {
  /**
   * Generates a summary or expands on a short note title/content.
   */
  generateNoteContent: async (prompt: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Tu es un assistant utile pour une application de prise de notes. 
        L'utilisateur veut développer ou organiser cette pensée : "${prompt}".
        Réponds uniquement avec le contenu de la note, formaté proprement en Markdown simple.
        Sois concis et clair.`,
      });

      return response.text || "Impossible de générer du contenu.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
};