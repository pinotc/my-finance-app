import { getBudgets, createBudget } from '../actions/budgetActions';

export default async function BudgetsPage() {
  const budgets = await getBudgets();

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800">Quản lý Ngân sách</h2>
          <p className="text-slate-500 text-sm mt-1">Kiểm soát chi tiêu hàng tháng của bạn</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cột trái: Form Thiết lập */}
          <div className="col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-sky-50 sticky top-10">
            <h3 className="text-lg font-semibold mb-5 text-slate-800">Thiết lập hạn mức</h3>
            <form action={createBudget} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1.5">Nhóm chi tiêu</label>
                <input 
                  type="text" name="categoryName" required placeholder="VD: Ăn uống, Đi lại..." 
                  className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1.5">Hạn mức / Tháng (VNĐ)</label>
                <input 
                  type="number" name="amount" required placeholder="VD: 5000000"
                  className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400" 
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm mt-2 shadow-sm shadow-blue-200">
                Tạo ngân sách
              </button>
            </form>
          </div>

          {/* Cột phải: Theo dõi tiến độ */}
          <div className="col-span-1 lg:col-span-2 space-y-5">
            {budgets.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-sky-200 p-10 text-center text-slate-400">
                Chưa có ngân sách nào được thiết lập cho tháng này.
              </div>
            ) : (
              budgets.map((budget: any) => {
                // Xác định màu sắc cảnh báo dựa trên % đã tiêu
                let progressColor = 'bg-emerald-400';
                if (budget.percent >= 80) progressColor = 'bg-rose-500';
                else if (budget.percent >= 50) progressColor = 'bg-amber-400';

                return (
                  <div key={budget.id} className="bg-white p-6 rounded-3xl shadow-sm border border-sky-50">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-700 text-lg">{budget.category.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          Đã chi: <span className="font-medium text-slate-700">{new Intl.NumberFormat('vi-VN').format(budget.spent)} đ</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Tổng: {new Intl.NumberFormat('vi-VN').format(Number(budget.amount))} đ</p>
                        <p className={`font-bold text-lg ${budget.remaining < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {budget.remaining < 0 ? 'Vượt quá: ' : 'Còn lại: '}{new Intl.NumberFormat('vi-VN').format(Math.abs(budget.remaining))} đ
                        </p>
                      </div>
                    </div>
                    
                    {/* Thanh Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${progressColor}`} 
                        style={{ width: `${budget.percent}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-[11px] font-medium text-slate-400">{budget.percent}%</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

        </div>
      </div>
    </div>
  );
}