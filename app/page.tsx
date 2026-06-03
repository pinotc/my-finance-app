import { getAccounts, createAccount } from './actions/accountActions';
import { getRecentTransactions, createTransaction } from './actions/transactionActions';
import { getDashboardStats } from './actions/reportActions';

export default async function Dashboard() {
  const accounts = await getAccounts();
  const transactions = await getRecentTransactions();
  const stats = await getDashboardStats();

  const totalBalance = accounts.reduce((sum: number, acc: any) => sum + Number(acc.balance), 0);
  
  // Tính toán tỷ lệ phần trăm phân bổ dòng tiền
  const totalFlow = stats.monthlyIncome + stats.monthlyExpense;
  const incomePercent = totalFlow > 0 ? Math.round((stats.monthlyIncome / totalFlow) * 100) : 50;
  const expensePercent = totalFlow > 0 ? Math.round((stats.monthlyExpense / totalFlow) * 100) : 50;

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* KHU VỰC 1: CÁC THẺ PHÂN TÍCH & BIỂU ĐỒ DÒNG TIỀN NHANH */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Thẻ ròng tổng tài sản */}
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 rounded-3xl shadow-lg shadow-sky-200/50 text-white flex flex-col justify-between h-44">
            <div>
              <p className="text-sky-100 text-sm font-medium mb-1">Tổng tài sản ròng</p>
              <p className="text-3xl font-bold tracking-tight">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalBalance)}
              </p>
            </div>
            <div className="text-xs text-sky-100 bg-white/10 w-fit px-3 py-1.5 rounded-xl">
              Trạng thái ổn định
            </div>
          </div>

          {/* Biểu đồ thanh so sánh Thu nhập - Chi tiêu tháng này */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-50 flex flex-col justify-between h-44">
            <h3 className="text-sm font-semibold text-slate-500">Dòng tiền tháng này</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-emerald-600">Thu: {new Intl.NumberFormat('vi-VN').format(stats.monthlyIncome)} đ</span>
                <span className="text-rose-500">Chi: {new Intl.NumberFormat('vi-VN').format(stats.monthlyExpense)} đ</span>
              </div>
              {/* Biểu đồ thanh ngang Tailwind */}
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
                <div className="bg-emerald-400 h-full transition-all" style={{ width: `${incomePercent}%` }}></div>
                <div className="bg-rose-400 h-full transition-all" style={{ width: `${expensePercent}%` }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>{incomePercent}% Thu nhập</span>
                <span>{expensePercent}% Chi tiêu</span>
              </div>
            </div>
          </div>

          {/* Báo cáo cơ cấu chi tiêu hàng đầu */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-50 flex flex-col justify-between h-44 overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-500 mb-2">Cơ cấu chi tiêu chính</h3>
            {stats.categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Chưa phát sinh khoản chi nào trong tháng.</p>
            ) : (
              <div className="space-y-2">
                {stats.categoryBreakdown.slice(0, 2).map((item, index) => {
                  // Giả lập tỷ lệ % của danh mục dựa trên tổng chi
                  const catPercent = stats.monthlyExpense > 0 ? Math.round((item.amount / stats.monthlyExpense) * 100) : 100;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <span className="text-slate-500">{new Intl.NumberFormat('vi-VN').format(item.amount)} đ</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-1.5 rounded-full" style={{ width: `${catPercent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* KHU VỰC 2: KHÔNG GIAN NHẬP LIỆU VÀ QUẢN LÝ DANH SÁCH */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cột trái: Các form điền thông tin */}
          <div className="col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-50">
              <h3 className="text-lg font-semibold mb-5 text-slate-800">Ghi chép giao dịch</h3>
              <form action={createTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Tài khoản</label>
                  <select name="accountId" required className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium">
                    <option value="">-- Chọn tài khoản --</option>
                    {accounts.map((acc: any) => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({new Intl.NumberFormat('vi-VN').format(Number(acc.balance))} đ)</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5">Loại</label>
                    <select name="type" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium">
                      <option value="expense">Chi tiền</option>
                      <option value="income">Thu tiền</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5 ">Số tiền (VNĐ)</label>
                    <input type="number" name="amount" required min="1" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Diễn giải</label>
                  <input type="text" name="notes" placeholder="VD: Tiền lương, ăn trưa..." className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm mt-2">
                  Lưu giao dịch
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-50">
              <h3 className="text-lg font-semibold mb-5 text-slate-800">Thêm tài khoản</h3>
              <form action={createAccount} className="space-y-4">
                <input type="text" name="name" required placeholder="Tên ngân hàng / Ví..." className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium" />
                <div className="grid grid-cols-2 gap-4">
                  <select name="type" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium">
                    <option value="bank">Ngân hàng</option>
                    <option value="cash">Tiền mặt</option>
                  </select>
                  <input type="number" name="balance" required defaultValue="0" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-sm focus:outline-none focus:border-sky-400 text-slate-800 font-medium" />
                </div>
                <button type="submit" className="w-full bg-sky-100 text-sky-700 py-3 rounded-xl hover:bg-sky-200 transition-colors font-medium text-sm">
                  + Thêm tài khoản
                </button>
              </form>
            </div>
          </div>

          {/* Cột phải: Danh sách thẻ tài khoản và Lịch sử giao dịch */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800">Tài khoản hiện có</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts.map((acc: any) => (
                  <div key={acc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-sky-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-700 text-sm">{acc.name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100 uppercase">{acc.type}</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">{new Intl.NumberFormat('vi-VN').format(Number(acc.balance))} đ</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Giao dịch gần đây</h3>
                
                {/* Nút Xuất file Excel liên kết trực tiếp với API Route vừa tạo */}
                <a 
                  href="/api/export" 
                  className="text-xs bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-600 px-4 py-2 rounded-xl font-medium border border-sky-100 shadow-sm transition-all flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Xuất dữ liệu Excel (.CSV)
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}