"use client";

import { useAuth } from "@clerk/nextjs";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  const { isSignedIn } = useAuth();

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
            <a href="#gallery" className="text-gray-500 hover:text-amber-600 transition-colors">画廊</a>
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
                  <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-transform hover:bg-amber-500 hover:scale-105 active:scale-95">
                    免费注册
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}