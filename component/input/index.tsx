"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function WallpaperInput() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("none");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("参考图片不能超过 5MB 哦");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();

  const generateWallpaper = async function () {
    if (!isSignedIn) {
      // 如果未登录，直接弹出登录框，打断生成
      openSignIn();
      return;
    }

    if (!description.trim()) {
      setError("输入不能为空哦");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await fetch("/api/gen-wallpaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: description, aspectRatio, style, referenceImage }),
      });

      const { code, data, message } = await result.json();

      if (code === 1 && data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        // Refresh server components (Gallery) smoothly without losing client state
        router.refresh();
        // Emit custom event for client-side Gallery component to refetch
        window.dispatchEvent(new Event("refresh-gallery"));
      } else {
        setError(message || "生成失败，稍后再试");
      }
    } catch (err) {
      setError("网络错误，可能是接口超时");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) generateWallpaper();
  };

  return (
    <div className="w-full max-w-3xl flex flex-col items-center">
      <div 
        className={`relative flex w-full items-center rounded-2xl border border-gray-200 bg-white p-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-amber-500 focus-within:shadow-md ${loading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <span className="pl-4 pr-2 text-amber-500 text-xl">🐾</span>
        <input
          type="text"
          className="flex-1 bg-transparent px-2 py-3 text-lg text-gray-900 outline-none placeholder:text-gray-400"
          placeholder="例如：一只在赛博朋克深巷中漫步的黑猫，霓虹倒影..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button
          onClick={generateWallpaper}
          disabled={loading}
          className="ml-2 flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-amber-500 active:scale-95 disabled:bg-gray-400 group"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{referenceImage ? "视觉解析融合中..." : "魔法渲染中..."}</span>
            </>
          ) : (
            <span className="flex items-center gap-1">爪击生成 <span className="text-xs group-hover:rotate-12 transition-transform">🐾</span></span>
          )}
        </button>
      </div>

      {/* 附加参数控制条 */}
      <div className={`mt-5 w-full flex flex-wrap items-center justify-between gap-4 px-2 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* 尺寸下拉框 */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
              <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              画幅
            </span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white pl-3 pr-10 py-2 text-sm font-medium text-gray-700 outline-none hover:border-amber-300 focus:ring-2 focus:ring-amber-500/30 transition-all cursor-pointer shadow-sm"
            >
              <option value="1:1">1:1 (默认方形)</option>
              <option value="16:9">16:9 (电脑壁纸)</option>
              <option value="9:16">9:16 (手机壁纸)</option>
            </select>
          </div>

          {/* 风格下拉框 */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
              <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              灵感
            </span>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white pl-3 pr-10 py-2 text-sm font-medium text-gray-700 outline-none hover:border-amber-300 focus:ring-2 focus:ring-amber-500/30 transition-all cursor-pointer shadow-sm"
            >
              <option value="none">自由生成 (默认)</option>
              <option value="anime">日系动漫 (Anime)</option>
              <option value="cyberpunk">赛博朋克 (Cyberpunk)</option>
              <option value="minimalist">极简黑白 (Minimalist)</option>
              <option value="photorealistic">超写实摄影 (Photo)</option>
              <option value="watercolor">水彩绘本风 (Watercolor)</option>
            </select>
          </div>
        </div>

        {/* 上传参考图按钮 */}
        <div className="flex items-center">
          {referenceImage ? (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-1.5 pr-4 shadow-sm animate-in fade-in slide-in-from-right-2">
              <img src={referenceImage} alt="Reference" className="h-9 w-9 rounded-lg object-cover ring-1 ring-black/5" />
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-amber-800 tracking-tight">已开启图生图</span>
                 <span className="text-[10px] text-amber-600/80">AI 将提取特征并重绘</span>
              </div>
              <button onClick={() => setReferenceImage(null)} className="ml-2 text-amber-600/60 hover:text-red-500 p-1 rounded-full hover:bg-white transition-all">✖</button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-5 py-2.5 text-sm font-medium text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 active:scale-95 transition-all shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16L8.586 11.414a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>+ 上传参考图</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full">{error}</p>}

      {generatedImage && (
        <div className="mt-16 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative mx-auto w-full max-w-2xl rounded-[2rem] bg-white/60 backdrop-blur-xl p-6 sm:p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] ring-1 ring-gray-900/5">
            
            {/* 顶层极简文案区 */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold tracking-tight text-gray-900">
                作品已就绪
              </h3>
              <p className="text-gray-400 text-sm mt-1.5 font-medium">已自动备份至底层画廊</p>
            </div>

            {/* 极简无边框图片展示区 */}
            <div className="group relative mx-auto w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 bg-gray-50">
              <img src={generatedImage} alt={description} className="w-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]" />
              
              {/* 高级幽灵渐变遮罩 */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 pt-24 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                 <p className="text-white/90 text-sm font-light leading-relaxed max-w-prose">
                   {description}
                 </p>
              </div>
            </div>

            {/* 极简操作区 */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href={generatedImage} 
                download={`mimi_wallpaper_${Date.now()}.png`}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-black hover:ring-4 hover:ring-gray-900/10 active:scale-95"
              >
                保存原图
              </a>
              <button 
                onClick={() => setGeneratedImage(null)}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-transparent px-8 py-3.5 text-sm font-medium text-gray-500 transition-all hover:bg-gray-100 hover:text-gray-900 active:scale-95"
              >
                收起
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}