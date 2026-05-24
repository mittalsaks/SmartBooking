import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, ArrowLeft, Trash2, LayoutList, CalendarDays, Plus } from 'lucide-react';
import axiosClient from '../../api/axiosClient';

interface Slot {
  id: number;
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  availableCount: number;
  status: string;
}

interface CreateSlotForm {
  slotDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

type ViewMode = 'table' | 'calendar';

export default function ManageSlots() {
  const { id: offerId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateSlotForm>({ defaultValues: { capacity: 10 } });

  useEffect(() => { fetchSlots(); }, [offerId]);

  const fetchSlots = async () => {
    try {
      const response = await axiosClient.get(`/slots/offer/${offerId}`);
      setSlots(response.data);
    } catch (err) { console.error('Failed to fetch slots', err); } finally { setLoading(false); }
  };

  const onSubmit = async (data: CreateSlotForm) => {
    try {
      await axiosClient.post('/slots', {
        offerId: Number(offerId),
        ...data,
        capacity: Number(data.capacity),
      });
      reset(); fetchSlots();
    } catch (err: any) { alert(err.response?.data || 'Failed to add slot.'); }
  };

  const handleDelete = async (slotId: number) => {
    if (!confirm('Delete this slot?')) return;
    try {
      await axiosClient.delete(`/slots/${slotId}`);
      setSlots(prev => prev.filter(s => s.id !== slotId));
    } catch { alert('Failed to delete slot.'); }
  };

  const getStatusStyle = (status: string) => {
    const map: Record<string, string> = {
      Available: 'bg-brandGreen/10 text-brandGreen border-brandGreen/30',
      Full: 'bg-red-500/10 text-red-400 border-red-500/30',
      Closed: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    };
    return map[status] || 'bg-white/5 text-textMuted border-white/10';
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => navigate('/admin/offers')} className="text-textMuted hover:text-brandGreen font-bold transition flex items-center gap-2">
          <ArrowLeft size={18} /> BACK TO OFFERS
        </button>
        <div className="flex bg-panelBg p-1 rounded-xl border border-white/5">
          <button onClick={() => setViewMode('table')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${viewMode === 'table' ? 'bg-brandGreen text-appBg' : 'text-textMuted hover:text-white'}`}>
            <LayoutList size={16} />
          </button>
          <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${viewMode === 'calendar' ? 'bg-brandGreen text-appBg' : 'text-textMuted hover:text-white'}`}>
            <CalendarDays size={16} />
          </button>
        </div>
      </div>

      {/* Add Slot Form */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 mb-8">
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3"><Plus className="text-brandGreen" /> ADD NEW SLOT</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
          {[ { label: 'Date', type: 'date', key: 'slotDate' }, { label: 'Start Time', type: 'time', key: 'startTime' }, { label: 'End Time', type: 'time', key: 'endTime' }, { label: 'Capacity', type: 'number', key: 'capacity' }].map(({ label, type, key }) => (
            <div key={key}>
              <label className="block text-[10px] font-black text-textMuted uppercase tracking-widest mb-2">{label}</label>
              <input type={type} {...register(key as any, { required: true })} className="w-full bg-appBg border border-white/10 rounded-xl p-3 outline-none focus:border-brandGreen text-white" />
            </div>
          ))}
          <button type="submit" disabled={isSubmitting} className="glass-btn shadow-glow w-full uppercase font-black tracking-widest">
            {isSubmitting ? 'ADDING...' : 'ADD SLOT'}
          </button>
        </form>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {['Date', 'Timing', 'Utilization', 'Status', 'Actions'].map(h => <th key={h} className="px-8 py-5 text-[10px] font-black text-textMuted uppercase tracking-widest">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-12 text-center text-textMuted">Loading...</td></tr>
              ) : slots.map(slot => (
                <tr key={slot.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="px-8 py-5 font-bold text-white">{new Date(slot.slotDate).toLocaleDateString()}</td>
                  <td className="px-8 py-5 text-sm text-textMuted font-mono">{slot.startTime.slice(0,5)} - {slot.endTime.slice(0,5)}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-bold text-white">{slot.bookedCount} / {slot.capacity}</div>
                      <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="bg-brandGreen h-full" style={{ width: `${(slot.bookedCount/slot.capacity)*100}%` }} /></div>
                    </div>
                  </td>
                  <td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(slot.status)}`}>{slot.status}</span></td>
                  <td className="px-8 py-5 text-right"><button onClick={() => handleDelete(slot.id)} className="text-textMuted hover:text-red-400 transition"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}