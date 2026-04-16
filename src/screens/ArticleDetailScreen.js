import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
  TextInput, KeyboardAvoidingView, Platform, Linking, Share,
  Animated, StatusBar, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  auth, 
  subscribeArticleComments, 
  postArticleComment, 
  toggleArticleCommentLike, 
  logBehaviour, 
  toggleSaveArticle, 
  subscribeBookmarks, 
  isArticleSaved,
  getArticleById
} from '../services/firebaseService';

const categoryColors = {
  tech:          { bg: '#e2e8f0', text: '#334155' },
  world:         { bg: '#dcfce7', text: '#15803d' },
  business:      { bg: '#fef9c3', text: '#a16207' },
  science:       { bg: '#e2e8f0', text: '#334155' },
  health:        { bg: '#fee2e2', text: '#b91c1c' },
  sports:        { bg: '#ffedd5', text: '#c2410c' },
  entertainment: { bg: '#fce7f3', text: '#be185d' },
};

const colors = {
  primary: '#526075',
  surfaceLow: '#f1f5f9',
  onSurface: '#1e293b',
  onSurfaceVariant: '#64748b',
};

// ─── Ad Banner Component ───────────────────────────────────────────
function AdBanner({ variant = 'a' }) {
  const ads = {
    a: {
      bg:    ['#1e293b', '#334155'],
      label: 'SPONSORED',
      title: 'Upgrade your reading experience',
      sub:   'Go ad-free with NEWS६९ Premium · ₹99/month',
      cta:   'Try Free',
      icon:  'workspace-premium',
    },
    b: {
      bg:    ['#4f46e5', '#7c3aed'],
      label: 'ADVERTISEMENT',
      title: 'Markets move fast. Stay ahead.',
      sub:   'Real-time portfolio tracking · Zerodha Kite',
      cta:   'Open App',
      icon:  'trending-up',
    },
  };
  const ad = ads[variant];
  return (
    <LinearGradient colors={ad.bg} style={adStyles.container} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={adStyles.topRow}>
        <Text style={adStyles.label}>{ad.label}</Text>
        <MaterialIcons name="info-outline" size={14} color="rgba(255,255,255,0.4)" />
      </View>
      <View style={adStyles.body}>
        <View style={adStyles.adIcon}>
          <MaterialIcons name={ad.icon} size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={adStyles.title}>{ad.title}</Text>
          <Text style={adStyles.sub}>{ad.sub}</Text>
        </View>
        <TouchableOpacity style={adStyles.cta}>
          <Text style={adStyles.ctaText}>{ad.cta}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const adStyles = StyleSheet.create({
  container: { borderRadius: 16, padding: 16, marginVertical: 4 },
  topRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label:     { fontFamily: 'Inter_600SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5 },
  body:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  adIcon:    { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  title:     { fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#fff', marginBottom: 2 },
  sub:       { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  cta:       { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  ctaText:   { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#1e293b' },
});

// ─── Comment Item ─────────────────────────────────────────────────
function CommentItem({ articleId, item }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(item.likes || 0);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (auth.currentUser && item.likedBy?.includes(auth.currentUser.uid)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
    setCount(item.likes || 0);
  }, [item]);

  const handleLike = async () => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      alert("Please log in from your profile to like comments.");
      return;
    }
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, speed: 30 }),
      Animated.spring(scale, { toValue: 1,   useNativeDriver: true, speed: 30 }),
    ]).start();
    const nowLiked = await toggleArticleCommentLike(articleId, item.id);
    if (nowLiked !== null) {
      setLiked(nowLiked);
      setCount((c) => nowLiked ? c + 1 : c - 1);
    }
  };

  const formattedTime = item.createdAt 
    ? new Date(item.createdAt).toLocaleDateString()
    : item.time || 'Just now';

  return (
    <View style={cStyles.row}>
      <Image source={{ uri: item.photoUrl || item.avatar || 'https://picsum.photos/seed/user/100/100' }} style={cStyles.avatar} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={cStyles.nameRow}>
          <Text style={cStyles.name}>{item.displayName || item.author}</Text>
          <Text style={cStyles.time}>{formattedTime}</Text>
        </View>
        <Text style={cStyles.text}>{item.text}</Text>
        <TouchableOpacity onPress={handleLike} style={cStyles.likeRow}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <MaterialIcons name={liked ? 'thumb-up' : 'thumb-up-off-alt'} size={16} color={liked ? '#526075' : '#94a3b8'} />
          </Animated.View>
          <Text style={[cStyles.likeCount, liked && { color: '#526075' }]}>{count}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cStyles = StyleSheet.create({
  row:      { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  avatar:   { width: 38, height: 38, borderRadius: 19, backgroundColor: '#e2e8f0' },
  nameRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name:     { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#1e293b' },
  time:     { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#94a3b8' },
  text:     { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#334155', lineHeight: 20 },
  likeRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  likeCount:{ fontFamily: 'Inter_500Medium', fontSize: 12, color: '#94a3b8' },
});

// ─── Main Screen ──────────────────────────────────────────────────
export default function ArticleDetailScreen({ route, navigation }) {
  const { article: initialArticle } = route.params;
  const insets = useSafeAreaInsets();
  
  const [article,      setArticle]      = useState(initialArticle);
  const [fullLoading,  setFullLoading]  = useState(!initialArticle.fullBody);
  const catColor = categoryColors[article.category] || categoryColors.tech;

  const [liked,        setLiked]        = useState(false);
  const [likeCount,    setLikeCount]    = useState(article.likes ?? 0);
  const [commentText,  setCommentText]  = useState('');
  const [allComments,  setAllComments]  = useState([]);
  const [isSaved,      setIsSaved]      = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;
  const scrollRef  = useRef(null);

  useEffect(() => {
    logBehaviour(article, 'read');
    
    // If article is partial (no fullBody), fetch it
    if (!article.fullBody) {
      setFullLoading(true);
      getArticleById(article.id).then(fullArt => {
        if (fullArt) setArticle(fullArt);
        setFullLoading(false);
      }).catch(() => setFullLoading(false));
    }

    const unsubComments = subscribeArticleComments(article.id, setAllComments);
    const unsubBookmarks = subscribeBookmarks((bookmarks) => {
      const saved = bookmarks.some(b => b.articleId === article.id);
      setIsSaved(saved);
    });
    return () => {
      unsubComments();
      unsubBookmarks();
    };
  }, [article.id]);

  const handleLike = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true, speed: 25 }),
      Animated.spring(heartScale, { toValue: 1,   useNativeDriver: true, speed: 25 }),
    ]).start();
    setLiked((v) => !v);
    setLikeCount((v) => (liked ? v - 1 : v + 1));
  };

  const handleShare = async () => {
    try {
      await Share.share({ title: article.title, message: `${article.title}\n\nShared from NEWS६९` });
    } catch (_) {}
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      await postArticleComment(article.id, commentText);
      setCommentText('');
    } catch (err) {
      if (err.message === 'ANON') {
        alert("Please log in from your profile to comment on articles.");
      }
    }
  };

  const handleToggleSave = async () => {
    const nextSaved = await toggleSaveArticle(article);
    setIsSaved(nextSaved);
  };

  const formatLikes = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        enabled={Platform.OS !== 'web'}
      >
        <ScrollView 
          ref={scrollRef} 
          style={s.scroll} 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled" 
          stickyHeaderIndices={[]} 
        >

          {/* ── Hero Image ── */}
          <View style={s.heroWrap}>
            <Image source={{ uri: article.imageUrl }} style={s.heroImage} resizeMode="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Back button */}
            <TouchableOpacity
              style={[s.backBtn, { top: insets.top + 10 }]}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            {/* Share button */}
            <TouchableOpacity
              style={[s.shareBtn, { top: insets.top + 10 }]}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* ── Article Card ── */}
          <View style={s.card}>

            {/* Category badge only */}
            <View style={s.metaRow}>
              <View style={[s.catBadge, { backgroundColor: catColor.bg }]}>
                <Text style={[s.catText, { color: catColor.text }]}>{article.categoryLabel}</Text>
              </View>
            </View>

            {/* Title */}
            <Text style={s.title}>{article.title}</Text>

            {/* ── Ad Slot A ── */}
            <AdBanner variant="a" />

            {/* Summary */}
            <Text style={s.summary}>{article.summary}</Text>

            {/* Full Body */}
            {fullLoading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ marginTop: 10, color: '#94a3b8', fontSize: 13 }}>Loading full story...</Text>
              </View>
            ) : article.fullBody ? (
              <Text style={s.body}>{article.fullBody}</Text>
            ) : null}

            {/* ── Ad Slot B ── */}
            <AdBanner variant="b" />

            {/* ── Sources ── */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <MaterialIcons name="verified" size={16} color="#526075" />
                <Text style={s.sectionTitle}>Sources</Text>
              </View>
              {(article.sources || []).map((src, i) => (
                <TouchableOpacity
                  key={i}
                  style={s.sourceRow}
                  onPress={() => Linking.openURL(src.url).catch(() => {})}
                  activeOpacity={0.7}
                >
                  <View style={s.sourceIcon}>
                    <MaterialIcons name="open-in-new" size={14} color="#526075" />
                  </View>
                  <Text style={s.sourceLabel}>{src.label || src.name || src.source || 'Original Source'}</Text>
                  <MaterialIcons name="chevron-right" size={18} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Like & Stats bar ── */}
            <View style={s.engageBar}>
              <TouchableOpacity style={s.engageBtn} onPress={handleLike} activeOpacity={0.8}>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <MaterialIcons name={liked ? 'favorite' : 'favorite-border'} size={22} color={liked ? '#ef4444' : '#64748b'} />
                </Animated.View>
                <Text style={[s.engageCount, liked && { color: '#ef4444' }]}>{formatLikes(likeCount)}</Text>
              </TouchableOpacity>
              <View style={s.engageBtn}>
                <MaterialIcons name="chat-bubble-outline" size={20} color="#64748b" />
                <Text style={s.engageCount}>{allComments.length}</Text>
              </View>
              <TouchableOpacity style={s.engageBtn} onPress={handleToggleSave} activeOpacity={0.8}>
                <MaterialIcons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? colors.primary : "#64748b"} />
                <Text style={[s.engageCount, isSaved && { color: colors.primary }]}>{isSaved ? "Saved" : "Save"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.engageBtn} onPress={handleShare} activeOpacity={0.8}>
                <MaterialIcons name="share" size={20} color="#64748b" />
                <Text style={s.engageCount}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* ── Comments ── */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <MaterialIcons name="forum" size={16} color="#526075" />
                <Text style={s.sectionTitle}>Discussion</Text>
              </View>

              {/* Comment input */}
              <View style={s.commentInputWrap}>
                <Image source={{ uri: auth.currentUser && auth.currentUser.photoURL ? auth.currentUser.photoURL : 'https://picsum.photos/seed/me/100/100' }} style={s.userAvatar} />
                <TextInput
                  style={s.commentInput}
                  placeholder="Share your thoughts…"
                  placeholderTextColor="#94a3b8"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={280}
                />
                <TouchableOpacity
                  style={[s.postBtn, !commentText.trim() && { opacity: 0.35 }]}
                  onPress={handlePostComment}
                  disabled={!commentText.trim()}
                >
                  <MaterialIcons name="arrow-upward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Comment list */}
              {allComments.map((c) => (
                <CommentItem key={c.id} articleId={article.id} item={c} />
              ))}
            </View>

          </View>
          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#f8fafc' },
  scroll:       { flex: 1 },

  // Hero
  heroWrap:     { width: '100%', height: 280, position: 'relative' },
  heroImage:    { width: '100%', height: '100%' },
  backBtn:      { position: 'absolute', left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  shareBtn:     { position: 'absolute', right: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },

  // Card
  card:         { backgroundColor: '#fff', marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, gap: 16 },

  // Meta
  metaRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catBadge:     { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  catText:      { fontFamily: 'Inter_600SemiBold', fontSize: 12, letterSpacing: 0.3 },
  readRow:      { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readTime:     { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#94a3b8' },

  // Title
  title:        { fontFamily: 'Manrope_800ExtraBold', fontSize: 24, color: '#0f172a', lineHeight: 32, letterSpacing: -0.5 },

  // Author
  authorRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: '#526075' },
  authorName:   { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: '#334155' },
  dot:          { color: '#cbd5e1', fontFamily: 'Inter_400Regular' },
  publishedAt:  { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#94a3b8' },

  // Content
  summary:      { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#1e293b', lineHeight: 26 },
  body:         { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#334155', lineHeight: 26 },

  // Section
  section:      { gap: 0 },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#1e293b' },
  commentCountBadge: { backgroundColor: '#526075', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  commentCountText:  { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#fff' },

  // Sources
  sourceRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  sourceIcon:   { width: 32, height: 32, borderRadius: 10, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  sourceLabel:  { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: '#334155' },

  // Engagement bar
  engageBar:    { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f1f5f9', paddingVertical: 12, justifyContent: 'space-around' },
  engageBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  engageCount:  { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#64748b' },

  // Comment input
  commentInputWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 8, paddingVertical: 4 },
  userAvatar:       { width: 36, height: 36, borderRadius: 18 },
  commentInput:     { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontFamily: 'Inter_400Regular', fontSize: 14, color: '#1e293b', maxHeight: 100 },
  postBtn:          { width: 38, height: 38, borderRadius: 19, backgroundColor: '#526075', alignItems: 'center', justifyContent: 'center' },
});
