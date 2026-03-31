import WallpaperInput from "../input";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* 极简风的背景光晕 (带有极光的微暖色调) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[400px] w-[600px] rounded-[100%] bg-gradient-to-tr from-amber-100/40 via-orange-50/20 to-transparent opacity-60 blur-[100px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="relative mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-black sm:text-6xl lg:text-7xl">
            一爪挥出
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent relative">
              {" "}创意喵壁纸{" "}
              <span className="absolute -top-4 -right-10 text-3xl md:text-5xl transform rotate-12 opacity-80 animate-bounce">🐾</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-500">
            只需输入你的灵感，强大的 AI 喵星人将在几秒钟内为你渲染出独一无二的高清壁纸。极简操作，喵不可言。
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <WallpaperInput />
        </div>
      </div>
    </section>
  );
}