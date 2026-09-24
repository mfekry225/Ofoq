import React from 'react';
import { TeacherProfile } from '../types';
import { Award, BookOpen, MessageCircle, Mail, Phone, Sparkles, ChevronRight, UserPlus, LogIn, CheckCircle2, MapPin, Globe } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

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
    <div id="teacher-profile-view" className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f0f7fc] dark:bg-[#060a12] text-slate-800 dark:text-slate-100 pb-20 transition-colors duration-200">
      {/* Top Bar for Navigation */}
      <header className="sticky top-0 z-30 w-full max-w-full bg-white/95 dark:bg-[#0b1326]/95 backdrop-blur-md border-b border-sky-100 dark:border-blue-900/40 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm sm:text-lg shadow-sm shadow-blue-600/20 shrink-0">
              {profile.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-none">{profile.name}</h1>
              <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 font-semibold truncate">الملف المهني والخبرات التأهيلية</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle size="sm" />

            <button
              id="profile-nav-login-btn"
              onClick={onNavigateToLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs font-bold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>تسجيل الدخول</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Responsive Desktop Container */}
      <div className="relative px-4 sm:px-6 lg:px-8 pt-8 pb-14 overflow-hidden bg-gradient-to-b from-blue-500/10 via-sky-500/5 to-transparent border-b border-sky-100 dark:border-blue-900/40">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-10 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Main Hero Copy & CTAs (7 cols) */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-right">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/50 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>خبرة متخصصة تفوق {profile.experienceYears} سنوات</span>
                </span>
                {profile.location && (
                  <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-blue-900/50 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{profile.location}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {profile.name}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-blue-700 dark:text-blue-400 font-bold">
                {profile.title}
              </p>

              <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                {profile.bio}
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  id="hero-enroll-cta-btn"
                  onClick={onNavigateToEnroll}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 text-blue-200" />
                  <span>طلب حجز جلسة تقييم / انضمام</span>
                </button>

                <a
                  id="hero-whatsapp-cta-btn"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800/50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>محادثة واتساب مباشرة</span>
                </a>

                {profile.portfolioUrl && (
                  <a
                    id="hero-portfolio-btn"
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#152244] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-blue-900/50 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>موقعي الشخصي</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Hero Highlights Card (5 cols on Desktop) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-7 border border-sky-100 dark:border-blue-900/40 shadow-xl shadow-blue-900/5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>أبرز مؤشرات الأداء والمنظومة</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {profile.stats.map((stat, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-[#080d1a] border border-slate-200/80 dark:border-blue-900/40 rounded-2xl p-4 text-center shadow-xs">
                    <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400">{stat.value}</div>
                    <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-blue-50/50 dark:bg-[#0b1326] rounded-2xl border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-2">
                <span className="font-bold text-blue-900 dark:text-blue-300 block">
                  🛡️ مميزات المتابعة عبر بوابة أُفق:
                </span>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>تقارير إلكترونية فورية لكل جلسة ترسل لولي الأمر</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>متابعة خطة التطور اللغوي والأنشطة المنزلية أولاً بأول</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>مقاييس وفحوصات سريعة ترصد مؤشرات النمو بدقة</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Responsive Desktop Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column (8 cols): Specializations, Certifications, Features */}
          <div className="lg:col-span-8 space-y-8">
            {/* Subjects & Expertise */}
            <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">المجالات والمسارات التأهيلية المتخصصة</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">برامج تدريبية وتأهيلية فردية مبنية على أسس علمية ومقاييس مقننة</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {profile.subjects.map((sub, idx) => (
                  <div
                    key={idx}
                    className="px-3.5 py-3 rounded-2xl bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100/70 dark:border-blue-900/40 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{sub}</span>
                  </div>
                ))}
              </div>

              {/* Certifications & Badges */}
              {profile.certifications && profile.certifications.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-blue-900/30">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-300 block mb-2.5">
                    🎖️ الخبرات والاعتمادات الميدانية:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {profile.certifications.map((cert, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Why Choose Us / Features */}
            <div className="space-y-4">
              <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>لماذا تختار منظومة متابعتنا؟</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-700 transition shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white mb-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                        {feat.title}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{feat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column (4 cols): Direct Contact & Booking CTA */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-blue-900/20 space-y-5">
              <div>
                <span className="text-[11px] font-bold text-sky-200 block uppercase tracking-wider">تواصل مباشر</span>
                <h3 className="font-black text-lg text-white mt-1">هل لديك استفسار أو ترغب في جدولة مخصصة؟</h3>
                <p className="text-xs text-sky-100/90 font-medium mt-1 leading-relaxed">
                  تواصل مع الأخصائي مباشرة لمناقشة حالة طفلك وتحديد الموعد الأنسب.
                </p>
              </div>

              <div className="space-y-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>محادثة واتساب سريعة</span>
                </a>

                <a
                  href={`tel:${profile.phone}`}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-sky-200" />
                  <span>اتصال هاتفي ({profile.phone})</span>
                </a>

                <a
                  href={`mailto:${profile.email}`}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-sky-200" />
                  <span>مراسلة عبر البريد الإلكتروني</span>
                </a>
              </div>

              <div className="pt-2 border-t border-white/15">
                <button
                  id="sidebar-enroll-btn"
                  onClick={onNavigateToEnroll}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-sky-50 text-blue-900 text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>طلب تقييم / انضمام الآن</span>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
