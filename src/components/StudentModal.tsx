import React, { useState } from 'react';
import { Student } from '../types';
import { 
  X, UserPlus, Phone, BookOpen, CheckCircle2, ShieldCheck, 
  Sparkles, RefreshCw, User, Lock, Calendar, MapPin, Activity, 
  RotateCcw, Baby, HeartPulse, GraduationCap
} from 'lucide-react';
import { 
  GRADE_STAGES, 
  REHAB_PATHWAYS, 
  FUNCTIONAL_LEVELS, 
  DIAGNOSIS_OPTIONS, 
  calculateAgeArabic 
} from '../studentOptions';

interface SelectWithCustomInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: readonly string[];
  placeholder?: string;
  customPlaceholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

const SelectWithCustomInput: React.FC<SelectWithCustomInputProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = '-- اختر من القائمة --',
  customPlaceholder = 'اكتب هنا إذا لم تجد الخيار بالقائمة...',
  icon,
  required = false,
}) => {
  const isOptionInList = options.includes(value as any);
  const [isManualMode, setIsManualMode] = useState<boolean>(!isOptionInList && Boolean(value));

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected === '__CUSTOM__') {
      setIsManualMode(true);
      if (isOptionInList) {
        onChange('');
      }
    } else {
      setIsManualMode(false);
      onChange(selected);
    }
  };

  const handleManualToggle = () => {
    setIsManualMode(false);
    if (!isOptionInList) {
      onChange(options[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
          {icon}
          <span>{label}</span>
          {required && <span className="text-orange-600 dark:text-orange-400">*</span>}
        </label>

        {isManualMode && (
          <button
            type="button"
            onClick={handleManualToggle}
            className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold flex items-center gap-1 transition"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>العودة للقائمة المنسدلة</span>
          </button>
        )}
      </div>

      <div className="relative">
        <select
          id={id}
          value={isManualMode ? '__CUSTOM__' : value}
          onChange={handleSelectChange}
          className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition cursor-pointer"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="dark:bg-[#0b1326] dark:text-white">
              {opt}
            </option>
          ))}
          <option value="__CUSTOM__" className="font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950">
            ✍️ كتابة يدوية / أخرى غير متوفرة بالقائمة...
          </option>
        </select>
      </div>

      {isManualMode && (
        <div className="animate-in fade-in duration-200">
          <input
            type="text"
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={customPlaceholder}
            className="w-full bg-blue-50/50 dark:bg-blue-950/40 border-2 border-blue-400 dark:border-blue-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:bg-white dark:focus:bg-[#0b1326]"
          />
        </div>
      )}
    </div>
  );
};

