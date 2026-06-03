import { getSession, updateProfile, changePassword } from '../actions/authActions';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await getSession();
  const { status } = await searchParams;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header>
          <h2 className="text-2xl font-semibold text-slate-800">Cài đặt Hệ thống</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý thông tin tài khoản và cấu hình cá nhân</p>
        </header>

        {status === 'success' && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium rounded-xl flex items-center gap-2">
            ✓ Đổi mật khẩu thành công! Thông tin đã được cập nhật bảo mật.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* CỘT TRÁI: THÔNG TIN HỒ SƠ */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-sky-50 overflow-hidden">
            <div className="p-6 flex items-center gap-4 border-b border-sky-50 bg-sky-50/30">
              <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-xl border-2 border-white shadow-sm">
                {(session?.name || 'U').charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{session?.name || 'Người dùng'}</h3>
                <p className="text-slate-400 text-xs">Hồ sơ cá nhân & Thông tin kết nối</p>
              </div>
            </div>

            <form action={updateProfile} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Họ và tên hiển thị</label>
                  <input type="text" name="name" defaultValue={session?.name || ''} required className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none text-slate-800 font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tên đăng nhập</label>
                  <input type="text" defaultValue={session?.username || ''} disabled className="w-full p-3 border border-slate-100 rounded-xl bg-slate-100 text-slate-400 text-sm cursor-not-allowed" />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm">
                Lưu thay đổi thông tin
              </button>
            </form>
          </div>

          {/* CỘT PHẢI: ĐỔI MẬT KHẨU TRỰC TIẾP */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-sky-50">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-amber-500 rounded-sm"></span> Đổi mật khẩu bảo mật
            </h3>
            
            <form action={changePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mật khẩu hiện tại</label>
                <input type="password" name="currentPassword" required className="w-full p-2.5 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Mật khẩu mới</label>
                <input type="password" name="newPassword" required className="w-full p-2.5 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none text-slate-800" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nhập lại mật khẩu mới</label>
                <input type="password" name="confirmPassword" required className="w-full p-2.5 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none text-slate-800" />
              </div>
              
              <button type="submit" className="w-full bg-slate-800 text-white py-2.5 rounded-xl hover:bg-slate-700 font-medium text-sm transition-colors mt-2">
                Cập nhật mật khẩu
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}