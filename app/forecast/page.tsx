import { getCashFlowForecast } from '../actions/forecastActions';

export default async function ForecastPage() {
  const { currentBalance, projections } = await getCashFlowForecast();

  return (
    <div className="flex-1 overflow-y-auto p-10 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header>
          <h2 className="text-2xl font-semibold text-slate-800">Dự báo dòng tiền (3 tháng tới)</h2>
          <p className="text-slate-500 text-sm mt-1">Hệ thống tự động phân tích dựa trên số dư hiện tại và các hóa đơn định kỳ</p>
        </header>

        {/* Khối hiển thị Điểm xuất phát */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 rounded-3xl shadow-lg text-white flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Vốn lưu động hiện tại (Tất cả tài khoản)</p>
            <p className="text-4xl font-bold tracking-tight">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentBalance)}
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 rounded-full bg-slate-600/50 flex items-center justify-center border border-slate-500/50">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Khối hiển thị Kịch bản tương lai */}
        <div className="space-y-5">
          <h3 className="text-lg font-semibold text-slate-800">Kịch bản tài chính</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projections.map((proj) => (
              <div 
                key={proj.id} 
                className={`p-6 rounded-3xl shadow-sm border relative overflow-hidden ${
                  proj.isWarning ? 'bg-rose-50 border-rose-100' : 'bg-white border-sky-50'
                }`}
              >
                {/* Chỉ báo màu cảnh báo ở góc */}
                <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rounded-full ${proj.isWarning ? 'bg-rose-200/50' : 'bg-emerald-50'}`}></div>

                <h4 className="font-bold text-slate-700 text-lg mb-4 relative z-10">
                  Tháng {proj.monthLabel}
                </h4>
                
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Dự thu cố định:</span>
                    <span className="font-medium text-emerald-600">+{new Intl.NumberFormat('vi-VN').format(proj.expectedIncome)} đ</span>
                  </div>
                  <div className="flex justify-between text-sm pb-3 border-b border-slate-100/50">
                    <span className="text-slate-500">Dự chi cố định:</span>
                    <span className="font-medium text-rose-500">-{new Intl.NumberFormat('vi-VN').format(proj.expectedExpense)} đ</span>
                  </div>
                  <div className="pt-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Số dư ước tính</p>
                    <p className={`text-2xl font-bold ${proj.isWarning ? 'text-rose-600' : 'text-slate-800'}`}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(proj.projectedBalance)}
                    </p>
                  </div>
                </div>

                {proj.isWarning && (
                  <div className="mt-4 bg-rose-100 text-rose-600 text-xs px-3 py-2 rounded-lg font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Cảnh báo thâm hụt dòng tiền!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}