import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, Platform,
  FlatList, useWindowDimensions, Share, Modal, TextInput,
  KeyboardAvoidingView, ScrollView, ActivityIndicator, Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import GlobalHeader from '../components/GlobalHeader';

import { auth, logBehaviour, getFeaturedArticles, toggleSaveArticle, subscribeBookmarks, isArticleSaved } from '../services/firebaseService';
import { timeAgo } from '../utils/timeUtils';
import { getSourceLogoByName } from '../data/sources';

// ─────────────────────────────────────────────────────────────────
// AI ASSISTANT — Gemini API Integration
// ─────────────────────────────────────────────────────────────────
async function generateAIResponse(userMessage, article) {
  // Use a hardcoded placeholder API key if no env variable is loaded in expo.
  // We recommend using process.env.EXPO_PUBLIC_GEMINI_API_KEY in a .env file.
  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    return 'I cannot respond yet! Please add your EXPO_PUBLIC_GEMINI_API_KEY to the .env file to enable Gemini AI.';
  }

  const title = article?.title ?? 'a news article';
  const cat = article?.categoryLabel ?? 'News';
  const auth = article?.author ?? 'an unnamed author';
  const summ = article?.summary ?? '';
  const full = article?.fullBody ?? '';

  const systemPrompt = `You are an expert AI news analyst for the '1234News' app. 
Your goal is to provide insightful, comprehensive, and detailed answers to the user's questions based on the provided article content. 
Title: ${title}
Category: ${cat}
Author: ${auth}
Summary: ${summ}
Full Content: ${full}

Please provide complete detailed explanations (ideally 1 paragraph (less than 100words) for summaries or complex questions) with a professional and journalistic tone. Focus on depth and context rather than brevity. Do not use markdown unless formatting a list.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${userMessage}` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
      })
    });

    if (!response.ok) {
      console.error("Gemini Error:", await response.text());
      return "I'm having trouble connecting to the AI service. Please check your API key.";
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return replyText ? replyText.trim() : "Sorry, I couldn't understand that.";
  } catch (error) {
    console.error("Gemini catch error:", error);
    return "Network error. Please make sure you are connected to the internet.";
  }
}

