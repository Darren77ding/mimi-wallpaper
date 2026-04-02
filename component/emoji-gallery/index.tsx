"use client";

import { Wallpaper } from "@/types/wallpaper";
import { useEffect, useState } from "react";

export default function EmojiGallery() {
  const [emojis, setEmojis] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchEmojis = async (pageNum: number, isRefresh = false) => {
    if (pageNum === 1 && isRefresh === false) setLoading(true);
    else if (pageNum > 1) setLoadingMore(true);

    try {
      const result = await fetch(`/api/get-wallpapers?category=emoji&page=${pageNum}`);
      const { data, hasMore: more } = await result.json();
      if (data) {
        if (isRefresh || pageNum === 1) {
          setEmojis(data);
        } else {
          setEmojis(prev => [...prev, ...data]);
        }
        setHasMore(more);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("加载表情包失败:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEmojis(1);

    const handleRefresh = () => {
      fetchEmojis(1, true);
    };
    
    const handleNewEmoji = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setEmojis(prev => {
          const newEmoji: Wallpaper = {
            id: Date.now(),
            imageUrl: customEvent.detail,
            imageDescription: "新鲜生成的表情包",
            createdAt: new Date().toISOString(),
          };
          return prev ? [newEmoji, ...prev] : [newEmoji];
        });
      }
    };
    
    window.addEventListener("refresh-emoji-gallery", handleRefresh);
    window.addEventListener("emoji-generated", handleNewEmoji);

    return () => {
      window.removeEventListener("refresh-emoji-gallery", handleRefresh);
      window.removeEventListener("emoji-generated", handleNewEmoji);
    };
  }, []);
  const handleDownload = (imageUrl: string, description: string) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);
        const resizedDataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = resizedDataUrl;
        const safeDesc = description.substring(0, 10).replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '') || Date.now().toString();
        a.download = `mimi_sticker_512x512_${safeDesc}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
    img.src = imageUrl;
  };

  return (
    <section id="gallery" className="h-full w-full">
      <div className="w-full">
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
            图库
            <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </h2>
          <span className="text-xs font-medium text-gray-400">实时更新</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gray-200"></div>
            ))}
          </div>
        ) : !emojis || emojis.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <svg className="h-16 w-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium">暂时没有表情包</p>
            <p className="text-xs text-gray-400 mt-1">快去左侧控制台召唤您的专属贴纸吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {emojis.map((emoji, idx) => (
              <div
                key={emoji.id || idx}
                className="group relative overflow-hidden rounded-2xl bg-white aspect-square flex items-center justify-center cursor-pointer shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:border-amber-200"
              >
                <img
                  src={emoji.imageUrl}
                  className="w-full h-full object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-110"
                  alt={emoji.imageDescription || "AI Emoji"}
                  loading="lazy"
                />
                
                {/* 悬停时的遮罩和下载图标 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-xs font-medium text-white line-clamp-2">
                       {emoji.imageDescription || "AI 生成之作"}
                    </p>
                    <div className="mt-3 flex items-center justify-between pointer-events-auto">
                       <span className="text-[10px] text-gray-300 hidden sm:block">
                         {new Date(emoji.createdAt || Date.now()).toLocaleDateString()}
                       </span>
                       <button 
                         onClick={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           handleDownload(emoji.imageUrl, emoji.imageDescription || "");
                         }}
                         title="打包下载贴纸标准尺寸 (512x512)"
                         className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors ml-auto sm:ml-0 pointer-events-auto cursor-pointer"
                       >
                         <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页按钮 */}
        {!loading && hasMore && (
           <div className="mt-8 flex justify-center pb-8">
             <button 
               onClick={() => fetchEmojis(page + 1)}
               disabled={loadingMore}
               className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {loadingMore ? (
                 <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               ) : (
                 <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
               )}
               {loadingMore ? '加载中...' : '加载更多'}
             </button>
           </div>
        )}
      </div>
    </section>
  );
}
