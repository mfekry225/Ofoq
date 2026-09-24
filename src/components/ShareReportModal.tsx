import React, { useState } from 'react';
import { SessionRecord, Student } from '../types';
import { X, MessageCircle, Copy, Check, Star, Share2 } from 'lucide-react';
import { generateParentWhatsAppMessage, getWhatsAppUrl } from '../utils';

interface ShareReportModalProps {
  session: SessionRecord;
  student: Student;
  teacherName: string;
  onClose: () => void;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  session,
  student,
  teacherName,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const reportMessage = generateParentWhatsAppMessage(session, student, teacherName);
  const whatsappUrl = getWhatsAppUrl(student.parentPhone, reportMessage);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl w-full max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 dark:border-blue-900/40 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/40 dark:from-[#0b1326] dark:via-[#0f172a] dark:to-[#152244] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-600/20 shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">تقرير الجلسة لولي الأمر</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">مستفيد: {student.name} • ولي الأمر: {student.parentName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#152244] hover:bg-slate-200 dark:hover:bg-[#1e2f5c] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              id="send-whatsapp-direct-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 transition cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال عبر الواتساب فوراً ({student.parentPhone})</span>
            </a>

            <button
              id="copy-report-text-btn"
              type="button"
              onClick={handleCopy}
              className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-[#152244] hover:bg-slate-200 dark:hover:bg-[#1e2f5c] border border-slate-200 dark:border-blue-900/40 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ نص التقرير بالكامل'}</span>
            </button>
          </div>

          {/* Visual Report Preview Card */}
          <div className="bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 rounded-2xl p-4 sm:p-5 space-y-4 text-xs text-slate-800 dark:text-slate-200 shadow-xs">
            {/* Session Headline */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-blue-900/30 pb-3">
              <div>
                <span className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider block">
                  تقرير الجلسة #{session.sessionNumber}
                </span>
                <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{session.topic}</span>
              </div>
              <div className="text-left">
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block">{session.date}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-500">{session.durationMinutes} دقيقة</span>
              </div>
            </div>

            {/* Activities trained */}
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                <span>الأنشطة والمهام المنفذة خلال الجلسة:</span>
              </span>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 pr-3">
                {session.activities.map((act, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span>{act.title} ({act.durationMinutes} دقيقة)</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ratings summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-[#0f172a] p-3.5 rounded-xl border border-slate-200 dark:border-blue-900/40 shadow-xs">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold mb-0.5">الاستيعاب والاستجابة للأوامر</span>
                <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1 text-xs sm:text-sm">
                  {'⭐'.repeat(session.understandingScore)} ({session.understandingScore}/5)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold mb-0.5">التفاعل والتركيز والانتباه</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-xs sm:text-sm">
                  {'✨'.repeat(session.studentEngagementScore)} ({session.studentEngagementScore}/5)
                </span>
              </div>
            </div>

            {/* Strengths & Next Plan in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <span className="text-[11px] font-bold text-slate-900 dark:text-white block mb-0.5">💪 نقاط القوة والتميز:</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{session.studentStrengths}</p>
              </div>

              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-0.5">🎯 خطة الجلسة القادمة:</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{session.nextPlan}</p>
              </div>
            </div>

            {session.homeworkAssigned && (
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200/80 dark:border-amber-900/40">
                <span className="text-[11px] font-bold text-amber-950 dark:text-amber-300 block mb-1">📝 التوجيهات والتوصيات المنزلية لولي الأمر:</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {session.homeworkAssigned}
                </p>
              </div>
            )}

            {session.teacherNoteToParent && (
              <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 p-3.5 rounded-xl text-blue-950 dark:text-blue-200">
                <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block mb-1">💌 رسالة الأخصائي الخاصة لولي الأمر:</span>
                <p className="italic text-slate-800 dark:text-slate-300">"{session.teacherNoteToParent}"</p>
              </div>
            )}

            {/* Access credentials reminder */}
            <div className="pt-2.5 border-t border-slate-200 dark:border-blue-900/30 text-center text-[11px] text-slate-500 dark:text-slate-400">
              بيانات الدخول للبوابة: <span className="font-mono text-blue-700 dark:text-blue-300 font-bold">{student.parentUsername || student.parentPhone}</span> (كلمة المرور: <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">{student.parentPassword || '123456'}</span>)
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-blue-900/40 flex justify-end bg-slate-50 dark:bg-[#0b1326]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-[#152244] hover:bg-slate-300 dark:hover:bg-[#1e2f5c] text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
