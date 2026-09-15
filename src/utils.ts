import { SessionRecord, Student } from './types';

/**
 * Formats a WhatsApp message summarizing a session for the parent
 */
export function generateParentWhatsAppMessage(session: SessionRecord, student: Student, teacherName: string): string {
  const stars = '⭐'.repeat(session.understandingScore);
  const engagementStars = '✨'.repeat(session.studentEngagementScore);
  
  const activitiesList = session.activities
    .map((act, idx) => `  ${idx + 1}. ${act.title} (${act.durationMinutes} دقيقة)`)
    .join('\n');

  return `*🌟 تقرير الجلسة التدريبية - ${student.name} 🌟*
السلام عليكم ورحمة الله وبركاته يا ${student.parentName} الكريمة/الكريم.
يسعدنا مشاركتكم تقرير ملخص لحصة اليوم مع ${teacherName}:

📅 *تاريخ الحصة:* ${session.date} - ${session.time}
🏷️ *موضوع الحصة:* ${session.topic}
⏱️ *المدة:* ${session.durationMinutes} دقيقة

━━━━━━━━━━━━━━━━━━━━
🎯 *الأنشطة التي تدرب عليها البطل اليوم:*
${activitiesList || '  - تطبيقات عملية وشروحات تفاعلية'}

📊 *مستوى الاستيعاب والتطبيق:* ${stars} (${session.understandingScore}/5)
🔥 *التفاعل والحماس:* ${engagementStars} (${session.studentEngagementScore}/5)

💪 *نقاط التميز والقوة:*
${session.studentStrengths || 'أداء رائع وتركيز مستمر طوال الحصة.'}

🌱 *ما سنركز على تطويره لاحقاً:*
${session.nextPlan || 'مواصلة التدرج في التطبيقات الأكثر تقدماً.'}

📝 *الواجب / النشاط المنزلي المطلوب:*
${session.homeworkAssigned || 'مراجعة ما تم تطبيقه في الحصة.'}

💌 *ملاحظة خاصة من المعلم:*
"${session.teacherNoteToParent || 'بارك الله في مجهوده ونتطلع للحصة القادمة بكل شغف.'}"
━━━━━━━━━━━━━━━━━━━━
🔗 *لمتابعة الخط الزمني وتفاصيل الحصص كاملة:*
ادخل على بوابة المربي برمز الدخول الخاص بكم: *${student.parentAccessCode}*`;
}

/**
 * Encodes text for a direct WhatsApp URL
 */
export function getWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function formatDateArabic(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
