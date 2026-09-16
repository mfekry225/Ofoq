import React, { useState } from 'react';
import { Student } from '../types';
import { 
  X, UserPlus, Phone, BookOpen, CheckCircle2, ShieldCheck, 
  Sparkles, RefreshCw, User, Lock, Calendar, MapPin, Activity, 
  PenTool, RotateCcw, AlertCircle, Baby, HeartPulse, GraduationCap
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
        <label htmlFor={id} className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
          {icon}
          <span>{label}</span>
          {required && <span className="text-orange-600">*</span>}
        </label>

        {isManualMode && (
          <button
            type="button"
            onClick={handleManualToggle}
            className="text-[10px] text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 transition"
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
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-sky-500 focus:bg-white transition cursor-pointer"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__CUSTOM__" className="font-bold text-sky-700 bg-sky-50">
            ✍️ كتابة يدوية / أخرى غير متوفرة بالقائمة...
          </option>
        </select>
      </div>

      {isManualMode && (
        <div className="relative animate-in fade-in slide-in-from-top-1 duration-150 pt-0.5">
          <input
            type="text"
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={customPlaceholder}
            className="w-full bg-sky-50/50 border border-sky-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
            autoFocus
          />
          <PenTool className="w-3.5 h-3.5 text-sky-500 absolute left-3 top-2.5 pointer-events-none" />
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
  const initialRandomId = Math.floor(100 + Math.random() * 900);
  const [formData, setFormData] = useState<Partial<Student>>({
    name: studentToEdit?.name || '',
    birthDate: studentToEdit?.birthDate || '',
    address: studentToEdit?.address || '',
    diagnosis: studentToEdit?.diagnosis || DIAGNOSIS_OPTIONS[0],
    grade: studentToEdit?.grade || GRADE_STAGES[0],
    subject: studentToEdit?.subject || REHAB_PATHWAYS[0],
    parentName: studentToEdit?.parentName || '',
    parentPhone: studentToEdit?.parentPhone || '',
    parentUsername: studentToEdit?.parentUsername || `parent_${initialRandomId}`,
    parentPassword: studentToEdit?.parentPassword || '123456',
    parentAccessCode: studentToEdit?.parentAccessCode || `STD-${initialRandomId}`,
    currentLevel: studentToEdit?.currentLevel || FUNCTIONAL_LEVELS[0],
    levelScore: studentToEdit?.levelScore || 80,
    totalSessions: studentToEdit?.totalSessions || 12,
    completedSessions: studentToEdit?.completedSessions || 0,
    remainingSessions: studentToEdit?.remainingSessions || 12,
    status: studentToEdit?.status || 'active',
    joinedAt: studentToEdit?.joinedAt || new Date().toISOString().split('T')[0],
    nextSessionDate: studentToEdit?.nextSessionDate || '',
    nextSessionTime: studentToEdit?.nextSessionTime || '04:30 م',
    notes: studentToEdit?.notes || '',
  });

  const calculatedAge = calculateAgeArabic(formData.birthDate);

  const generateCredentials = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const cleanName = formData.name ? formData.name.trim().split(' ')[0] : 'user';
    setFormData((prev) => ({
      ...prev,
      parentUsername: `${cleanName}_${randomNum}`.toLowerCase(),
      parentPassword: Math.floor(100000 + Math.random() * 900000).toString(),
      parentAccessCode: `OFQ-${randomNum}`,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.parentName || !formData.parentPhone) return;

    const completed = formData.completedSessions || 0;
    const total = formData.totalSessions || 12;
    const remaining = Math.max(0, total - completed);

    const savedStudent: Student = {
      id: studentToEdit?.id || `std-${Date.now()}`,
      name: formData.name.trim(),
      birthDate: formData.birthDate || undefined,
      address: formData.address?.trim() || undefined,
      diagnosis: formData.diagnosis?.trim() || undefined,
      grade: (formData.grade || GRADE_STAGES[0]).trim(),
      subject: (formData.subject || REHAB_PATHWAYS[0]).trim(),
      parentName: formData.parentName.trim(),
      parentPhone: formData.parentPhone.trim(),
      parentUsername: (formData.parentUsername || `parent_${Date.now().toString().slice(-4)}`).trim(),
      parentPassword: (formData.parentPassword || '123456').trim(),
      parentAccessCode: (formData.parentAccessCode || `OFQ-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase(),
      currentLevel: (formData.currentLevel || FUNCTIONAL_LEVELS[0]).trim(),
      levelScore: Number(formData.levelScore) || 80,
      totalSessions: total,
      completedSessions: completed,
      remainingSessions: remaining,
      status: (formData.status as any) || 'active',
      joinedAt: formData.joinedAt || new Date().toISOString().split('T')[0],
      nextSessionDate: formData.nextSessionDate,
      nextSessionTime: formData.nextSessionTime,
      notes: formData.notes?.trim() || undefined,
    };

    onSaveStudent(savedStudent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-sky-100 rounded-3xl w-full max-w-xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-gradient-to-r from-sky-50 via-white to-sky-50/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-sm shadow-sky-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {studentToEdit ? 'تعديل ملف الطالب والخطة التأهيلية' : 'تسجيل بطل جديد وإنشاء حساب لولي الأمر'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">بيانات التخاطب والتنمية اللغوية وتخصيص دخول ولي الأمر</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          
          {/* SECTION 1: Student Primary Info */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span>البيانات الشخصية للطالب</span>
            </h4>

            {/* Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اسم الطالب / المستفيد <span className="text-orange-600">*</span>
              </label>
              <input
                id="input-std-name"
                type="text"
                required
                placeholder="مثال: يوسف أحمد الخليفة"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition text-xs sm:text-sm"
              />
            </div>

            {/* Birth Date & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>تاريخ الميلاد</span>
                </label>
                <input
                  id="input-std-birthdate"
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
                {calculatedAge && (
                  <div className="mt-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                    <Baby className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>العمر المحسوب: {calculatedAge}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>العنوان / المنطقة السكنية</span>
                </label>
                <input
                  id="input-std-address"
                  type="text"
                  placeholder="مثال: المنامة - الرفاع، مجمع 921"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Clinical & Rehabilitation Classification */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
              <span>التشخيص والمرحلة والمسار التأهيلي (أخصائي التخاطب وذوي الهمم)</span>
            </h4>

            {/* Diagnosis Dropdown */}
            <SelectWithCustomInput
              id="input-std-diagnosis"
              label="التشخيص الطبي / التأهيلي"
              value={formData.diagnosis || ''}
              onChange={(val) => setFormData({ ...formData, diagnosis: val })}
              options={DIAGNOSIS_OPTIONS}
              placeholder="-- حدد التشخيص أو اكتب يدوياً --"
              customPlaceholder="اكتب تشخيصاً مخصصاً (مثال: لدغة رائية، تأخر نطقي مصاحب لضعف سمعي...)"
              icon={<HeartPulse className="w-3.5 h-3.5 text-rose-600" />}
            />

            {/* Grade / Stage Dropdown (starts from early intervention 2 years) */}
            <SelectWithCustomInput
              id="input-std-grade"
              label="الصف / المرحلة الدراسية والتنموية"
              value={formData.grade || ''}
              onChange={(val) => setFormData({ ...formData, grade: val })}
              options={GRADE_STAGES}
              placeholder="-- حدد المرحلة أو التدخل المبكر --"
              customPlaceholder="اكتب المرحلة يدوياً (مثال: تدخل مبكر سنتان ونصف، دمج جزئي...)"
              icon={<GraduationCap className="w-3.5 h-3.5 text-indigo-600" />}
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
              icon={<Activity className="w-3.5 h-3.5 text-sky-600" />}
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

          {/* SECTION 3: Dedicated Parent Account Credentials */}
          <div className="pt-2 border-t border-slate-100">
            <div className="p-4 bg-sky-50/40 border border-sky-200/80 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>بيانات وحساب ولي الأمر لدخول المنصة</span>
                </span>

                <button
                  type="button"
                  onClick={generateCredentials}
                  className="px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-[11px] font-bold flex items-center gap-1 transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>توليد تلقائي</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    اسم ولي الأمر <span className="text-orange-600">*</span>
                  </label>
                  <input
                    id="input-std-parent-name"
                    type="text"
                    required
                    placeholder="مثال: أ. أحمد الخليفة (والد الطفل)"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    هاتف ولي الأمر (واتساب) <span className="text-orange-600">*</span>
                  </label>
                  <input
                    id="input-std-parent-phone"
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="+973 XXXXXXXX"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-right placeholder-slate-400 focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>

              {/* Credentials Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>اسم المستخدم لولي الأمر <span className="text-orange-600">*</span></span>
                  </label>
                  <input
                    id="input-std-parent-username"
                    type="text"
                    required
                    dir="ltr"
                    value={formData.parentUsername}
                    onChange={(e) => setFormData({ ...formData, parentUsername: e.target.value })}
                    className="w-full bg-white border border-sky-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-sky-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-orange-600" />
                    <span>كلمة مرور ولي الأمر <span className="text-orange-600">*</span></span>
                  </label>
                  <input
                    id="input-std-parent-password"
                    type="text"
                    required
                    dir="ltr"
                    value={formData.parentPassword}
                    onChange={(e) => setFormData({ ...formData, parentPassword: e.target.value })}
                    className="w-full bg-white border border-sky-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                يقوم ولي الأمر بتسجيل الدخول من الشاشة الرئيسية باستخدام اسم المستخدم وكلمة المرور هذه لمتابعة تطورات ابنه حصراً وبخصوصية تامة.
              </p>
            </div>
          </div>

          {/* SECTION 4: Sessions Allocation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">إجمالي الجلسات بالباقة</label>
              <input
                id="input-std-total-sessions"
                type="number"
                min="1"
                value={formData.totalSessions}
                onChange={(e) => setFormData({ ...formData, totalSessions: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الجلسات المنجزة</label>
              <input
                id="input-std-completed-sessions"
                type="number"
                min="0"
                value={formData.completedSessions}
                onChange={(e) => setFormData({ ...formData, completedSessions: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* SECTION 5: Clinical Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات وتشخيص الخطة الفردية (IEP)</label>
            <textarea
              id="input-std-notes"
              rows={2}
              placeholder="نقاط القوة، محفزات الطفل، المعززات السلوكية، تفاصيل اختبار اللغات أو تقرير السمعيات..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
            >
              إلغاء
            </button>

            <button
              id="save-student-submit-btn"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold shadow-md shadow-sky-500/20 transition flex items-center gap-2"
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
