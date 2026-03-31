import Wallpapers from "@/component/wallpapers";
import Header from "@/component/header";
import Footer from "@/component/footer";
import Hero from "@/component/hero";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 selection:bg-black selection:text-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <Wallpapers />
      </main>
      <Footer />
    </div>
  );
}
