import { getDebts, createDebt } from '../actions/debtActions';

export default async function DebtsPage() {
  const debts = await getDebts();

  // Phân loại và tính tổng nợ
  const loans = debts.filter((d: any) => d.type === 'loan');
  const creditCards = debts.filter((d: any) => d.type === 'credit_card');
  
  const totalDebtAmount = debts.reduce((sum: number, d: any) => sum + Number(d.remainingDebt), 0);

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Quản lý Nợ & Thẻ tín dụng</h2>
            <p className="text-slate-500 text-sm mt-1">Theo dõi các nghĩa vụ tài chính và hạn mức thẻ</p>
          </div>
          <div className="bg-rose-50 border border-rose-100 px-6 py-3 rounded-2xl text-right">
            <p className="text-xs text-rose-600 font-medium">Tổng Dư Nợ Hiện Tại</p>
            <p className="text-2xl font-bold text-rose-700">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalDebtAmount)}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cột trái: Form nhập khoản nợ */}
          <div className="col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-sky-50">
            <h3 className="text-lg font-semibold mb-5 text-slate-800">Thêm khoản nợ mới</h3>
            <form action={createDebt} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1.5">Phân loại nợ</label>
                <select name="type" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400">
                  <option value="loan">Khoản vay (Ngân hàng / Người thân)</option>
                  <option value="credit_card">Thẻ tín dụng (Credit Card)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1.5">Nơi vay / Tên ngân hàng</label>
                <input type="text" name="lender" required placeholder="VD: Vietcombank, Shinhan Bank..." className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Vốn gốc / Hạn mức</label>
                  <input type="number" name="totalAmount" required className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Dư nợ hiện tại</label>
                  <input type="number" name="remainingDebt" required className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Lãi suất (%/năm)</label>
                  <input type="number" step="0.1" name="interestRate" defaultValue="0" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Ngày đến hạn</label>
                  <input type="date" name="dueDate" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium   text-sm focus:outline-none focus:border-sky-400" />
                </div>
              </div>
              <button type="submit" className="w-full bg-rose-600 text-white py-3 rounded-xl hover:bg-rose-700 transition-colors font-medium text-sm mt-2 shadow-sm shadow-rose-200">
                Lưu khoản nợ
              </button>
            </form>
          </div>

          {/* Cột phải: Hiển thị danh sách phân loại nợ */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
            
            {/* Phân hệ 1: Thẻ tín dụng */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <span className="w-2 h-4 bg-sky-400 rounded-sm"></span> Thẻ tín dụng
              </h3>
              {creditCards.length === 0 ? (
                <p className="text-sm text-slate-400 italic pl-4">Không có dư nợ thẻ tín dụng.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {creditCards.map((card: any) => (
                    <div key={card.id} className="bg-white p-6 rounded-2xl shadow-sm border border-sky-50 relative overflow-hidden group">
                      <div className="absolute right-0 top-0 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl border-l border-b border-sky-50">
                        Credit Card
                      </div>
                      <h4 className="font-bold text-slate-700 text-base mb-1">{card.lender}</h4>
                      <p className="text-xs text-slate-400 mb-4">Hạn mức: {new Intl.NumberFormat('vi-VN').format(Number(card.totalAmount))} đ</p>
                      
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[11px] text-slate-400 uppercase font-medium">Dư nợ cần trả</p>
                          <p className="text-xl font-bold text-slate-800">{new Intl.NumberFormat('vi-VN').format(Number(card.remainingDebt))} đ</p>
                        </div>
                        {card.dueDate && (
                          <div className="text-right">
                            <p className="text-[10px] text-rose-500 font-medium">Hạn thanh toán</p>
                            <p className="text-xs font-semibold text-slate-600">{new Date(card.dueDate).toLocaleDateString('vi-VN')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phân hệ 2: Khoản vay tài chính */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-800 flex items-center gap-2">
                <span className="w-2 h-4 bg-blue-500 rounded-sm"></span> Khoản vay dài hạn
              </h3>
              {loans.length === 0 ? (
                <p className="text-sm text-slate-400 italic pl-4">Không có khoản vay nào.</p>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-sky-50 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-sky-50 text-slate-500">
                      <tr>
                        <th className="p-4 font-medium">Chủ nợ</th>
                        <th className="p-4 font-medium">Gốc ban đầu</th>
                        <th className="p-4 font-medium">Lãi suất</th>
                        <th className="p-4 font-medium text-right">Dư nợ còn lại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loans.map((loan: any) => (
                        <tr key={loan.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-semibold text-slate-800">{loan.lender}</td>
                          <td className="p-4 text-slate-500">{new Intl.NumberFormat('vi-VN').format(Number(loan.totalAmount))} đ</td>
                          <td className="p-4 text-slate-600 font-medium">{Number(loan.interestRate)}% / năm</td>
                          <td className="p-4 text-right font-bold text-rose-600">
                            {new Intl.NumberFormat('vi-VN').format(Number(loan.remainingDebt))} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}