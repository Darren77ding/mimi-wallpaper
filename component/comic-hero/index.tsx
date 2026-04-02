import ComicInput from "../comic-input";

export default function ComicHero() {
  return (
    <section className="relative w-full">
      <div className="pointer-events-none absolute -top-10 -left-10 flex items-center justify-center">
        {/* Replace ambient backdrop colors for comic styling */}
        <div className="h-[200px] w-[200px] rounded-[100%] bg-gradient-to-tr from-yellow-100/60 via-amber-50/40 to-transparent opacity-80 blur-[60px]"></div>
      </div>

      <div className="relative z-10 w-full mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            连环漫画
            <br />
            <span className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent relative block mt-1">
              喵星日记
              <svg className="absolute -top-3 -right-6 h-6 w-6 text-amber-500 opacity-90 animate-pulse transform rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            用 AI 画笔记录您与爱宠的温馨、搞笑瞬间。描述一段日常故事，秒出专属连环画。
          </p>
        </div>

        <div className="mt-8 w-full">
          <ComicInput />
        </div>
      </div>
    </section>
  );
}
