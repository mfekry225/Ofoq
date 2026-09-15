import React from 'react';
import { TeacherProfile } from '../types';
import { Award, BookOpen, Send, Calendar, CheckCircle2, MessageCircle, Mail, Phone, Sparkles, ChevronRight, UserPlus, LogIn, Star } from 'lucide-react';

interface TeacherProfileViewProps {
  profile: TeacherProfile;
  onNavigateToEnroll: () => void;
  onNavigateToLogin: () => void;
}

export const TeacherProfileView: React.FC<TeacherProfileViewProps> = ({
  profile,
  onNavigateToEnroll,
  onNavigateToLogin,
}) => {
  const whatsappUrl = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent('السلام عليكم ورحمة الله، أود الاستفسار عن تفاصيل الدروس وحجز جلسة تجريبية.')}`;

  return (
    <div id="teacher-profile-view" className="min-h-screen bg-[#f0f7fc] text-slate-800 pb-20">
      {/* Top Bar for Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-sky-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-600 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-sky-500/20">
            {profile.name.slice(0, 2)}
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900">{profile.name}</h1>
            <p className="text-xs text-sky-700 font-semibold">الملف المهني والخبرات</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="profile-nav-login-btn"
            onClick={onNavigateToLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-xs font-bold text-sky-800 border border-sky-200 transition"
          >
            <LogIn className="w-3.5 h-3.5 text-sky-600" />
            <span>تسجيل الدخول</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative px-4 pt-8 pb-12 overflow-hidden bg-gradient-to-b from-sky-100/60 via-sky-50/40 to-[#f0f7fc] border-b border-sky-100/80">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-72 h-72 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>خبرة مستمرة تفوق {profile.experienceYears} سنوات</span>
            </span>
            {profile.location && (
              <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white border border-sky-200 text-slate-700 text-xs font-bold shadow-2xs">
                <span>📍 {profile.location}</span>
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-2">
            {profile.name}
          </h1>

          <p className="text-sm sm:text-base text-sky-900 font-bold mb-3">
            {profile.title}
          </p>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto mb-6 font-medium">
            {profile.bio}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="hero-enroll-cta-btn"
              onClick={onNavigateToEnroll}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white font-bold text-sm shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-orange-200" />
              <span>طلب حجز جلسة تقييم / انضمام</span>
            </button>

            {profile.portfolioUrl && (
              <a
                id="hero-portfolio-btn"
                href={profile.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-white hover:bg-sky-50/50 text-slate-800 border border-sky-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition"
              >
                <span>السيرة الذاتية والموقع الشخصي</span>
                <span className="text-[11px] text-sky-600 font-mono">mfekry.vercel.app ↗</span>
              </a>
            )}

            <a
              id="hero-whatsapp-cta-btn"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>محادثة واتساب مباشرة</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-4 space-y-8 relative z-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {profile.stats.map((stat, i) => (
            <div key={i} className="bg-white border border-sky-100 rounded-2xl p-4 text-center shadow-xs">
              <div className="text-xl sm:text-2xl font-black text-sky-700">{stat.value}</div>
              <div className="text-[11px] sm:text-xs text-slate-600 mt-1 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Subjects & Expertise */}
        <div className="bg-white border border-sky-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">المجالات والمسارات التأهيلية المتخصصة</h2>
              <p className="text-xs text-slate-500 font-medium">برامج تدريبية وتأهيلية فردية مبنية على أسس علمية</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile.subjects.map((sub, idx) => (
              <span
                key={idx}
                className="px-3.5 py-2 rounded-xl bg-sky-50/60 border border-sky-100 text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                {sub}
              </span>
            ))}
          </div>

          {/* Certifications & Badges */}
          {profile.certifications && profile.certifications.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-orange-800 block mb-2.5">
                🎖️ الخبرات والاعتمادات الميدانية في مملكة البحرين:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profile.certifications.map((cert, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3 rounded-xl bg-orange-50/50 border border-orange-200/70 text-xs font-medium text-slate-700 flex items-center gap-2.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Why Choose Us / Features */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              <span>لماذا تختار منظومة متابعتنا؟</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-white border border-sky-100 rounded-2xl p-5 flex flex-col justify-between hover:border-sky-300 transition shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    {feat.title}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info Footer Card */}
        <div className="bg-gradient-to-br from-sky-800 via-sky-700 to-sky-900 text-white rounded-3xl p-6 shadow-xl shadow-sky-900/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white mb-1">هل لديك استفسار أو ترغب في جدولة مخصصة؟</h3>
              <p className="text-xs text-sky-100 font-medium">تواصل معي شخصياً وسأجيبك بأسرع وقت</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${profile.email}`}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 flex items-center gap-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5 text-orange-300" />
                <span>إيميل</span>
              </a>
              <a
                href={`tel:${profile.phone}`}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/20 flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5 text-orange-300" />
                <span>اتصال هاتف</span>
              </a>
              <button
                id="footer-enroll-btn"
                onClick={onNavigateToEnroll}
                className="px-4 py-2.5 rounded-xl bg-orange-400 hover:bg-orange-300 text-slate-950 text-xs font-bold shadow-md transition flex items-center gap-1"
              >
                <span>اشترك الآن</span>
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
