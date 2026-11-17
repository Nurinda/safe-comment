// Paket bahasa bawaan (rule-based). Daftar sengaja ringkas; tambah sendiri lewat Pengaturan.
// Bahasa tanpa paket (Rusia, Thai, dll.) tetap dianalisis lewat AI.
export const PACKS = {
  id: {
    hate: ['kafir', 'bunuh', 'mati aja', 'mati saja', 'antek asing', 'aseng', 'teroris', 'laknat', 'sesat'],
    abuse: ['anjing', 'babi', 'bangsat', 'bajingan', 'brengsek', 'goblok', 'tolol', 'bodoh', 'idiot', 'dungu', 'sampah', 'tai', 'setan', 'kampret', 'cebong', 'sinting', 'bego', 'bacot', 'munafik', 'kampungan', 'monyet'],
    sexual: ['kontol', 'memek', 'ngentot', 'jablay', 'pelacur', 'bokep', 'open bo', 'sange', 'telanjang'],
    spam: ['slot gacor', 'maxwin', 'togel', 'judol', 'judi online', 'situs slot', 'link bio', 'daftar sekarang', 'klik link', 'jackpot', 'deposit'],
  },
  ms: {
    hate: ['bunuh', 'kafir'],
    abuse: ['bodoh', 'sial', 'celaka', 'bangang', 'pukimak', 'anjing', 'babi'],
    sexual: ['pelacur', 'sundal'],
    spam: ['slot', 'judi', 'pinjaman cepat'],
  },
  en: {
    hate: ['kill yourself', 'kys', 'nigger', 'faggot', 'terrorist', 'go back to your country', 'subhuman', 'retard'],
    abuse: ['idiot', 'stupid', 'moron', 'asshole', 'bitch', 'shit', 'fuck', 'dumb', 'loser', 'trash', 'scum', 'pathetic', 'bastard'],
    sexual: ['slut', 'whore', 'send nudes', 'nudes', 'dick', 'pussy', 'porn'],
    spam: ['free money', 'click here', 'dm me', 'crypto giveaway', 'whatsapp me', 'casino', 'betting', 'promo code'],
  },
  es: {
    hate: ['muerete', 'maricon'],
    abuse: ['idiota', 'estupido', 'imbecil', 'mierda', 'cabron', 'pendejo', 'gilipollas', 'basura'],
    sexual: ['puta', 'zorra', 'verga'],
    spam: ['gana dinero', 'haz clic', 'apuestas'],
  },
  pt: {
    hate: ['morra', 'macaco'],
    abuse: ['idiota', 'burro', 'merda', 'lixo', 'otario', 'babaca', 'vagabundo'],
    sexual: ['puta', 'vadia'],
    spam: ['ganhe dinheiro', 'clique aqui', 'apostas'],
  },
  fr: {
    hate: ['creve', 'sale arabe', 'sale juif'],
    abuse: ['idiot', 'connard', 'salaud', 'merde', 'debile', 'ordure', 'abruti'],
    sexual: ['pute', 'salope', 'encule'],
    spam: ['cliquez ici', 'casino en ligne'],
  },
  de: {
    hate: ['stirb', 'kanake', 'untermensch'],
    abuse: ['idiot', 'dummkopf', 'scheisse', 'arschloch', 'wichser', 'depp', 'versager', 'muell'],
    sexual: ['schlampe', 'nutte', 'hurensohn'],
    spam: ['klick hier', 'schnell geld'],
  },
  ar: {
    hate: ['اقتلوه', 'ارهابي', 'كافر'],
    abuse: ['غبي', 'حمار', 'كلب', 'حقير', 'تافه'],
    sexual: ['شرموطة', 'عاهرة'],
    spam: ['اربح المال', 'اضغط هنا'],
  },
  hi: {
    hate: ['मार डालो', 'आतंकवादी'],
    abuse: ['बेवकूफ', 'गधा', 'कमीना', 'हरामी', 'चूतिया'],
    sexual: ['रंडी'],
    spam: ['यहाँ क्लिक'],
  },
  ja: {
    hate: ['死ね', '殺す', '消えろ'],
    abuse: ['バカ', '馬鹿', 'アホ', 'クズ', 'ブス', 'きもい', 'キモい'],
    sexual: ['エロ'],
    spam: ['クリック', '副業'],
  },
  ko: {
    hate: ['죽어', '뒤져'],
    abuse: ['바보', '멍청', '병신', '쓰레기', '꺼져'],
    sexual: ['창녀'],
    spam: ['클릭', '대출'],
  },
  zh: {
    hate: ['去死', '杀了', '黑鬼', '支那'],
    abuse: ['傻', '蠢', '垃圾', '废物', '白痴', '滚', '笨蛋'],
    sexual: ['婊子', '妓女', '约炮'],
    spam: ['点击', '博彩', '赚钱', '加微信'],
  },
};

export const PACK_NAMES = { id: 'Indonesia', ms: 'Melayu', en: 'Inggris', es: 'Spanyol', pt: 'Portugis', fr: 'Prancis', de: 'Jerman', ar: 'Arab', hi: 'Hindi', ja: 'Jepang', ko: 'Korea', zh: 'Mandarin' };

export const STOP = {
  id: 'yang dan di ini itu tidak aku kamu dengan untuk ga gak nggak banget sih dong lu gue kok udah aja nya',
  en: 'the and is you this that are with for not it of to have',
  ms: 'saya awak tak lah je boleh kita dengan yang ini itu',
  es: 'el la los que de es y en un una por con no esto',
  pt: 'o os que de não nao é um uma para com voce você isso',
  fr: 'le la les que de est et un une pas pour vous ce',
  de: 'der die das und ist nicht ein ich du mit zu',
};
