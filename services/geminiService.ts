
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 分析创作作品的图片并生成标题和见解
 * @param base64Image 图片的base64字符串
 * @param stage 当前创作阶段
 */
export const analyzePotteryImage = async (base64Image: string, stage: string) => {
  try {
    const prompt = `
      我正在进行陶艺创作，目前处于 ${stage} 阶段。
      请分析这张图片，给出：
      1. 一个富有诗意或简洁的标题（title）
      2. 一段关于该作品造型、纹理或可能的改进建议（insight）
    `;

    // Updated generateContent call to follow standard multimodal and JSON response guidelines
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1],
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: '诗意或简洁的标题',
            },
            insight: {
              type: Type.STRING,
              description: '关于作品的分析与建议',
            },
          },
          required: ["title", "insight"],
        }
      }
    });

    // Access the .text property directly as per guidelines
    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      title: `${stage}记录`,
      insight: "无法连接到AI分析。这件作品看起来很有潜力！"
    };
  }
};
