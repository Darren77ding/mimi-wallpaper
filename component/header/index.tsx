"use client";

import { useAuth } from "@clerk/nextjs";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useState } from "react";

export default function Header() {
  const { isSignedIn } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2 group">
              <img src="/logo.png" alt="MiMi Wallpaper" className="h-10 w-auto object-contain transition-transform group-hover:scale-110" />
              <span className="text-lg font-bold tracking-tight text-black">
                MiMi Wallpaper
              </span>
            </a>
          </div>
          
          <nav className="hidden md:flex flex-1 items-center justify-center space-x-8 text-sm font-medium">
            <a href="/" className="text-gray-500 hover:text-amber-600 transition-colors">喵星壁纸</a>
            <a href="/emoji" className="text-gray-500 hover:text-amber-600 transition-colors">喵星表情包</a>
            <a href="/comic" className="text-gray-500 hover:text-amber-600 transition-colors">猫咪日记</a>
            {/* <a href="#pricing" className="text-gray-500 hover:text-amber-600 transition-colors">价格</a> */}
            {/* <a href="#faq" className="text-gray-500 hover:text-amber-600 transition-colors">FAQ</a> */}
          </nav>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9"
                  }
                }}
              />
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-gray-500 hover:text-amber-600 transition-colors">
                    登录
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="hidden sm:block rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-amber-500 hover:scale-105 active:scale-95">
                    免费注册
                  </button>
                </SignInButton>
              </>
            )}
            
            {/* 移动端汉堡菜单按钮 */}
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-amber-600 focus:outline-none transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="菜单"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 移动端菜单下拉面板 */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[100%] left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-xl py-4 px-6 flex flex-col space-y-4 animate-in slide-in-from-top-4 duration-200 z-40">
          <a href="/" className="block text-base font-bold text-gray-800 hover:text-amber-500 py-2 border-b border-gray-100">喵星壁纸</a>
          <a href="/emoji" className="block text-base font-bold text-gray-800 hover:text-amber-500 py-2 border-b border-gray-100">喵星表情包</a>
          <a href="/comic" className="block text-base font-bold text-gray-800 hover:text-amber-500 py-2 border-b border-gray-100">猫咪日记</a>
          {!isSignedIn && (
             <div className="pt-2">
               <SignInButton mode="modal">
                 <button className="w-full rounded-full bg-black px-4 py-3 text-sm font-medium text-white hover:bg-amber-500">
                   登录 / 免费注册
                 </button>
               </SignInButton>
             </div>
          )}
        </div>
      )}
    </header>
  );
}