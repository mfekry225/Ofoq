import React, { useState } from 'react';
import { 
  ASSESSMENT_SCALES, 
  AssessmentScale, 
  CompletedAssessmentRecord 
} from '../assessmentScales';
import { 
  MessageSquare, ShieldAlert, BrainCircuit, Activity, 
  CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, 
  ArrowLeft, Share2, RefreshCw, Printer, Sparkles, 
  ChevronDown, ChevronUp, User, Calendar, MessageCircle, 
  Info, Award, Check
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface AssessmentScreeningViewProps {
  initialChildName?: string;
  initialParentName?: string;
  teacherPhone?: string;
  teacherName?: string;
  onBack?: () => void;
  onSaveAssessment?: (record: CompletedAssessmentRecord) => void;
  embeddedMode?: boolean; // if rendered inside dashboard or parent portal
}

export const AssessmentScreeningView: React.FC<AssessmentScreeningViewProps> = ({
  initialChildName = '',
  initialParentName = '',
  teacherPhone = '201000000000',
  teacherName = 'الأخصائي',
  onBack,
  onSaveAssessment,
  embeddedMode = false
}) => {
  // Navigation & Scale State
  const [selectedScaleKey, setSelectedScaleKey] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 to 9 (10 questions)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [previewAllItemsScale, setPreviewAllItemsScale] = useState<string | null>(null);

  // Child & Evaluator Information
  const [childName, setChildName] = useState(initialChildName);
  const [childAge, setChildAge] = useState('');
  const [evaluatorName, setEvaluatorName] = useState(initialParentName);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const selectedScale: AssessmentScale | null = selectedScaleKey 
    ? ASSESSMENT_SCALES[selectedScaleKey] 
    : null;

  // Icons Helper
  const renderScaleIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'BrainCircuit': return <BrainCircuit className={className} />;
      case 'Activity': return <Activity className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  // Start Assessment
  const handleStartScale = (key: string) => {
    setSelectedScaleKey(key);
    setCurrentStep(0);
    setAnswers({});
    setIsCompleted(false);
  };

  // Answer a Question
  const handleSelectAnswer = (questionId: number, score: number) => {
    const updatedAnswers = { ...answers, [questionId]: score };
    setAnswers(updatedAnswers);

    // If not the last question, auto advance smoothly after short delay
    if (currentStep < 9) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 150);
    } else {
      // Completed all 10
      setIsCompleted(true);
      if (selectedScale) {
        const total = (Object.values(updatedAnswers) as number[]).reduce((sum: number, v: number) => sum + Number(v || 0), 0);
        let level: 'low' | 'moderate' | 'high' = 'low';
        let label = selectedScale.interpretations.low.label;
        if (total >= selectedScale.interpretations.high.min) {
          level = 'high';
          label = selectedScale.interpretations.high.label;
        } else if (total >= selectedScale.interpretations.moderate.min) {
          level = 'moderate';
          label = selectedScale.interpretations.moderate.label;
        }

        const record: CompletedAssessmentRecord = {
          id: `assess-${Date.now()}`,
          scaleId: selectedScale.id,
          scaleTitle: selectedScale.title,
          childName: childName.trim() || 'الطفل',
          childAge: childAge.trim() || undefined,
          evaluatorName: evaluatorName.trim() || undefined,
          scores: updatedAnswers,
          totalScore: total,
          riskLevel: level,
          riskLabel: label,
          date: new Date().toISOString().split('T')[0]
        };

        if (onSaveAssessment) {
          onSaveAssessment(record);
        }
      }
    }
  };

  // Calculate Result Metrics
  const calculateTotalScore = (): number => {
    return (Object.values(answers) as number[]).reduce((sum: number, v: number) => sum + Number(v || 0), 0);
  };

  const getResultInterpretation = () => {
    if (!selectedScale) return null;
    const score: number = calculateTotalScore();
    const { low, moderate, high } = selectedScale.interpretations;

    if (score <= low.max) {
      return { level: 'low' as const, data: low, percentage: Math.round((score / 20) * 100) };
    }
    if (score <= moderate.max) {
      return { level: 'moderate' as const, data: moderate, percentage: Math.round((score / 20) * 100) };
    }
    return { level: 'high' as const, data: high, percentage: Math.round((score / 20) * 100) };
  };

  // Generate WhatsApp text report
  const generateWhatsAppMessage = () => {
    if (!selectedScale) return '';
    const score = calculateTotalScore();
    const result = getResultInterpretation();
    if (!result) return '';

    const lines = [
      `*تقرير الفحص السريع عبر منصة أُفُق* 📋`,
      `━━━━━━━━━━━━━━━━━━`,
      `*المقياس:* ${selectedScale.title}`,
      `*اسم الطفل:* ${childName || 'غير محدد'} ${childAge ? `(${childAge})` : ''}`,
      `*المُقيّم:* ${evaluatorName || 'ولي الأمر'}`,
      `*التاريخ:* ${new Date().toLocaleDateString('ar-EG')}`,
      `━━━━━━━━━━━━━━━━━━`,
      `*النتيجة الإجمالية:* ${score} من 20 (${result.percentage}%)`,
      `*التقييم الإرشادي:* ${result.data.label}`,
      `*الملخص:* ${result.data.summary}`,
      `━━━━━━━━━━━━━━━━━━`,
      `*أبرز النقاط المرصودة:*`
    ];

    // Add high risk items
    selectedScale.questions.forEach((q) => {
      const val = answers[q.id];
      if (val === 2) {
        lines.push(`• [ملحوظ جداً]: ${q.text}`);
      } else if (val === 1) {
        lines.push(`• [بدرجة متوسطة]: ${q.text}`);
      }
    });

    lines.push(`━━━━━━━━━━━━━━━━━━`);
    lines.push(`أود استشارتكم أستاذنا في هذه النتيجة وتحديد موعد لتقييم شامل. شكراً لكم.`);

    return encodeURIComponent(lines.join('\n'));
  };

  const handleCopyReport = () => {
    if (!selectedScale) return;
    const score = calculateTotalScore();
    const result = getResultInterpretation();
    if (!result) return;

    const reportText = `تقرير الفحص السريع (${selectedScale.title})
اسم الطفل: ${childName || 'الطفل'} | العمر: ${childAge || '-'}
النتيجة: ${score} من 20 (${result.percentage}%)
المستوى: ${result.data.label}
الملخص: ${result.data.summary}`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // VIEW 1: Scale Selection & Overview
  // ==========================================
  if (!selectedScale) {
    return (
      <div className={`min-h-screen w-full max-w-full overflow-x-hidden ${embeddedMode ? 'p-0' : 'bg-[#f0f7fc] dark:bg-[#060a12] p-3 sm:p-6'} text-slate-800 dark:text-slate-100 transition-colors duration-200`}>
        {/* Top Header */}
        {!embeddedMode && (
          <header className="max-w-4xl mx-auto flex items-center justify-between gap-2 mb-6 pt-2">
            {onBack && (
              <button
                id="assess-back-btn"
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-blue-50 dark:hover:bg-[#152244] text-xs font-bold text-slate-700 dark:text-slate-200 border border-sky-100 dark:border-blue-900/40 shadow-xs transition cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>رجوع</span>
              </button>
            )}

            <div className="text-right min-w-0 flex-1">
              <div className="flex items-center justify-end gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                  أدوات الفحص والمسح المبكر
                </span>
              </div>
            </div>

            <ThemeToggle size="sm" />
          </header>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-sky-100 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>4 مقاييس سريعة • 10 بنود مقننة لكل مقياس</span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
                مقاييس الكشف والتقييم السريع للطفل
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
                أداة مسحية علمية لمساعدة ولي الأمر والأخصائي على رصد مؤشرات النمو اللغوي، طيف التوحد، صعوبات التعلم النمائية، وطلاقة الكلام، مع حساب فوري للدرجات وتوجيهات عملية.
              </p>
            </div>
          </div>

          {/* Child Information Card (Optional) */}
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-4 sm:p-5 border border-sky-100 dark:border-blue-900/40 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>بيانات التقييم (اختياري لتخصيص التقرير والواتساب):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">اسم الطفل:</label>
                <input
                  type="text"
                  placeholder="مثال: يوسف أحمد"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">عمر الطفل:</label>
                <input
                  type="text"
                  placeholder="مثال: 4 سنوات و6 أشهر"
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">اسم المُقيّم (ولي الأمر):</label>
                <input
                  type="text"
                  placeholder="مثال: أم يوسف / أ. محمد"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/50 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Scale Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ASSESSMENT_SCALES).map(([key, scale]) => (
              <div
                key={key}
                className="bg-white dark:bg-[#0f172a] rounded-3xl p-5 sm:p-6 border border-sky-100 dark:border-blue-900/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`p-3 rounded-2xl bg-gradient-to-tr ${scale.colorScheme.gradient} text-white shadow-md shadow-blue-600/20 shrink-0`}>
                      {renderScaleIcon(scale.iconName, "w-6 h-6")}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${scale.colorScheme.badgeBg} ${scale.colorScheme.badgeText} ${scale.colorScheme.border}`}>
                        {scale.category}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {scale.targetAge}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                      {scale.title}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                      {scale.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30 p-2 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-semibold">{scale.questions.length} أسئلة • وقت الإجابة ~ دقيقتان</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-blue-900/30 flex items-center gap-2">
                  <button
                    id={`start-scale-${key}`}
                    onClick={() => handleStartScale(key)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${scale.colorScheme.gradient} hover:opacity-95 shadow-sm shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer`}
                  >
                    <span>بدء التقييم الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <button
                    id={`preview-scale-${key}`}
                    onClick={() => setPreviewAllItemsScale(previewAllItemsScale === key ? null : key)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#152244] hover:bg-slate-200 dark:hover:bg-[#1e2f5c] text-slate-600 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="استعراض بنود المقياس بالكامل"
                  >
                    {previewAllItemsScale === key ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">البنود</span>
                  </button>
                </div>

                {/* Preview drawer if expanded */}
                {previewAllItemsScale === key && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-blue-900/50 space-y-2 text-xs bg-slate-50 dark:bg-[#080d1a] p-3 rounded-2xl">
                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                      <span>بنود المقياس الـ 10 المقننة:</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">جاهزة للتطبيق</span>
                    </div>
                    <ol className="space-y-1.5 list-decimal list-inside text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                      {scale.questions.map((q) => (
                        <li key={q.id} className="pb-1 border-b border-slate-200/50 dark:border-blue-900/20 last:border-0">
                          <span className="font-medium">{q.text}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: Completed Assessment Result Screen
  // ==========================================
  if (isCompleted) {
    const totalScore = calculateTotalScore();
    const result = getResultInterpretation();

    return (
      <div className={`min-h-screen w-full max-w-full overflow-x-hidden ${embeddedMode ? 'p-0' : 'bg-[#f0f7fc] dark:bg-[#060a12] p-3 sm:p-6'} text-slate-800 dark:text-slate-100 transition-colors duration-200`}>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Top Actions Bar */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              id="result-back-scales-btn"
              onClick={() => setSelectedScaleKey(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-blue-50 dark:hover:bg-[#152244] text-xs font-bold text-slate-700 dark:text-slate-200 border border-sky-100 dark:border-blue-900/40 shadow-xs transition cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>قائمة المقاييس</span>
            </button>

            <div className="flex items-center gap-2">
              <ThemeToggle size="sm" />
              <button
                id="result-print-btn"
                onClick={handlePrint}
                className="p-2 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-blue-50 dark:hover:bg-[#152244] text-slate-600 dark:text-slate-300 border border-sky-100 dark:border-blue-900/40 shadow-xs transition cursor-pointer"
                title="طباعة التقرير"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Result Card */}
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 border border-sky-100 dark:border-blue-900/40 shadow-xl shadow-blue-950/5 dark:shadow-blue-950/30 space-y-6 transition-colors">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-1 border border-blue-100 dark:border-blue-900/40 shadow-xs">
                {renderScaleIcon(selectedScale.iconName, "w-7 h-7")}
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 inline-block">
                نتيجة الفحص الاسترشادي
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {selectedScale.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {childName ? `الطفل: ${childName}` : ''} {childAge ? `• العمر: ${childAge}` : ''} {evaluatorName ? `• المُقيّم: ${evaluatorName}` : ''}
              </p>
            </div>

            {/* Score & Risk Level Meter */}
            {result && (
              <div className="bg-slate-50 dark:bg-[#080d1a] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-blue-900/40 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
                      الدرجة الكلية المرصودة
                    </span>
                    <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">{totalScore}</span>
                      <span className="text-sm font-bold text-slate-400">/ 20</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center sm:items-end gap-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      مستوى المؤشرات
                    </span>
                    <div className={`px-3.5 py-1.5 rounded-xl font-black text-xs sm:text-sm border flex items-center gap-1.5 ${
                      result.level === 'low'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                        : result.level === 'moderate'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
                    }`}>
                      {result.level === 'low' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {result.level === 'moderate' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {result.level === 'high' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                      <span>{result.data.label}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-700 ${
                        result.level === 'low'
                          ? 'bg-emerald-500'
                          : result.level === 'moderate'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, result.percentage))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                    <span>0 (مطمئن تماماً)</span>
                    <span>10 (متوسط)</span>
                    <span>20 (مرتفع جداً)</span>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-blue-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {result.data.summary}
                </div>
              </div>
            )}

            {/* Recommendations & Advice */}
            {result && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>أهم التوصيات والخطوات الإرشادية للأسرة:</span>
                </div>
                <div className="space-y-2">
                  {result.data.advice.map((adv, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-medium">{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Item Breakdown Drawer */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>تفاصيل الإجابات على بنود المقياس الـ 10:</span>
              </div>
              <div className="space-y-2">
                {selectedScale.questions.map((q) => {
                  const val = answers[q.id] ?? 0;
                  return (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#080d1a] border border-slate-200 dark:border-blue-900/40 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-slate-400 font-bold ml-1">{q.id}.</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{q.text}</span>
                      </div>
                      <div className="shrink-0">
                        {val === 2 && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-200 dark:border-rose-800/50">
                            نعم / غالباً (2)
                          </span>
                        )}
                        {val === 1 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800/50">
                            أحياناً (1)
                          </span>
                        )}
                        {val === 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800/50">
                            لا / نادراً (0)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: WhatsApp & Retest */}
            <div className="pt-4 border-t border-slate-100 dark:border-blue-900/30 flex flex-col sm:flex-row items-center gap-3">
              <a
                id="share-whatsapp-assessment-btn"
                href={`https://wa.me/${teacherPhone}?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال التقرير عبر واتساب للأخصائي ({teacherName})</span>
              </a>

              <button
                id="copy-assessment-btn"
                onClick={handleCopyReport}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-100 dark:bg-[#152244] hover:bg-slate-200 dark:hover:bg-[#1e2f5c] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copiedNotification ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600">تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>نسخ التقرير</span>
                  </>
                )}
              </button>

              <button
                id="retest-scale-btn"
                onClick={() => {
                  setAnswers({});
                  setCurrentStep(0);
                  setIsCompleted(false);
                }}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة الفحص</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: Step-by-Step Question Interface (1 to 10)
  // ==========================================
  const currentQuestion = selectedScale.questions[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / 10) * 100);
  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden ${embeddedMode ? 'p-0' : 'bg-[#f0f7fc] dark:bg-[#060a12] p-3 sm:p-6'} text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col justify-between`}>
      {/* Top Bar */}
      <div className="max-w-2xl w-full mx-auto space-y-4 pt-2">
        <div className="flex items-center justify-between gap-2">
          <button
            id="cancel-scale-btn"
            onClick={() => setSelectedScaleKey(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#0f172a] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-blue-900/40 transition cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>إلغاء والعودة</span>
          </button>

          <div className="text-center min-w-0">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block truncate">
              {selectedScale.title}
            </span>
          </div>

          <ThemeToggle size="sm" />
        </div>

        {/* Progress Bar & Counter */}
        <div className="space-y-1.5 bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-sky-100 dark:border-blue-900/40 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-blue-600 dark:text-blue-400">
              البند {currentStep + 1} من 10
            </span>
            <span className="text-slate-400">
              {progressPercent}% مكتمل
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${selectedScale.colorScheme.gradient} transition-all duration-300 rounded-full`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="max-w-2xl w-full mx-auto my-auto py-6">
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl p-6 sm:p-8 border border-sky-100 dark:border-blue-900/40 shadow-xl shadow-blue-950/5 dark:shadow-blue-950/30 space-y-6 transition-colors">
          {/* Question Badge & Text */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-black text-sm flex items-center justify-center border border-blue-200 dark:border-blue-800/40">
                {currentQuestion.id}
              </span>
              <span className="text-xs font-bold text-slate-400">
                السؤال رقم {currentStep + 1}
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.text}
            </h2>

            {currentQuestion.subHint && (
              <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100/70 dark:border-blue-900/30 leading-relaxed font-medium">
                💡 <span className="font-bold">توضيح للمُقيّم:</span> {currentQuestion.subHint}
              </p>
            )}
          </div>

          {/* Answer Buttons (3 Clear Likert Options) */}
          <div className="space-y-2.5 pt-2">
            {/* Option 0: No / Rarely */}
            <button
              id={`answer-0-btn`}
              onClick={() => handleSelectAnswer(currentQuestion.id, 0)}
              className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                currentAnswer === 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 dark:bg-[#080d1a] border-slate-200 dark:border-blue-900/40 hover:bg-slate-100 dark:hover:bg-[#152244] text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentAnswer === 0
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {currentAnswer === 0 && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm block">لا / نادراً / لا ينطبق</span>
                  <span className="text-[10px] text-slate-400 font-medium">الطفل لا يُظهر هذه الصعوبة أو تظهر بشكل نادر جداً</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 px-2 py-1 rounded-lg bg-white dark:bg-[#0f172a] border dark:border-blue-900/40 shrink-0">
                0 نقطة
              </span>
            </button>

            {/* Option 1: Moderate / Sometimes */}
            <button
              id={`answer-1-btn`}
              onClick={() => handleSelectAnswer(currentQuestion.id, 1)}
              className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                currentAnswer === 1
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 dark:border-amber-500 text-amber-900 dark:text-amber-100 ring-2 ring-amber-500/20'
                  : 'bg-slate-50 dark:bg-[#080d1a] border-slate-200 dark:border-blue-900/40 hover:bg-slate-100 dark:hover:bg-[#152244] text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentAnswer === 1
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {currentAnswer === 1 && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm block">أحياناً / بدرجة متوسطة</span>
                  <span className="text-[10px] text-slate-400 font-medium">تحدث في بعض الأوقات والمواقف دون استمرار دائم</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 px-2 py-1 rounded-lg bg-white dark:bg-[#0f172a] border dark:border-blue-900/40 shrink-0">
                1 نقطة
              </span>
            </button>

            {/* Option 2: Yes / Frequent */}
            <button
              id={`answer-2-btn`}
              onClick={() => handleSelectAnswer(currentQuestion.id, 2)}
              className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 cursor-pointer ${
                currentAnswer === 2
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 dark:border-rose-500 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/20'
                  : 'bg-slate-50 dark:bg-[#080d1a] border-slate-200 dark:border-blue-900/40 hover:bg-slate-100 dark:hover:bg-[#152244] text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentAnswer === 2
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {currentAnswer === 2 && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm block">نعم / غالباً وبشكل ملحوظ</span>
                  <span className="text-[10px] text-slate-400 font-medium">سمة واضحة ومستمرة وتعيق تواصل أو تعلم الطفل</span>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 px-2 py-1 rounded-lg bg-white dark:bg-[#0f172a] border dark:border-blue-900/40 shrink-0">
                2 نقطة
              </span>
            </button>
          </div>

          {/* Navigation Controls (Prev / Next) */}
          <div className="pt-4 border-t border-slate-100 dark:border-blue-900/30 flex items-center justify-between gap-2">
            <button
              id="prev-question-btn"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                currentStep === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : 'bg-slate-100 dark:bg-[#152244] hover:bg-slate-200 dark:hover:bg-[#1e2f5c] text-slate-700 dark:text-slate-200 cursor-pointer'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              <span>السابق</span>
            </button>

            {/* Questions Dots */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {selectedScale.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-6 bg-blue-600 dark:bg-blue-400'
                      : answers[q.id] !== undefined
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                  title={`السؤال ${idx + 1}`}
                />
              ))}
            </div>

            {currentStep < 9 ? (
              <button
                id="next-question-btn"
                disabled={currentAnswer === undefined}
                onClick={() => setCurrentStep((prev) => Math.min(9, prev + 1))}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  currentAnswer === undefined
                    ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                    : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-sm'
                }`}
              >
                <span>التالي</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="finish-scale-btn"
                disabled={currentAnswer === undefined}
                onClick={() => setIsCompleted(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  currentAnswer === undefined
                    ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer shadow-md shadow-emerald-600/20'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>عرض النتيجة</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
