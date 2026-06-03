'use client'

import { useActionState, Suspense } from 'react';
import { login } from '../actions/authActions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// Tách riêng form ra một component để bọc Suspense (Chuẩn Next.js khi dùng useSearchParams)
function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  const searchParams = useSearchParams();
  
  // Bắt cờ thông báo đăng ký thành công từ URL
  const registerSuccess = searchParams.get('register') === 'success';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6 w-full">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-slate-100 border border-sky-50/50 space-y-8">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-sky-100 text-sky-600 font-bold text-xl flex items-center justify-center rounded-2xl mx-auto shadow-sm shadow-sky-100">
            F
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight pt-2">Chào mừng quay trở lại</h2>
          <p className="text-slate-400 text-sm">Hệ thống quản lý tài chính thông minh</p>
        </div>

        <form action={formAction} className="space-y-5">
          {/* Khối thông báo ĐĂNG KÝ thành công */}
          {registerSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs px-4 py-3 rounded-xl font-medium">
              Đăng ký tài khoản thành công! Vui lòng đăng nhập để bắt đầu.
            </div>
          )}

          {/* Khối thông báo lỗi đăng nhập (Sai pass/username) */}
          {state?.error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs px-4 py-3 rounded-xl font-medium">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên đăng nhập</label>
            <input 
              type="text" name="username"
              className="w-full p-3.5 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50 transition-all" 
              placeholder="Nhập tên đăng nhập của bạn"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mật khẩu</label>
            </div>
            <input 
              type="password" name="password" 
              className="w-full p-3.5 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-50 transition-all" 
              placeholder="Nhập mật khẩu của bạn"
            />
          </div>

          <button 
            type="submit" disabled={isPending}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl hover:bg-blue-700 font-semibold text-sm transition-all shadow-md shadow-blue-100 mt-2 flex items-center justify-center disabled:opacity-50"
          >
            {isPending ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-100 space-y-4">
          {/* Nút Đăng ký tài khoản mới */}
          <Link href="/register" className="text-blue-600 hover:underline text-sm font-medium text-center block">
            Chưa có tài khoản? Đăng ký tại đây
          </Link>
          <p className="text-xs text-slate-400">
            Tài khoản dùng thử mặc định đã được điền sẵn.
          </p>
        </div>
        
      </div>
    </div>
  );
}

// Bọc Component chính bằng Suspense để không bị lỗi Build
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}