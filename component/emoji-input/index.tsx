"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function EmojiInput() {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const generateEmoji = async function () {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    if (!description.trim()) {
      setError("输入不能为空哦");
      return;
    }

    setLoading(true);
    setError(null);
    setError(null);

    try {
      const result = await fetch("/api/gen-wallpaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: description, aspectRatio: "emoji", style, referenceImage }),
      });

      const { code, data, message } = await result.json();

      if (code === 1 && data?.imageUrl) {
        setDescription(""); // clear input on success
        window.dispatchEvent(new CustomEvent("emoji-generated", { detail: data.imageUrl }));
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
    if (e.key === "Enter" && !loading) generateEmoji();
  };

  return (
    <div className="w-full flex flex-col items-start text-left">
      <div 
        className={`relative flex flex-col w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/10 ${loading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <textarea
          className="w-full bg-transparent px-1 py-2 text-base text-gray-900 outline-none placeholder:text-gray-400 resize-none min-h-[100px]"
          placeholder="描述你的表情包，例如：一只黑猫翻白眼，带文字‘无语’..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={generateEmoji}
            disabled={loading || !description.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-amber-500 active:scale-95 disabled:bg-gray-400 group"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{referenceImage ? "特征融合中..." : "生成中..."}</span>
              </>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                一键召唤表情包
              </span>
            )}
          </button>
        </div>
      </div>

      <div className={`mt-6 w-full flex flex-col gap-5 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex flex-col gap-2">
          {/* 风格下拉框 */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
              <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              风格
            </span>
            <div className="relative">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white pl-4 pr-10 py-2 text-sm font-medium text-gray-700 outline-none hover:border-amber-300 focus:ring-2 focus:ring-amber-500/30 transition-all cursor-pointer shadow-sm"
              >
                <option value="none">自由生成 (默认)</option>
                <option value="anime">日系颜文字风 (Anime)</option>
                <option value="minimalist">线条手绘贴纸 (Doodle)</option>
                <option value="3d">可爱3D卡通 (Cute 3D)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 上传参考图按钮 */}
        <div className="flex items-center">
          {referenceImage ? (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-1.5 pr-4 shadow-sm animate-in fade-in slide-in-from-right-2">
              <img src={referenceImage} alt="Reference" className="h-9 w-9 rounded-lg object-cover ring-1 ring-black/5" />
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-amber-800 tracking-tight">已开启图生图</span>
                 <span className="text-[10px] text-amber-600/80">AI 将魔改这张图</span>
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
    </div>
  );
}
