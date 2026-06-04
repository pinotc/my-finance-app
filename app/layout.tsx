import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { getSession, logout } from './actions/authActions';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Finance Dashboard',
  description: 'Hệ thống quản lý tài chính cá nhân',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // NẾU CHƯA ĐĂNG NHẬP: Trả về giao diện trống hoàn toàn
  if (!session) {
    return (
      <html lang="vi">
        <body className={`${inter.className} bg-slate-50`}>
          {children}
        </body>
      </html>
    );
  }

  // NẾU ĐÃ ĐĂNG NHẬP: Giao diện xịn sò Responsive
  return (
    <html lang="vi">
      <body className={`${inter.className} flex h-screen bg-slate-50 font-sans text-slate-800`}>
        
        {/* 1. SIDEBAR (PC): Thêm class 'hidden md:flex' để tàng hình trên điện thoại */}
        <aside className="hidden md:flex w-64 bg-white border-r border-sky-100 flex-col shrink-0 z-20"> 
          <div className="h-20 flex items-center px-8 border-b border-sky-50">
            <div className="w-8 h-8 bg-sky-200 rounded-lg mr-3 flex items-center justify-center text-sky-700 font-bold">F</div>
            <h1 className="text-xl font-bold text-sky-900 tracking-tight">Finance App</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link href="/" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Tổng quan & Thu Chi</Link>
            <Link href="/investments" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Danh mục Đầu tư</Link>
            <Link href="/budgets" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Quản lý Ngân sách</Link>
            <Link href="/debts" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Quản lý Nợ & Thẻ</Link>
            <Link href="/goals" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Mục tiêu Tài chính</Link>
            <Link href="/recurring" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Hóa đơn & Định kỳ</Link>
            <Link href="/forecast" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Dự báo Dòng tiền</Link>          
            <Link href="/settings" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium mt-4">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Cài đặt Hệ thống
            </Link>
          </nav>

          <div className="p-4 border-t border-sky-50">
            <form action={logout}>
              <button type="submit" className="w-full flex items-center px-4 py-3 text-xs text-rose-500 hover:bg-rose-50 rounded-xl font-semibold transition-all">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Đăng xuất tài khoản
              </button>
            </form>
          </div>
        </aside>

        {/* 2. KHUNG NỘI DUNG: Sửa chữ lỗi, thêm pb-16 cho mobile để không bị đè bởi Bottom Tab */}
        <div className="flex-1 flex flex-col overflow-hidden relative pb-16 md:pb-0">
          {/* Header: Chỉnh lại chiều cao và padding cho gọn trên Mobile */}
          <header className="h-16 md:h-20 bg-white border-b border-sky-100 flex items-center justify-between px-4 md:px-10 shrink-0 z-20 relative">
            <h2 className="text-lg md:text-xl font-semibold text-slate-700">Hệ thống Quản lý</h2>
            
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">{session.name}</p>
              </div>
              
              {/* Nút Avatar */}
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold border border-sky-200">
                {session.name.charAt(0)}
              </div>

              {/* DROPDOWN MENU MOBILE (CSS Only - Dành cho các tính năng phụ) */}
              <details className="md:hidden group relative">
                <summary className="list-none cursor-pointer p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </summary>
                
                {/* Nội dung Menu xổ xuống */}
                <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 flex flex-col gap-1 z-50">
                  <Link href="/budgets" className="px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl font-medium">💰 Ngân sách</Link>
                  <Link href="/debts" className="px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl font-medium">💳 Nợ & Thẻ</Link>
                  <Link href="/goals" className="px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl font-medium">🎯 Mục tiêu</Link>
                  <Link href="/recurring" className="px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl font-medium">🔄 Hóa đơn</Link>
                  <Link href="/forecast" className="px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl font-medium">📈 Dự báo</Link>
                </div>
              </details>
            </div>
          </header>
          
          {children} 
        </div>

        {/* 3. TAB BAR (MOBILE): Hiện thị riêng cho iPhone, tàng hình trên PC */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center px-2 py-2 pb-safe z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <Link href="/" className="flex flex-col items-center p-2 text-slate-400 hover:text-sky-600">
            <span className="text-xl mb-1">📊</span>
            <span className="text-[10px] font-bold">Tổng quan</span>
          </Link>

          <Link href="/investments" className="flex flex-col items-center p-2 text-sky-600">
            <span className="text-xl mb-1">💰</span>
            <span className="text-[10px] font-bold">Đầu tư</span>
          </Link>

          <Link href="/settings" className="flex flex-col items-center p-2 text-slate-400 hover:text-sky-600">
            <span className="text-xl mb-1">⚙️</span>
            <span className="text-[10px] font-bold">Cài đặt</span>
          </Link>

          <form action={logout}>
            <button type="submit" className="flex flex-col items-center p-2 text-rose-400 hover:text-rose-500">
              <span className="text-xl mb-1">🚪</span>
              <span className="text-[10px] font-bold">Thoát</span>
            </button>
          </form>
        </nav>

      </body>
    </html>
  );
}