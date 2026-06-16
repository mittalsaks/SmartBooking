import { useEffect, useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, AlertCircle, Upload, X, ImagePlus,
  ChevronRight, Tag, Clock, Users, FileText,
  CheckCircle, Loader2, ArrowLeft, Zap, Save
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';

/* ─────────────────── Types ─────────────────── */
export interface EditOfferData {
  title: string;
  description: string;
  category: string;
  originalPrice: number;
  offerPrice: number;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalCapacity: number;
  maxBookingPerCustomer: number;
  termsAndConditions: string;
  status: string;
  imageFile?: FileList;
}

const CATEGORIES = ['Restaurant','Gym','Salon','Clinic','Coaching','Turf','Spa','Other'];
const STATUSES   = ['Draft','Active','Paused','Expired','Cancelled'];
const BACKEND_URL = 'https://smartbooking-pmww.onrender.com';

/* ─────────────────── Helpers ─────────────────── */
// Convert "HH:mm:ss" or "HH:mm:ss.fffffff" → "HH:mm" for <input type="time">
function toTimeInput(t?: string): string {
  if (!t) return '';
  return t.substring(0, 5); // grab "HH:mm"
}
// Convert "2026-05-24T00:00:00" or "2026-05-24" → "2026-05-24" for <input type="date">
function toDateInput(d?: string): string {
  if (!d) return '';
  return d.split('T')[0];
}

/* ─────────────────── Section wrapper ─────────────────── */
function FormSection({
  icon: Icon, title, accent = '#39FF96', delay = 0, children,
}: { icon: any; title: string; accent?: string; delay?: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'rgba(10, 20, 35, 0.75)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, backdropFilter: 'blur(24px)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)', overflow: 'hidden',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '16px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: `linear-gradient(90deg, ${accent}09 0%, transparent 60%)`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 10,
          background: `${accent}16`, border: `1px solid ${accent}30`,
        }}>
          <Icon size={15} style={{ color: accent }} strokeWidth={1.8} />
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: 0, letterSpacing: '0.02em' }}>{title}</h3>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </motion.div>
  );
}

/* ─────────────────── Field Label ─────────────────── */
function FieldLabel({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <label style={{
      display: 'block', fontSize: 10, fontWeight: 700,
      letterSpacing: '0.1em', textTransform: 'uppercase' as const,
      marginBottom: 8, color: error ? '#F87171' : '#4A5568',
    }}>
      {children}
    </label>
  );
}

/* ─────────────────── Field Error ─────────────────── */
function FieldError({ msg }: { msg?: string }) {
  return msg ? (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      style={{ fontSize: 11, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, color: '#F87171' }}>
      <AlertCircle size={11} /> {msg}
    </motion.p>
  ) : null;
}

/* ─────────────────── Input style ─────────────────── */
const inp = (hasError?: boolean): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', borderRadius: 12, boxSizing: 'border-box' as const,
  background: 'rgba(255,255,255,0.03)',
  border: `1px solid ${hasError ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)'}`,
  color: '#E2E8F0', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
  fontFamily: 'inherit',
});

