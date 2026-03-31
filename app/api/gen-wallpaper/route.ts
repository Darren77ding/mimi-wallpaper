import { NextResponse } from "next/server";
import { generateImage, analyzeImage } from "@/service/gemini";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { prompt, aspectRatio, style, referenceImage } = await req.json();

    if (!prompt && !referenceImage) {
      return NextResponse.json(
        { code: 0, message: "提示词或参考图至少需提供一项" },
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

    let finalPrompt = prompt || "根据图中元素重新生成一幅高清艺术作品";

    // 1. 如果包含参考图（图生图模式），先调用视觉大模型反推细节
    if (referenceImage) {
      // 解析 data:image/jpeg;base64,... 的格式
      const mimeTypeMatch = referenceImage.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
      const base64Data = referenceImage.replace(/^data:image\/\w+;base64,/, "");

      // 调用多模态提取并合并用户指令
      finalPrompt = await analyzeImage(base64Data, mimeType, finalPrompt);
    }

    // 2. 调用 Gemini 生成图片并传入高级参数
    const base64Image = await generateImage(finalPrompt, aspectRatio, style);

    // 检查是否真的生成了图片（以 data:image 开头）
    if (!base64Image.startsWith("data:image")) {
      return NextResponse.json(
        { code: 0, message: "AI 未能生成图片，请换个描述试试" },
        { status: 500 }
      );
    }

    // 2. 将 base64 转为 Buffer，准备上传
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // 3. 生成唯一文件名
    const fileName = `wallpaper_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.png`;

    // 4. 上传到 Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("wallpapers")
      .upload(fileName, buffer, {
        contentType: "image/png",
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("上传失败:", uploadError);
      return NextResponse.json(
        { code: 0, message: "图片上传失败: " + uploadError.message },
        { status: 500 }
      );
    }

    // 5. 获取图片的公开 URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("wallpapers").getPublicUrl(fileName);

    // 6. 保存记录到数据库
    const { error: dbError } = await supabase.from("wallpapers").insert({
      image_url: publicUrl,
      image_description: prompt || "Image-to-Image Generation",
      image_size: aspectRatio || "1:1",
      user_id: userId,
    });

    if (dbError) {
      console.error("数据库保存失败:", dbError);
      // 图片已上传成功，即使数据库写入失败也返回图片
    }

    return NextResponse.json({
      code: 1,
      message: "ok",
      data: {
        imageUrl: publicUrl,
        imageDescription: prompt,
      },
    });
  } catch (error: any) {
    console.error("生成壁纸失败:", error);
    return NextResponse.json(
      { code: 0, message: error.message || "未知错误" },
      { status: 500 }
    );
  }
}
