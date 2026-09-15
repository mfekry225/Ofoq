import { TeacherProfile, Student, SessionRecord, TimelineMilestone, EnrollmentLead, AbsenceExcuseRequest, TeacherCredentials } from './types';

export const DEFAULT_TEACHER_CREDENTIALS: TeacherCredentials = {
  email: 'mfekry225@gmail.com',
  password: '123'
};

export const INITIAL_TEACHER_PROFILE: TeacherProfile = {
  name: 'أ. محمد فكري',
  title: 'أخصائي تربية خاصة وتأهيل معرفي وسلوكي | مهندس برمجيات وتكنولوجيا تعليمية',
  tagline: 'خبرة ممتدة ومستمرة في مملكة البحرين في التربية الخاصة، الخطط الفردية (IEP)، وتأهيل ذوي الاحتياجات الخاصة وصعوبات التعلم مع دمج التقنيات الحديثة',
  bio: 'أخصائي تربية خاصة بخبرة مستمرة في مملكة البحرين، متخصص في تصميم وتطبيق البرامج التربوية الفردية (IEP)، تأهيل حالات طيف التوحد، معالجة صعوبات التعلم الأكاديمية والنمائية، وتعديل السلوك وتنمية مهارات الانتباه والتواصل. يجمع بين الخبرة الميدانية الإكلينيكية والحلول التقنية والبرمجية التفاعلية لتمكين الطالب ودعم الأسرة بأسلوب علمي ومتابعة دقيقة.',
  experienceYears: 10,
  location: 'مملكة البحرين 🇧🇭',
  portfolioUrl: 'https://mfekry.vercel.app/',
  phone: '+97333000000',
  email: 'mfekry225@gmail.com',
  whatsapp: '97333000000',
  subjects: [
    'التربية الخاصة والخطط الفردية (IEP)',
    'تأهيل طيف التوحد وتنمية التواصل',
    'علاج صعوبات التعلم الأكاديمية والنمائية',
    'تعديل السلوك وتنمية الانتباه والتركيز',
    'البرمجة والتفكير المنطقي المعرفي',
    'الإرشاد الأسري ومتابعة أولياء الأمور'
  ],
  certifications: [
    'بكالوريوس وترخيص ممارسة التربية الخاصة',
    'خبرة مستمرة في المراكز والمدارس التأهيلية بمملكة البحرين',
    'تطبيق مقاييس الذكاء وتشخيص صعوبات التعلم والتوحد',
    'Software Engineer & Web Technologies Developer'
  ],
  features: [
    {
      title: 'خطة تربوية فردية (IEP) دقيقة',
      description: 'أهداف تدريبية مقاسة خطوة بخطوة تناسب قدرات واحتياجات كل بطل بشكل منفرد.',
      icon: 'Target'
    },
    {
      title: 'تقرير فوري لولي الأمر بعد كل جلسة',
      description: 'بيان بالأنشطة التي تدرب عليها الطالب، معدل استجابته وتركيزه، وإرشادات واضحة للمنزل عبر الواتساب.',
      icon: 'Send'
    },
    {
      title: 'خط زمني لتطور المهارات والسلوك',
      description: 'متابعة بصرية تراكمية لإنجاز الأهداف وتخطي المحطات التأهيلية بنجاح.',
      icon: 'TrendingUp'
    },
    {
      title: 'بوابة مشفرة ومعزولة لكل أسرة',
      description: 'اسم مستخدم وكلمة سر مخصصة لكل ولي أمر تضمن الخصوصية التامة لتقارير وتطورات طفله.',
      icon: 'ShieldCheck'
    }
  ],
  stats: [
    { label: 'سنة خبرة مستمرة بالبحرين', value: '+10' },
    { label: 'خطة فردية (IEP) منجزة بنجاح', value: '+450' },
    { label: 'جلسة تأهيلية وتدريبية منفذة', value: '+4,200' },
    { label: 'نسبة رضا واطمئنان الأسر', value: '99.5%' }
  ]
};

// Clean slate: completely empty initial lists so the teacher builds real student profiles from scratch
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_SESSIONS: SessionRecord[] = [];
export const INITIAL_TIMELINES: TimelineMilestone[] = [];
export const INITIAL_LEADS: EnrollmentLead[] = [];
export const INITIAL_EXCUSES: AbsenceExcuseRequest[] = [];