// ─────────────────────────────────────────────────────────────────
// AI Chat Modal Component
// ─────────────────────────────────────────────────────────────────
function AIAssistantModal({ visible, onClose, article }) {
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Approximate distance from screen center to the bottom-right AI button
  const startTranslateX = screenW * 0.4;
  const startTranslateY = screenH * 0.4;

  const scaleAnim = useRef(new Animated.Value(0.01)).current;
  const transXAnim = useRef(new Animated.Value(startTranslateX)).current;
  const transYAnim = useRef(new Animated.Value(startTranslateY)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [internalVisible, setInternalVisible] = useState(visible);

  // Pop-in / pop-out animation
  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      // Reset to start position before animating in
      scaleAnim.setValue(0.05);
      transXAnim.setValue(startTranslateX);
      transYAnim.setValue(startTranslateY);
      opacAnim.setValue(0);
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(transXAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(transYAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(opacAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0.05, duration: 180, useNativeDriver: true }),
        Animated.timing(transXAnim, { toValue: startTranslateX, duration: 180, useNativeDriver: true }),
        Animated.timing(transYAnim, { toValue: startTranslateY, duration: 180, useNativeDriver: true }),
        Animated.timing(opacAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      ]).start(() => setInternalVisible(false));
    }
  }, [visible]);

  // Seed greeting when article changes
  useEffect(() => {
    if (visible && article) {
      setMessages([{
        id: 'init',
        role: 'assistant',
        text: `Hi! I am your AI assistant. I am reading:\n\n"${article.title}"\n\nAsk me anything about this story — a summary, fact-check, author background, or related topics.`,
      }]);
    }
  }, [visible, article?.id]);

  const SUGGESTIONS = [
    { icon: 'summarize', label: 'Summarise this story' },
    { icon: 'fact-check', label: 'Check the facts' },
    { icon: 'person-search', label: 'Who wrote this?' },
    { icon: 'insights', label: 'Why does it matter?' },
    { icon: 'compare-arrows', label: 'Other perspectives' },
    { icon: 'sentiment-neutral', label: 'Is it biased?' },
  ];

  const hasConversation = messages.length > 1;

  const handleSuggestion = (label) => {
    setInputText(label);
    setTimeout(() => { handleSendWith(label); }, 50);
  };

  const handleSendWith = (text) => {
    const msg = text || inputText;
    if (!msg.trim() || isLoading) return;
    const userMsg = { id: `u_${Date.now()}`, role: 'user', text: msg.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    const delay = 600 + Math.random() * 800;
    setTimeout(async () => {
      const response = await generateAIResponse(userMsg.text, article);
      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: 'assistant', text: response }]);
      setIsLoading(false);
      logBehaviour(article, 'ai_query');
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, delay);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <Modal visible={internalVisible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>

      {/* Animated blur+scrim — fades in/out with the panel, no flash on close */}
      <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: opacAnim }]} pointerEvents="none">
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
        <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.62)' }]} />
      </Animated.View>

      {/* KAV wraps the whole overlay so keyboard lifts the entire panel */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[aiStyles.overlay, { paddingTop: insets.top }]}>
          <Animated.View style={[aiStyles.panel, { transform: [{ translateX: transXAnim }, { translateY: transYAnim }, { scale: scaleAnim }], opacity: opacAnim }]}>

            {/* Header */}
            <View style={aiStyles.header}>
              <View style={aiStyles.headerLeft}>
                <View style={aiStyles.assistantIcon}>
                  <MaterialIcons name="auto-awesome" size={18} color="rgba(255,255,255,0.85)" />
                </View>
                <Text style={aiStyles.headerTitle}>Ask AI</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={aiStyles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="keyboard-arrow-down" size={26} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollRef}
              style={aiStyles.scrollArea}
              contentContainerStyle={[aiStyles.scrollContent, { paddingBottom: 16 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => hasConversation && scrollRef.current?.scrollToEnd({ animated: true })}
            >
              {/* Intro card */}
              {!hasConversation && (
                <View style={aiStyles.introCard}>
                  <View style={aiStyles.introIconWrap}>
                    <MaterialIcons name="auto-awesome" size={28} color="rgba(255,255,255,0.85)" />
                  </View>
                  <Text style={aiStyles.introHeading}>AI News Assistant</Text>
                  <Text style={aiStyles.introSub}>I'm reading this article with you.</Text>
                  {article && (
                    <View style={aiStyles.articlePill}>
                      <MaterialIcons name="article" size={13} color="rgba(255,255,255,0.7)" />
                      <Text style={aiStyles.articlePillText} numberOfLines={2}>{article.title}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Suggestion chips */}
              {!hasConversation && (
                <View style={aiStyles.suggestionsGrid}>
                  {SUGGESTIONS.map((s) => (
                    <TouchableOpacity
                      key={s.label}
                      style={aiStyles.suggestionCard}
                      onPress={() => handleSuggestion(s.label)}
                      activeOpacity={0.65}
                    >
                      <MaterialIcons name={s.icon} size={20} color="rgba(255,255,255,0.75)" />
                      <Text style={aiStyles.suggestionText}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Chat messages */}
              {messages.slice(1).map((msg) => (
                <View key={msg.id} style={msg.role === 'user' ? aiStyles.userRow : aiStyles.aiRow}>
                  {msg.role === 'assistant' && (
                    <View style={aiStyles.aiBadge}>
                      <MaterialIcons name="auto-awesome" size={12} color="rgba(255,255,255,0.7)" />
                    </View>
                  )}
                  <View style={msg.role === 'user' ? aiStyles.userBubble : aiStyles.aiBubble}>
                    <Text style={msg.role === 'user' ? aiStyles.userText : aiStyles.aiText}>{msg.text}</Text>
                  </View>
                </View>
              ))}

              {/* Loading dots */}
              {isLoading && (
                <View style={aiStyles.aiRow}>
                  <View style={aiStyles.aiBadge}>
                    <MaterialIcons name="auto-awesome" size={12} color="rgba(255,255,255,0.7)" />
                  </View>
                  <View style={[aiStyles.aiBubble, { paddingVertical: 14, paddingHorizontal: 20 }]}>
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input bar — no inner KAV, outer KAV handles keyboard */}
            <View style={[aiStyles.inputBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TextInput
                ref={inputRef}
                style={aiStyles.input}
                placeholder="Ask anything…"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={300}
                onSubmitEditing={() => handleSendWith()}
              />
              <TouchableOpacity
                style={[aiStyles.sendBtn, (!inputText.trim() || isLoading) && { opacity: 0.35 }]}
                onPress={() => handleSendWith()}
                disabled={!inputText.trim() || isLoading}
              >
                <MaterialIcons name="arrow-upward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// HomeScreen
// ─────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [savedIds, setSavedIds] = useState([]);
  const [aiVisible, setAiVisible] = useState(false);

  const isAutoPlayingRef = useRef(isAutoPlaying);
  const currentIndexRef = useRef(currentIndex);
  const flatListRef = useRef(null);
  const readSpecificArticleRef = useRef(null);

  const [articles, setArticles] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load featured articles on mount
  useEffect(() => {
    getFeaturedArticles().then(data => {
      setArticles(data);
      setIsLoadingData(false);
      if (data.length > 0) {
        logBehaviour(data[0], 'read');
      }
    });
  }, []);

  // Live bookmarks subscription
  useEffect(() => {
    return subscribeBookmarks((bookmarks) => {
      setSavedIds(bookmarks.map(b => b.articleId));
    });
  }, []);

  const handleSave = async (article) => {
    await toggleSaveArticle(article);
  };

  const handleShare = async (article) => {
    try {
      await Share.share({
        title: article.title,
        message: `${article.title}\n\n${article.summary}\n\nShared from NEWS69`,
      });
    } catch (_) { }
  };

  useEffect(() => { isAutoPlayingRef.current = isAutoPlaying; }, [isAutoPlaying]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const articleStartTimeRef = useRef(Date.now());
  const activeArticle = articles[currentIndex] || articles[0];

  const handleIndexUpdate = (newIndex) => {
    if (newIndex >= 0 && newIndex < articles.length && newIndex !== currentIndexRef.current) {

      // Log behavior for the PREVIOUS article we just scrolled away from
      const prevArticle = articles[currentIndexRef.current];
      if (prevArticle) {
        const timeSpentMs = Date.now() - articleStartTimeRef.current;
        const type = timeSpentMs < 2000 ? 'skip' : 'read';
        logBehaviour(prevArticle, type, { readDurationMs: timeSpentMs });
      }

      // Update index & reset timer
      setCurrentIndex(newIndex);
      currentIndexRef.current = newIndex;
      articleStartTimeRef.current = Date.now();

      if (isAutoPlayingRef.current) {
        readSpecificArticleRef.current(newIndex);
      } else {
        Speech.stop();
        setIsSpeaking(false);
      }
    }
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const viewHeight = event.nativeEvent.layoutMeasurement.height;
    if (viewHeight > 0) {
      const newIndex = Math.round(offsetY / viewHeight);
      handleIndexUpdate(newIndex);
    }
  };

  readSpecificArticleRef.current = (index) => {
    const article = articles[index];
    if (!article) return;
    Speech.stop();
    setIsSpeaking(true);
    const textToSpeak = `${article.title}. \n\n ${article.summary}`;
    Speech.speak(textToSpeak, {
      rate: 0.9,
      pitch: 1.0,
      onStart: () => setIsSpeaking(true),
      onDone: () => {
        if (isAutoPlayingRef.current) {
          const nextIndex = index + 1;
          if (nextIndex < articles.length) {
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setTimeout(() => handleIndexUpdate(nextIndex), 400);
          } else {
            setIsAutoPlaying(false);
            setIsSpeaking(false);
          }
        } else {
          setIsSpeaking(false);
        }
      },
      onStopped: () => { if (!isAutoPlayingRef.current) setIsSpeaking(false); },
      onError: () => { if (!isAutoPlayingRef.current) setIsSpeaking(false); },
    });
  };

  const handlePlayAudio = () => {
    if (isAutoPlaying) {
      Speech.stop();
      setIsAutoPlaying(false);
      setIsSpeaking(false);
    } else {
      setIsAutoPlaying(true);
      readSpecificArticleRef.current(currentIndexRef.current);
    }
  };

  useEffect(() => {
    return () => { Speech.stop(); };
  }, []);

  const renderItem = ({ item }) => (
    <View style={{ width, height, backgroundColor: '#000' }}>
      <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <View style={styles.staticScrim} />
      <LinearGradient
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.mainContent}>
        <TouchableOpacity
          style={styles.newsBlock}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('ArticleDetail', { article: item })}
        >
          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            <View style={styles.sourcesContainer}>
              {(item.sources && item.sources.length > 0) ? (
                <>
                  {item.sources.slice(0, 3).map((src, idx) => {
                    const logoUrl = getSourceLogoByName(src.label || src.name || src.source) || src.iconUrl || src.logo;
                    return (
                    <View key={idx} style={[styles.sourceAvatar, { zIndex: 3 - idx, marginLeft: idx === 0 ? 0 : -10 }]}>
                      {logoUrl ? (
                        <Image source={{ uri: logoUrl }} style={styles.avatarImage} />
                      ) : (
                        <View style={[styles.avatarImage, { backgroundColor: '#526075', alignItems: 'center', justifyContent: 'center' }]}>
                          <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Inter_700Bold' }}>
                            {(src.label || src.name || src.source || 'L')[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                    );
                  })}
                  <Text style={styles.sourceText}>
                    {item.sources.length > 3
                      ? `+${item.sources.length - 3} Sources`
                      : (item.sources.length === 3 ? '' : (item.sources[0].label || item.sources[0].name || item.sources[0].source))}
                  </Text>
                </>
              ) : (
                <View style={styles.sourcesContainer}>
                  <View style={styles.sourceAvatar}>
                    <View style={[styles.avatarImage, { backgroundColor: '#526075', alignItems: 'center', justifyContent: 'center' }]}>
                      <MaterialIcons name="newspaper" size={14} color="#fff" />
                    </View>
                  </View>
                  <Text style={styles.sourceText}>Lucid News</Text>
                </View>
              )}
            </View>
            <Text style={styles.timeText}>{timeAgo(item.publishedAt)}</Text>
          </View>

          <Text style={styles.headlineText}>{item.title}</Text>
          <Text style={styles.bodyText}>{item.summary}</Text>
        </TouchableOpacity>

        {/* Action Buttons — Left and Right */}
        <View style={[styles.actionButtonsContainer, { bottom: Math.max(insets.bottom, 24) + 80 }]}>

          <View style={styles.leftActions}>
            {/* Save */}
            <View style={styles.actionItem}>
              <TouchableOpacity
                style={[styles.actionBtn, savedIds.includes(item.id) && styles.actionBtnActive]}
                activeOpacity={0.75}
                onPress={() => handleSave(item)}
              >
                <MaterialIcons
                  name={savedIds.includes(item.id) ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={savedIds.includes(item.id) ? '#3b82f6' : '#fff'}
                />
              </TouchableOpacity>
            </View>

            {/* Share */}
            <View style={styles.actionItem}>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.75}
                onPress={() => handleShare(item)}
              >
                <MaterialIcons name="share" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Assistant (Right side) */}
          <View style={styles.actionItem}>
            <TouchableOpacity
              style={styles.aiActionBtn}
              activeOpacity={0.75}
              onPress={() => setAiVisible(true)}
            >
              <MaterialIcons name="auto-awesome" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </View>
  );

  if (isLoadingData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
      />

      {/* Global Header */}
      <GlobalHeader
        rightComponent={
          <TouchableOpacity onPress={handlePlayAudio} activeOpacity={0.8} style={styles.audioBtn}>
            <MaterialIcons name={isSpeaking ? 'stop' : 'record-voice-over'} size={20} color="#c1c0c0ff" />
          </TouchableOpacity>
        }
      />

      {/* AI Assistant Modal */}
      <AIAssistantModal
        visible={aiVisible}
        onClose={() => setAiVisible(false)}
        article={activeArticle}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// STYLES — HomeScreen
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  staticScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  mainContent: { flex: 1, zIndex: 20, width: '100%' },
  newsBlock: { flex: 1, width: '100%', justifyContent: 'center', paddingHorizontal: 20, maxWidth: 500, alignSelf: 'center', paddingBottom: 60 },
  metadataRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  sourcesContainer: { flexDirection: 'row', alignItems: 'center' },
  sourceAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', backgroundColor: '#fff', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  sourceText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#fff', marginLeft: 16, letterSpacing: 0.5 },
  timeText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1.5 },
  headlineText: { fontFamily: 'Manrope_800ExtraBold', fontSize: 30, color: '#fff', lineHeight: 36, letterSpacing: -0.5, marginBottom: 16 },
  bodyText: { fontFamily: 'Inter_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.9)', lineHeight: 22 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, position: 'absolute', alignSelf: 'center', maxWidth: 500 },
  leftActions: { flexDirection: 'row', gap: 20 },
  actionItem: { alignItems: 'center', gap: 6 },
  actionBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  actionBtnActive: { backgroundColor: 'rgba(255,255,255,0.95)' },
  aiActionBtn: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  actionLabel: { fontFamily: 'Inter_500Medium', fontSize: 11, color: 'rgba(255,255,255,0.75)', letterSpacing: 0.3 },
  audioBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});

// ─────────────────────────────────────────────────────────────────
// STYLES — AI Assistant Modal (liquid glass)
// ─────────────────────────────────────────────────────────────────
const aiStyles = StyleSheet.create({
  // Full screen overlay
  overlay: { flex: 1, justifyContent: 'flex-end', paddingHorizontal: 0 },
  panel: { flex: 1, borderTopLeftRadius: 0, borderTopRightRadius: 0, overflow: 'hidden', marginTop: 0 },

  // Header — subtle dark glass strip
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'rgba(0,0,0,0.25)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  assistantIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Manrope_700Bold', fontSize: 17, color: '#fff' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },

  // Scrollable body
  scrollArea: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24, gap: 20 },

  // Intro card — borderless glass
  introCard: { borderRadius: 20, padding: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  introIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  introHeading: { fontFamily: 'Manrope_800ExtraBold', fontSize: 19, color: '#fff', marginBottom: 5 },
  introSub: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.65)', marginBottom: 14, textAlign: 'center' },
  articlePill: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', width: '100%' },
  articlePillText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.85)', flex: 1, lineHeight: 18 },

  // Suggestion chips — tinted glass
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  suggestionCard: { width: '47%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  suggestionText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },

  // Chat rows
  aiRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, alignSelf: 'flex-start', maxWidth: '88%' },
  userRow: { alignSelf: 'flex-end', maxWidth: '82%' },
  aiBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: 2 },
  // AI bubble: cool blue-grey tint
  aiBubble: { backgroundColor: 'rgba(120,140,160,0.28)', borderRadius: 18, borderTopLeftRadius: 4, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  aiText: { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.92)', lineHeight: 22 },
  // User bubble: warm amber-sand tint
  userBubble: { backgroundColor: 'rgba(210,165,100,0.32)', borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,220,140,0.25)' },
  userText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#fff', lineHeight: 20 },

  // Input bar — dark glass tray
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(0,0,0,0.3)' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, paddingHorizontal: 18, paddingVertical: Platform.OS === 'ios' ? 12 : 10, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#fff', maxHeight: 120, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', flexShrink: 0, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
});
