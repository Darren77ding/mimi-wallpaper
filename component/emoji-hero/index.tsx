import EmojiInput from "../emoji-input";

export default function EmojiHero() {
  return (
    <section className="relative w-full">
      <div className="pointer-events-none absolute -top-10 -left-10 flex items-center justify-center">
        <div className="h-[200px] w-[200px] rounded-[100%] bg-gradient-to-tr from-yellow-100/60 via-orange-50/40 to-transparent opacity-80 blur-[60px]"></div>
      </div>

      <div className="relative z-10 w-full mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            一键召唤
            <br />
            <span className="bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent relative block mt-1">
              喵星表情包
              <svg className="absolute -top-3 -right-6 h-6 w-6 text-amber-500 opacity-90 animate-pulse transform -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-500">
            聊天表情大变身！描述你的天马行空，秒出一个独属于你的搞怪贴纸。
          </p>
        </div>

        <div className="mt-8 w-full">
          <EmojiInput />
        </div>
      </div>
    </section>
  );
}
