export const SITE = {
  name: 'MedHub',
  domain: 'medhub.work',
  tagline: '医学知识库',
  description:
    'MedHub 医学知识库：收录基础医学（解剖学、生理学、生物化学、病理学、微生物与免疫、药理学）与临床医学（诊断学、医学影像学）课程知识网页，按学科分类、支持站内搜索，供医学生与医学爱好者学习复习。',
};

/** 作者小红书主页（全站右下角角标跳转） */
export const XHS_URL = 'https://xhslink.cn/o/5gVWoQUjyoC';

export type Category = {
  slug: string;
  name: string;
  icon: string;
  description: string;
  subtopics: string[];
};

/**
 * 站点两大栏目（固定）：
 * 基础医学（二级：解剖学/生理学/生物化学/病理学/微生物与免疫/药理学）
 * 临床医学（二级：诊断学/医学影像学）
 * 如需调整栏目，修改此数组并同步 public/content/ 目录名。
 */
export const CATEGORIES: Category[] = [
  {
    slug: 'basic-medicine',
    name: '基础医学',
    icon: '🧬',
    description: '解剖学、生理学、生物化学、病理学、微生物与免疫、药理学——医学的核心基础学科课程。',
    subtopics: ['解剖学', '生理学', '生物化学', '病理学', '微生物与免疫', '药理学'],
  },
  {
    slug: 'clinical-medicine',
    name: '临床医学',
    icon: '🩻',
    description: '诊断学与医学影像学——衔接基础与临床的桥接课程：体格检查、心电图、影像读片。',
    subtopics: ['诊断学', '医学影像学'],
  },
];

/** 二级目录（子文件夹名 → 中文显示名） */
export const SUBCATEGORY_NAMES: Record<string, string> = {
  anatomy: '解剖学',
  physiology: '生理学',
  biochemistry: '生物化学',
  pathology: '病理学',
  'micro-immuno': '微生物与免疫',
  pharmacology: '药理学',
  diagnosis: '诊断学',
  imaging: '医学影像学',
};

export const MEDICAL_DISCLAIMER =
  '本站内容仅供医学教育与学习参考，不构成任何诊断或治疗建议；临床决策请以执业医师面诊意见为准。';
