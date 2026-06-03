import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Lấy cookie phiên đăng nhập
  const sessionId = request.cookies.get('session_user_id')?.value;
  const { pathname } = request.nextUrl;

  // 1. Danh sách các trang MỞ CỬA TỰ DO (Không cần đăng nhập vẫn vào được)
  const publicPaths = ['/login', '/register', '/forgot-password'];

  // Nếu người dùng chưa đăng nhập VÀ đang cố vào một trang không nằm trong danh sách tự do
  if (!sessionId && !publicPaths.includes(pathname)) {
    // Đuổi về trang đăng nhập
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Nếu đã đăng nhập rồi mà cố tình vào lại trang login/register thì đẩy thẳng vào trong
  if (sessionId && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Cho phép đi tiếp
  return NextResponse.next();
}

// Cấu hình để middleware không chặn các file tĩnh (hình ảnh, css, api...)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};