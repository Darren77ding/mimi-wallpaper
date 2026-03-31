import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 视觉模型分析垫图，提取特征并融合用户的修改需求
export async function analyzeImage(base64Data: string, mimeType: string, userPrompt: string) {
  try {
    // 使用支持多模态视觉的闪电模型
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        }
      },
      `Analyze this reference image in extreme detail. Describe the core subject, setting, lighting, composition, color palette, and art style.
      
      The user wants to generate a new image based on this, with the following modifications/instructions: "${userPrompt}"
      
      Synthesize your deep analysis of the reference image with the user's instructions to create a cohesive, highly detailed, and descriptive PROMPT (in English) for an AI image generator. 
      Only return the precise text of the prompt, without any introductions, explanations, or quotes.`
    ]);
    
    return result.response.text();
  } catch (err: any) {
    console.error("图片前置分析失败:", err);
    throw new Error("Failed to analyze reference image: " + err.message);
  }
}

// 核心生图功能 (支持拼接风格和比例提示)
export async function generateImage(prompt: string, aspectRatio: string = "1:1", style: string = "") {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

    let finalPrompt = prompt;
    
    // 如果有特殊风格，拼入 prompt 头部
    if (style && style !== "none") {
      finalPrompt = `[Style: ${style}] ` + finalPrompt;
    }

    // 尝试在 prompt 末尾施加比例限制（由于实验模型可能不吃 generationConfig，用自然语言强约束）
    if (aspectRatio !== "1:1") {
      const ratioContext = aspectRatio === "16:9" ? "widescreen 16:9 horizontal desktop wallpaper" : "vertical 9:16 mobile wallpaper";
      finalPrompt += `. The resulting image MUST be strictly formatted as a ${ratioContext}.`;
    }

    // 💡 暂时去掉所有报错的 generationConfig
    const result = await model.generateContent(finalPrompt); 
    
    const response = await result.response;
    const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (imageData) {
      return `data:image/png;base64,${imageData}`;
    }

    return response.text() || "未生成数据";
  } catch (err: any) {
    console.error("生成失败:", err);
    throw err;
  }
}