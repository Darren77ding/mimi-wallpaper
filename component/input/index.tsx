"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function WallpaperInput() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ prompt: description }),
      });

      const { code, data, message } = await result.json();

      if (code === 1 && data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        // Refresh server components (Gallery) smoothly without losing client state
        router.refresh();
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
              <span>魔法渲染中...</span>
            </>
          ) : (
            <span className="flex items-center gap-1">爪击生成 <span className="text-xs group-hover:rotate-12 transition-transform">🐾</span></span>
          )}
        </button>
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