/* ─────────────────── Image Upload ─────────────────── */
function ImageUpload({
  register, watch, existingUrl,
}: { register: any; watch: any; existingUrl?: string }) {
  const [preview, setPreview]   = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => { if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleFile = useCallback((file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }, [preview]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const clearPreview = () => {
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const displayUrl = preview || (existingUrl
    ? (existingUrl.startsWith('http') ? existingUrl : `${BACKEND_URL}${existingUrl}`)
    : null);

  const { ref: rhfRef, onChange: rhfOnChange, ...rest } = register('imageFile');

  return (
    <div>
      <AnimatePresence mode="wait">
        {displayUrl ? (
          <motion.div key="preview"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.22 }}
            style={{ position: 'relative', borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(57,255,150,0.35)', boxShadow: '0 0 30px rgba(57,255,150,0.1)' }}>
            <img src={displayUrl} alt="Offer" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', padding: 16,
              background: 'linear-gradient(to top, rgba(5,12,24,0.92) 0%, transparent 55%)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={14} color="#39FF96" />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#39FF96' }}>
                  {preview ? 'New image selected' : 'Current image'}
                </span>
              </div>
            </div>
            <button type="button" onClick={clearPreview}
              style={{
                position: 'absolute', top: 10, right: 10, width: 30, height: 30,
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(5,12,24,0.9)', border: '1px solid rgba(248,113,113,0.4)',
                color: '#F87171', cursor: 'pointer',
              }}>
              <X size={13} />
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}
              style={{
                position: 'absolute', top: 10, left: 10,
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 10,
                background: 'rgba(5,12,24,0.9)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#94A3B8', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit',
              }}>
              <ImagePlus size={13} /> Replace
            </button>
          </motion.div>
        ) : (
          <motion.div key="dropzone"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              cursor: 'pointer', borderRadius: 16, transition: 'all 0.2s',
              border: `2px dashed ${dragging ? 'rgba(57,255,150,0.7)' : 'rgba(255,255,255,0.1)'}`,
              background: dragging ? 'rgba(57,255,150,0.06)' : 'rgba(255,255,255,0.015)',
            }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, marginBottom: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: dragging ? 'rgba(57,255,150,0.15)' : 'rgba(57,255,150,0.06)',
                border: `1px solid ${dragging ? 'rgba(57,255,150,0.5)' : 'rgba(57,255,150,0.2)'}`,
              }}>
                <Upload size={22} style={{ color: '#39FF96' }} strokeWidth={1.5} />
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}>
                {dragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
              </p>
              <p style={{ fontSize: 11, color: '#4A5568' }}>PNG, JPG, WEBP up to 10MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <input type="file" accept="image/*" style={{ display: 'none' }}
        ref={el => { rhfRef(el); (fileRef as any).current = el; }}
        onChange={e => { rhfOnChange(e); handleFile(e.target.files?.[0] ?? null); }}
        {...rest}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN: EditOffer
══════════════════════════════════════════════════ */
export default function EditOffer() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loadState,   setLoadState]   = useState<'loading' | 'ready' | 'error'>('loading');
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [existingImg, setExistingImg] = useState<string | undefined>();

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors },
  } = useForm<EditOfferData>();

  const originalPrice      = Number(watch('originalPrice')) || 0;
  const offerPrice         = Number(watch('offerPrice'))    || 0;
  const discountPercentage = watch('discountPercentage');
  const startDate          = watch('startDate');

  /* ── Auto-calc discount ── */
  useEffect(() => {
    const calc =
      originalPrice > 0 && offerPrice >= 0 && originalPrice > offerPrice
        ? parseFloat(((originalPrice - offerPrice) / originalPrice * 100).toFixed(2))
        : 0;
    if (calc !== discountPercentage) {
      setValue('discountPercentage', calc, { shouldDirty: false, shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalPrice, offerPrice]);

  /* ── Load existing offer ── */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res  = await axiosClient.get(`/offers/${id}`);
        const data = res.data;
        setExistingImg(data.imageUrl || undefined);

        // Pre-fill all form fields
        reset({
          title:                 data.title                 ?? '',
          description:           data.description           ?? '',
          category:              data.category              ?? 'Restaurant',
          originalPrice:         data.originalPrice         ?? 0,
          offerPrice:            data.offerPrice            ?? 0,
          discountPercentage:    data.discountPercentage    ?? 0,
          startDate:             toDateInput(data.startDate),
          endDate:               toDateInput(data.endDate),
          startTime:             toTimeInput(data.startTime),
          endTime:               toTimeInput(data.endTime),
          totalCapacity:         data.totalCapacity         ?? 20,
          maxBookingPerCustomer: data.maxBookingPerCustomer ?? 1,
          termsAndConditions:    data.termsAndConditions    ?? '',
          status:                data.status                ?? 'Draft',
        });
        setLoadState('ready');
      } catch {
        setLoadState('error');
      }
    })();
  }, [id, reset]);

  /* ── Submit ── */
  const onSubmit = async (data: EditOfferData) => {
    setSubmitState('loading');
    setSubmitError(null);
    try {
      const fmtTime = (t: string) => t?.length === 5 ? `${t}:00` : (t ?? '00:00:00');

      const fd = new FormData();
      fd.append('title',                 data.title);
      fd.append('description',           data.description           ?? '');
      fd.append('category',              data.category);
      fd.append('originalPrice',         String(Number(data.originalPrice)));
      fd.append('offerPrice',            String(Number(data.offerPrice)));
      fd.append('discountPercentage',    String(Number(data.discountPercentage)));
      fd.append('startDate',             data.startDate);
      fd.append('endDate',               data.endDate);
      fd.append('startTime',             fmtTime(data.startTime));
      fd.append('endTime',               fmtTime(data.endTime));
      fd.append('totalCapacity',         String(Number(data.totalCapacity)));
      fd.append('maxBookingPerCustomer', String(Number(data.maxBookingPerCustomer)));
      fd.append('termsAndConditions',    data.termsAndConditions    ?? '');
      fd.append('status',                data.status);
      fd.append('businessId',            '1');
      if (data.imageFile?.[0]) fd.append('imageFile', data.imageFile[0]);

      await axiosClient.put(`/offers/${id}`, fd);

      setSubmitState('success');
      setTimeout(() => navigate('/admin/offers'), 1400);
    } catch (err: any) {
      let msg = 'Failed to update offer.';
      if (typeof err.response?.data === 'string')      msg = err.response.data;
      else if (err.response?.data?.errors)
        msg = Object.values(err.response.data.errors).flat().join(' · ');
      else if (err.response?.data?.message)            msg = err.response.data.message;
      setSubmitError(msg);
      setSubmitState('error');
    }
  };

  /* ── Loading state ── */
  if (loadState === 'loading') return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(57,255,150,0.2)',
            borderTopColor: '#39FF96', margin: '0 auto 12px' }} />
        <p style={{ color: '#4A5568', fontSize: 13, fontWeight: 600 }}>Loading offer data…</p>
      </div>
    </div>
  );

  /* ── Error loading ── */
  if (loadState === 'error') return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{
        background: 'rgba(10,20,36,0.82)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, padding: 32, textAlign: 'center', maxWidth: 400,
      }}>
        <AlertCircle size={36} color="#F87171" style={{ margin: '0 auto 14px' }} />
        <p style={{ fontSize: 15, fontWeight: 700, color: '#F0FDF4', marginBottom: 16 }}>
          Could not load offer #{id}
        </p>
        <button onClick={() => navigate('/admin/offers')}
          style={{
            padding: '10px 20px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg,#39FF96,#22C55E)',
            color: '#050D18', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}>
          Back to Offers
        </button>
      </div>
    </div>
  );

  const hasErrors = Object.keys(errors).length > 0;

  /* ── Form ── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #050C18 0%, #071628 50%, #050C18 100%)' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(57,255,150,0.07) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <motion.button type="button" onClick={() => navigate('/admin/offers')}
              whileHover={{ x: -2 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 12, fontWeight: 600, color: '#4A5568',
                background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#39FF96'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#4A5568'}>
              <ArrowLeft size={13} /> Manage Offers
            </motion.button>
            <ChevronRight size={11} style={{ color: '#2D3748' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#39FF96' }}>Edit Offer #{id}</span>
          </div>

          <h1 style={{
            fontSize: 28, fontWeight: 800, margin: '0 0 6px', letterSpacing: -0.5,
            background: 'linear-gradient(135deg, #F7FAFC 30%, #39FF96 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            Edit Offer
          </h1>
          <p style={{ fontSize: 12, color: '#4A5568', margin: 0 }}>Update the details below and save changes</p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── Basic Info ── */}
          <FormSection icon={Tag} title="Offer Details" accent="#39FF96" delay={0.05}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 16, marginBottom: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <FieldLabel error={!!errors.title}>Offer Title *</FieldLabel>
                <input {...register('title', { required: 'Title is required' })}
                  placeholder="e.g., 75% Off Masala Dosa Feast"
                  style={inp(!!errors.title)}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(57,255,150,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.title ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)')} />
                <FieldError msg={errors.title?.message} />
              </div>
              <div>
                <FieldLabel>Category</FieldLabel>
                <select {...register('category')} style={{ ...inp(), cursor: 'pointer' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(57,255,150,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0A1423' }}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <textarea {...register('description')} rows={3}
                placeholder="Describe what makes this offer unmissable…"
                style={{ ...inp(), resize: 'vertical', lineHeight: 1.6 }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(57,255,150,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')} />
            </div>
          </FormSection>

          {/* ── Image ── */}
          <FormSection icon={ImagePlus} title="Offer Image" accent="#22D3EE" delay={0.1}>
            <ImageUpload register={register} watch={watch} existingUrl={existingImg} />
            <p style={{ fontSize: 11, color: '#4A5568', marginTop: 10 }}>
              Leave unchanged to keep the current image. Upload a new one to replace it.
            </p>
          </FormSection>

          {/* ── Pricing ── */}
          <FormSection icon={Calculator} title="Pricing" accent="#A78BFA" delay={0.15}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px', gap: 16, alignItems: 'end' }}>
              <div>
                <FieldLabel error={!!errors.originalPrice}>Original Price (₹) *</FieldLabel>
                <input type="number" step="0.01"
                  {...register('originalPrice', { required: 'Required', min: { value: 0.1, message: 'Must be positive' } })}
                  placeholder="0.00" style={inp(!!errors.originalPrice)}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.originalPrice ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)')} />
                <FieldError msg={errors.originalPrice?.message} />
              </div>
              <div>
                <FieldLabel error={!!errors.offerPrice}>Offer Price (₹) *</FieldLabel>
                <input type="number" step="0.01"
                  {...register('offerPrice', {
                    required: 'Required', min: { value: 0, message: 'Must be ≥ 0' },
                    validate: v => Number(v) < originalPrice || 'Must be less than original',
                  })}
                  placeholder="0.00" style={inp(!!errors.offerPrice)}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = errors.offerPrice ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)')} />
                <FieldError msg={errors.offerPrice?.message} />
              </div>
              <motion.div
                animate={discountPercentage > 0 ? { scale: [1, 1.04, 1] } : {}}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: 42, borderRadius: 12, fontWeight: 800, fontSize: 18,
                  fontVariantNumeric: 'tabular-nums',
                  ...(discountPercentage > 0 ? {
                    background: 'rgba(57,255,150,0.1)', border: '1px solid rgba(57,255,150,0.35)', color: '#39FF96',
                  } : {
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#2D3748',
                  }),
                }}>
                {discountPercentage > 0 ? `${discountPercentage}% OFF` : '— % OFF'}
              </motion.div>
            </div>
            <AnimatePresence>
              {discountPercentage > 0 && originalPrice > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ padding: '10px 14px', borderRadius: 12, fontSize: 12, color: '#718096',
                    background: 'rgba(57,255,150,0.05)', border: '1px solid rgba(57,255,150,0.15)', overflow: 'hidden' }}>
                  Customer saves{' '}
                  <span style={{ color: '#39FF96', fontWeight: 700 }}>₹{(originalPrice - offerPrice).toFixed(2)}</span>
                  {' '}per booking
                </motion.div>
              )}
            </AnimatePresence>
          </FormSection>

          {/* ── Schedule ── */}
          <FormSection icon={Clock} title="Schedule & Timing" accent="#FCD34D" delay={0.2}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: 'Start Date', field: 'startDate', type: 'date', err: errors.startDate, opts: { required: true } },
                { label: 'End Date',   field: 'endDate',   type: 'date', err: errors.endDate,
                  opts: { required: true, validate: (v: string) => v >= startDate || 'Must be after start date' } },
                { label: 'Start Time', field: 'startTime', type: 'time', err: errors.startTime, opts: { required: true } },
                { label: 'End Time',   field: 'endTime',   type: 'time', err: errors.endTime,   opts: { required: true } },
              ].map(({ label, field, type, err, opts }) => (
                <div key={field}>
                  <FieldLabel error={!!err}>{label} *</FieldLabel>
                  <input type={type} {...register(field as any, opts)} style={inp(!!err)}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(252,211,77,0.4)')}
                    onBlur={e => (e.currentTarget.style.borderColor = err ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)')} />
                  {err && <FieldError msg={(err as any)?.message} />}
                </div>
              ))}
            </div>
          </FormSection>

          {/* ── Capacity & Status ── */}
          <FormSection icon={Users} title="Capacity & Status" accent="#F87171" delay={0.25}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div>
                <FieldLabel>Total Capacity</FieldLabel>
                <input type="number" {...register('totalCapacity', { required: true, min: 1 })} style={inp()}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')} />
              </div>
              <div>
                <FieldLabel>Max Per Customer</FieldLabel>
                <input type="number" {...register('maxBookingPerCustomer', { required: true, min: 1 })} style={inp()}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')} />
              </div>
              <div>
                <FieldLabel>Status</FieldLabel>
                <select {...register('status')} style={{ ...inp(), cursor: 'pointer' }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(248,113,113,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
                  {STATUSES.map(s => <option key={s} value={s} style={{ background: '#0A1423' }}>{s}</option>)}
                </select>
              </div>
            </div>
          </FormSection>

          {/* ── Terms ── */}
          <FormSection icon={FileText} title="Terms & Conditions" accent="#94A3B8" delay={0.3}>
            <textarea {...register('termsAndConditions')} rows={3}
              placeholder="e.g., Valid for dine-in only. Cannot be combined with other offers."
              style={{ ...inp(), resize: 'vertical', lineHeight: 1.6, width: '100%', boxSizing: 'border-box' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.4)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')} />
          </FormSection>

          {/* ── Error banner ── */}
          <AnimatePresence>
            {(hasErrors || submitError) && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 14,
                  background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171',
                }}>
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                  {submitError ?? 'Please fix the highlighted fields before saving.'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Footer buttons ── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <motion.button type="button" onClick={() => navigate('/admin/offers')}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 12,
                fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', cursor: 'pointer', fontFamily: 'inherit',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#E2E8F0'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              <ArrowLeft size={14} /> Cancel
            </motion.button>

            <motion.button type="submit"
              disabled={submitState === 'loading' || submitState === 'success'}
              whileHover={submitState === 'idle' || submitState === 'error' ? { scale: 1.03, y: -1 } : {}}
              whileTap={submitState === 'idle' || submitState === 'error' ? { scale: 0.97 } : {}}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '11px 32px', borderRadius: 12, fontSize: 14, fontWeight: 800,
                minWidth: 160, cursor: submitState === 'loading' ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', border: 'none', transition: 'all 0.25s',
                ...(submitState === 'success' ? {
                  background: 'linear-gradient(135deg,#22C55E,#39FF96)', color: '#050C18',
                  boxShadow: '0 0 32px rgba(57,255,150,0.45)',
                } : submitState === 'loading' ? {
                  background: 'rgba(57,255,150,0.3)', color: '#F0FDF4',
                } : {
                  background: 'linear-gradient(135deg,#39FF96,#22D3EE)', color: '#050C18',
                  boxShadow: '0 0 24px rgba(57,255,150,0.3)',
                }),
              }}>
              <AnimatePresence mode="wait">
                {submitState === 'loading' && (
                  <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Saving…
                  </motion.span>
                )}
                {submitState === 'success' && (
                  <motion.span key="s" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <CheckCircle size={15} /> Saved!
                  </motion.span>
                )}
                {(submitState === 'idle' || submitState === 'error') && (
                  <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Save size={15} /> Save Changes
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
