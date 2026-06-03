'use client'

import { useActionState } from 'react';
import { register } from '../actions/authActions';
import Link from 'next/link';

// Chú ý từ khóa 'export default' bắt buộc phải có ở đây
export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(register, null);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 w-full">
      <div className="bg-white p-8 rounded-3xl shadow-md border border-sky-50 w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Đăng ký Tài khoản</h2>
          <p className="text-slate-400 text-sm mt-1">Khởi tạo không gian quản lý tài chính của bạn</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên</label>
            <input type="text" name="name" required placeholder="Nhập họ tên của bạn" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none text-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên người dùng</label>
            <input type="text" name="username" required placeholder="Nhập tên người dùng" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none text-slate-800" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
            <input type="password" name="password" required placeholder="••••••••" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none text-slate-800" />
          </div>

          {state?.error && (
            <p className="text-xs font-medium text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100">{state.error}</p>
          )}

          <button type="submit" disabled={isPending} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm shadow-blue-100">
            {isPending ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Đã có tài khoản? <Link href="/login" className="text-blue-600 font-semibold hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}