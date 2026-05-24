import { useEffect, useState } from 'react';
import { Calendar, Users, DollarSign, Clock, Search, RefreshCw, Download, Bell, X, CheckCircle, ArrowUpRight } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

interface Booking {
  id: number;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  offerTitle: string;
  businessName: string;
  offerPrice: number;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: string;
  bookedAt: string;
  peopleCount?: number;
}

const ALL_STATUSES = ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'NoShow'];
const PAYMENT_STATUSES = ['Unpaid', 'Paid', 'Refunded'];

// Cyber-SaaS status styles
const STATUS_STYLES: Record<string, string> = {
  Confirmed: 'bg-brandGreen/10 text-brandGreen border-brandGreen/30',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  Pending:   'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  NoShow:    'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<Record<number, string>>({});

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const res = await axiosClient.get('/bookings', { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data);
      setFiltered(res.data);
      const initPayment: Record<number, string> = {};
      res.data.forEach((b: Booking) => { initPayment[b.id] = 'Unpaid'; });
      setPaymentStatus(initPayment);
    } catch {
      console.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    let result = bookings.filter(b => 
      (statusFilter === 'All' || b.status === statusFilter) &&
      (b.customerName?.toLowerCase().includes(search.toLowerCase()) || b.bookingReference?.toLowerCase().includes(search.toLowerCase()))
    );
    setFiltered(result);
  }, [search, statusFilter, bookings]);

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      await axiosClient.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } finally { setUpdatingId(null); }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-wide uppercase">Bookings Management</h1>
          <p className="text-textMuted text-sm mt-1">Full oversight of all customer reservations.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchBookings} className="glass-panel px-5 py-2.5 rounded-xl text-white font-bold hover:border-brandGreen/50 transition-all flex items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => {}} className="glass-btn shadow-glow px-6 py-2.5 rounded-xl font-bold flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Calendar />} label="Total Bookings" value={bookings.length} />
        <StatCard icon={<CheckCircle />} label="Confirmed" value={bookings.filter(b => b.status === 'Confirmed').length} />
        <StatCard icon={<Clock />} label="Today" value={bookings.filter(b => new Date(b.bookedAt).toDateString() === new Date().toDateString()).length} />
        <StatCard icon={<DollarSign />} label="Revenue" value={`$${bookings.reduce((sum, b) => sum + (b.offerPrice || 0), 0).toFixed(2)}`} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brandGreen/50" size={18} />
          <input type="text" placeholder="Search references, customers..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-panelBg border border-white/5 rounded-xl focus:border-brandGreen focus:ring-1 focus:ring-brandGreen outline-none text-white transition-all" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-6 py-3.5 bg-panelBg border border-white/5 rounded-xl text-white outline-none focus:border-brandGreen cursor-pointer">
          <option value="All">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {['Reference', 'Customer', 'Offer', 'Slot', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-8 py-5 text-[10px] font-black text-textMuted uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(booking => (
                <tr key={booking.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-8 py-5 font-mono text-xs text-brandGreen font-bold">{booking.bookingReference}</td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-sm text-white">{booking.customerName}</p>
                    <p className="text-xs text-textMuted">{booking.customerEmail}</p>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-300">{booking.offerTitle}</td>
                  <td className="px-8 py-5 text-xs text-textMuted font-mono whitespace-nowrap">
                    {new Date(booking.slotDate).toLocaleDateString()}<br/>{booking.slotStartTime?.substring(0, 5)}
                  </td>
                  <td className="px-8 py-5 font-bold text-white">${booking.offerPrice.toFixed(2)}</td>
                  <td className="px-8 py-5">
                    <select value={booking.status} disabled={updatingId === booking.id}
                      onChange={e => handleStatusChange(booking.id, e.target.value)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border cursor-pointer outline-none ${STATUS_STYLES[booking.status]}`}>
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-brandGreen hover:underline text-xs font-bold uppercase tracking-widest">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:border-brandGreen/30 transition-all">
      <div className="p-3 bg-brandGreen/10 rounded-xl text-brandGreen">{icon}</div>
      <div>
        <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}