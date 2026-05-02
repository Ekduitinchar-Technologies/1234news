import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LanguageContext = createContext({
  language: 'English (US)',
  setLanguage: () => {},
});

const translations = {
  'English (US)': {
    featuredNews: 'Featured News',
    viewAll: 'View All',
    explainers: 'Explainers',
    trendingTopics: 'Trending Topics',
    topStories: 'Top Stories',
    latestNews: 'Latest News',
    polls: 'Polls',
    viewResults: 'View Results',
    votes: 'Votes',
    vote: 'Vote',
    savedArticles: 'Saved Articles',
    readingGoal: 'Reading Goal',
    readingGoalSub: 'Daily news consumption target',
    editProfile: 'Edit profile',
    settings: 'Settings',
    pushNotifications: 'Push Notifications',
    darkMode: 'Dark Mode',
    appLanguage: 'App Language',
    sources: 'Sources',
    logOut: 'Log Out',
    logIn: 'Log In / Register',
    noSavedArticles: 'No saved articles yet.\nBookmark articles on the home feed!',
    home: 'Home',
    news: 'News',
    profile: 'Profile',
    originalSource: 'Original Source',
    share: 'Share',
    save: 'Save',
    saved: 'Saved',
    discussion: 'Discussion',
    shareThoughts: 'Share your thoughts…',
    loadingStory: 'Loading full story...',
    justNow: 'Just now',
    guestReader: 'Guest Reader',
    articlesRead: 'Articles Read',
    commentsPosted: 'Comments Posted',
    min: 'MIN',
    chooseSources: 'Choose your preferred news sources',
    askAI: 'Ask AI',
    aiNewsAssistant: 'AI News Assistant',
    aiReadingSubtitle: 'I\'m reading this article with you.',
    askAnything: 'Ask anything…',
    interests: 'Interests',
    appearance: 'Appearance',
    languageSetting: 'Language',
    breakingNewsAlerts: 'Breaking News Alerts',
    seeMore: 'See more',
    viewAllProfile: 'View all',
  },
  'Nepali': {
    featuredNews: 'प्रमुख समाचार',
    viewAll: 'सबै हेर्नुहोस्',
    explainers: 'व्याख्याकर्ताहरू',
    trendingTopics: 'ट्रेन्डिङ विषयहरू',
    topStories: 'मुख्य समाचारहरू',
    latestNews: 'ताजा समाचार',
    polls: 'मतदान',
    viewResults: 'नतिजा हेर्नुहोस्',
    votes: 'मत',
    vote: 'मत दिनुहोस्',
    savedArticles: 'सुरक्षित गरिएका लेखहरू',
    readingGoal: 'पढ्ने लक्ष्य',
    readingGoalSub: 'दैनिक समाचार पढ्ने लक्ष्य',
    editProfile: 'प्रोफाइल सम्पादन गर्नुहोस्',
    settings: 'सेटिङहरू',
    pushNotifications: 'पुश सूचनाहरू',
    darkMode: 'डार्क मोड',
    appLanguage: 'एपको भाषा',
    sources: 'स्रोतहरू',
    logOut: 'लग आउट',
    logIn: 'लग इन / दर्ता गर्नुहोस्',
    noSavedArticles: 'कुनै लेख सुरक्षित गरिएको छैन।\nहोम फिडमा लेखहरू बुकमार्क गर्नुहोस्!',
    home: 'गृह',
    news: 'समाचार',
    profile: 'प्रोफाइल',
    originalSource: 'मूल स्रोत',
    share: 'सेयर गर्नुहोस्',
    save: 'सुरक्षित गर्नुहोस्',
    saved: 'सुरक्षित गरियो',
    discussion: 'छलफल',
    shareThoughts: 'आफ्नो विचार साझा गर्नुहोस्…',
    loadingStory: 'पूरा कथा लोड हुँदैछ...',
    justNow: 'भर्खरै',
    guestReader: 'अतिथि पाठक',
    articlesRead: 'पढिएका लेखहरू',
    commentsPosted: 'टिप्पणीहरू पोस्ट गरियो',
    min: 'मिनेट',
    chooseSources: 'आफ्नो मनपर्ने समाचार स्रोतहरू छान्नुहोस्',
    askAI: 'एआई लाई सोध्नुहोस्',
    aiNewsAssistant: 'एआई समाचार सहायक',
    aiReadingSubtitle: 'म तपाईंसँग यो लेख पढ्दै छु।',
    askAnything: 'केहि पनि सोध्नुहोस्…',
    interests: 'रुचिहरू',
    appearance: 'देखावट',
    languageSetting: 'भाषा',
    breakingNewsAlerts: 'ब्रेकिंग न्यूज अलर्ट',
    seeMore: 'थप हेर्नुहोस्',
    viewAllProfile: 'सबै हेर्नुहोस्',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('English (US)');

  useEffect(() => {
    const loadLang = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('APP_LANGUAGE');
        if (storedLang) {
          setLanguageState(storedLang);
        }
      } catch (e) {
        console.error('Failed to load language', e);
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (lang) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem('APP_LANGUAGE', lang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  const t = (key) => {
    const isNepali = language && language.includes('Nepali');
    const langKey = isNepali ? 'Nepali' : 'English (US)';
    return translations[langKey]?.[key] || translations['English (US)'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => React.useContext(LanguageContext);

export const useLocalizedArticle = (article) => {
  const { language } = useLanguage();
  if (!article) return article;
  
  const isNepali = language && language.includes('Nepali');
  if (isNepali) {
    return {
      ...article,
      title: article.title_np || article.title,
      summary: article.summary_np || article.summary,
      body: article.body_np || article.body,
    };
  } else {
    return {
      ...article,
      title: article.title_en || article.title,
      summary: article.summary_en || article.summary,
      body: article.body_en || article.body,
    };
  }
};

