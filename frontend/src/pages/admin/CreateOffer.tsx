import { useEffect, useRef, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, AlertCircle, Upload, X, ImagePlus,
  ChevronRight, Tag, Clock, Users, FileText,
  CheckCircle, Loader2, Sparkles, ArrowLeft, Zap
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../components/ToastProvider';

export interface CreateOfferData {
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

/* ── Section wrapper ── */
function FormSection({
  icon: Icon, title, accent = '#39FF96', delay = 0, children
}: {
  icon: any; title: string; accent?: string; delay?: number; children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(10, 20, 35, 0.75)',
        border: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.3)',
      }}
    >
      <div
        className="flex items-center gap-3 px-6 py-4"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          background: `linear-gradient(90deg, ${accent}09 0%, transparent 60%)`,
        }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-xl"
          style={{
            background: `${accent}16`,
            border: `1px solid ${accent}30`,
            boxShadow: `0 0 12px ${accent}18`,
          }}
        >
          <Icon size={15} style={{ color: accent }} strokeWidth={1.8} />
        </div>
        <h3 className="text-sm font-semibold" style={{ color: '#E2E8F0', letterSpacing: '0.02em' }}>{title}</h3>
        <div className="ml-auto h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(90deg, ${accent}30, transparent)` }} />
      </div>
      <div className="px-6 py-6">{children}</div>
    </motion.div>
  );
}

/* ── Field label ── */
function FieldLabel({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <label
      className="block text-[10px] font-bold tracking-[0.1em] uppercase mb-2"
      style={{ color: error ? '#F87171' : '#4A5568' }}
    >
      {children}
    </label>
  );
}

/* ── Error message ── */
function FieldError({ msg }: { msg?: string }) {
  return msg ? (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-[11px] mt-1.5 flex items-center gap-1"
      style={{ color: '#F87171' }}
    >
      <AlertCircle size={11} /> {msg}
    </motion.p>
  ) : null;
}

/* ── Input styles helper ── */
const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '10px 14px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.03)',
  border: `1px solid ${hasError ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.08)'}`,
  color: '#E2E8F0',
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxShadow: hasError ? '0 0 0 3px rgba(248,113,113,0.1)' : 'none',
});

