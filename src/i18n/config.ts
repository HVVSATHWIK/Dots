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
      "nav.about": "About",
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
      "language.tamil": "தமிழ்",

      // Tutorial - Buyer
      "tutorial.buyer.step1.title": "Welcome to DOTS!",
      "tutorial.buyer.step1.description": "Discover authentic handmade crafts from skilled Indian artisans. Let's get you started with your journey.",
      "tutorial.buyer.step2.title": "Explore Art Categories",
      "tutorial.buyer.step2.description": "Browse through different categories like paintings, jewelry, textiles, and more. Each piece tells a unique story.",
      "tutorial.buyer.step3.title": "Save Your Favorites",
      "tutorial.buyer.step3.description": "Create your wishlist by saving items you love. Get notified when similar items are added.",
      "tutorial.buyer.step4.title": "Request Custom Art",
      "tutorial.buyer.step4.description": "Have a specific vision? Request custom artwork from artisans who can bring your ideas to life.",
      "tutorial.buyer.step5.title": "Complete Your First Purchase",
      "tutorial.buyer.step5.description": "Ready to own a piece of Indian heritage? Make your first purchase and support local artisans.",

      // Tutorial - Artisan
      "tutorial.artisan.step1.title": "Welcome to DOTS, Artisan!",
      "tutorial.artisan.step1.description": "Showcase your craftsmanship to buyers worldwide. Let's set up your artisan profile and start selling your creations.",
      "tutorial.artisan.step2.title": "Complete Your Profile",
      "tutorial.artisan.step2.description": "Add your story, expertise, and beautiful photos of your work. A complete profile attracts more buyers.",
      "tutorial.artisan.step3.title": "Add Your Products",
      "tutorial.artisan.step3.description": "Upload high-quality photos of your handmade items. Include detailed descriptions and pricing.",
      "tutorial.artisan.step4.title": "Manage Your Orders",
      "tutorial.artisan.step4.description": "Track incoming orders, communicate with buyers, and ensure timely delivery of your beautiful creations.",
      "tutorial.artisan.step5.title": "Grow Your Business",
      "tutorial.artisan.step5.description": "Use analytics to understand what sells, respond to custom requests, and build lasting relationships with buyers."
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
      "nav.about": "हमारे बारे में",
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
      "language.tamil": "தமிழ்",

      // Tutorial - Buyer
      "tutorial.buyer.step1.title": "DOTS में आपका स्वागत है!",
      "tutorial.buyer.step1.description": "कुशल भारतीय कारीगरों से वास्तविक हस्तनिर्मित शिल्प खोजें। आइए आपकी यात्रा शुरू करें।",
      "tutorial.buyer.step2.title": "कला श्रेणियां एक्सप्लोर करें",
      "tutorial.buyer.step2.description": "पेंटिंग, ज्वेलरी, टेक्सटाइल और अधिक जैसी विभिन्न श्रेणियों को ब्राउज़ करें। प्रत्येक टुकड़ा एक अनोखी कहानी बताता है।",
      "tutorial.buyer.step3.title": "अपने पसंदीदा को सेव करें",
      "tutorial.buyer.step3.description": "उन आइटमों को सेव करके अपनी विशलिस्ट बनाएं जिन्हें आप पसंद करते हैं। जब समान आइटम जोड़े जाते हैं तो सूचित हों।",
      "tutorial.buyer.step4.title": "कस्टम कला का अनुरोध करें",
      "tutorial.buyer.step4.description": "कोई विशिष्ट विजन है? उन कारीगरों से कस्टम कलाकृति का अनुरोध करें जो आपकी विचारों को जीवंत कर सकते हैं।",
      "tutorial.buyer.step5.title": "अपनी पहली खरीदारी पूरी करें",
      "tutorial.buyer.step5.description": "भारतीय विरासत का एक टुकड़ा खरीदने के लिए तैयार हैं? अपनी पहली खरीदारी करें और स्थानीय कारीगरों का समर्थन करें।",

      // Tutorial - Artisan
      "tutorial.artisan.step1.title": "DOTS में आपका स्वागत है, कारीगर!",
      "tutorial.artisan.step1.description": "दुनिया भर के खरीदारों के सामने अपनी कारीगरी का प्रदर्शन करें। आइए आपका कारीगर प्रोफाइल सेट करें और अपनी रचनाओं की बिक्री शुरू करें।",
      "tutorial.artisan.step2.title": "अपना प्रोफाइल पूरा करें",
      "tutorial.artisan.step2.description": "अपनी कहानी, विशेषज्ञता और अपने काम की सुंदर तस्वीरें जोड़ें। एक पूरा प्रोफाइल अधिक खरीदारों को आकर्षित करता है।",
      "tutorial.artisan.step3.title": "अपने उत्पाद जोड़ें",
      "tutorial.artisan.step3.description": "अपने हस्तनिर्मित आइटमों की उच्च गुणवत्ता वाली तस्वीरें अपलोड करें। विस्तृत विवरण और मूल्य निर्धारण शामिल करें।",
      "tutorial.artisan.step4.title": "अपने ऑर्डर प्रबंधित करें",
      "tutorial.artisan.step4.description": "आने वाले ऑर्डर को ट्रैक करें, खरीदारों के साथ संवाद करें, और अपनी सुंदर रचनाओं की समय पर डिलीवरी सुनिश्चित करें।",
      "tutorial.artisan.step5.title": "अपना व्यवसाय बढ़ाएं",
      "tutorial.artisan.step5.description": "यह समझने के लिए एनालिटिक्स का उपयोग करें कि क्या बिकता है, कस्टम अनुरोधों का जवाब दें, और खरीदारों के साथ स्थायी संबंध बनाएं।"
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
      "nav.about": "మా గురించి",
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
      "language.tamil": "தமிழ்",

      // Tutorial - Buyer
      "tutorial.buyer.step1.title": "DOTS కు స్వాగతం!",
      "tutorial.buyer.step1.description": "నైపుణ్యం గల భారతీయ కళాకారుల నుండి వాస్తవ హస్తనిర్మిత కళలను కనుగొనండి. మీ ప్రయాణాన్ని ప్రారంభిద్దాం.",
      "tutorial.buyer.step2.title": "కళ వర్గాలను అన్వేషించండి",
      "tutorial.buyer.step2.description": "చిత్రాలు, ఆభరణాలు, వస్త్రాలు మరియు మరిన్నింటి వంటి వివిధ వర్గాలను బ్రౌజ్ చేయండి. ప్రతి ముక్క ఒక ప్రత్యేక కథ చెబుతుంది.",
      "tutorial.buyer.step3.title": "మీ అభిమానాలను సేవ్ చేయండి",
      "tutorial.buyer.step3.description": "మీకు నచ్చిన వస్తువులను సేవ్ చేసి మీ విష్‌లిస్ట్‌ను సృష్టించండి. సమానమైన వస్తువులు జోడించబడినప్పుడు నోటిఫికేషన్ పొందండి.",
      "tutorial.buyer.step4.title": "కస్టమ్ కళను అభ్యర్థించండి",
      "tutorial.buyer.step4.description": "ఏదైనా నిర్దిష్ట దృష్టి ఉందా? మీ ఆలోచనలను జీవంతం చేయగల కళాకారుల నుండి కస్టమ్ కళను అభ్యర్థించండి.",
      "tutorial.buyer.step5.title": "మీ మొదటి కొనుగోలును పూర్తి చేయండి",
      "tutorial.buyer.step5.description": "భారతీయ వారసత్వం యొక్క ఒక ముక్కను కొనుగోలు చేయడానికి సిద్ధంగా ఉన్నారా? మీ మొదటి కొనుగోలును చేసి స్థానిక కళాకారులకు మద్దతు ఇవ్వండి.",

      // Tutorial - Artisan
      "tutorial.artisan.step1.title": "DOTS కు స్వాగతం, కళాకారా!",
      "tutorial.artisan.step1.description": "ప్రపంచవ్యాప్తంగా కొనుగోలుదారులకు మీ కళను ప్రదర్శించండి. మీ కళాకార ప్రొఫైల్‌ను సెటప్ చేసి మీ సృష్టుల అమ్మకాన్ని ప్రారంభిద్దాం.",
      "tutorial.artisan.step2.title": "మీ ప్రొఫైల్‌ను పూర్తి చేయండి",
      "tutorial.artisan.step2.description": "మీ కథ, నైపుణ్యం మరియు మీ పని యొక్క అందమైన ఫోటోలను జోడించండి. పూర్తి ప్రొఫైల్ మరిన్ని కొనుగోలుదారులను ఆకర్షిస్తుంది.",
      "tutorial.artisan.step3.title": "మీ ఉత్పత్తులను జోడించండి",
      "tutorial.artisan.step3.description": "మీ హస్తనిర్మిత వస్తువుల యొక్క అధిక నాణ్యత ఫోటోలను అప్‌లోడ్ చేయండి. వివరణాత్మక వివరాలు మరియు ధరలను చేర్చండి.",
      "tutorial.artisan.step4.title": "మీ ఆర్డర్‌లను నిర్వహించండి",
      "tutorial.artisan.step4.description": "వచ్చే ఆర్డర్‌లను ట్రాక్ చేయండి, కొనుగోలుదారులతో కమ్యూనికేట్ చేయండి, మరియు మీ అందమైన సృష్టుల సమయానుకూల డెలివరీని నిర్ధారించండి.",
      "tutorial.artisan.step5.title": "మీ వ్యాపారాన్ని పెంచండి",
      "tutorial.artisan.step5.description": "ఏమి అమ్ముతుందో అర్థం చేసుకోవడానికి విశ్లేషణలను ఉపయోగించండి, కస్టమ్ అభ్యర్థనలకు స్పందించండి, మరియు కొనుగోలుదారులతో శాశ్వత సంబంధాలను నిర్మించండి."
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
      "nav.about": "எங்களைப் பற்றி",
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
      "language.tamil": "தமிழ்",

      // Tutorial - Buyer
      "tutorial.buyer.step1.title": "DOTS க்கு வரவேற்கிறோம்!",
      "tutorial.buyer.step1.description": "திறமையான இந்திய கைவினைஞர்களிடமிருந்து அசல் கைவினைப் பொருட்களை கண்டறிந்து கொள்ளுங்கள். உங்கள் பயணத்தை தொடங்குவோம்.",
      "tutorial.buyer.step2.title": "கலை வகைகளை ஆராயுங்கள்",
      "tutorial.buyer.step2.description": "ஓவியங்கள், நகைகள், துணிகள் மற்றும் பல போன்ற பல்வேறு வகைகளை உலாவுங்கள். ஒவ்வொரு துண்டும் ஒரு தனித்துவமான கதையை சொல்கிறது.",
      "tutorial.buyer.step3.title": "உங்கள் விருப்பங்களை சேமிக்கவும்",
      "tutorial.buyer.step3.description": "நீங்கள் விரும்பும் பொருட்களை சேமித்து உங்கள் விருப்பப்பட்டியலை உருவாக்குங்கள். ஒத்த பொருட்கள் சேர்க்கப்படும்போது அறிவிப்பு பெறுங்கள்.",
      "tutorial.buyer.step4.title": "தனிப்பயன் கலையை கோருங்கள்",
      "tutorial.buyer.step4.description": "ஒரு குறிப்பிட்ட பார்வை உள்ளதா? உங்கள் எண்ணங்களை உயிர்ப்பிக்கக்கூடிய கைவினைஞர்களிடமிருந்து தனிப்பயன் கலையை கோருங்கள்.",
      "tutorial.buyer.step5.title": "உங்கள் முதல் வாங்கலை முடிக்கவும்",
      "tutorial.buyer.step5.description": "இந்திய மரபின் ஒரு துண்டை வாங்க தயாரா? உங்கள் முதல் வாங்கலை செய்து உள்ளூர்க் கைவினைஞர்களை ஆதரிக்கவும்.",

      // Tutorial - Artisan
      "tutorial.artisan.step1.title": "DOTS க்கு வரவேற்கிறோம், கைவினைஞரே!",
      "tutorial.artisan.step1.description": "உலகெங்கும் வாங்குபவர்களுக்கு உங்கள் கைவினைத் திறனை வெளிப்படுத்துங்கள். உங்கள் கைவினைஞர் சுயவிவரத்தை அமைத்து உங்கள் படைப்புகளை விற்பனை செய்யத் தொடங்குவோம்.",
      "tutorial.artisan.step2.title": "உங்கள் சுயவிவரத்தை நிறைவு செய்யுங்கள்",
      "tutorial.artisan.step2.description": "உங்கள் கதை, நிபுணத்துவம் மற்றும் உங்கள் பணியின் அழகான புகைப்படங்களைச் சேர்க்கவும். முழுமையான சுயவிவரம் அதிக வாங்குபவர்களை ஈர்க்கிறது.",
      "tutorial.artisan.step3.title": "உங்கள் தயாரிப்புகளைச் சேர்க்கவும்",
      "tutorial.artisan.step3.description": "உங்கள் கைவினைப் பொருட்களின் உயர் தர புகைப்படங்களை பதிவேற்றவும். விரிவான விளக்கங்கள் மற்றும் விலை நிர்ணயத்தை உள்ளடக்கியதாக இருக்கும்.",
      "tutorial.artisan.step4.title": "உங்கள் ஆர்டர்களை நிர்வகிக்கவும்",
      "tutorial.artisan.step4.description": "உள்வரும் ஆர்டர்களை கண்காணிக்கவும், வாங்குபவர்களுடன் தொடர்பு கொள்ளவும், உங்கள் அழகான படைப்புகளின் தொடர்பான வழங்கலை உறுதிப்படுத்தவும்.",
      "tutorial.artisan.step5.title": "உங்கள் வணிகத்தை வளர்ச்சியடையச் செய்யுங்கள்",
      "tutorial.artisan.step5.description": "எது விற்கப்படுகிறது என்பதை புரிந்துகொள்ள பகுப்பாய்வுகளைப் பயன்படுத்தவும், தனிப்பயன் கோரிக்கைகளுக்கு பதிலளிக்கவும், வாங்குபவர்களுடன் நீடித்த உறவுகளை உருவாக்கவும்."
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