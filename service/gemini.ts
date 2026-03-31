import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// service/gemini.ts
export async function generateImage(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-image-preview" });

    // 💡 暂时去掉所有报错的 generationConfig
    const result = await model.generateContent(prompt); 
    
    const response = await result.response;
    const imageData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (imageData) {
      // 虽然没设 webp，但默认通常是 png，所以先改回 png 保证显示
      return `data:image/png;base64,${imageData}`;
    }

    return response.text() || "未生成数据";
  } catch (err: any) {
    console.error("生成失败:", err);
    throw err;
  }
}