import { getRecurringTransactions, createRecurring } from '../actions/recurringActions';
import { getAccounts } from '../actions/accountActions';

export default async function RecurringPage() {
  const recurringItems = await getRecurringTransactions();
  const accounts = await getAccounts();

  const now = new Date();

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header>
          <h2 className="text-2xl font-semibold text-slate-800">Hóa đơn & Giao dịch định kỳ</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý các khoản thu chi lặp lại (Internet, Tiền nhà, Subscriptions...)</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cột trái: Form tạo hóa đơn lặp lại */}
          <div className="col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-sky-50">
            <h3 className="text-lg font-semibold mb-5 text-slate-800">Thêm lịch định kỳ</h3>
            <form action={createRecurring} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1.5">Tên khoản chi / Thu</label>
                <input 
                  type="text" name="name" required 
                  placeholder="VD: Tiền mạng FPT, Netflix..." 
                  className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Loại dòng tiền</label>
                  <select name="type" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none">
                    <option value="expense">Chi phí cố định</option>
                    <option value="income">Thu nhập định kỳ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Chu kỳ lặp</label>
                  <select name="frequency" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none">
                    <option value="monthly">Hàng tháng (Monthly)</option>
                    <option value="yearly">Hàng năm (Yearly)</option>
                    <option value="weekly">Hàng tuần (Weekly)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Số tiền (VND)</label>
                  <input type="number" name="amount" required placeholder="đ" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Tài khoản liên kết</label>
                  <select name="accountId" required className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none">
                    <option value="">-- Chọn --</option>
                    {accounts.map((acc: any) => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1.5">Ngày gia hạn kế tiếp</label>
                <input type="date" name="nextDate" required className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm mt-2">
                Lên lịch trình
              </button>
            </form>
          </div>

          {/* Cột phải: Danh sách lịch trình hóa đơn chủ động */}
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Danh sách lịch trình hoạt động</h3>
            {recurringItems.length === 0 ? (
              <p className="text-sm text-slate-400 italic bg-white p-6 rounded-3xl border border-sky-50 text-center">
                Chưa có hóa đơn hoặc dịch vụ gia hạn định kỳ nào được đăng ký.
              </p>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-sky-50 overflow-hidden divide-y divide-slate-100">
                {recurringItems.map((item: any) => {
                  const nextDate = new Date(item.nextDate);
                  
                  // Tính toán số ngày còn lại đến kỳ thanh toán tiếp theo
                  const timeDiff = nextDate.getTime() - now.getTime();
                  const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
                  
                  // Gắn cờ cảnh báo nếu hóa đơn sắp đến hạn trong vòng 7 ngày
                  const isUrgent = daysLeft >= 0 && daysLeft <= 7;

                  return (
                    <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${item.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>
                          {item.frequency === 'monthly' ? 'M' : 'Y'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-800 text-sm">{item.name}</h4>
                            {isUrgent && (
                              <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-md font-bold animate-pulse">
                                Sắp đến hạn ({daysLeft} ngày)
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Nguồn thanh toán: <span className="font-medium text-slate-600">{item.account.name}</span> • Kỳ sau: {nextDate.toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${item.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                          {item.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item.amount))}
                        </p>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-500 font-medium uppercase tracking-wider">
                          {item.frequency}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}