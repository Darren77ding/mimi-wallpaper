"use client";

import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

export default function ComicInput() {
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState("webtoon");

  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const generateComic = async function () {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    if (!description.trim()) {
      setError("日记内容不能为空哦");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. 发起请求给后端，分镜并绘画
      const result = await fetch("/api/gen-comic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: description, pages, style }),
      });

      const { code, data, message } = await result.json();

      if (code === 1 && data?.panels) {
        setDescription(""); // 清空输入
        // 触发自定事件，将漫画画格推送到画廊中
        window.dispatchEvent(new CustomEvent("comic-generated", { detail: data.panels }));
      } else {
        setError(message || "生成失败，稍后再试");
      }
    } catch (err) {
      setError("网络错误导致生成超时，由于多格生成耗时较长，请稍候重试");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Mac(Meta)+Enter 或者是 Windows(Ctrl)+Enter 才提交，因为日记一般带换行
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !loading) {
      generateComic();
    }
  };

  return (
    <div className="w-full flex flex-col items-start text-left">
      <div 
        className={`relative flex flex-col w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/10 ${loading ? 'opacity-70 pointer-events-none' : ''}`}
      >
        <textarea
          className="w-full bg-transparent px-1 py-2 text-base text-gray-900 outline-none placeholder:text-gray-400 resize-none min-h-[140px]"
          placeholder="写下关于猫咪的一段趣事... (例如: 刚倒满水准备喝，这主子走过来闻了闻，居然当面洗脚！)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-4 flex flex-col gap-2">
          <button
            onClick={generateComic}
            disabled={loading || !description.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-amber-500 active:scale-95 disabled:bg-gray-400 group"
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>剧本构思与绘制中 (预估 {pages * 15} 秒)...</span>
              </>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                编写故事并生成画面
              </span>
            )}
          </button>
        </div>
      </div>

      <div className={`mt-6 w-full flex flex-col gap-5 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex flex-col gap-4">
          
          {/* 格数选择器 */}
          <div className="flex items-center justify-between gap-2 border border-gray-100 rounded-xl p-3 bg-white shadow-sm">
            <span className="text-sm font-medium text-gray-500">剧本分格数量</span>
            <div className="flex gap-2">
              {[1, 2].map((num) => (
                <button
                  key={num}
                  onClick={() => setPages(num)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${pages === num ? 'bg-amber-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {num} 格
                </button>
              ))}
            </div>
          </div>

          {/* 漫画风格拉框 */}
          <div className="flex items-center justify-between gap-2 border border-gray-100 rounded-xl p-3 bg-white shadow-sm">
            <span className="text-sm font-medium text-gray-500">默认画风</span>
            <div className="relative">
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="appearance-none rounded-lg border-0 bg-transparent pl-4 pr-8 py-1.5 text-sm font-semibold text-gray-700 outline-none cursor-pointer"
              >
                <option value="comic book illustration">手绘漫画 (Sketch)</option>
                <option value="minimalist flat vector illustration">极简插画 (Minimalist)</option>
                <option value="webtoon style, vertical comic manga">韩系 Webtoon</option>
                <option value="japanese anime style, studio ghibli">日系绘本 (Anime)</option>
                <option value="3D cute disney pixar style">3D 卡通 (Pixar)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>

      {error && <p className="mt-4 text-sm font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full">{error}</p>}
    </div>
  );
}
