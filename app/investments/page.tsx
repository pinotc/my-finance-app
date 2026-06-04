'use client'

import { useState, useEffect } from 'react';
import { 
  getDomesticGoldPrice, 
  getGoldTransactions, 
  addGoldTransaction, 
  deleteGoldTransaction 
} from '../actions/financeActions';

interface GoldPriceResponse {
  success: boolean;
  time: string;
  date: string;
  name: string;
  buy: number;
  sell: number;
}

interface Transaction {
  id: number;
  date: Date;
  quantity: number; 
  unit: string;
  buyPrice: number; 
}

export default function InvestmentsPage() {
  const [livePrice, setLivePrice] = useState<GoldPriceResponse | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [targetMargin, setTargetMargin] = useState<number>(10);
  
  const [inputQty, setInputQty] = useState<string>('');
  const [inputUnit, setInputUnit] = useState<'lượng' | 'chỉ'>('chỉ');
  const [inputPrice, setInputPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi chạy khi mở trang
  useEffect(() => {
    fetchTransactionsFromDB();
    fetchLiveGold();
    const interval = setInterval(fetchLiveGold, 60000);
    return () => clearInterval(interval);
  }, []);

  // Kéo dữ liệu từ Database
  const fetchTransactionsFromDB = async () => {
    const data = await getGoldTransactions();
    setTransactions(data);
  };

  const fetchLiveGold = async () => {
    setIsRefreshing(true);
    const data = await getDomesticGoldPrice();
    if (data && data.success) {
      setLivePrice(data);
      setLastUpdated(`${data.date} lúc ${data.time}`);
    }
    setIsRefreshing(false);
  };

  // Thêm giao dịch lưu vào Database
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQty || !inputPrice) return;
    setIsSubmitting(true);

    const res = await addGoldTransaction(
      parseFloat(inputQty), 
      inputUnit, 
      parseFloat(inputPrice)
    );

    if (res?.success) {
      setInputQty('');
      setInputPrice('');
      await fetchTransactionsFromDB(); // Tải lại danh sách mới
    }
    setIsSubmitting(false);
  };

  // Xóa giao dịch khỏi Database
  const handleDelete = async (id: number) => {
    await deleteGoldTransaction(id);
    await fetchTransactionsFromDB(); // Tải lại danh sách mới
  };

  // ==========================================
  // TÍNH TOÁN LOGIC
  // ==========================================
  const totalQuantityLuong = transactions.reduce((sum, tx) => {
    const qtyInLuong = (tx.unit || 'lượng') === 'chỉ' ? tx.quantity / 10 : tx.quantity;
    return sum + qtyInLuong;
  }, 0);

  const totalInvested = transactions.reduce((sum, tx) => sum + (tx.quantity * tx.buyPrice), 0);
  const avgBuyPrice = totalQuantityLuong > 0 ? totalInvested / totalQuantityLuong : 0;
  
  const currentMarketPrice = livePrice?.buy || 0; 
  const currentValue = totalQuantityLuong * currentMarketPrice;
  
  const profitLoss = currentValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;
  const isProfit = profitLoss >= 0;

  const targetSellingPrice = avgBuyPrice * (1 + targetMargin / 100);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Tài sản Vàng</h2>
            <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Realtime ({livePrice?.name || 'DOJI'}): <span className="font-semibold text-slate-700">{lastUpdated || 'Đang kết nối...'}</span>
            </p>
          </div>
          <button 
            onClick={fetchLiveGold} disabled={isRefreshing}
            className="text-sm bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-all"
          >
            {isRefreshing ? 'Đang tải...' : 'Làm mới giá ⟳'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <h3 className="font-bold text-slate-800 text-lg mb-6">Tổng quan Danh mục</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tổng khối lượng</p>
                  <p className="text-3xl font-black text-slate-800">{totalQuantityLuong.toFixed(2)} <span className="text-base font-semibold text-slate-500">lượng</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Tổng vốn đã đầu tư</p>
                  <p className="text-xl font-bold text-slate-700">{totalInvested.toLocaleString('vi-VN')} đ</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl">
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mb-1">Giá Mua Trung bình (DCA)</p>
                  <p className="text-lg font-bold text-slate-800">{avgBuyPrice.toLocaleString('vi-VN')} đ/lượng</p>
                </div>
                <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100/50">
                  <p className="text-[11px] text-sky-600 font-bold uppercase tracking-wide mb-1">Giá hiện tại (Tiệm Mua Vào)</p>
                  <p className="text-lg font-bold text-sky-700"> 
                    {currentMarketPrice > 0 ? currentMarketPrice.toLocaleString('vi-VN') + ' đ/lượng' : '---'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-5 md:gap-0">
                {/* Khối Lời / Lỗ */}
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Lời / Lỗ Realtime</p>
                  <div className="flex flex-wrap items-baseline gap-2 md:gap-3">
                    <p className={`text-2xl md:text-3xl font-black ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {profitLoss > 0 ? '+' : ''}{profitLoss.toLocaleString('vi-VN')} đ
                    </p>
                    <span className={`px-2 py-1 rounded-lg text-xs md:text-sm font-bold ${isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {isProfit ? '▲' : '▼'} {Math.abs(profitLossPercent).toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Khối Giá trị hiện tại */}
                <div>
                  <p className="text-sm text-slate-500 font-medium mb-1">Tổng Giá trị hiện tại</p>
                  <p className="text-xl md:text-2xl font-bold text-slate-800">{currentValue.toLocaleString('vi-VN')} đ</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 shadow-md text-white">
              <h3 className="font-bold text-white text-lg mb-2 flex items-center gap-2">🎯 Tính toán Điểm Chốt Lời</h3>
              <p className="text-slate-400 text-sm mb-6">Giá mục tiêu tiệm cần niêm yết (tính trên 1 lượng) để đạt % lãi kỳ vọng.</p>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-3">
                    <span className="text-slate-300">Mức lợi nhuận mong muốn:</span>
                    <span className="text-amber-400 font-bold text-lg">{targetMargin}%</span>
                  </div>
                  <input 
                    type="range" min="1" max="100" 
                    value={targetMargin} onChange={(e) => setTargetMargin(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 text-slate-800" 
                  />
                </div>
                
                <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-300 uppercase tracking-wider mb-1">Tiệm báo giá này thì bán</p>
                    <p className="text-2xl font-bold text-white">{targetSellingPrice.toLocaleString('vi-VN')} đ/lượng</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-300 uppercase tracking-wider mb-1">Lãi dự kiến thu về</p>
                    <p className="text-lg font-bold text-emerald-400">+ {((targetSellingPrice - avgBuyPrice) * totalQuantityLuong).toLocaleString('vi-VN')} đ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-sm"></span> Thêm lệnh mua
              </h3>
              
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Số lượng</label>
                    <input 
                      type="number" step="0.01" min="0.01" required
                      value={inputQty} onChange={(e) => setInputQty(e.target.value)}
                      className="w-full p-3 border border-slate-100 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-blue-300 text-slate-800" 
                      placeholder="VD: 5"
                    />
                  </div>
                  <div className="w-[100px]">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Đơn vị</label>
                    <select 
                      value={inputUnit} onChange={(e) => setInputUnit(e.target.value as 'lượng' | 'chỉ')}
                      className="w-full p-3 border border-slate-100 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-blue-300 text-slate-800"
                    >
                      <option value="chỉ">Chỉ</option>
                      <option value="lượng">Lượng</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Giá mua gốc (đ/{inputUnit})</label>
                  <input 
                    type="number" required
                    value={inputPrice} onChange={(e) => setInputPrice(e.target.value)}
                    className="w-full p-3 border border-slate-100 rounded-xl bg-slate-50 text-sm focus:outline-none focus:border-blue-300 text-slate-800" 
                    placeholder={inputUnit === 'chỉ' ? 'VD: 17363000' : 'VD: 173630000'}
                  />
                </div>
                <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-semibold text-sm transition-colors mt-2 disabled:opacity-50">
                  {isSubmitting ? 'Đang lưu vào DB...' : 'Ghi nhận tài sản'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Lịch sử thu gom (DB)</h3>
              
              {transactions.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6 italic">Chưa có dữ liệu mua vào.</p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center group">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{tx.quantity} {tx.unit || 'lượng'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(tx.date).toLocaleDateString('vi-VN')} • {tx.buyPrice.toLocaleString('vi-VN')} đ/{tx.unit || 'lượng'}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="text-rose-400 hover:text-rose-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}