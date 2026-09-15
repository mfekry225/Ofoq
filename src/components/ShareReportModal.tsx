import React, { useState } from 'react';
import { SessionRecord, Student } from '../types';
import { X, MessageCircle, Copy, Check, Star, Calendar, Clock, Sparkles, Send, Share2, BookOpen, User, ArrowRight } from 'lucide-react';
import { generateParentWhatsAppMessage, getWhatsAppUrl, formatDateArabic } from '../utils';

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

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `تقرير جلسة الطالب ${student.name}`,
          text: reportMessage,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-sky-100 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-sky-50/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold border border-sky-200">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">تقرير الجلسة لولي الأمر</h3>
              <p className="text-[11px] text-slate-500 font-medium">مستفيد: {student.name} • ولي الأمر: {student.parentName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Quick Action Buttons on Mobile */}
          <div className="grid grid-cols-2 gap-2">
            <a
              id="send-whatsapp-direct-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-900/10 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>إرسال عبر الواتساب فوراً</span>
            </a>

            <button
              id="copy-report-text-btn"
              type="button"
              onClick={handleCopy}
              className="py-3 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'تم النسخ بنجاح!' : 'نسخ نص التقرير'}</span>
            </button>
          </div>

          {/* Visual Report Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3.5 text-xs text-slate-800 shadow-xs">
            {/* Session Headline */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] text-sky-700 font-bold uppercase tracking-wider block">
                  تقرير الجلسة #{session.sessionNumber}
                </span>
                <span className="font-bold text-sm text-slate-900">{session.topic}</span>
              </div>
              <div className="text-left">
                <span className="text-[11px] text-slate-600 font-medium block">{session.date}</span>
                <span className="text-[10px] text-slate-500">{session.durationMinutes} دقيقة</span>
              </div>
            </div>

            {/* Activities trained */}
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>الأنشطة والمهام المنفذة خلال الجلسة:</span>
              </span>
              <ul className="space-y-1.5 text-slate-700 pr-3">
                {session.activities.map((act, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    <span>{act.title} ({act.durationMinutes} دقيقة)</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ratings summary */}
            <div className="grid grid-cols-2 gap-2.5 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold mb-0.5">الاستيعاب والاستجابة للأوامر</span>
                <span className="font-bold text-sky-700 flex items-center gap-1 text-xs">
                  {'⭐'.repeat(session.understandingScore)} ({session.understandingScore}/5)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold mb-0.5">التفاعل والتركيز والانتباه</span>
                <span className="font-bold text-orange-600 flex items-center gap-1 text-xs">
                  {'✨'.repeat(session.studentEngagementScore)} ({session.studentEngagementScore}/5)
                </span>
              </div>
            </div>

            {/* Strengths & Next Plan */}
            <div className="space-y-2.5">
              <div>
                <span className="text-[11px] font-bold text-slate-900 block mb-0.5">💪 نقاط القوة والتميز المعززة:</span>
                <p className="text-slate-600 leading-relaxed">{session.studentStrengths}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-900 block mb-0.5">🎯 خطة الجلسة القادمة والتركيز:</span>
                <p className="text-slate-600 leading-relaxed">{session.nextPlan}</p>
              </div>

              {session.homeworkAssigned && (
                <div>
                  <span className="text-[11px] font-bold text-orange-950 block mb-0.5">📝 التوجيهات والتوصيات المنزلية لولي الأمر:</span>
                  <p className="text-slate-800 bg-orange-50/70 p-2.5 rounded-xl border border-orange-200">
                    {session.homeworkAssigned}
                  </p>
                </div>
              )}

              {session.teacherNoteToParent && (
                <div className="bg-sky-50/60 border border-sky-200 p-3 rounded-xl text-sky-950">
                  <span className="text-[10px] font-bold text-sky-800 block mb-1">💌 رسالة الأخصائي الخاصة لولي الأمر:</span>
                  <p className="italic text-slate-800">"{session.teacherNoteToParent}"</p>
                </div>
              )}
            </div>

            {/* Access Code reminder */}
            <div className="pt-2.5 border-t border-slate-200 text-center text-[11px] text-slate-500">
              رمز الدخول لبوابة المربي لمتابعة ملف الطفل كاملاً: <strong className="text-sky-700 font-mono tracking-wider">{student.parentAccessCode}</strong>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
