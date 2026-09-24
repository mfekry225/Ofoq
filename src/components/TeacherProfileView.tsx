import React from 'react';
import { TeacherProfile } from '../types';
import { 
  Award, BookOpen, MessageCircle, Mail, Phone, Sparkles, ChevronRight, 
  UserPlus, LogIn, CheckCircle2, MapPin, Activity, Target, HeartPulse, 
  Users, Smile, Clock, FileText, AlertCircle, ShieldCheck, Heart, Stethoscope
} from 'lucide-react';
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
  const whatsappUrl = `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent('السلام عليكم ورحمة الله، أود الاستفسار عن تفاصيل جلسات التخاطب وتأهيل النطق وحجز موعد تقييم لطفلي.')}`;

  return (
    <div id="teacher-profile-view" className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f0f7fc] dark:bg-[#060a12] text-slate-800 dark:text-slate-100 pb-20 transition-colors duration-200">
      {/* Top Bar for Navigation */}
      <header className="sticky top-0 z-30 w-full max-w-full bg-white/95 dark:bg-[#0b1326]/95 backdrop-blur-md border-b border-sky-100 dark:border-blue-900/40 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm sm:text-lg shadow-sm shadow-blue-600/20 shrink-0">
              {profile.name.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-none">{profile.name}</h1>
              <p className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 font-semibold truncate">الملف المهني لأخصائي النطق والتخاطب</p>
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

      {/* Hero Section */}
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
                  <span>خبرة إكلينيكية وميدانية تفوق {profile.experienceYears} سنوات</span>
                </span>
                {profile.location && (
                  <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-blue-900/50 text-slate-700 dark:text-slate-300 text-xs font-bold shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{profile.location}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>ممارس مرخص ومعتمد</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                {profile.name}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-blue-700 dark:text-blue-400 font-bold">
                {profile.title}
              </p>

              {/* Core Bio Exactly As Requested */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-[#0b1326]/80 border border-sky-100 dark:border-blue-900/50 shadow-xs">
                <p className="text-xs sm:text-sm lg:text-base text-slate-700 dark:text-slate-200 leading-relaxed font-semibold max-w-2xl mx-auto lg:mx-0">
                  {profile.bio}
                </p>
              </div>

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
                  <span>محادثة واتساب مباشرة للاستفسار</span>
                </a>
              </div>
            </div>

            {/* Quick Hero Highlights Card (5 cols on Desktop) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-7 border border-sky-100 dark:border-blue-900/40 shadow-xl shadow-blue-900/5 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>أبرز مؤشرات الأداء والخبرة الميدانية</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {profile.stats.map((stat, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-[#080d1a] border border-slate-200/80 dark:border-blue-900/40 rounded-2xl p-4 text-center shadow-xs">
                    <div className="text-xl sm:text-2xl font-black text-blue-700 dark:text-blue-400">{stat.value}</div>
                    <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-1 font-bold">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-blue-50/60 dark:bg-[#0b1326] rounded-2xl border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-2">
                <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>رعاية شاملة قائمة على الشراكة مع ولي الأمر:</span>
                </span>
                <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>تقييم تشخيصي وتحديد دقيق لنقاط القوة والاحتياج</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>تقرير إنجاز فوري يصلك بعد كل جلسة عبر المنصة والواتساب</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>تدريب مستمر للأسرة على استراتيجيات التحفيز المنزلي</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Responsive Desktop Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        
        {/* SECTION 1: ما أقوم به كأخصائي مع طفلك (أقوم بـ...) */}
        <section id="specialist-duties-section" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 dark:border-blue-900/40 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-bold mb-2">
                <Stethoscope className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>المهام الإكلينيكية والعلاجية للطفل</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>كأخصائي نطق وتخاطب؛ أقوم بـ:</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md">
              خطوات علاجية مدروسة ومبنية على أحدث المعايير العلمية والمقاييس المقننة لتحقيق أسرع تقدم لغوي للطفل
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.specialistDuties && profile.specialistDuties.length > 0 ? (
              profile.specialistDuties.map((duty, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-700 transition shadow-xs flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold group-hover:scale-105 transition">
                        {idx === 0 && <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        {idx === 1 && <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                        {idx === 2 && <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
                        {idx === 3 && <Sparkles className="w-5 h-5 text-amber-500" />}
                        {idx === 4 && <HeartPulse className="w-5 h-5 text-rose-500" />}
                        {idx === 5 && <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                        {idx >= 6 && <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        الهدف {idx + 1}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                      {duty.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {duty.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-blue-900/30 flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>تطبيق عملي فردي مباشر</span>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </section>

        {/* SECTION 2: كيف أساعد وأساند أسرتك (وأساعد الأسرة على...) */}
        <section id="family-support-section" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 dark:border-emerald-900/40 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
                <Heart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>الشراكة الأسرية والإرشاد المنزلي</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>وأساعد الأسرة وولي الأمر على:</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md">
              لأن الأسرة هي الركيزة الأساسية للنجاح؛ نرافقكم خطوة بخطوة ونمكنكم من قيادة التطور اللغوي لطفلكم بالمنزل
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.familySupport && profile.familySupport.length > 0 ? (
              profile.familySupport.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-[#0f172a] border border-emerald-100/90 dark:border-emerald-900/40 rounded-2xl p-5 hover:border-emerald-300 dark:hover:border-emerald-700 transition shadow-xs flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold group-hover:scale-105 transition">
                        {idx === 0 && <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                        {idx === 1 && <Smile className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                        {idx === 2 && <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
                        {idx === 3 && <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        {idx === 4 && <AlertCircle className="w-5 h-5 text-amber-500" />}
                        {idx >= 5 && <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                        مساندة {idx + 1}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-emerald-900/30 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>متابعة وتوجيه مستمر للأسرة</span>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </section>

        {/* SECTION 3: المسارات والبرامج التأهيلية + التواصل المباشر */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column (8 cols): Specializations & Certifications */}
          <div className="lg:col-span-8 space-y-8">
            {/* Subjects & Expertise */}
            <div className="bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/40">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">المسارات والبرامج التأهيلية المتخصصة</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">برامج فردية دقيقة مصممة لتلبية احتياجات الطفل اللغوية</p>
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
                <span>مميزات منظومة المتابعة الرقمية عبر منصة أُفق</span>
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
                <span className="text-[11px] font-bold text-sky-200 block uppercase tracking-wider">تواصل مباشر وسريع</span>
                <h3 className="font-black text-lg text-white mt-1">هل لديك استفسار أو ترغب في استشارة لحالة طفلك؟</h3>
                <p className="text-xs text-sky-100/90 font-medium mt-1 leading-relaxed">
                  تواصل مع الأخصائي مباشرة لمناقشة حالة طفلك والاطمئنان وتحديد موعد الجلسة الاستكشافية.
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

            {/* Reassurance Note for Parents */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0f172a] border border-sky-100 dark:border-blue-900/40 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs sm:text-sm">
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <span>رسالة طمأنينة لكل أب وأم</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                تأخر النطق واللغة ليس نهاية المطاف؛ فالتدخل المبكر والتأهيل القائم على خطة علمية واضحة والشراكة الأسرية الصادقة يُحدث فارقاً ملموساً وسريعاً في طلاقة طفلك وثقته بنفسه.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