/* ── Image Upload ── */
function ImageUpload({ register }: { register: any }) {
  const [preview, setPreview]   = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  /* Clean up object URLs on unmount */
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const handleFile = useCallback((file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (preview) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
  }, [preview]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const clearPreview = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const { ref: rhfRef, onChange: rhfOnChange, ...rest } = register('imageFile');

  return (
    <div>
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(57,255,150,0.35)', boxShadow: '0 0 30px rgba(57,255,150,0.1)' }}
          >
            <img src={preview} alt="Offer preview" className="w-full h-56 object-cover" />
            <div
              className="absolute inset-0 flex items-end p-4"
              style={{ background: 'linear-gradient(to top, rgba(5,12,24,0.92) 0%, transparent 55%)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(57,255,150,0.2)' }}>
                  <CheckCircle size={12} style={{ color: '#39FF96' }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: '#39FF96' }}>Image ready</span>
              </div>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearPreview}
              className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(5,12,24,0.9)', border: '1px solid rgba(248,113,113,0.4)', color: '#F87171' }}
            >
              <X size={13} />
            </motion.button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(5,12,24,0.9)', border: '1px solid rgba(255,255,255,0.12)', color: '#94A3B8' }}
            >
              <ImagePlus size={13} /> Replace
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer rounded-2xl transition-all duration-200"
            style={{
              border: `2px dashed ${dragging ? 'rgba(57,255,150,0.7)' : 'rgba(255,255,255,0.1)'}`,
              background: dragging ? 'rgba(57,255,150,0.06)' : 'rgba(255,255,255,0.015)',
              boxShadow: dragging ? '0 0 30px rgba(57,255,150,0.15)' : 'none',
            }}
          >
            <motion.div
              animate={dragging ? { scale: 1.02 } : { scale: 1 }}
              className="flex flex-col items-center py-12 px-6 select-none"
            >
              <motion.div
                animate={dragging
                  ? { y: [-6, 2, -6], transition: { repeat: Infinity, duration: 0.9 } }
                  : { y: 0 }
                }
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: dragging ? 'rgba(57,255,150,0.15)' : 'rgba(57,255,150,0.06)',
                  border: `1px solid ${dragging ? 'rgba(57,255,150,0.5)' : 'rgba(57,255,150,0.2)'}`,
                  boxShadow: dragging ? '0 0 24px rgba(57,255,150,0.25)' : 'none',
                }}
              >
                <Upload size={22} style={{ color: '#39FF96' }} strokeWidth={1.5} />
              </motion.div>
              <p className="text-sm font-semibold mb-1.5" style={{ color: '#E2E8F0' }}>
                {dragging ? 'Drop to upload' : 'Drag & drop your image'}
              </p>
              <p className="text-xs text-center" style={{ color: '#4A5568' }}>
                or{' '}
                <span style={{ color: '#39FF96', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  browse files
                </span>
                {' '}— PNG, JPG, WEBP up to 10MB
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input — NOT using RHF ref trick that causes RangeError */}
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        ref={(el) => {
          rhfRef(el);
          (fileRef as any).current = el;
        }}
        onChange={(e) => {
          rhfOnChange(e);                          // notify RHF
          handleFile(e.target.files?.[0] ?? null); // update preview
        }}
        {...rest}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function CreateOffer() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors }
  } = useForm<CreateOfferData>({
    defaultValues: {
      category: 'Restaurant', status: 'Draft',
      totalCapacity: 20, maxBookingPerCustomer: 1
    }
  });

  const originalPrice      = Number(watch('originalPrice')) || 0;
  const offerPrice         = Number(watch('offerPrice'))    || 0;
  const discountPercentage = watch('discountPercentage');
  const startDate          = watch('startDate');

  /* ─── FIX 1: Guard setValue inside effect with a stable comparison ─── */
  useEffect(() => {
    const calc =
      originalPrice > 0 && offerPrice >= 0 && originalPrice > offerPrice
        ? parseFloat(((originalPrice - offerPrice) / originalPrice * 100).toFixed(2))
        : 0;

    // Only call setValue when the value actually changes — prevents infinite loop
    if (calc !== discountPercentage) {
      setValue('discountPercentage', calc, { shouldDirty: false, shouldValidate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalPrice, offerPrice]);
  // ↑ intentionally omit discountPercentage & setValue from deps

  const onSubmit = async (data: CreateOfferData) => {
    setSubmitState('loading');
    setSubmitError(null);
    try {
      // ✅ NAYA CODE: Browser se asli logged-in Business ki ID nikal rahe hain
      const realBusinessId = localStorage.getItem('businessId'); 

      // ✅ Agar login ID nahi mili, toh error dikhao aur yahin ruk jao
      if (!realBusinessId) {
        pushToast({ title: 'Error', message: 'Please login first! Business ID missing.', level: 'error' });
        setSubmitState('error');
        return; 
      }

      const formatTime = (t: string) =>
        t?.length === 5 ? `${t}:00` : (t ?? '00:00:00');

      const fd = new FormData();
      fd.append('title',                 data.title);
      fd.append('description',           data.description ?? '');
      fd.append('category',              data.category);
      fd.append('originalPrice',         String(Number(data.originalPrice)));
      fd.append('offerPrice',            String(Number(data.offerPrice)));
      fd.append('discountPercentage',    String(Number(data.discountPercentage)));
      fd.append('startDate',             data.startDate);
      fd.append('endDate',               data.endDate);
      fd.append('startTime',             formatTime(data.startTime));
      fd.append('endTime',               formatTime(data.endTime));
      fd.append('totalCapacity',         String(Number(data.totalCapacity)));
      fd.append('maxBookingPerCustomer', String(Number(data.maxBookingPerCustomer)));
      fd.append('termsAndConditions',    data.termsAndConditions ?? '');
      fd.append('status',                data.status);
      
      // ✅ NAYA CODE: Yahan humne hardcoded '1' ki jagah asli ID daal di!
      fd.append('businessId',            realBusinessId);
      
      fd.append('imageUrl',              '');
      if (data.imageFile?.[0]) fd.append('imageFile', data.imageFile[0]);

      await axiosClient.post('/offers', fd);

      pushToast({ title: 'Success', message: 'Offer created successfully.', level: 'success' });
      window.localStorage.setItem('afterOfferChange', Date.now().toString());
      setSubmitState('success');
      setTimeout(() => navigate('/admin/offers'), 1400);
    } catch (error: any) {
      let msg = 'Failed to create offer.';
      if (typeof error.response?.data === 'string')       msg = error.response.data;
      else if (error.response?.data?.errors)
        msg = Object.values(error.response.data.errors).flat().join(' · ');
      else if (error.response?.data?.message)             msg = error.response.data.message;

      pushToast({ title: 'Error', message: msg, level: 'error' });
      setSubmitError(msg);
      setSubmitState('error');
      console.error(error);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #050C18 0%, #071628 50%, #050C18 100%)' }}
    >
      {/* Ambient background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(57,255,150,0.07) 0%, transparent 70%)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-16">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-3">
              <motion.button
                type="button"
                onClick={() => navigate('/admin/offers')}
                whileHover={{ x: -2 }}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: '#4A5568' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#39FF96')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#4A5568')}
              >
                <ArrowLeft size={12} /> Manage Offers
              </motion.button>
              <ChevronRight size={11} style={{ color: '#2D3748' }} />
              <span className="text-xs font-medium" style={{ color: '#39FF96' }}>New Offer</span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #F7FAFC 30%, #39FF96 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.2,
              }}
            >
              Create New Offer
            </h1>
            <p className="text-sm mt-1.5" style={{ color: '#4A5568' }}>
              Fill in the details below to publish a new deal
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold"
            style={{
              background: 'rgba(57,255,150,0.08)',
              border: '1px solid rgba(57,255,150,0.2)',
              color: '#39FF96',
              boxShadow: '0 0 20px rgba(57,255,150,0.08)',
            }}
          >
            <Zap size={12} />
            Live Preview Ready
          </motion.div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* ── Section 1: Basic Info ── */}
          <FormSection icon={Tag} title="Offer Details" accent="#39FF96" delay={0.05}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <FieldLabel error={!!errors.title}>Offer Title *</FieldLabel>
                <input
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g., 75% Off Masala Dosa Feast"
                  style={inputStyle(!!errors.title)}
                  className="focus:outline-none focus:border-green-400/50 focus:shadow-[0_0_0_3px_rgba(57,255,150,0.1)] hover:border-white/15 transition-all duration-200"
                />
                <FieldError msg={errors.title?.message} />
              </div>
              <div>
                <FieldLabel>Category</FieldLabel>
                <select
                  {...register('category')}
                  style={{ ...inputStyle(), cursor: 'pointer' }}
                  className="focus:outline-none focus:border-green-400/50 transition-all duration-200"
                >
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0A1423' }}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-5">
              <FieldLabel>Description</FieldLabel>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Describe what makes this offer unmissable…"
                style={{ ...inputStyle(), resize: 'vertical', lineHeight: '1.6' }}
                className="focus:outline-none focus:border-green-400/50 focus:shadow-[0_0_0_3px_rgba(57,255,150,0.1)] hover:border-white/15 transition-all duration-200"
              />
            </div>
          </FormSection>

          {/* ── Section 2: Image Upload ── */}
          <FormSection icon={ImagePlus} title="Offer Image" accent="#22D3EE" delay={0.1}>
            <ImageUpload register={register} />
            <p className="text-[11px] mt-3 flex items-center gap-1.5" style={{ color: '#4A5568' }}>
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: '#22D3EE', boxShadow: '0 0 6px #22D3EE' }}
              />
              Displays on the public deals page. Recommended: 1200×630px, min 800×400px.
            </p>
          </FormSection>

          {/* ── Section 3: Pricing ── */}
          <FormSection icon={Calculator} title="Pricing Strategy" accent="#A78BFA" delay={0.15}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              <div>
                <FieldLabel error={!!errors.originalPrice}>Original Price (₹) *</FieldLabel>
                <input
                  type="number" step="0.01"
                  {...register('originalPrice', {
                    required: 'Required',
                    min: { value: 0.1, message: 'Must be positive' }
                  })}
                  placeholder="0.00"
                  style={inputStyle(!!errors.originalPrice)}
                  className="focus:outline-none focus:border-purple-400/50 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.1)] transition-all duration-200"
                />
                <FieldError msg={errors.originalPrice?.message} />
              </div>
              <div>
                <FieldLabel error={!!errors.offerPrice}>Offer Price (₹) *</FieldLabel>
                <input
                  type="number" step="0.01"
                  {...register('offerPrice', {
                    required: 'Required',
                    min: { value: 0, message: 'Must be ≥ 0' },
                    validate: v => Number(v) < originalPrice || 'Must be less than original price'
                  })}
                  placeholder="0.00"
                  style={inputStyle(!!errors.offerPrice)}
                  className="focus:outline-none focus:border-purple-400/50 focus:shadow-[0_0_0_3px_rgba(167,139,250,0.1)] transition-all duration-200"
                />
                <FieldError msg={errors.offerPrice?.message} />
              </div>

              {/* Live discount badge */}
              <motion.div
                animate={discountPercentage > 0
                  ? { scale: [1, 1.05, 1], transition: { duration: 0.35 } }
                  : {}
                }
                className="flex items-center justify-center h-[46px] rounded-[12px] font-extrabold text-xl tabular-nums tracking-tight"
                style={discountPercentage > 0 ? {
                  background: 'linear-gradient(135deg, rgba(57,255,150,0.12), rgba(57,255,150,0.06))',
                  border: '1px solid rgba(57,255,150,0.35)',
                  color: '#39FF96',
                  boxShadow: '0 0 24px rgba(57,255,150,0.2), inset 0 1px 0 rgba(57,255,150,0.1)',
                } : {
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: '#2D3748',
                }}
              >
                {discountPercentage > 0 ? `${discountPercentage}% OFF` : '—% OFF'}
              </motion.div>
            </div>

            {/* Savings preview */}
            <AnimatePresence>
              {discountPercentage > 0 && originalPrice > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="px-4 py-3 rounded-xl text-xs font-medium overflow-hidden"
                  style={{
                    background: 'rgba(57,255,150,0.05)',
                    border: '1px solid rgba(57,255,150,0.15)',
                    color: '#718096',
                  }}
                >
                  Customer saves{' '}
                  <span style={{ color: '#39FF96', fontWeight: 700 }}>
                    ₹{(originalPrice - offerPrice).toFixed(2)}
                  </span>{' '}
                  per booking · Offer price{' '}
                  <span style={{ color: '#E2E8F0', fontWeight: 600 }}>₹{offerPrice.toFixed(2)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </FormSection>

          {/* ── Section 4: Schedule ── */}
          <FormSection icon={Clock} title="Schedule & Timing" accent="#FCD34D" delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { label: 'Start Date', field: 'startDate', type: 'date', error: errors.startDate, opts: { required: true } },
                {
                  label: 'End Date', field: 'endDate', type: 'date', error: errors.endDate,
                  opts: { required: true, validate: (v: string) => v >= startDate || 'Must be after start date' }
                },
                { label: 'Start Time', field: 'startTime', type: 'time', error: errors.startTime, opts: { required: true } },
                { label: 'End Time',   field: 'endTime',   type: 'time', error: errors.endTime,   opts: { required: true } },
              ].map(({ label, field, type, error, opts }) => (
                <div key={field}>
                  <FieldLabel error={!!error}>{label} *</FieldLabel>
                  <input
                    type={type}
                    {...register(field as any, opts)}
                    style={inputStyle(!!error)}
                    className="focus:outline-none focus:border-yellow-400/50 focus:shadow-[0_0_0_3px_rgba(252,211,77,0.1)] transition-all duration-200"
                  />
                  {error && <FieldError msg={(error as any)?.message} />}
                </div>
              ))}
            </div>
          </FormSection>

          {/* ── Section 5: Capacity & Status ── */}
          <FormSection icon={Users} title="Capacity & Status" accent="#F87171" delay={0.25}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <FieldLabel>Total Capacity</FieldLabel>
                <input
                  type="number"
                  {...register('totalCapacity', { required: true, min: 1 })}
                  style={inputStyle()}
                  className="focus:outline-none focus:border-red-400/50 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.1)] transition-all duration-200"
                />
              </div>
              <div>
                <FieldLabel>Max Per Customer</FieldLabel>
                <input
                  type="number"
                  {...register('maxBookingPerCustomer', { required: true, min: 1 })}
                  style={inputStyle()}
                  className="focus:outline-none focus:border-red-400/50 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.1)] transition-all duration-200"
                />
              </div>
              <div>
                <FieldLabel>Initial Status</FieldLabel>
                <select
                  {...register('status')}
                  style={{ ...inputStyle(), cursor: 'pointer' }}
                  className="focus:outline-none focus:border-red-400/50 transition-all duration-200"
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s} style={{ background: '#0A1423' }}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </FormSection>

          {/* ── Section 6: Terms & Conditions ── */}
          <FormSection icon={FileText} title="Terms & Conditions" accent="#94A3B8" delay={0.3}>
            <textarea
              {...register('termsAndConditions')}
              rows={3}
              placeholder="e.g., Valid for dine-in only. Cannot be combined with other offers. One redemption per customer."
              style={{ ...inputStyle(), resize: 'vertical', lineHeight: '1.6', width: '100%' }}
              className="focus:outline-none focus:border-slate-400/50 focus:shadow-[0_0_0_3px_rgba(148,163,184,0.08)] hover:border-white/15 transition-all duration-200"
            />
          </FormSection>

          {/* ── Validation / API error banner ── */}
          <AnimatePresence>
            {(hasErrors || submitError) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-start gap-3 px-5 py-4 rounded-2xl text-sm"
                style={{
                  background: 'rgba(248,113,113,0.07)',
                  border: '1px solid rgba(248,113,113,0.25)',
                  color: '#F87171',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">
                  {submitError ?? 'Please fix the highlighted fields before submitting.'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Footer actions ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="flex items-center justify-between pt-2"
          >
            {/* Cancel */}
            <motion.button
              type="button"
              onClick={() => navigate('/admin/offers')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94A3B8',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)';
                (e.currentTarget as HTMLElement).style.color = '#E2E8F0';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLElement).style.color = '#94A3B8';
              }}
            >
              <ArrowLeft size={15} /> Cancel
            </motion.button>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitState === 'loading' || submitState === 'success'}
              whileHover={submitState === 'idle' || submitState === 'error'
                ? { scale: 1.03, y: -1 }
                : {}
              }
              whileTap={submitState === 'idle' || submitState === 'error'
                ? { scale: 0.97 }
                : {}
              }
              className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold min-w-[160px] justify-center transition-all duration-300"
              style={
                submitState === 'success' ? {
                  background: 'linear-gradient(135deg, #22C55E, #39FF96)',
                  color: '#050C18',
                  boxShadow: '0 0 32px rgba(57,255,150,0.45)',
                  border: 'none',
                } : submitState === 'loading' ? {
                  background: 'linear-gradient(135deg, rgba(57,255,150,0.5), rgba(34,211,238,0.3))',
                  color: '#F0FDF4',
                  border: '1px solid rgba(57,255,150,0.3)',
                  opacity: 0.8,
                } : {
                  background: 'linear-gradient(135deg, #39FF96, #22D3EE)',
                  color: '#050C18',
                  border: 'none',
                  boxShadow: '0 0 24px rgba(57,255,150,0.3)',
                }
              }
            >
              <AnimatePresence mode="wait">
                {submitState === 'loading' && (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 size={15} className="animate-spin" />
                    Publishing…
                  </motion.span>
                )}
                {submitState === 'success' && (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle size={15} />
                    Published!
                  </motion.span>
                )}
                {(submitState === 'idle' || submitState === 'error') && (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles size={14} />
                    Publish Offer
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

        </form>
      </div>
    </div>
  );
}
