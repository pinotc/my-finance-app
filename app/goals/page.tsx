import { getGoals, createGoal, fundGoal } from '../actions/goalActions';
import { prisma } from '@/lib/prisma';

export default async function GoalsPage() {
  const goals = await getGoals();
  const userId = 1;
  const investments = await prisma.investment.findMany({ where: { userId } });
  const totalInvested = investments.reduce((sum, inv) => sum + (Number(inv.quantity) * Number(inv.averageBuyPrice)), 0);

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header>
          <h2 className="text-2xl font-semibold text-slate-800">Mục tiêu tài chính</h2>
          <p className="text-slate-500 text-sm mt-1">Lập kế hoạch và theo dõi tiến độ các khoản tích lũy dài hạn</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cột trái: Form tạo mục tiêu */}
          <div className="col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-sky-50">
            <h3 className="text-lg font-semibold mb-5 text-slate-800">Tạo mục tiêu mới</h3>
            <form action={createGoal} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1.5">Tên mục tiêu</label>
                <input 
                  type="text" name="name" required 
                  placeholder="VD: Quỹ đổi xe Mazda 3, Mua nhà..." 
                  className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Số tiền cần đạt</label>
                  <input type="number" name="targetAmount" required placeholder="đ" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400" />
                </div>
                <div>
                  <label className="block text-sm text-slate-500 mb-1.5">Đã có sẵn (nếu có)</label>
                  <input type="number" name="currentAmount" defaultValue="0" placeholder="đ" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1.5">Hạn định đạt được</label>
                <input type="date" name="deadline" className="w-full p-3 border border-sky-100 rounded-xl bg-slate-50/50 text-slate-800 font-medium text-sm focus:outline-none focus:border-sky-400" />
              </div>
              <button type="submit" className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition-colors font-medium text-sm mt-2 shadow-sm shadow-sky-200">
                Kích hoạt mục tiêu
              </button>
            </form>
          </div>

          {/* Cột phải: Danh sách tiến độ mục tiêu */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            {goals.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Chưa có mục tiêu tài chính nào được thiết lập.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal: any) => {
                  const target = Number(goal.targetAmount);
                  const current = Number(goal.currentAmount);
                  const remaining = target - current;
                  const percent = Math.min(Math.round((current / target) * 100), 100);

                  return (
                    <div key={goal.id} className="bg-white p-6 rounded-3xl shadow-sm border border-sky-50 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-700 text-base line-clamp-1">{goal.name}</h4>
                          <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-600 rounded-lg border border-sky-100 shrink-0">
                            {percent}%
                          </span>
                        </div>
                        
                        {goal.deadline && (
                          <p className="text-xs text-slate-400 mb-3">
                            Hạn định: {new Date(goal.deadline).toLocaleDateString('vi-VN')}
                          </p>
                        )}

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Đã tích lũy:</span>
                            <span className="font-semibold text-slate-700">{new Intl.NumberFormat('vi-VN').format(current)} đ</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Mục tiêu:</span>
                            <span className="font-medium text-slate-500">{new Intl.NumberFormat('vi-VN').format(target)} đ</span>
                          </div>
                        </div>

                        {/* Thanh tiến trình */}
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                          <div className="bg-sky-400 h-2 rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>

                      {/* Form nộp thêm tiền nhanh tại chỗ */}
                      <form action={fundGoal} className="pt-3 border-t border-slate-50 flex items-center gap-2">
                        <input type="hidden" name="goalId" value={goal.id} />
                        <input 
                          type="number" name="amount" required min="1" 
                          placeholder="Số tiền nộp thêm..." 
                          className="flex-1 px-3 py-2 border border-sky-100 rounded-lg bg-slate-50/50 text-slate-800 font-medium text-xs focus:outline-none" 
                        />
                        <button type="submit" className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs hover:bg-slate-900 transition-colors shrink-0 font-medium">
                          Nộp
                        </button>
                      </form>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}