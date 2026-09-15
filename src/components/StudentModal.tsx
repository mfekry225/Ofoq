import React, { useState } from 'react';
import { Student } from '../types';
import { X, UserPlus, Key, Phone, BookOpen, CheckCircle2, ShieldCheck, Sparkles, RefreshCw, User, Lock } from 'lucide-react';

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
    grade: studentToEdit?.grade || 'المرحلة الابتدائية',
    subject: studentToEdit?.subject || 'تأهيل وتنمية مهارات وصعوبات التعلم',
    parentName: studentToEdit?.parentName || '',
    parentPhone: studentToEdit?.parentPhone || '',
    parentUsername: studentToEdit?.parentUsername || `parent_${initialRandomId}`,
    parentPassword: studentToEdit?.parentPassword || '123456',
    parentAccessCode: studentToEdit?.parentAccessCode || `STD-${initialRandomId}`,
    currentLevel: studentToEdit?.currentLevel || 'المستوى الأول (تأسيسي)',
    levelScore: studentToEdit?.levelScore || 75,
    totalSessions: studentToEdit?.totalSessions || 12,
    completedSessions: studentToEdit?.completedSessions || 0,
    remainingSessions: studentToEdit?.remainingSessions || 12,
    status: studentToEdit?.status || 'active',
    joinedAt: studentToEdit?.joinedAt || new Date().toISOString().split('T')[0],
    nextSessionDate: studentToEdit?.nextSessionDate || '',
    nextSessionTime: studentToEdit?.nextSessionTime || '04:30 م',
    notes: studentToEdit?.notes || '',
  });

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
      name: formData.name!,
      grade: formData.grade || 'مرحلة دراسية',
      subject: formData.subject || 'المسار التأهيلي',
      parentName: formData.parentName!,
      parentPhone: formData.parentPhone!,
      parentUsername: (formData.parentUsername || `parent_${Date.now().toString().slice(-4)}`).trim(),
      parentPassword: (formData.parentPassword || '123456').trim(),
      parentAccessCode: (formData.parentAccessCode || `OFQ-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase(),
      currentLevel: formData.currentLevel || 'المستوى التأسيسي',
      levelScore: Number(formData.levelScore) || 80,
      totalSessions: total,
      completedSessions: completed,
      remainingSessions: remaining,
      status: (formData.status as any) || 'active',
      joinedAt: formData.joinedAt || new Date().toISOString().split('T')[0],
      nextSessionDate: formData.nextSessionDate,
      nextSessionTime: formData.nextSessionTime,
      notes: formData.notes,
    };

    onSaveStudent(savedStudent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-sky-100 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-sky-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold border border-sky-200">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {studentToEdit ? 'تعديل ملف الطالب وحساب ولي الأمر' : 'تسجيل طالب جديد وإنشاء حساب لولي الأمر'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">إنشاء اسم مستخدم وكلمة مرور مخصصة لدخول ولي الأمر</p>
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
          {/* Student Name & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                اسم الطالب / المستفيد <span className="text-orange-600">*</span>
              </label>
              <input
                id="input-std-name"
                type="text"
                required
                placeholder="اسم الطالب ثلاثي"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">الصف / المرحلة الدراسية</label>
              <input
                id="input-std-grade"
                type="text"
                placeholder="مثال: روضة / ابتدائي / دمج"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Subject & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المسار التدريبي / التأهيلي</label>
              <input
                id="input-std-subject"
                type="text"
                placeholder="مثال: تأهيل نطق وتخاطب / تعديل سلوك"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المستوى الحالي</label>
              <input
                id="input-std-level"
                type="text"
                placeholder="مثال: المستوى 1 - تأسيسي استجابي"
                value={formData.currentLevel}
                onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Parent Info & Dedicated Credentials */}
          <div className="p-4 bg-sky-50/40 border border-sky-200/80 rounded-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>بيانات وحساب ولي الأمر المنفصل</span>
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
                  placeholder="مثال: أ. حمد الخليفة"
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
              يقوم ولي الأمر بتسجيل الدخول من الشاشة الرئيسية باستخدام اسم المستخدم وكلمة المرور أعلاه لمتابعة ابنه حصراً وبشكل آمن.
            </p>
          </div>

          {/* Sessions Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">إجمالي الجلسات المشترك بها</label>
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

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات وتشخيص الخطة الفردية</label>
            <textarea
              id="input-std-notes"
              rows={2}
              placeholder="نقاط القوة، محفزات الطفل، المعززات السلوكية، أو أي تفاصيل خاصة..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition"
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

