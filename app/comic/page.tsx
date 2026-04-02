import Header from "@/component/header";
import Footer from "@/component/footer";
import ComicHero from "@/component/comic-hero";
import ComicGallery from "@/component/comic-gallery";

export const metadata = {
  title: "猫咪日记生成器 | MiMi Comic",
  description: "一键生成连环漫",
};

export default function ComicPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 selection:bg-black selection:text-white">
      <Header />
      <main className="flex-1 bg-amber-50/50 relative">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* 左侧：固宽侧边栏 */}
            <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 lg:sticky lg:top-24 z-10">
              <ComicHero />
            </div>
            {/* 右侧：沉浸式画廊面板 (类似 Webtoon 垂直浏览) */}
            <div className="flex-1 w-full bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-gray-900/5 overflow-hidden min-h-[calc(100vh-12rem)] p-6 lg:p-10">
              <ComicGallery />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
