import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("wallpapers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("查询壁纸失败:", error);
      return NextResponse.json(
        { code: 0, message: error.message },
        { status: 500 }
      );
    }

    // 将数据库字段映射为前端使用的驼峰命名
    const wallpapers = (data || []).map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      imageDescription: row.image_description,
      imageSize: row.image_size,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      code: 1,
      message: "ok",
      data: wallpapers,
    });
  } catch (error: any) {
    console.error("获取壁纸列表失败:", error);
    return NextResponse.json(
      { code: 0, message: error.message || "未知错误" },
      { status: 500 }
    );
  }
}