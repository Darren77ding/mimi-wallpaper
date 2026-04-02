"use client";

import { Wallpaper } from "@/types/wallpaper";
import { useEffect, useState } from "react";

export default function Wallpapers() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchWallpapers = async (pageNum: number, isRefresh = false) => {
    if (pageNum === 1 && isRefresh === false) setLoading(true);
    else if (pageNum > 1) setLoadingMore(true);

    try {
      const result = await fetch(`/api/get-wallpapers?category=wallpaper&page=${pageNum}`);
      const { data, hasMore: more } = await result.json();
      
      if (data) {
        if (isRefresh || pageNum === 1) {
          setWallpapers(data);
        } else {
          setWallpapers(prev => [...prev, ...data]);
        }
        setHasMore(more);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("加载壁纸失败:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchWallpapers(1);

    // 监听生成组件发出的刷新事件
    const handleRefresh = () => {
      fetchWallpapers(1, true);
    };
    window.addEventListener("refresh-gallery", handleRefresh);

    return () => {
      window.removeEventListener("refresh-gallery", handleRefresh);
    };
  }, []);

  return (
    <section id="gallery" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">喵星画廊 <span className="text-amber-500">🐾</span></h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">探索全世界铲屎官在此生成的喵级绝美壁纸。</p>
        </div>

        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="break-inside-avoid animate-pulse rounded-2xl bg-gray-200 h-64 mb-6"></div>
            ))}
          </div>
        ) : !wallpapers || wallpapers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
             <span className="text-4xl mb-4 opacity-50">😿</span>
            暂时没有壁纸，你是第一个见证魔力的人。
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {wallpapers.map((wallpaper, idx) => (
              <div
                key={wallpaper.id || idx}
                className="group relative overflow-hidden rounded-2xl bg-gray-100 cursor-pointer shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-xl hover:ring-gray-900/10"
              >
                <img
                  src={wallpaper.imageUrl}
                  className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  alt={wallpaper.imageDescription || "AI Wallpaper"}
                  loading="lazy"
                />
                
                {/* 悬停时的遮罩和下载图标 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-sm font-medium text-white line-clamp-2">
                       {wallpaper.imageDescription || "AI 生成之作"}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                       <span className="text-xs text-gray-300">
                         {new Date(wallpaper.createdAt || Date.now()).toLocaleDateString()}
                       </span>
                       <a 
                         href={wallpaper.imageUrl} 
                         download 
                         target="_blank"
                         rel="noreferrer"
                         className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-colors"
                       >
                         <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                         </svg>
                       </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页按钮 */}
        {!loading && hasMore && (
           <div className="mt-12 flex justify-center">
             <button 
               onClick={() => fetchWallpapers(page + 1)}
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