"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "ta";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isTamil: boolean;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<string, { en: string; ta: string }> = {
  // Navigation
  "nav.home": { en: "Home", ta: "முகப்பு" },
  "nav.about": { en: "About", ta: "எங்களை பற்றி" },
  "nav.waterBodies": { en: "Water Bodies", ta: "நீர்நிலைகள்" },
  "nav.ourWork": { en: "Our Work", ta: "பணிகள்" },
  "nav.updates": { en: "Updates", ta: "களப் பதிவுகள்" },
  "nav.gallery": { en: "Gallery", ta: "கேலரி" },
  "nav.contact": { en: "Contact", ta: "தொடர்புக்கு" },
  "nav.donate": { en: "Donate", ta: "நன்கொடை" },
  "nav.languageBtn": { en: "தமிழ்", ta: "English" },

  // Hero Section
  "hero.title": { en: "Bringing Puduthangal Lake", ta: "புதுத்தாங்கல் ஏரி" },
  "hero.titleHighlight": { en: "Back to Life", ta: "மீண்டும் உயிர் பெறுகிறது" },
  "hero.subtitle": { en: "Restoring Chennai's Water Heritage", ta: "சென்னை நீர்நிலைகளை மீட்டெடுக்கும் மக்கள் இயக்கம்" },
  "hero.tagline": {
    en: "The lake on Mudichur Road, Tambaram, lay dry and neglected for 15–16 years. Since October 2026, we have cleared and reshaped it to harvest rainwater and protect 20,000 local families from monsoon floods. In October 2026, the water came back.",
    ta: "தாம்பரம் முடிச்சூர் சாலையில் உள்ள புதுத்தாங்கல் ஏரி 15–16 ஆண்டுகளாக வறண்டு கிடந்தது. 2026 அக்டோபர் முதல், மழைநீரைச் சேமிக்கவும் 20,000 குடும்பங்களை வெள்ளத்திலிருந்து பாதுகாக்கவும் ஏரியைத் தூர்வாரி சீரமைத்துள்ளோம். இப்போது தண்ணீர் நிறைந்துள்ளது.",
  },
  "hero.ctaDonate": { en: "Help the Work", ta: "பணிகளுக்கு உதவ" },
  "hero.ctaVideo": { en: "Watch Story Reel (2 min)", ta: "கள வீடியோ பார்க்க (2 நிமி)" },
  "hero.ctaProgress": { en: "See the Progress", ta: "பணிகளைப் பார்க்க" },
  "hero.stat1.val": { en: "15 Yrs", ta: "15 ஆண்டுகள்" },
  "hero.stat1.desc": { en: "Lake lay dry and neglected before work began", ta: "பணிகள் தொடங்கும் முன் வறண்டு கிடந்த காலம்" },
  "hero.stat2.val": { en: "16 Days", ta: "16 நாட்கள்" },
  "hero.stat2.desc": { en: "Continuous excavation to desilt and reshape bed", ta: "தொடர் இயந்திரப் பணிகள் மூலம் தூர்வாரப்பட்டது" },
  "hero.stat3.val": { en: "20,000", ta: "20,000" },
  "hero.stat3.desc": { en: "Local families protected from monsoon floods", ta: "வெள்ளப் பாதிப்பிலிருந்து பாதுகாக்கப்பட்ட குடும்பங்கள்" },
  "hero.stat4.val": { en: "30+", ta: "30+" },
  "hero.stat4.desc": { en: "Ponds and water bodies approved for restoration", ta: "மீட்டெடுக்க திட்டமிடப்பட்ட நீர்நிலைகள்" },

  // Video Banner Section
  "video.title": { en: "The Day the Water Came Back", ta: "நீர் மீண்டும் வந்த அந்த நாள்" },
  "video.desc": {
    en: "On 18 October 2026, after only 16 days of non-stop excavation and desilting, rainwater flowed into Puduthangal Lake for the first time in 15 years. Watch founder S. Shanthi recount the historic moment.",
    ta: "16 நாட்கள் தொடர் தூர்வாரும் பணிக்குப் பிறகு, 15 ஆண்டுகளுக்குப் பின் புதுத்தாங்கல் ஏரிக்கு மழைநீர் வந்த வரலாற்று தருணத்தை நிறுவனர் எஸ். சாந்தி விளக்குகிறார்.",
  },
  "video.btn": { en: "Watch Full Story", ta: "முழு வீடியோ பார்க்க" },
  "video.label": { en: "Documentary Reel", ta: "ஆவணப் பதிவு" },

  // Water Bodies Section
  "wb.sectionTitle": { en: "Restoring Neglected Lakes & Ponds", ta: "நீர்நிலைகள் மீட்பு பணிகள்" },
  "wb.sectionSubtitle": {
    en: "From the 15-year dry bed of Puduthangal Lake in Tambaram to village ponds across Tindivanam and Kanchipuram, we desilt, reshape, and plant palm saplings to retain rainwater and prevent floods.",
    ta: "தாம்பரம் புதுத்தாங்கல் ஏரி முதல் திண்டிவனம், காஞ்சிபுரம் கிராமப்புற குளங்கள் வரை தூர்வாரி, கரைகளில் பனை மரக்கன்றுகளை நட்டு நீர்வளத்தைப் பாதுகாக்கிறோம்.",
  },
  "wb.sponsorBtn": { en: "Sponsor a Water Body", ta: "நீர்நிலையை தத்தெடுக்க" },
  "wb.viewAllBtn": { en: "Explore All Water Bodies", ta: "அனைத்து நீர்நிலைகளையும் பார்க்க" },

  // Programs Section
  "programs.sectionTitle": { en: "More than Lakes: 25 Years of Welfare", ta: "25 ஆண்டுகால மகளிர் & மக்கள் நலப்பணிகள்" },
  "programs.sectionSubtitle": {
    en: "Alongside water bodies, our trust drives women's healthcare, trauma-informed survivor rehabilitation, micro-credit enterprises, and child tutoring.",
    ta: "நீர்நிலைகள் மீட்புடன் பெண்கள் நல்வாழ்வு, குடும்ப வன்முறையால் பாதிக்கப்பட்டோருக்கு ஆதரவு, சுயஉதவி குழுக்கள் மற்றும் கல்வி வழிகாட்டல் வழங்கி வருகிறோம்.",
  },
  "programs.viewAllBtn": { en: "View Comprehensive Program Details", ta: "விரிவான பணிகளைப் பார்க்க" },

  // About Section
  "about.title": { en: "A Women's Trust, Working for Our Water", ta: "ஐந்தருவி மகளிர் நல அறக்கட்டளை" },
  "about.desc": {
    en: "Five Falls Women's Welfare Trust is a registered trust (Regd. No. 87/2018) based in Selaiyur, East Tambaram, Chennai. For 25 years, we have empowered women and championed community water revival.",
    ta: "ஐந்தருவி மகளிர் நல அறக்கட்டளை (பதிவு எண்: 87/2018) சென்னை கிழக்கு தாம்பரம் சேலையூரில் இயங்கும் ஒரு பதிவு பெற்ற அறக்கட்டளையாகும். 25 ஆண்டுகளாக மகளிர் முன்னேற்றம் மற்றும் நீர்நிலைகள் பாதுகாப்பில் செயல்பட்டு வருகிறது.",
  },
  "about.journeyTitle": { en: "25 Years of Community Empowerment (2000–2026)", ta: "எங்கள் 25 ஆண்டுகால மக்கள் சேவை பயணம்" },
  "about.journeySubtitle": { en: "From five homemakers to a regional movement", ta: "ஐந்து பெண்களில் தொடங்கி இன்று ஒரு மக்கள் இயக்கமாக" },

  // Field Updates
  "updates.sectionTitle": { en: "Fresh Dispatches from the Field", ta: "களப் பதிவுகள் & செய்திகள்" },
  "updates.viewAll": { en: "View Full Updates Archive", ta: "அனைத்து களப் பதிவுகளையும் பார்க்க" },

  // Donation
  "donate.title": { en: "Help Keep the Machinery Running", ta: "பணிகள் தொடர நன்கொடை அளியுங்கள்" },
  "donate.desc": {
    en: "The machines and volunteers run entirely on public contributions. Sponsor vehicle hire, a day's diesel, or volunteer meals. Every contribution directly powers work on the ground.",
    ta: "எங்கள் இயந்திரங்களும் தொண்டர்களும் பொதுமக்களின் ஆதரவோடு மட்டுமே இயங்குகின்றனர். ஒரு நாள் டீசல் அல்லது உணவுச் செலவை ஏற்று உதவலாம்.",
  },
  "donate.bankUpi": { en: "Direct Bank UPI", ta: "வங்கி UPI எண்" },
  "donate.copyUpi": { en: "Copy UPI ID", ta: "UPI நகலெடுக்க" },
  "donate.copied": { en: "Copied!", ta: "நகலெடுக்கப்பட்டது!" },
  "donate.scanQr": { en: "Scan QR with any UPI App", ta: "GPay / PhonePe மூலம் ஸ்கேன் செய்க" },

  // Footer
  "footer.wordmark": { en: "FIVE FALLS", ta: "நீருக்கு நன்றி" },
  "footer.tagline": { en: "Gratitude to Water · Restoring Chennai's Lakes & Empowering Communities", ta: "நீருக்கு நன்றி · ஏரிகளை மீட்போம், மக்களை காப்போம்" },
  "footer.trustName": { en: "Five Falls Women's Welfare Trust", ta: "ஐந்தருவி மகளிர் நல அறக்கட்டளை" },
  "footer.regNo": { en: "Regd. No. 87/2018 · Selaiyur, East Tambaram, Chennai - 600073", ta: "பதிவு எண்: 87/2018 · சேலையூர், கிழக்கு தாம்பரம், சென்னை - 600073" },
  "footer.rights": { en: "All rights reserved. Citizen-led lake restoration movement.", ta: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. மக்கள் இயக்கம்." },

  // Common
  "common.volunteer": { en: "Volunteer with Us", ta: "தன்னார்வலராக இணைய" },
  "common.learnMore": { en: "Learn More", ta: "மேலும் அறிய" },
  "common.viewGallery": { en: "View Gallery", ta: "கேலரி பார்க்க" },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  isTamil: false,
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("5falls_lang") as Language | null;
      if (saved === "en" || saved === "ta") {
        setLanguageState(saved);
      }
    } catch {
      // ignore localstorage errors
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("5falls_lang", lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "ta" : "en";
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return language === "ta" ? entry.ta : entry.en;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isTamil: language === "ta",
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
