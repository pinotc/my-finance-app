"use client";
import { useState } from 'react';

export default function ReportDashboard({ transactions }: { transactions: any[] }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Logic lọc dữ liệu theo ngày
  const filteredTransactions = transactions.filter((t: any) => {
    const txDate = new Date(t.date);
    txDate.setHours(0, 0, 0, 0);
    let isValid = true;
    if (startDate) {
      const start = new Date(startDate); start.setHours(0, 0, 0, 0);
      if (txDate < start) isValid = false;
    }
    if (endDate) {
      const end = new Date(endDate); end.setHours(23, 59, 59, 999);
      if (txDate > end) isValid = false;
    }
    return isValid;
  });

  // 2. Tính toán số liệu
  const filteredIncome = filteredTransactions.filter((t: any) => t.type.toLowerCase() === 'income').reduce((sum: number, t: any) => sum + t.amount, 0);
  const filteredExpense = filteredTransactions.filter((t: any) => t.type.toLowerCase() === 'expense').reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalFlow = filteredIncome + filteredExpense;
  const incomePercent = totalFlow > 0 ? Math.round((filteredIncome / totalFlow) * 100) : 0;
  const expensePercent = totalFlow > 0 ? Math.round((filteredExpense / totalFlow) * 100) : 0;

  const expenseBreakdown = filteredTransactions
    .filter((t: any) => t.type.toLowerCase() === 'expense')
    .reduce((acc: any, tx: any) => {
      const catName = tx.category || 'Khác';
      acc[catName] = (acc[catName] || 0) + tx.amount;
      return acc;
    }, {});

  const sortedBreakdown = Object.entries(expenseBreakdown)
    .map(([name, amount]) => ({ name, amount: amount as number }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        
        {/* THANH BỘ LỌC */}
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-sky-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-slate-800 font-bold text-xl">Báo cáo tình hình tài chính</h2>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex-1 md:flex-none">
              <span className="text-xs text-slate-500 mr-2 font-medium shrink-0">Từ:</span>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-full cursor-pointer" />
            </div>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex-1 md:flex-none">
              <span className="text-xs text-slate-500 mr-2 font-medium shrink-0">Đến:</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-sm text-slate-700 outline-none w-full cursor-pointer" />
            </div>
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-xs text-rose-500 font-medium px-2 underline whitespace-nowrap">Xóa lọc</button>
            )}
          </div>
        </div>

        {/* CÁC BIỂU ĐỒ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-50 flex flex-col justify-between h-56">
            <h3 className="text-sm font-semibold text-slate-500">Thống kê Dòng tiền</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-emerald-600">Thu: {new Intl.NumberFormat('vi-VN').format(filteredIncome)} đ</span>
                <span className="text-rose-500">Chi: {new Intl.NumberFormat('vi-VN').format(filteredExpense)} đ</span>
              </div>
              {totalFlow === 0 ? (
                <div className="w-full h-5 bg-slate-100 rounded-full relative overflow-hidden"><div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#f8fafc_10px,#f8fafc_20px)] opacity-50"></div></div>
              ) : (
                <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-400 h-full transition-all" style={{ width: `${incomePercent}%` }}></div>
                  <div className="bg-rose-400 h-full transition-all" style={{ width: `${expensePercent}%` }}></div>
                </div>
              )}
              <div className="flex justify-between text-xs text-slate-400">
                <span>{incomePercent}% Tổng thu</span>
                <span>{expensePercent}% Tổng chi</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-50 flex flex-col h-56 overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-500 mb-4 shrink-0">Cơ cấu chi tiêu chính</h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {sortedBreakdown.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Chưa phát sinh khoản chi nào.</p>
              ) : (
                sortedBreakdown.map((item, index) => {
                  const catPercent = filteredExpense > 0 ? Math.round((item.amount / filteredExpense) * 100) : 100;
                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700">{item.name}</span>
                        <span className="text-slate-500 font-semibold">{new Intl.NumberFormat('vi-VN').format(item.amount)} đ</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-2 rounded-full" style={{ width: `${catPercent}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* LỊCH SỬ GIAO DỊCH (Full Width) */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-sky-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Lịch sử giao dịch chi tiết</h3>
            <a href="/api/export" className="text-xs bg-white text-slate-600 hover:bg-sky-50 px-4 py-2 rounded-xl font-medium border border-sky-100 flex items-center gap-1 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Xuất Excel
            </a>
          </div>
          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm italic">Không có giao dịch nào thỏa mãn bộ lọc.</p>
            ) : (
              filteredTransactions.map((tx: any) => {
                const isExpense = tx.type.toLowerCase() === 'expense';
                const isTransfer = tx.type.toLowerCase() === 'transfer';
                return (
                  <div key={tx.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${isTransfer ? 'bg-blue-50 text-blue-500' : isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                        {isTransfer ? '⇄' : isExpense ? '▼' : '▲'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700">{tx.category}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(tx.date).toLocaleDateString('vi-VN')} {tx.notes && `• ${tx.notes}`}</p>
                      </div>
                    </div>
                    <div className={`font-bold text-base ${isTransfer ? 'text-blue-600' : isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isTransfer ? '' : isExpense ? '-' : '+'}{new Intl.NumberFormat('vi-VN').format(tx.amount)} đ
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}