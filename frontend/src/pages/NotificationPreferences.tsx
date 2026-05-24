import { useEffect, useState } from 'react';
import { getNotificationPreferences, updateNotificationPreferences } from '../services/notificationApi';
import { useToast } from '../components/ToastProvider';

const availableChannels = ['email', 'sms', 'whatsapp'];
const availableTypes = ['registration', 'otp', 'booking_confirmation', 'booking_cancellation', 'offer_reminder', 'expiry_alert', 'new_offer'];

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<{ notificationChannels: string[]; notificationTypes: string[] }>({ notificationChannels: [], notificationTypes: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { pushToast } = useToast();

  useEffect(() => {
    const loadPreferences = async () => {
      setLoading(true);
      try {
        const response = await getNotificationPreferences();
        setPreferences(response.data);
      } catch (error: any) {
        pushToast({ title: 'Error', message: error.response?.data?.message || 'Failed to load preferences', level: 'error' });
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, [pushToast]);

  const toggleItem = (slot: string, field: 'notificationChannels' | 'notificationTypes') => {
    setPreferences((current) => {
      const list = current[field];
      const next = list.includes(slot) ? list.filter((item) => item !== slot) : [...list, slot];
      return { ...current, [field]: next };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await updateNotificationPreferences(preferences);
      setPreferences(response.data);
      pushToast({ title: 'Saved', message: 'Notification preferences updated.', level: 'success' });
    } catch (error: any) {
      pushToast({ title: 'Error', message: error.response?.data?.message || 'Unable to save settings', level: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 rounded-[32px] border border-slate-700 bg-slate-950/90 p-8 shadow-[0_40px_120px_rgba(16,185,129,0.14)]">
      <div>
        <h1 className="text-3xl font-black text-white">Notification Preferences</h1>
        <p className="mt-2 text-slate-400">Choose which channels and message types you want to receive.</p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 text-center text-slate-300">Loading preferences…</div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold text-white">Delivery Channels</h2>
            <p className="text-sm text-slate-400 mt-1">Select where you want to receive your alerts.</p>
            <div className="mt-5 space-y-3">
              {availableChannels.map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleItem(channel, 'notificationChannels')}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${preferences.notificationChannels.includes(channel) ? 'border-emerald-400 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]' : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold capitalize">{channel}</p>
                      <p className="text-sm text-slate-400">Enabled for {channel === 'email' ? 'email' : channel === 'sms' ? 'SMS' : 'WhatsApp'} delivery.</p>
                    </div>
                    <span className="text-sm text-slate-300">{preferences.notificationChannels.includes(channel) ? 'On' : 'Off'}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold text-white">Notification Types</h2>
            <p className="text-sm text-slate-400 mt-1">Enable alerts for events that matter to you.</p>
            <div className="mt-5 grid gap-3">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleItem(type, 'notificationTypes')}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${preferences.notificationTypes.includes(type) ? 'border-emerald-400 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]' : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500'}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold capitalize">{type.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-slate-400">Receive {type.replace(/_/g, ' ')} updates.</p>
                    </div>
                    <span className="text-sm text-slate-300">{preferences.notificationTypes.includes(type) ? 'On' : 'Off'}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-3xl bg-gradient-to-r from-emerald-400 to-lime-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 shadow-[0_24px_64px_rgba(16,185,129,0.16)] transition hover:scale-[1.01] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
