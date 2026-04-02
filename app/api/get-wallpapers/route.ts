import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const pageStr = searchParams.get("page") || "1";
    const limit = 20;
    const page = parseInt(pageStr, 10);
    const fromIndex = (page - 1) * limit;
    const toIndex = fromIndex + limit - 1;

    let query = supabase
      .from("wallpapers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(fromIndex, toIndex);

    if (category === 'emoji') {
      query = query.eq('image_size', 'emoji');
    } else if (category === 'comic') {
      query = query.in('image_size', ['comic', 'comic_v2']);
    } else if (category === 'wallpaper') {
      query = query.neq('image_size', 'emoji').neq('image_size', 'comic').neq('image_size', 'comic_v2');
    }

    const { data, count, error } = await query;

    if (error) {
      console.error("查询壁纸失败:", error);
      return NextResponse.json(
        { code: 0, message: error.message },
        { status: 500 }
      );
    }

    const hasMore = count !== null ? (fromIndex + (data?.length || 0) < count) : false;

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
      hasMore,
    });
  } catch (error: any) {
    console.error("获取壁纸列表失败:", error);
    return NextResponse.json(
      { code: 0, message: error.message || "未知错误" },
      { status: 500 }
    );
  }
}