import { getRecentTransactions } from '../actions/transactionActions';
import ReportDashboard from '../components/ReportDashboard';

export default async function ReportsPage() {
  const rawTransactions = await getRecentTransactions(); 

  const cleanTransactions = rawTransactions.map((tx: any) => ({
    id: tx.id,
    // Nếu là luồng chuyển khoản thì hiện chữ chuyển khoản, ngược lại hiện tên danh mục thông thường
    category: tx.type === 'transfer' ? 'Chuyển tiền nội bộ ⇄' : (tx.category?.name || 'Khác'), 
    type: tx.type,
    amount: Number(tx.amount),
    date: new Date(tx.date).toISOString(), 
    notes: tx.notes || ''
  }));

  return (
    <ReportDashboard transactions={cleanTransactions} />
  );
}