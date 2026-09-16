// Preset options specialized for Speech Therapy, Language Development & People of Determination

export const GRADE_STAGES = [
  'التدخل المبكر (سنتان)',
  'التدخل المبكر (3 سنوات)',
  'التدخل المبكر (4 سنوات)',
  'حضانة / ما قبل الروضة (Nursery)',
  'الروضة الأولى (KG 1)',
  'الروضة الثانية (KG 2)',
  'مرحلة تمهيدي (Pre-School)',
  'الصف الأول الابتدائي',
  'الصف الثاني الابتدائي',
  'الصف الثالث الابتدائي',
  'الصف الرابع الابتدائي',
  'الصف الخامس الابتدائي',
  'الصف السادس الابتدائي',
  'المرحلة الإعدادية / المتوسطة',
  'المرحلة الثانوية',
  'فصول الدمج الشامل (Inclusive Classes)',
  'فصول التربية الخاصة / الرعاية النهارية',
  'برامج التأهيل المهني والشباب (ذوي الهمم)',
  'جلسات منزلية / عيادة خارجية'
] as const;

export const REHAB_PATHWAYS = [
  'تأهيل التخاطب وتأخر نمو اللغة (التدخل المبكر)',
  'اضطرابات النطق ومخارج الأصوات (اللدغات / الحذف / الإبدال / التشويه)',
  'التلعثم واللجلجة واضطراب الطلاقة اللغوية (Stuttering & Fluency)',
  'تأهيل اضطراب طيف التوحد (ASD) والتواصل اللفظي وغير اللفظي',
  'تأهيل أطفال متلازمة داون وتنمية الحصيلة اللغوية والتواصلية',
  'تأهيل الإعاقة السمعية وزارعي القوقعة (التأهيل السمعي الشفهي AVT)',
  'تأهيل الشلل الدماغي واضطرابات النطق العصبية (Dysarthria / Apraxia)',
  'تنمية المهارات اللغوية والإدراكية المعرفية والتواصل البصري',
  'تعديل السلوك وتنمية الانتباه والتركيز وخفض السلوكيات النمطية',
  'علاج صعوبات التعلم الأكاديمية والنمائية (ديسلكسيا، ديسكالكوليا، عسر كتابة)',
  'اضطراب فرط الحركة وتشتت الانتباه (ADHD) والتحكم بالاندفاعية',
  'التواصل البديل والمعزز (AAC / نظام تبادل الصور PECS)',
  'التأسيس القرائي والكتابي والصوتي (نور البيان / الفونكس)',
  'تأهيل الإعاقات المتعددة والمزدوجة',
  'تأهيل الحبسة الكلامية (Aphasia) واضطرابات البلع والتغذية'
] as const;

export const FUNCTIONAL_LEVELS = [
  'مرحلة التهيئة والاستكشاف والتواصل البصري والامتثال للأوامر',
  'مستوى ما قبل اللغة (الانتباه المشترك، الإشارة، التقليد الحركي والصوتي)',
  'مرحلة الكلمات الأولى والتسمية (مفردات البيئة المحيطة، أعضاء الجسم، الطعام)',
  'مرحلة الجملة البسيطة (ربط كلمتين: فعل + اسم / صفة + موصوف)',
  'مرحلة الجملة الموسعة (3 - 4 كلمات مع حروف الجر وأسماء الإشارة والضمائر)',
  'مرحلة الحوار التبادلي والسرد القصصي والإجابة عن الأسئلة (من، أين، لماذا)',
  'مرحلة تصحيح الفونيمات ومخارج الأصوات وتعميمها في الكلمات والجمل',
  'مرحلة الطلاقة اللغوية والتحكم في سرعة الإيقاع وخفض التشنجات',
  'مستوى الوعي الفونولوجي والتمييز السمعي والتهيئة للتعلم الأكاديمي',
  'مستوى صعوبات التعلم التأسيسي (التمييز البصري، فك الشفرة، الفهم القرائي)',
  'مستوى متقدم واستقلالية تواصلية تامة واندماج مدرسي ومجتمعي'
] as const;

export const DIAGNOSIS_OPTIONS = [
  'تأخر نمو لغوي نوعي (Developmental Language Delay - SLI)',
  'اضطراب طيف التوحد (Autism Spectrum Disorder - ASD)',
  'متلازمة داون (Down Syndrome)',
  'لدغات واضطرابات نطق الفونيمات (Speech Sound Disorder)',
  'تلعثم / لجلجة (Stuttering / Fluency Disorder)',
  'ضعف سمعي / زراعة قوقعة إلكترونية (Hearing Impairment / Cochlear Implant)',
  'شلل دماغي وإعاقة حركية ونطقية (Cerebral Palsy)',
  'صعوبات تعلم أكاديمية أو نمائية (Learning Disabilities)',
  'اضطراب فرط الحركة وتشتت الانتباه (ADHD)',
  'تأخر نمائي شامل (Global Developmental Delay)',
  'إعاقة ذهنية / متلازمات جينية نادرة',
  'خناشة / خنف / شق سقف الحلق (Cleft Palate)',
  'اضطراب التواصل الاجتماعي العملي (SCD)',
  'طبيعي / يحتاج تقوية وتنمية مهارات لغوية وتعبيرية'
] as const;

/**
 * Calculates child's age in Arabic from birthDate string (YYYY-MM-DD)
 */
export function calculateAgeArabic(birthDateStr?: string): string | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;

  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  const days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) return null;

  if (years === 0) {
    if (months === 0) return 'أقل من شهر';
    if (months === 1) return 'شهر واحد';
    if (months === 2) return 'شهران';
    if (months >= 3 && months <= 10) return `${months} أشهر`;
    return `${months} شهراً`;
  }

  const yearsStr = 
    years === 1 ? 'سنة واحدة' :
    years === 2 ? 'سنتان' :
    years >= 3 && years <= 10 ? `${years} سنوات` :
    `${years} سنة`;

  if (months === 0) return yearsStr;
  
  const monthsStr = 
    months === 1 ? 'وشهر' :
    months === 2 ? 'وشهران' :
    months >= 3 && months <= 10 ? `و ${months} أشهر` :
    `و ${months} شهراً`;

  return `${yearsStr} ${monthsStr}`;
}
