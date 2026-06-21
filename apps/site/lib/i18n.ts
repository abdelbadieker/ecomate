import { cookies } from 'next/headers';

export type Lang = 'en' | 'ar';

/** Read the active locale from the `lang` cookie (server components). */
export function getLang(): Lang {
  return cookies().get('lang')?.value === 'ar' ? 'ar' : 'en';
}

export const dictionaries = {
  en: {
    nav: { features: 'Features', pricing: 'Pricing', how: 'How It Works', contact: 'Contact Us' },
    auth: { login: 'Login', register: 'Get Started', dashboard: 'Dashboard' },
    hero: {
      badge: 'All-in-One SaaS Platform for Algerian Business',
      title1: 'Build your', titleHi: 'Business', title2: 'without the complexity.',
      sub: 'EcoMate centralizes every tool Algerian SMEs need into one platform — AI chatbot automation, order management, CRM. No technical knowledge required.',
      start: 'Start Now', discover: 'Discover Features',
      tools: 'Tools', aiResp: 'AI Response', automation: 'Automation', missed: 'Missed Orders',
    },
    integ: {
      label: 'Connects seamlessly with the platforms your customers already use',
      social: 'All Social Platforms', socialT: 'Where your customers message you',
      delivery: 'Algerian Delivery Network', deliveryT: 'Shipping partners across all wilayas',
      home: 'Home Delivery', office: 'Office Pickup', express: 'Express Delivery', wilayas: 'All 58 Wilayas',
      tools: 'Business Tools', toolsT: 'Keep using the tools you love', more: '+ More',
      sheets: 'Google Sheets', excel: 'Excel Export', pdf: 'PDF Reports',
    },
    powered: {
      label: 'What EcoMate delivers for your business — every single day',
      reply: 'reply speed', langs: 'languages supported', aiRate: 'AI response rate',
      orders: 'orders automated', wilayas: 'wilayas covered', missed: 'missed messages',
      realtime: 'dashboard data', security: 'data security',
    },
    how: {
      tag: 'Simple Process', titleA: 'From zero to selling', titleHi: 'in 4 steps.',
      sub: 'We handle the complexity so you can focus on what matters — growing your business.',
      s1t: 'Tell Us Your Business', s1d: 'Sign up and describe your activity, products, and goals.',
      s2t: 'We Set Everything Up', s2d: 'Our team configures your AI chatbot, product catalog, and dashboard.',
      s3t: 'Connect Your Channels', s3d: 'Link your social pages and your delivery partner effortlessly.',
      s4t: 'Start Scaling', s4d: 'Watch as AI answers questions and closes sales 24/7.',
    },
    cta: {
      titleA: 'Ready to automate your', titleHi: 'Sales?',
      sub: 'Join hundreds of merchants in Algeria who have centralized their operations and skyrocketed their revenue with EcoMate.',
      start: 'Get Started Now', signin: 'Sign In to Dashboard', note: 'Cancel anytime.',
    },
    footer: {
      tagline: 'Empowering Algerian businesses with professional e-commerce automation tailored for the local market.',
      product: 'Product', features: 'Features', pricing: 'Pricing', guides: 'Guides',
      company: 'Company', about: 'About Us', careers: 'Careers', contact: 'Contact',
      legal: 'Legal', privacy: 'Privacy Policy', terms: 'Terms of Service',
      rights: 'Built for scale in', country: 'Algeria', secure: 'Secure', fast: 'Lightning Fast',
    },
    services: {
      tag: 'Everything You Need',
      title1: 'All tools.', titleHi: 'One platform.', title2: 'Zero fragmentation.',
      sub: 'Stop juggling a dozen different tools. EcoMate brings every capability your Algerian business needs into one seamless, affordable system.',
    },
    pricing: {
      tag: 'Pricing', title1: 'Three ways to', titleHi: 'grow', title2: 'with EcoMate.',
      sub: 'Land with automation, add marketing content packs, and scale into full performance-based fulfillment — pay only for what moves your business.',
      flow1: 'Automation', flow2: 'Marketing Packs', flow3: 'Fulfillment',
      autoTag: 'Automation · SaaS', autoNote: 'Monthly subscription · save with annual',
      packsTag: 'Marketing · Content Packs', packsNote: 'Scripting + filming · with or without ads management',
      fulTag: 'Fulfillment · Performance', fulNote: 'We earn when you earn — % of delivered orders only',
      popular: 'Most Popular', bestValue: 'Best Value', recommended: 'Recommended',
      getStarted: 'Get Started', requestPack: 'Request a Pack', talk: 'Talk to Us',
      videos: 'videos', orWith: 'or', withAds: 'with ads management', ofRevenue: 'of delivered revenue',
      fineprint: 'Example figures — the % is set against your COD/delivery economics and applies to delivered (paid) orders only. Ad spend, when applicable, is billed separately.',
      monthShort: 'mo',
    },
  },
  ar: {
    nav: { features: 'المزايا', pricing: 'الأسعار', how: 'كيف يعمل', contact: 'اتصل بنا' },
    auth: { login: 'تسجيل الدخول', register: 'ابدأ الآن', dashboard: 'لوحة التحكم' },
    hero: {
      badge: 'منصة SaaS متكاملة للأعمال الجزائرية',
      title1: 'ابنِ', titleHi: 'مشروعك', title2: 'بدون تعقيد.',
      sub: 'إيكومايت تجمع كل أداة تحتاجها الشركات الجزائرية الصغيرة والمتوسطة في منصة واحدة — روبوت محادثة بالذكاء الاصطناعي، إدارة الطلبات، وإدارة العملاء. بدون أي خبرة تقنية.',
      start: 'ابدأ الآن', discover: 'اكتشف المزايا',
      tools: 'أدوات', aiResp: 'استجابة الذكاء الاصطناعي', automation: 'أتمتة', missed: 'طلبات ضائعة',
    },
    integ: {
      label: 'يتكامل بسلاسة مع المنصات التي يستخدمها عملاؤك بالفعل',
      social: 'جميع منصات التواصل', socialT: 'حيث يراسلك عملاؤك',
      delivery: 'شبكة التوصيل الجزائرية', deliveryT: 'شركاء الشحن عبر كل الولايات',
      home: 'توصيل للمنزل', office: 'استلام من المكتب', express: 'توصيل سريع', wilayas: 'كل 58 ولاية',
      tools: 'أدوات الأعمال', toolsT: 'واصل استخدام الأدوات التي تحبها', more: '+ المزيد',
      sheets: 'Google Sheets', excel: 'تصدير Excel', pdf: 'تقارير PDF',
    },
    powered: {
      label: 'ما تقدمه إيكومايت لأعمالك — كل يوم',
      reply: 'سرعة الرد', langs: 'لغات مدعومة', aiRate: 'معدل استجابة الذكاء الاصطناعي',
      orders: 'طلبات مؤتمتة', wilayas: 'ولاية مغطاة', missed: 'رسائل ضائعة',
      realtime: 'بيانات لحظية', security: 'أمان البيانات',
    },
    how: {
      tag: 'عملية بسيطة', titleA: 'من الصفر إلى البيع', titleHi: 'في 4 خطوات.',
      sub: 'نحن نتولى التعقيد لتركّز أنت على ما يهم — تنمية أعمالك.',
      s1t: 'أخبرنا عن مشروعك', s1d: 'سجّل وصف نشاطك ومنتجاتك وأهدافك.',
      s2t: 'نجهّز لك كل شيء', s2d: 'يقوم فريقنا بإعداد روبوت المحادثة وكتالوج المنتجات ولوحة التحكم.',
      s3t: 'اربط قنواتك', s3d: 'اربط صفحاتك على التواصل وشريك التوصيل بكل سهولة.',
      s4t: 'ابدأ التوسّع', s4d: 'شاهد الذكاء الاصطناعي يجيب على الأسئلة ويتمم المبيعات على مدار الساعة.',
    },
    cta: {
      titleA: 'جاهز لأتمتة', titleHi: 'مبيعاتك؟',
      sub: 'انضم إلى مئات التجار في الجزائر الذين وحّدوا عملياتهم وضاعفوا إيراداتهم مع إيكومايت.',
      start: 'ابدأ الآن', signin: 'الدخول إلى لوحة التحكم', note: 'يمكنك الإلغاء في أي وقت.',
    },
    footer: {
      tagline: 'نُمكّن الأعمال الجزائرية بأتمتة تجارة إلكترونية احترافية مصمّمة للسوق المحلي.',
      product: 'المنتج', features: 'المزايا', pricing: 'الأسعار', guides: 'الأدلة',
      company: 'الشركة', about: 'من نحن', careers: 'الوظائف', contact: 'اتصل بنا',
      legal: 'قانوني', privacy: 'سياسة الخصوصية', terms: 'شروط الخدمة',
      rights: 'مبني للتوسّع في', country: 'الجزائر', secure: 'آمن', fast: 'سريع كالبرق',
    },
    services: {
      tag: 'كل ما تحتاجه',
      title1: 'كل الأدوات.', titleHi: 'منصة واحدة.', title2: 'بدون تشتّت.',
      sub: 'توقّف عن التنقل بين عشر أدوات مختلفة. إيكومايت تجمع كل ما تحتاجه أعمالك الجزائرية في نظام واحد سلس وبأسعار في المتناول.',
    },
    pricing: {
      tag: 'الأسعار', title1: 'ثلاث طرق', titleHi: 'للنمو', title2: 'مع إيكومايت.',
      sub: 'ابدأ بالأتمتة، أضف باقات المحتوى التسويقي، ثم توسّع إلى خدمة التوصيل القائمة على الأداء — ادفع فقط مقابل ما يحرّك أعمالك.',
      flow1: 'الأتمتة', flow2: 'باقات التسويق', flow3: 'التوصيل',
      autoTag: 'الأتمتة · اشتراك', autoNote: 'اشتراك شهري · وفّر مع الدفع السنوي',
      packsTag: 'التسويق · باقات المحتوى', packsNote: 'كتابة + تصوير · مع أو بدون إدارة الإعلانات',
      fulTag: 'التوصيل · حسب الأداء', fulNote: 'نربح عندما تربح — نسبة من الطلبات المسلّمة فقط',
      popular: 'الأكثر شيوعاً', bestValue: 'أفضل قيمة', recommended: 'موصى به',
      getStarted: 'ابدأ الآن', requestPack: 'اطلب باقة', talk: 'تحدّث معنا',
      videos: 'فيديو', orWith: 'أو', withAds: 'مع إدارة الإعلانات', ofRevenue: 'من الإيراد المسلّم',
      fineprint: 'أرقام تقريبية — تُحدَّد النسبة وفق اقتصاديات الدفع عند الاستلام/التوصيل وتُطبّق على الطلبات المسلّمة (المدفوعة) فقط. تُحتسب ميزانية الإعلانات بشكل منفصل عند الحاجة.',
      monthShort: 'شهر',
    },
  },
} as const;

export type Dict = (typeof dictionaries)['en'];
