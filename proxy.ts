import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 定义哪些路由是受保护的（必须登录）
const isProtectedApiRoute = createRouteMatcher(['/api/gen-wallpaper(.*)'])

export const proxy = clerkMiddleware(async (auth, req) => {
  // 如果调用的是生成壁纸 API，必须登录
  if (isProtectedApiRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
