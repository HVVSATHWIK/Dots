import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Common
      "app.name": "DOTS",
      "app.description": "Discover authentic Indian crafts and connect with artisans",
      "nav.home": "Home",
      "nav.discover": "Discover",
      "nav.themes": "Themes",
      "nav.community": "Community",
      "nav.dashboard": "Dashboard",
      "nav.profile": "Profile",
      "nav.login": "Login",
      "nav.signup": "Sign Up",
      "nav.logout": "Logout",

      // Authentication
      "auth.welcome": "Welcome to DOTS",
      "auth.signin": "Sign In",
      "auth.signup": "Sign Up",
      "auth.continueWithGoogle": "Continue with Google",
      "auth.or": "or",
      "auth.email": "Email",
      "auth.password": "Password",
      "auth.confirmPassword": "Confirm Password",
      "auth.forgotPassword": "Forgot Password?",
      "auth.noAccount": "Don't have an account?",
      "auth.haveAccount": "Already have an account?",
      "auth.signingIn": "Signing in...",
      "auth.creatingAccount": "Creating account...",

      // Role Selection
      "role.title": "Choose Your Role",
      "role.buyer": "I'm a Buyer",
      "role.buyerDesc": "Discover and purchase authentic Indian crafts",
      "role.artisan": "I'm an Artisan",
      "role.artisanDesc": "Sell my handmade crafts and connect with buyers",
      "role.benefits": "Benefits",
      "role.selectRole": "Select your role to continue",

      // Buyer Features
      "buyer.dashboard": "Buyer Dashboard",
      "buyer.recommendations": "Personalized Recommendations",
      "buyer.wishlist": "My Wishlist",
      "buyer.orders": "My Orders",
      "buyer.discover": "Discover New Art",

      // Artisan Features
      "artisan.dashboard": "Artisan Dashboard",
      "artisan.products": "My Products",
      "artisan.sales": "Sales Analytics",
      "artisan.orders": "Manage Orders",
      "artisan.profile": "Artisan Profile",

      // Common Actions
      "actions.save": "Save",
      "actions.cancel": "Cancel",
      "actions.delete": "Delete",
      "actions.edit": "Edit",
      "actions.add": "Add",
      "actions.view": "View",
      "actions.back": "Back",
      "actions.next": "Next",
      "actions.previous": "Previous",
      "actions.continue": "Continue",
      "actions.finish": "Finish",

      // Messages
      "messages.loading": "Loading...",
      "messages.error": "Something went wrong",
      "messages.success": "Success!",
      "messages.noData": "No data available",

      // Language
      "language.select": "Select Language",
      "language.english": "English",
      "language.hindi": "हिंदी",
      "language.telugu": "తెలుగు",
      "language.tamil": "தமிழ்"
    }
  },
  hi: {
    translation: {
      // Common
      "app.name": "DOTS",
      "app.description": "प्रामाणिक भारतीय शिल्प खोजें और कारीगरों से जुड़ें",
      "nav.home": "होम",
      "nav.discover": "खोजें",
      "nav.themes": "थीम्स",
      "nav.community": "समुदाय",
      "nav.dashboard": "डैशबोर्ड",
      "nav.profile": "प्रोफ़ाइल",
      "nav.login": "लॉग इन",
      "nav.signup": "साइन अप",
      "nav.logout": "लॉग आउट",

      // Authentication
      "auth.welcome": "DOTS में आपका स्वागत है",
      "auth.signin": "साइन इन",
      "auth.signup": "साइन अप",
      "auth.continueWithGoogle": "Google के साथ जारी रखें",
      "auth.or": "या",
      "auth.email": "ईमेल",
      "auth.password": "पासवर्ड",
      "auth.confirmPassword": "पासवर्ड की पुष्टि करें",
      "auth.forgotPassword": "पासवर्ड भूल गए?",
      "auth.noAccount": "खाता नहीं है?",
      "auth.haveAccount": "पहले से खाता है?",
      "auth.signingIn": "साइन इन हो रहा है...",
      "auth.creatingAccount": "खाता बनाया जा रहा है...",

      // Role Selection
      "role.title": "अपनी भूमिका चुनें",
      "role.buyer": "मैं खरीदार हूँ",
      "role.buyerDesc": "प्रामाणिक भारतीय शिल्प खोजें और खरीदें",
      "role.artisan": "मैं कारीगर हूँ",
      "role.artisanDesc": "अपने हस्तनिर्मित शिल्प बेचें और खरीदारों से जुड़ें",
      "role.benefits": "लाभ",
      "role.selectRole": "जारी रखने के लिए अपनी भूमिका चुनें",

      // Buyer Features
      "buyer.dashboard": "खरीदार डैशबोर्ड",
      "buyer.recommendations": "व्यक्तिगत सिफारिशें",
      "buyer.wishlist": "मेरी विशलिस्ट",
      "buyer.orders": "मेरे ऑर्डर",
      "buyer.discover": "नई कला खोजें",

      // Artisan Features
      "artisan.dashboard": "कारीगर डैशबोर्ड",
      "artisan.products": "मेरे उत्पाद",
      "artisan.sales": "बिक्री विश्लेषण",
      "artisan.orders": "ऑर्डर प्रबंधित करें",
      "artisan.profile": "कारीगर प्रोफ़ाइल",

      // Common Actions
      "actions.save": "सेव करें",
      "actions.cancel": "रद्द करें",
      "actions.delete": "मिटाएं",
      "actions.edit": "संपादित करें",
      "actions.add": "जोड़ें",
      "actions.view": "देखें",
      "actions.back": "वापस",
      "actions.next": "अगला",
      "actions.previous": "पिछला",
      "actions.continue": "जारी रखें",
      "actions.finish": "समाप्त",

      // Messages
      "messages.loading": "लोड हो रहा है...",
      "messages.error": "कुछ गलत हो गया",
      "messages.success": "सफलता!",
      "messages.noData": "कोई डेटा उपलब्ध नहीं",

      // Language
      "language.select": "भाषा चुनें",
      "language.english": "English",
      "language.hindi": "हिंदी",
      "language.telugu": "తెలుగు",
      "language.tamil": "தமிழ்"
    }
  },
  te: {
    translation: {
      // Common
      "app.name": "DOTS",
      "app.description": "ప్రామాణిక భారతీయ కళలను కనుగొనండి మరియు కళాకారులతో కనెక్ట్ అవ్వండి",
      "nav.home": "హోమ్",
      "nav.discover": "కనుగొను",
      "nav.themes": "థీమ్స్",
      "nav.community": "కమ్యూనిటీ",
      "nav.dashboard": "డ్యాష్బోర్డ్",
      "nav.profile": "ప్రొఫైల్",
      "nav.login": "లాగిన్",
      "nav.signup": "సైన్ అప్",
      "nav.logout": "లాగ్ అవుట్",

      // Authentication
      "auth.welcome": "DOTS కు స్వాగతం",
      "auth.signin": "సైన్ ఇన్",
      "auth.signup": "సైన్ అప్",
      "auth.continueWithGoogle": "Google తో కొనసాగించు",
      "auth.or": "లేదా",
      "auth.email": "ఇమెయిల్",
      "auth.password": "పాస్‌వర్డ్",
      "auth.confirmPassword": "పాస్‌వర్డ్ నిర్ధారించు",
      "auth.forgotPassword": "పాస్‌వర్డ్ మర్చిపోయారా?",
      "auth.noAccount": "ఖాతా లేదా?",
      "auth.haveAccount": "ఇప్పటికే ఖాతా ఉందా?",
      "auth.signingIn": "సైన్ ఇన్ అవుతోంది...",
      "auth.creatingAccount": "ఖాతా సృష్టించబడుతోంది...",

      // Role Selection
      "role.title": "మీ పాత్రను ఎంచుకోండి",
      "role.buyer": "నేను కొనుగోలుదారిని",
      "role.buyerDesc": "ప్రామాణిక భారతీయ కళలను కనుగొనండి మరియు కొనండి",
      "role.artisan": "నేను కళాకారుడిని",
      "role.artisanDesc": "నా చేతితో తయారు చేసిన కళలను అమ్మండి మరియు కొనుగోలుదారులతో కనెక్ట్ అవ్వండి",
      "role.benefits": "ప్రయోజనాలు",
      "role.selectRole": "కొనసాగించడానికి మీ పాత్రను ఎంచుకోండి",

      // Buyer Features
      "buyer.dashboard": "కొనుగోలుదారు డ్యాష్బోర్డ్",
      "buyer.recommendations": "వ్యక్తిగత సిఫార్సులు",
      "buyer.wishlist": "నా విష్‌లిస్ట్",
      "buyer.orders": "నా ఆర్డర్‌లు",
      "buyer.discover": "కొత్త కళ కనుగొను",

      // Artisan Features
      "artisan.dashboard": "కళాకారు డ్యాష్బోర్డ్",
      "artisan.products": "నా ఉత్పత్తులు",
      "artisan.sales": "అమ్మకాల విశ్లేషణ",
      "artisan.orders": "ఆర్డర్‌లను నిర్వహించు",
      "artisan.profile": "కళాకారు ప్రొఫైల్",

      // Common Actions
      "actions.save": "సేవ్ చేయు",
      "actions.cancel": "రద్దు చేయు",
      "actions.delete": "తొలగించు",
      "actions.edit": "సవరించు",
      "actions.add": "జోడించు",
      "actions.view": "చూడు",
      "actions.back": "వెనుకకు",
      "actions.next": "తరువాత",
      "actions.previous": "మునుపటి",
      "actions.continue": "కొనసాగించు",
      "actions.finish": "పూర్తి",

      // Messages
      "messages.loading": "లోడ్ అవుతోంది...",
      "messages.error": "ఏదో తప్పు జరిగింది",
      "messages.success": "విజయం!",
      "messages.noData": "డేటా అందుబాటులో లేదు",

      // Language
      "language.select": "భాష ఎంచుకోండి",
      "language.english": "English",
      "language.hindi": "हिंदी",
      "language.telugu": "తెలుగు",
      "language.tamil": "தமிழ்"
    }
  },
  ta: {
    translation: {
      // Common
      "app.name": "DOTS",
      "app.description": "அசல் இந்திய கைவினைப் பொருட்களை கண்டறிந்து கைவினைஞர்களுடன் இணையுங்கள்",
      "nav.home": "முகப்பு",
      "nav.discover": "கண்டறி",
      "nav.themes": "கருப்பொருள்கள்",
      "nav.community": "சமூகம்",
      "nav.dashboard": "டாஷ்போர்டு",
      "nav.profile": "சுயவிவரம்",
      "nav.login": "உள்நுழை",
      "nav.signup": "பதிவு செய்",
      "nav.logout": "வெளியேறு",

      // Authentication
      "auth.welcome": "DOTS க்கு வரவேற்கிறோம்",
      "auth.signin": "உள்நுழை",
      "auth.signup": "பதிவு செய்",
      "auth.continueWithGoogle": "Google உடன் தொடரவும்",
      "auth.or": "அல்லது",
      "auth.email": "மின்னஞ்சல்",
      "auth.password": "கடவுச்சொல்",
      "auth.confirmPassword": "கடவுச்சொல்லை உறுதிப்படுத்து",
      "auth.forgotPassword": "கடவுச்சொல் மறந்துவிட்டதா?",
      "auth.noAccount": "கணக்கு இல்லையா?",
      "auth.haveAccount": "ஏற்கனவே கணக்கு உள்ளதா?",
      "auth.signingIn": "உள்நுழைவு நடைபெறுகிறது...",
      "auth.creatingAccount": "கணக்கு உருவாக்கப்படுகிறது...",

      // Role Selection
      "role.title": "உங்கள் பாத்திரத்தை தேர்ந்தெடுக்கவும்",
      "role.buyer": "நான் ஒரு வாங்குபவன்",
      "role.buyerDesc": "அசல் இந்திய கைவினைப் பொருட்களை கண்டறிந்து வாங்குங்கள்",
      "role.artisan": "நான் ஒரு கைவினைஞர்",
      "role.artisanDesc": "எனது கைவினைப் பொருட்களை விற்று வாங்குபவர்களுடன் இணையுங்கள்",
      "role.benefits": "நன்மைகள்",
      "role.selectRole": "தொடர்வதற்கு உங்கள் பாத்திரத்தை தேர்ந்தெடுக்கவும்",

      // Buyer Features
      "buyer.dashboard": "வாங்குபவர் டாஷ்போர்டு",
      "buyer.recommendations": "தனிப்பயன் பரிந்துரைகள்",
      "buyer.wishlist": "எனது விருப்பப்பட்டியல்",
      "buyer.orders": "எனது ஆர்டர்கள்",
      "buyer.discover": "புதிய கலையை கண்டறி",

      // Artisan Features
      "artisan.dashboard": "கைவினைஞர் டாஷ்போர்டு",
      "artisan.products": "எனது தயாரிப்புகள்",
      "artisan.sales": "விற்பனை பகுப்பாய்வு",
      "artisan.orders": "ஆர்டர்களை நிர்வகி",
      "artisan.profile": "கைவினைஞர் சுயவிவரம்",

      // Common Actions
      "actions.save": "சேமி",
      "actions.cancel": "ரத்து செய்",
      "actions.delete": "நீக்கு",
      "actions.edit": "திருத்து",
      "actions.add": "சேர்",
      "actions.view": "பார்",
      "actions.back": "பின்னால்",
      "actions.next": "அடுத்து",
      "actions.previous": "முந்தைய",
      "actions.continue": "தொடரவும்",
      "actions.finish": "முடி",

      // Messages
      "messages.loading": "ஏற்றப்படுகிறது...",
      "messages.error": "ஏதோ தவறு நடந்தது",
      "messages.success": "வெற்றி!",
      "messages.noData": "தரவு கிடைக்கவில்லை",

      // Language
      "language.select": "மொழியை தேர்ந்தெடு",
      "language.english": "English",
      "language.hindi": "हिंदी",
      "language.telugu": "తెలుగు",
      "language.tamil": "தமிழ்"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;