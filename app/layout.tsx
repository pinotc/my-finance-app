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

  if (!session) {
    return (
      <html lang="vi">
        <body className={`${inter.className} bg-slate-50`}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="vi">
      <body className={`${inter.className} flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden`}>
        
        {/* 1. SIDEBAR (PC) */}
        <aside className="hidden md:flex w-64 bg-white border-r border-sky-100 flex-col shrink-0 z-30"> 
          <div className="h-20 flex items-center px-8 border-b border-sky-50">
            <div className="w-8 h-8 bg-sky-200 rounded-lg mr-3 flex items-center justify-center text-sky-700 font-bold">F</div>
            <h1 className="text-xl font-bold text-sky-900 tracking-tight">Finance App</h1>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link href="/" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Tổng quan tài sản</Link>
            <Link href="/reports" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Báo cáo tài chính</Link>
            <Link href="/investments" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Danh mục Đầu tư</Link>
            <Link href="/budgets" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Quản lý Ngân sách</Link>
            <Link href="/debts" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Quản lý Nợ & Thẻ</Link>
            <Link href="/goals" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Mục tiêu Tài chính</Link>
            <Link href="/recurring" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Hóa đơn & Định kỳ</Link>
            <Link href="/forecast" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium">Dự báo Dòng tiền</Link>           
            <Link href="/settings" className="flex items-center px-4 py-3 text-slate-500 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-colors font-medium mt-4">
              Cài đặt Hệ thống
            </Link>
          </nav>
          <div className="p-4 border-t border-sky-50">
            <form action={logout}>
              <button type="submit" className="w-full flex items-center px-4 py-3 text-xs text-rose-500 hover:bg-rose-50 rounded-xl font-semibold transition-all">
                Đăng xuất tài khoản
              </button>
            </form>
          </div>
        </aside>

        {/* 2. KHUNG NỘI DUNG CHÍNH */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          
          {/* HEADER (MOBILE & PC) - Cố định ở trên cùng */}
          <header className="h-16 md:h-20 bg-white border-b border-sky-100 flex items-center justify-between px-4 md:px-10 shrink-0 z-40">
            <h2 className="text-lg md:text-xl font-semibold text-slate-700 truncate mr-2">Hệ thống Quản lý</h2>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-700">{session.name}</p>
              </div>
              
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold border border-sky-200 shrink-0">
                {session.name.charAt(0)}
              </div>

              {/* DROPDOWN MENU MOBILE - Đã fix hiển thị */}
              <details className="md:hidden group relative">
                <summary className="list-none cursor-pointer p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </summary>
                
                {/* Menu này sẽ đè lên trên mọi thứ nhờ z-50 */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 flex flex-col gap-1 z-50 animate-in fade-in zoom-in duration-200">
                  <Link href="/budgets" className="px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl font-medium">💰 Ngân sách</Link>
                  <Link href="/debts" className="px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl font-medium">💳 Nợ & Thẻ</Link>
                  <Link href="/goals" className="px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl font-medium">🎯 Mục tiêu</Link>
                  <Link href="/recurring" className="px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl font-medium">🔄 Hóa đơn</Link>
                  <Link href="/forecast" className="px-4 py-3 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-700 rounded-xl font-medium">📈 Dự báo</Link>
                </div>
              </details>
            </div>
          </header>
          
          {/* VÙNG CUỘN NỘI DUNG TRANG CON */}
          <main className="flex-1 overflow-y-auto bg-slate-50 pb-24 md:pb-6">
            {children} 
          </main>
        </div>

        {/* 3. TAB BAR (MOBILE) - Luôn nằm trên cùng lớp giao diện */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around items-center px-1 py-3 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <Link href="/" className="flex flex-col items-center p-1 text-slate-400 hover:text-sky-600 transition-colors">
            <span className="text-xl mb-1">💼</span>
            <span className="text-[10px] font-bold">Tài sản</span>
          </Link>

          <Link href="/reports" className="flex flex-col items-center p-1 text-slate-400 hover:text-sky-600 transition-colors">
            <span className="text-xl mb-1">📈</span>
            <span className="text-[10px] font-bold">Báo cáo</span>
          </Link>

          <Link href="/investments" className="flex flex-col items-center p-1 text-slate-400 hover:text-sky-600 transition-colors">
            <span className="text-xl mb-1">💰</span>
            <span className="text-[10px] font-bold">Đầu tư</span>
          </Link>

          <Link href="/settings" className="flex flex-col items-center p-1 text-slate-400 hover:text-sky-600 transition-colors">
            <span className="text-xl mb-1">⚙️</span>
            <span className="text-[10px] font-bold">Cài đặt</span>
          </Link>

          <form action={logout} className="flex">
            <button type="submit" className="flex flex-col items-center p-1 text-rose-400 hover:text-rose-500 transition-colors">
              <span className="text-xl mb-1">🚪</span>
              <span className="text-[10px] font-bold">Thoát</span>
            </button>
          </form>
        </nav>

      </body>
    </html>
  );
}