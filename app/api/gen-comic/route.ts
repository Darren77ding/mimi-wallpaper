import { NextResponse } from "next/server";
import { generateImage, generateComicScript } from "@/service/gemini";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { story, pages = 1, style = "anime" } = await req.json();

    if (!story) {
      return NextResponse.json(
        { code: 0, message: "必须要填写你的猫咪日记才能生成漫画哦" },
        { status: 400 }
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { code: 0, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (pages > 4) {
      return NextResponse.json(
        { code: 0, message: "目前最多只支持生成4格漫画" },
        { status: 400 }
      );
    }

    // 1. 使用 Gemini 分解故事，生成连环画分镜脚本 (包含英文 Prompt 与 中文 Caption)
    const scriptPanels = await generateComicScript(story, pages);

    // 2. 并行调用大模型针对每个分镜作图
    const imagePromises = scriptPanels.map(async (panel: any, index: number) => {
      // 复合画风指令：确保所有格子风格尽量统一
      const globalContext = "The art style MUST match across all panels securely. Continuous character identity. ";
      const finalPrompt = globalContext + panel.prompt;
      
      const base64Image = await generateImage(finalPrompt, "comic", style);

      if (!base64Image.startsWith("data:image")) {
        throw new Error(`第 ${index + 1} 格生成失败`);
      }

      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `comic_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;

      // 上传到 Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("wallpapers")
        .upload(fileName, buffer, {
          contentType: "image/png",
          cacheControl: "3600",
        });

      if (uploadError) {
        throw new Error("图片上传失败: " + uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage.from("wallpapers").getPublicUrl(fileName);

      return {
        imageUrl: publicUrl,
        caption: panel.caption,
        prompt: panel.prompt
      };
    });

    const results = await Promise.all(imagePromises);

    // 等到所有画格生成完毕且取得 URL 后，统一将这组漫画作为一个实体保存到数据库
    const { error: dbError } = await supabase.from("wallpapers").insert({
      image_url: results[0].imageUrl, // 用第一格当做列表上的展示封面
      image_description: JSON.stringify({
        date: new Date().toLocaleDateString("zh-CN"), // 记录当下生成日记的日期
        panels: results
      }), 
      image_size: "comic_v2", 
      user_id: userId,
    });

    if (dbError) {
      console.error("数据库保存连环画实体失败:", dbError);
    }

    return NextResponse.json({
      code: 1,
      message: "ok",
      data: {
        panels: results
      },
    });
  } catch (error: any) {
    console.error("生成连环漫画失败:", error);
    return NextResponse.json(
      { code: 0, message: error.message || "未知错误" },
      { status: 500 }
    );
  }
}
