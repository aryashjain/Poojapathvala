// Interface language. Hindi (Devanagari) is the default; English is one click away.
// The choice lives in the `pp-lang` cookie so the server renders the right language
// on the first response, with no flash and no client script.

export const LANGS = ['hi', 'en'];
export const DEFAULT_LANG = 'hi';

export function langFromRequest(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)pp-lang=(hi|en)(?:;|$)/);
  return match ? match[1] : DEFAULT_LANG;
}

// Pick the Hindi or English value of a field, falling back to English.
export function loc(lang, en, hi) {
  return lang === 'hi' && hi ? hi : en;
}

const STRINGS = {
  hi: {
    brandName: 'पूजापाठवाला',
    tagline: 'पवित्र ग्रंथ, आरती, पूजा, स्तोत्र और कविता — सरल, शांत और साझा करने योग्य।',
    homeEyebrow: 'आरती, पूजा और पवित्र ग्रंथों का डिजिटल पुस्तकालय',
    homeLede: 'हिंदी और अंग्रेज़ी में पढ़ें, बिना साइन-अप के। नीचे सभी रचनाएँ खोजें।',
    homeDescription: 'आरती, पूजा विधि, चालीसा, स्तोत्र और मंत्र हिंदी और अंग्रेज़ी में पढ़ें और खोजें।',
    searchLabel: 'सभी रचनाएँ खोजें',
    searchPlaceholder: 'चालीसा, मंत्र, कविता खोजें…',
    searchButton: 'खोजें',
    searchTitle: 'खोज',
    searchPrompt: 'सभी रचनाओं में खोजने के लिए कुछ लिखें।',
    searchNone: '“{q}” के लिए कुछ नहीं मिला।',
    matchOne: '“{q}” के लिए 1 परिणाम मिला।',
    matchMany: '“{q}” के लिए {n} परिणाम मिले।',
    panelNone: '“{q}” के लिए कोई परिणाम नहीं।',
    seeAll: 'सभी {n} परिणाम देखें',
    collectionsAria: 'संग्रह',
    noCollections: 'अभी कोई संग्रह नहीं है।',
    featured: 'चुनी हुई रचनाएँ',
    textOne: '{n} रचना',
    textMany: '{n} रचनाएँ',
    minutes: '{n} मिनट',
    noTexts: 'अभी कोई रचना नहीं है।',
    topicDescription: '{name} की रचनाएँ।',
    home: 'मुखपृष्ठ',
    breadcrumb: 'पथ-सूचक',
    readerLabel: 'पढ़ने के विकल्प',
    sizeGroup: 'अक्षर का आकार',
    sizeSmaller: 'अक्षर छोटे करें',
    sizeLarger: 'अक्षर बड़े करें',
    modeGroup: 'पढ़ने का रंग',
    modeLight: 'सफ़ेद',
    modeSepia: 'सेपिया',
    modeDark: 'गहरा',
    shareGroup: 'साझा करें',
    copyLink: 'लिंक कॉपी करें',
    copied: 'लिंक कॉपी हुआ',
    copyFailed: 'कॉपी नहीं हो सका',
    copyUnsupported: 'इस ब्राउज़र में समर्थित नहीं',
    prev: '← पिछला',
    next: 'अगला →',
    moreInCollection: 'इसी संग्रह में और',
    sitemap: 'साइटमैप',
    addTexts: 'रचनाएँ जोड़ें',
    langToggle: 'English',
    langToggleAria: 'Switch to English',
    notFoundTitle: 'पृष्ठ नहीं मिला',
    notFoundLede: 'यह पृष्ठ कहीं खो गया है।',
    returnHome: '{name} पर वापस जाएँ',
    feedbackLink: 'प्रतिक्रिया',
    feedbackTitle: 'अपनी राय दें',
    feedbackLede: 'कोई त्रुटि, सुझाव या नया पाठ जोड़ने का अनुरोध? यहाँ लिखें। हम हर संदेश पढ़ते हैं।',
    feedbackName: 'नाम (वैकल्पिक)',
    feedbackEmail: 'ईमेल',
    feedbackEmailHint: 'केवल जवाब देने के लिए। सार्वजनिक नहीं होगा।',
    feedbackType: 'विषय',
    feedbackMessage: 'संदेश',
    feedbackSubmit: 'भेजें',
    feedbackThanks: 'धन्यवाद! आपका संदेश मिल गया है।',
    feedbackDisabled: 'प्रतिक्रिया अभी उपलब्ध नहीं है।',
    typeBug: 'गलती / त्रुटि',
    typeContent: 'पाठ में सुधार',
    typeIdea: 'नया सुझाव',
    typeOther: 'अन्य',
    errNameLong: 'नाम 80 अक्षरों से छोटा रखें।',
    errEmailRequired: 'कृपया अपना ईमेल लिखें।',
    errEmailInvalid: 'सही ईमेल लिखें।',
    errMessageRequired: 'कृपया संदेश लिखें।',
    errMessageShort: 'थोड़ा और विस्तार से लिखें।',
    errMessageLong: 'संदेश 2000 अक्षरों से छोटा रखें।',
  },
  en: {
    brandName: 'Poojapathvala',
    tagline: 'Sacred texts, aartis, pooja, stotras and poetry, clean and easy to share.',
    homeEyebrow: 'A digital library of aartis, pooja and sacred texts',
    homeLede: 'Read in Hindi and English, with no sign-up. Search every text below.',
    homeDescription: 'Read and search Hindu aartis, pooja vidhi, chalisas, stotras and mantras in Hindi and English.',
    searchLabel: 'Search all texts',
    searchPlaceholder: 'Search chalisas, mantras, poems…',
    searchButton: 'Search',
    searchTitle: 'Search',
    searchPrompt: 'Type something to search every text.',
    searchNone: 'Nothing found for “{q}”.',
    matchOne: '1 match for “{q}”.',
    matchMany: '{n} matches for “{q}”.',
    panelNone: 'No matches for “{q}”.',
    seeAll: 'See all {n} results',
    collectionsAria: 'Collections',
    noCollections: 'No collections yet.',
    featured: 'Featured',
    textOne: '{n} text',
    textMany: '{n} texts',
    minutes: '{n} min',
    noTexts: 'No texts yet.',
    topicDescription: 'A collection of texts on {name}.',
    home: 'Home',
    breadcrumb: 'Breadcrumb',
    readerLabel: 'Reading controls',
    sizeGroup: 'Text size',
    sizeSmaller: 'Smaller text',
    sizeLarger: 'Larger text',
    modeGroup: 'Reading mode',
    modeLight: 'Light',
    modeSepia: 'Sepia',
    modeDark: 'Dark',
    shareGroup: 'Share',
    copyLink: 'Copy link',
    copied: 'Link copied',
    copyFailed: 'Copy failed',
    copyUnsupported: 'Copy not supported',
    prev: '← Previous',
    next: 'Next →',
    moreInCollection: 'More in this collection',
    sitemap: 'Sitemap',
    addTexts: 'Add texts',
    langToggle: 'हिन्दी',
    langToggleAria: 'हिन्दी में देखें',
    notFoundTitle: 'Page not found',
    notFoundLede: 'This page has wandered off.',
    returnHome: 'Return to {name}',
    feedbackLink: 'Feedback',
    feedbackTitle: 'Share your feedback',
    feedbackLede: 'Found a mistake, have an idea, or want a text added? Tell us. We read every message.',
    feedbackName: 'Name (optional)',
    feedbackEmail: 'Email',
    feedbackEmailHint: 'Only used to reply. Never shown publicly.',
    feedbackType: 'Topic',
    feedbackMessage: 'Message',
    feedbackSubmit: 'Send',
    feedbackThanks: 'Thank you! We have received your message.',
    feedbackDisabled: 'Feedback is not available right now.',
    typeBug: 'Mistake or bug',
    typeContent: 'Correction to a text',
    typeIdea: 'New idea',
    typeOther: 'Other',
    errNameLong: 'Keep the name under 80 characters.',
    errEmailRequired: 'Please enter your email.',
    errEmailInvalid: 'Enter a valid email address.',
    errMessageRequired: 'Please write a message.',
    errMessageShort: 'Write a little more so we can understand.',
    errMessageLong: 'Keep the message under 2000 characters.',
  },
};

// Look up a UI string and fill in {placeholders}.
export function t(lang, key, vars = {}) {
  const table = STRINGS[lang] || STRINGS[DEFAULT_LANG];
  let text = table[key] ?? STRINGS.en[key] ?? key;
  for (const [name, value] of Object.entries(vars)) {
    text = text.split('{' + name + '}').join(String(value));
  }
  return text;
}

// "4 min" -> "4 मिनट". Anything without a number is returned unchanged.
export function minutes(lang, reading) {
  if (!reading) return '';
  const match = reading.match(/(\d+)/);
  if (!match || lang !== 'hi') return reading;
  return t(lang, 'minutes', { n: match[1] });
}

export function textCount(lang, n) {
  return t(lang, n === 1 ? 'textOne' : 'textMany', { n });
}

export function formatDate(lang, iso) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
