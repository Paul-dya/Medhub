export const SITE = {
  name: 'MedHub',
  domain: 'medhub.work',
  tagline: '面向医学生的基础医学知识库',
  description:
    'MedHub 收录基础医学、诊断学与影像学课程知识网页，按学科分类、支持站内搜索，供医学生与医学爱好者学习复习。',
};

export type Category = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  subtopics: string[];
};

/**
 * 站点收录范围（按约定固定为三大板块）：
 * 基础医学 / 诊断学 / 影像学；不收录内、外、妇、儿、皮肤、耳鼻喉等临床各科。
 * 如需调整板块，修改此数组并同步 public/content/ 目录名。
 */
export const CATEGORIES: Category[] = [
  {
    slug: 'basic-medicine',
    name: '基础医学',
    icon: '🧬',
    description: '解剖学、生理学、生物化学、病理学、微生物与免疫、药理学等核心基础学科课程。',
    subtopics: ['解剖学', '生理学', '生物化学', '病理学', '微生物与免疫', '药理学', '医学遗传'],
  },
  {
    slug: 'diagnosis',
    name: '诊断学',
    icon: '🩺',
    description: '病史采集、体格检查、诊断思维与基本临床技能，衔接基础与临床的桥梁课程。',
    subtopics: ['问诊', '全身检查', '心血管查体', '胸腹查体', '心电图基础', '诊断思维'],
  },
  {
    slug: 'imaging',
    name: '影像学',
    icon: '🩻',
    description: 'X 线、CT、MRI、超声的系统读片方法与典型征象识别。',
    subtopics: ['X 线', 'CT', 'MRI', '超声', '读片方法'],
  },
];

export const SCOPE_NOTE =
  '本站仅收录基础医学、诊断学与影像学课程内容，不收录内、外、妇、儿、皮肤、耳鼻喉等临床各科内容。';

export const MEDICAL_DISCLAIMER =
  '本站内容仅供医学教育与学习参考，不构成任何诊断或治疗建议；临床决策请以执业医师面诊意见为准。';