interface StudentModalProps {
  studentToEdit?: Student | null;
  onSaveStudent: (student: Student) => void;
  onClose: () => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  studentToEdit,
  onSaveStudent,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    name: studentToEdit?.name || '',
    subject: studentToEdit?.subject || REHAB_PATHWAYS[0],
    grade: studentToEdit?.grade || GRADE_STAGES[0],
    currentLevel: studentToEdit?.currentLevel || FUNCTIONAL_LEVELS[0],
    levelScore: studentToEdit?.levelScore ?? 75,
    parentName: studentToEdit?.parentName || '',
    parentPhone: studentToEdit?.parentPhone || '+973 ',
    parentUsername: studentToEdit?.parentUsername || '',
    parentPassword: studentToEdit?.parentPassword || '123456',
    totalSessions: studentToEdit?.totalSessions || 12,
    completedSessions: studentToEdit?.completedSessions || 0,
    diagnosis: studentToEdit?.diagnosis || DIAGNOSIS_OPTIONS[0],
    birthDate: studentToEdit?.birthDate || '',
    address: studentToEdit?.address || '',
    nextSessionDate: studentToEdit?.nextSessionDate || '',
    nextSessionTime: studentToEdit?.nextSessionTime || '05:00 م',
    notes: studentToEdit?.notes || '',
  });

  const calculatedAge = formData.birthDate ? calculateAgeArabic(formData.birthDate) : '';

  const generateCredentials = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const cleanPhone = (formData.parentPhone || '').replace(/[^0-9]/g, '');
    const phonePart = cleanPhone.slice(-4) || `${randomNum}`;

    let baseUser = 'parent';
    if (formData.name?.trim()) {
      const parts = formData.name.trim().split(' ');
      baseUser = parts[0].toLowerCase();
      baseUser = baseUser.replace(/[^a-z0-9]/gi, '') || 'parent';
    }

    setFormData((prev) => ({
      ...prev,
      parentUsername: `${baseUser}_${phonePart}`,
      parentPassword: `${randomNum}`,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.parentName || !formData.parentPhone) return;

    const savedStudent: Student = {
      id: studentToEdit?.id || `std-${Date.now()}`,
      name: formData.name.trim(),
      grade: formData.grade || GRADE_STAGES[0],
      subject: formData.subject || REHAB_PATHWAYS[0],
      currentLevel: formData.currentLevel || FUNCTIONAL_LEVELS[0],
      levelScore: Number(formData.levelScore) || 75,
      parentName: formData.parentName.trim(),
      parentPhone: formData.parentPhone.trim(),
      parentUsername: formData.parentUsername?.trim() || formData.parentPhone.replace(/[^0-9]/g, ''),
      parentPassword: formData.parentPassword?.trim() || '123456',
      totalSessions: Number(formData.totalSessions) || 12,
      completedSessions: Number(formData.completedSessions) || 0,
      remainingSessions: Math.max(0, (Number(formData.totalSessions) || 12) - (Number(formData.completedSessions) || 0)),
      status: studentToEdit?.status || 'active',
      joinedAt: studentToEdit?.joinedAt || new Date().toISOString().split('T')[0],
      diagnosis: formData.diagnosis?.trim() || undefined,
      birthDate: formData.birthDate?.trim() || undefined,
      address: formData.address?.trim() || undefined,
      nextSessionDate: formData.nextSessionDate,
      nextSessionTime: formData.nextSessionTime,
      notes: formData.notes?.trim() || undefined,
    };

    onSaveStudent(savedStudent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl w-full max-w-xl md:max-w-3xl lg:max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-blue-900/40 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/40 dark:from-[#0b1326] dark:via-[#0f172a] dark:to-[#152244] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-600/20 shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                {studentToEdit ? 'تعديل ملف الطالب والخطة التأهيلية' : 'تسجيل بطل جديد وإنشاء حساب لولي الأمر'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">بيانات التخاطب والتنمية اللغوية وتخصيص دخول ولي الأمر</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#152244] hover:bg-slate-200 dark:hover:bg-[#1e2f5c] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body with Responsive Multi-Column Desktop Grid */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-7 flex-1 overflow-y-auto space-y-6 text-xs">
          
          {/* SECTION 1: Student Primary Info */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>البيانات الأساسية والشخصية للطالب</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5">
              {/* Name */}
              <div className="md:col-span-2 lg:col-span-6">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم الطالب / المستفيد <span className="text-orange-600 dark:text-orange-400">*</span>
                </label>
                <input
                  id="input-std-name"
                  type="text"
                  required
                  placeholder="مثال: يوسف أحمد الخليفة"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition text-xs sm:text-sm"
                />
              </div>

              {/* Birth Date */}
              <div className="md:col-span-1 lg:col-span-3">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>تاريخ الميلاد</span>
                </label>
                <input
                  id="input-std-birthdate"
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                />
                {calculatedAge && (
                  <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                    <Baby className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>العمر: {calculatedAge}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="md:col-span-1 lg:col-span-3">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>العنوان / المنطقة السكنية</span>
                </label>
                <input
                  id="input-std-address"
                  type="text"
                  placeholder="مثال: المنامة - الرفاع"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Clinical & Rehabilitation Classification */}
          <div className="pt-4 border-t border-slate-100 dark:border-blue-900/30 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>التشخيص والمرحلة والمسار التأهيلي (التخاطب وصعوبات التعلم)</span>
            </h4>

            {/* 2x2 Desktop Grid for Clean Non-scrolling Data Entry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Diagnosis Dropdown */}
              <SelectWithCustomInput
                id="input-std-diagnosis"
                label="التشخيص الطبي / التأهيلي"
                value={formData.diagnosis || ''}
                onChange={(val) => setFormData({ ...formData, diagnosis: val })}
                options={DIAGNOSIS_OPTIONS}
                placeholder="-- حدد التشخيص أو اكتب يدوياً --"
                customPlaceholder="اكتب تشخيصاً مخصصاً (مثال: لدغة رائية، تأخر نطقي مصاحب لضعف سمعي...)"
                icon={<HeartPulse className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
              />

              {/* Grade / Stage Dropdown */}
              <SelectWithCustomInput
                id="input-std-grade"
                label="الصف / المرحلة الدراسية والتنموية"
                value={formData.grade || ''}
                onChange={(val) => setFormData({ ...formData, grade: val })}
                options={GRADE_STAGES}
                placeholder="-- حدد المرحلة أو التدخل المبكر --"
                customPlaceholder="اكتب المرحلة يدوياً (مثال: تدخل مبكر سنتان ونصف، دمج جزئي...)"
                icon={<GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                required
              />

              {/* Rehab Pathway Dropdown */}
              <SelectWithCustomInput
                id="input-std-subject"
                label="المسار التدريبي / التأهيلي"
                value={formData.subject || ''}
                onChange={(val) => setFormData({ ...formData, subject: val })}
                options={REHAB_PATHWAYS}
                placeholder="-- حدد المسار التدريبي أو اكتب يدوياً --"
                customPlaceholder="اكتب المسار يدوياً (مثال: تأهيل النطق بعد عملية شق سقف الحلق...)"
                icon={<Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                required
              />

              {/* Functional Level Dropdown */}
              <SelectWithCustomInput
                id="input-std-level"
                label="المستوى اللغوي / الوظيفي الحالي"
                value={formData.currentLevel || ''}
                onChange={(val) => setFormData({ ...formData, currentLevel: val })}
                options={FUNCTIONAL_LEVELS}
                placeholder="-- حدد المستوى الحالي للطفل --"
                customPlaceholder="اكتب المستوى الحالي يدوياً (مثال: مرحلة إنتاج مقاطع ثنائية مع تدريب التنفّس...)"
                icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                required
              />
            </div>
          </div>

          {/* SECTION 3: Dedicated Parent Account Credentials */}
          <div className="pt-4 border-t border-slate-100 dark:border-blue-900/30">
            <div className="p-4 sm:p-5 bg-blue-50/50 dark:bg-[#0b1326] border border-blue-200/80 dark:border-blue-900/50 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>بيانات وحساب ولي الأمر لدخول المنصة</span>
                </span>

                <button
                  type="button"
                  onClick={generateCredentials}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/40 text-blue-800 dark:text-blue-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>توليد تلقائي</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    اسم ولي الأمر <span className="text-orange-600 dark:text-orange-400">*</span>
                  </label>
                  <input
                    id="input-std-parent-name"
                    type="text"
                    required
                    placeholder="مثال: أ. أحمد الخليفة (والد الطفل)"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    هاتف ولي الأمر (واتساب) <span className="text-orange-600 dark:text-orange-400">*</span>
                  </label>
                  <input
                    id="input-std-parent-phone"
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="+973 XXXXXXXX"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-right placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 transition"
                  />
                </div>
              </div>

              {/* Credentials Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>اسم المستخدم لولي الأمر <span className="text-orange-600 dark:text-orange-400">*</span></span>
                  </label>
                  <input
                    id="input-std-parent-username"
                    type="text"
                    required
                    dir="ltr"
                    value={formData.parentUsername}
                    onChange={(e) => setFormData({ ...formData, parentUsername: e.target.value })}
                    className="w-full bg-white dark:bg-[#080d1a] border border-blue-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span>كلمة مرور ولي الأمر <span className="text-orange-600 dark:text-orange-400">*</span></span>
                  </label>
                  <input
                    id="input-std-parent-password"
                    type="text"
                    required
                    dir="ltr"
                    value={formData.parentPassword}
                    onChange={(e) => setFormData({ ...formData, parentPassword: e.target.value })}
                    className="w-full bg-white dark:bg-[#080d1a] border border-blue-200 dark:border-blue-900/60 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-mono font-bold focus:outline-hidden focus:border-blue-500 transition"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                يقوم ولي الأمر بتسجيل الدخول من الشاشة الرئيسية باستخدام اسم المستخدم وكلمة المرور هذه لمتابعة تطورات ابنه حصراً وبخصوصية تامة.
              </p>
            </div>
          </div>

          {/* SECTION 4: Sessions Allocation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 border-t border-slate-100 dark:border-blue-900/30">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">إجمالي الجلسات بالباقة</label>
              <input
                id="input-std-total-sessions"
                type="number"
                min="1"
                value={formData.totalSessions}
                onChange={(e) => setFormData({ ...formData, totalSessions: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الجلسات المنجزة</label>
              <input
                id="input-std-completed-sessions"
                type="number"
                min="0"
                value={formData.completedSessions}
                onChange={(e) => setFormData({ ...formData, completedSessions: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">الجلسات المتبقية (تلقائي)</label>
              <div className="w-full bg-slate-100 dark:bg-[#0b1326] border border-slate-200 dark:border-blue-900/40 rounded-xl px-3 py-2 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-between">
                <span>{Math.max(0, (Number(formData.totalSessions) || 12) - (Number(formData.completedSessions) || 0))}</span>
                <span className="text-[10px] text-slate-400 font-normal">جلسة باقية</span>
              </div>
            </div>
          </div>

          {/* SECTION 5: Clinical Notes */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ملاحظات وتشخيص الخطة الفردية (IEP)</label>
            <textarea
              id="input-std-notes"
              rows={2}
              placeholder="نقاط القوة، محفزات الطفل، المعززات السلوكية، تفاصيل اختبار اللغات أو تقرير السمعيات..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl p-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-[#0b1326] transition"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#152244] hover:bg-slate-200 dark:hover:bg-[#1e2f5c] text-slate-600 dark:text-slate-300 font-bold transition cursor-pointer"
            >
              إلغاء
            </button>

            <button
              id="save-student-submit-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-md shadow-blue-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>{studentToEdit ? 'حفظ التعديلات' : 'إضافة الطالب وتفعيل الحساب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
