import { getAccounts, createAccount } from './actions/accountActions';
import { createTransaction } from './actions/transactionActions';
import TransactionForm from './components/TransactionForm';

export default async function HomePage() {
  // 1. Kéo dữ liệu thô từ Database
  const rawAccounts = await getAccounts();

  // 2. BÓC TÁCH TRIỆT ĐỂ: Chỉ lấy đúng 4 trường, vứt bỏ toàn bộ Date, Decimal và rác Prisma
  const cleanAccounts = rawAccounts.map((acc: any) => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    balance: Number(acc.balance)
  }));

  // 3. Tính tổng tài sản dựa trên data đã làm sạch
  const totalBalance = cleanAccounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tổng quan tài sản</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {/* CỘT TRÁI: THÔNG TIN TÀI SẢN & TÀI KHOẢN */}
          <div className="col-span-1 lg:col-span-2 space-y-6 md:space-y-8">
            
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 md:p-8 rounded-3xl shadow-lg shadow-sky-200/50 text-white flex flex-col justify-between h-44">
              <div>
                <p className="text-sky-100 text-sm font-medium mb-1">Tổng tài sản ròng</p>
                <p className="text-3xl md:text-4xl font-black tracking-tight">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalBalance)}
                </p>
              </div>
              <div className="text-xs text-sky-100 bg-white/10 w-fit px-3 py-1.5 rounded-xl font-semibold">
                Hệ thống ổn định • Realtime
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">Tài khoản hiện có</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dùng cleanAccounts ở đây */}
                {cleanAccounts.map((acc: any) => (
                  <div key={acc.id} className="bg-white p-5 rounded-2xl shadow-sm border border-sky-50 hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-700 text-sm md:text-base">{acc.name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-500 rounded border border-slate-100 uppercase font-bold tracking-wider">{acc.type}</span>
                    </div>
                    <p className="text-xl md:text-2xl font-black text-slate-800">
                      {new Intl.NumberFormat('vi-VN').format(acc.balance)} đ
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <details className="bg-white p-4 rounded-2xl border border-sky-50 shadow-sm max-w-md group cursor-pointer">
              <summary className="list-none text-sm font-bold text-sky-600 flex items-center justify-between">
                <span>+ Cần tạo thêm tài khoản mới?</span>
                <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <form action={createAccount} className="space-y-3 mt-4 pt-4 border-t border-slate-50">
                <input type="text" name="name" required placeholder="Tên ngân hàng / Ví..." className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-xs font-medium text-slate-700 outline-none focus:border-sky-400" />
                <div className="grid grid-cols-2 gap-3">
                  <select name="type" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-xs font-medium text-slate-700 outline-none focus:border-sky-400">
                    <option value="bank">Ngân hàng</option>
                    <option value="cash">Tiền mặt</option>
                  </select>
                  <input type="number" name="balance" required defaultValue="0" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-xs font-medium text-slate-700 outline-none focus:border-sky-400" />
                </div>
                <button type="submit" className="w-full bg-sky-50 text-sky-700 py-2.5 rounded-xl hover:bg-sky-100 font-bold text-xs transition-colors">Xác nhận tạo tài khoản</button>
              </form>
            </details>
          </div>

          {/* CỘT PHẢI: Truyền cleanAccounts xuống Client Component */}
          <div className="col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-sky-50 sticky top-6">
            <h3 className="text-lg font-semibold mb-5 text-slate-800">Ghi chép nhanh</h3>
            <TransactionForm accounts={cleanAccounts} createTransaction={createTransaction} />
          </div>

        </div>
      </div>
    </div>
  );
}