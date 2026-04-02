"use client";

import { Wallpaper } from "@/types/wallpaper";
import { useEffect, useState } from "react";

// 新生成的整条漫画
type ComicStrip = {
  imageUrl: string;
  caption: string;
};

export default function ComicGallery() {
  const [historyPanels, setHistoryPanels] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [activeComic, setActiveComic] = useState<ComicStrip[] | null>(null);

  const fetchHistory = async (pageNum: number, isRefresh = false) => {
    if (pageNum === 1 && isRefresh === false) setLoading(true);
    else if (pageNum > 1) setLoadingMore(true);

    try {
      const result = await fetch(`/api/get-wallpapers?category=comic&page=${pageNum}`);
      const { data, hasMore: more } = await result.json();
      if (data) {
        if (isRefresh || pageNum === 1) {
          setHistoryPanels(data);
        } else {
          setHistoryPanels(prev => [...prev, ...data]);
        }
        setHasMore(more);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("加载历史连环画失败:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);

    const handleNewComic = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        // 设置顶部的整条 Webtoon 视图
        setActiveComic(customEvent.detail);
        
        // 同时也主动抓取这次的新数据作为一条 V2 历史图库
        setHistoryPanels(prev => {
          const newStrip = {
             id: Date.now(),
             imageUrl: customEvent.detail[0]?.imageUrl || "",
             imageDescription: JSON.stringify({
               date: new Date().toLocaleDateString("zh-CN"),
               panels: customEvent.detail
             }),
             imageSize: "comic_v2",
             createdAt: new Date().toISOString()
          };
          return prev ? [newStrip, ...prev] : [newStrip];
        });
      }
    };
    
    window.addEventListener("comic-generated", handleNewComic);
    return () => {
      window.removeEventListener("comic-generated", handleNewComic);
    };
  }, []);

  return (
    <section id="gallery" className="h-full w-full">
      <div className="w-full">
        <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
            连环画展厅
            <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </h2>
          <span className="text-xs font-medium text-gray-400">上下滚动阅读</span>
        </div>

        {/* --- 最新生成的漫画 (Webtoon 模式) --- */}
        {activeComic && activeComic.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800">✨ 刚刚生成的日记</h3>
              <button 
                 onClick={() => setActiveComic(null)}
                 className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
              >
                 收起
              </button>
            </div>
            
            {/* 核心：前后端合成连环画 */}
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 bg-gray-50 p-6 rounded-[2rem] border border-gray-200 shadow-inner">
              {activeComic.map((panel, idx) => (
                <div key={idx} className="flex flex-col rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100 animate-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 150}ms` }}>
                  <img src={panel.imageUrl} className="w-full h-auto object-cover" alt={panel.caption} />
                  <div className="p-4 bg-white border-t border-gray-50 flex items-start gap-3">
                     <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold leading-none">{idx + 1}</span>
                     <p className="text-sm font-medium leading-relaxed text-gray-800 break-words">{panel.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- 历史单格画廊 --- */}
        <h3 className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-wider">历史分镜库</h3>
        
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-200"></div>
            ))}
          </div>
        ) : !historyPanels || historyPanels.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[200px]">
            <svg className="h-16 w-16 mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm font-medium">暂时没有绘画记录</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5 items-start">
            {historyPanels.map((panelData, idx) => {
              let isV2 = false;
              let comicData: any = null;
              try {
                if (panelData.imageSize === 'comic_v2') {
                   comicData = JSON.parse(panelData.imageDescription || "{}");
                   isV2 = true;
                }
              } catch(e) {}

              // === 新版多格合并卡片展示 (方案A) ===
              if (isV2 && comicData.panels) {
                return (
                  <div key={panelData.id} className="break-inside-avoid w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-xl transition-all border-b-4 border-b-amber-300 cursor-pointer group">
                     <div className="flex justify-between items-center mb-3 px-1 gap-2">
                        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1 truncate">
                          <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="truncate">{comicData.date || '喵星日记'}</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                          📚 {comicData.panels.length} 页
                        </span>
                     </div>
                     <div className="flex flex-col gap-3">
                        {comicData.panels.map((p: any, i: number) => (
                           <div key={i} className="flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-gray-50/50 shadow-inner group-hover:border-amber-200 transition-colors">
                             <img src={p.imageUrl} loading="lazy" className="w-full h-auto object-cover" alt={p.caption} />
                             <div className="p-2.5 bg-white text-[11px] font-medium text-gray-800 leading-relaxed text-center px-3 border-t border-gray-50">{p.caption}</div>
                           </div>
                        ))}
                     </div>
                  </div>
                );
              }

              // === 旧版单图回退兼容展示 ===
              return (
                <div
                  key={panelData.id || idx}
                  className="break-inside-avoid group relative overflow-hidden rounded-2xl bg-white flex flex-col cursor-pointer shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:border-amber-200"
                >
                  <img
                    src={panelData.imageUrl}
                    className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    alt={panelData.imageDescription || "AI Comic"}
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="text-xs font-semibold text-white drop-shadow-md line-clamp-2">
                       {panelData.imageDescription || "连环画分镜"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 分页按钮 */}
        {!loading && hasMore && (
           <div className="mt-8 flex justify-center pb-8">
             <button 
               onClick={() => fetchHistory(page + 1)}
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
