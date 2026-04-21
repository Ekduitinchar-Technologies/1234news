import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Image,
  TouchableOpacity, Modal, FlatList, Dimensions, Platform, Share,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import GlobalHeader from '../components/GlobalHeader';

import {
  auth,
  getArticles,
  getTrending,
  getExplainers,
  subscribePolls,
  castPollVote,
  getPollVote,
  subscribeDiscussions,
  subscribeThreadComments,
  postThreadComment,
  toggleThreadCommentLike,
  getSpotlights
} from '../services/firebaseService';
import { timeAgo } from '../utils/timeUtils';
import { getSourceLogoByName } from '../data/sources';

const { width: SCREEN_W } = Dimensions.get('window');

const MARKET_TICKERS = [
  { symbol: 'S&P 500', value: '5,088.80', change: '+0.03%' },
  { symbol: 'NASDAQ', value: '15,996.82', change: '-0.28%' },
  { symbol: 'BTC', value: '$51,432', change: '+1.2%' },
  { symbol: 'GOOG', value: '$144.34', change: '-0.15%' },
  { symbol: 'AAPL', value: '$182.52', change: '+0.4%' },
  { symbol: 'TSLA', value: '$191.97', change: '-1.4%' },
];

// ─────────────────────────────────────────────────────────────────
// TickerBar — auto-scrolls; touch pauses
// ─────────────────────────────────────────────────────────────────
function TickerBar() {
  const scrollRef = useRef(null);
  const offsetRef = useRef(0);
  const isPaused  = useRef(false);
  const ITEM_W    = 148;
  const TOTAL_W   = MARKET_TICKERS.length * ITEM_W;
  const display   = [...MARKET_TICKERS, ...MARKET_TICKERS];

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused.current || !scrollRef.current) return;
      offsetRef.current += 1;
      if (offsetRef.current >= TOTAL_W) offsetRef.current = 0;
      scrollRef.current.scrollTo({ x: offsetRef.current, animated: false });
    }, 16);
    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onScrollBeginDrag={() => { isPaused.current = true; }}
      onScrollEndDrag={(e) => { offsetRef.current = e.nativeEvent.contentOffset.x; isPaused.current = false; }}
      onMomentumScrollEnd={(e) => { offsetRef.current = e.nativeEvent.contentOffset.x; }}
      contentContainerStyle={styles.tickerScroll}
    >
      {display.map((t, i) => (
        <View key={i} style={styles.tickerItem}>
          <Text style={styles.tickerLabel}>{t.label}</Text>
          <Text style={styles.tickerValue}>{t.value}</Text>
          <Text style={t.up ? styles.tickerUp : styles.tickerDown}>{t.change}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────
// SinglePoll — one swipeable poll page
// ─────────────────────────────────────────────────────────────────
function SinglePoll({ poll }) {
  const [options, setOptions] = useState([]);
  const [votedIdx, setVotedIdx] = useState(null);

  useEffect(() => { setOptions(poll.options || []); }, [poll.options]);

  useEffect(() => {
    getPollVote(poll.id).then((saved) => {
      if (saved !== null && saved !== undefined) setVotedIdx(saved);
    });
  }, [poll.id]);

  const totalVotes = options.reduce((s, o) => s + (o.votes || 0), 0);

  const handleVote = async (idx) => {
    if (votedIdx !== null) return;
    const res = await castPollVote(poll.id, idx);
    if (res?.error) {
      alert(res.error === 'anon' ? 'Please log in from your profile to vote.' : 'Error casting vote.');
      return;
    }
    setOptions(options.map((o, i) => i === idx ? { ...o, votes: (o.votes || 0) + 1 } : o));
    setVotedIdx(idx);
  };

  return (
    <View style={styles.pollPage}>
      <View style={styles.pollTopRow}>
        <View style={styles.pollCategoryBadge}>
          <Text style={styles.pollCategoryText}>{poll.category || 'Poll'}</Text>
        </View>
        {votedIdx !== null && <Text style={styles.pollTotal}>{totalVotes.toLocaleString()} votes</Text>}
      </View>
      <Text style={styles.pollQuestion}>{poll.question}</Text>
      <View style={styles.pollOptions}>
        {options.map((opt, idx) => {
          const pct      = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
          const isChosen = votedIdx === idx;
          const hasVoted = votedIdx !== null;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.pollOptionBtn, isChosen && styles.pollOptionBtnChosen]}
              onPress={() => handleVote(idx)}
              activeOpacity={hasVoted ? 1 : 0.75}
            >
              {hasVoted && (
                <View style={[styles.pollBarFill, { width: `${pct}%`, backgroundColor: isChosen ? 'rgba(82,96,117,0.18)' : 'rgba(82,96,117,0.07)' }]} />
              )}
              <Text style={[styles.pollOptionText, isChosen && { color: '#526075', fontFamily: 'Manrope_700Bold' }]}>{opt.text || opt.label || opt}</Text>
              {hasVoted
                ? <Text style={styles.pollPctText}>{pct}%</Text>
                : <MaterialIcons name="chevron-right" size={18} color="#c4cbd0" />
              }
            </TouchableOpacity>
          );
        })}
      </View>
      {votedIdx === null && <Text style={styles.pollHint}>Tap an option to cast your vote</Text>}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// PollsCarousel — horizontal paging carousel of polls
// ─────────────────────────────────────────────────────────────────
function PollsCarousel({ activeCategory }) {
  const [polls, setPolls] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);
  const POLL_W = SCREEN_W - 32;

  useEffect(() => {
    return subscribePolls(setPolls);
  }, []);

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / POLL_W);
    setActiveIndex(idx);
  };

  const displayPolls = useMemo(() => {
    return polls.filter(p => !p.category || activeCategory === 'All News' || activeCategory === 'For You' || p.category === activeCategory);
  }, [polls, activeCategory]);

  if (displayPolls.length === 0) return null;

  return (
    <View style={styles.pollsSection}>
      <View style={styles.pollHeaderRow}>
        <MaterialIcons name="analytics" size={22} color="#526075" />
        <Text style={styles.pollHeaderTitle}>Daily Polls</Text>
        <Text style={styles.pollPageIndicator}>{activeIndex + 1} / {displayPolls.length}</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={POLL_W}
        contentContainerStyle={{ gap: 0 }}
      >
        {displayPolls.map((poll) => (
          <View key={poll.id} style={{ width: POLL_W }}>
            <SinglePoll poll={poll} />
          </View>
        ))}
      </ScrollView>

      {/* Dot indicators */}
      <View style={styles.pollDots}>
        {displayPolls.map((_, i) => (
          <View key={i} style={[styles.pollDot, i === activeIndex && styles.pollDotActive]} />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// ContentGalleryModal — fullscreen swipeable gallery, image-only
// ─────────────────────────────────────────────────────────────────
function ContentGalleryModal({ item, visible, onClose }) {
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const urls = item?.contentImageUrls || [];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageHeights, setImageHeights] = useState({});
  const scrollRef = useRef(null);

  const handleShare = async (url) => {
    try {
      await Share.share({ message: item?.title || '', url });
    } catch (_) {}
  };

  const goLeft = () => {
    if (activeIndex > 0) {
      scrollRef.current?.scrollTo({ x: (activeIndex - 1) * width, animated: true });
      setActiveIndex(activeIndex - 1);
    }
  };

  const goRight = () => {
    if (activeIndex < urls.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
      setActiveIndex(activeIndex + 1);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {/* Close button top-right */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute', top: insets.top + 12, right: 16, zIndex: 30,
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: 'rgba(0,0,0,0.55)',
            justifyContent: 'center', alignItems: 'center',
          }}
        >
          <MaterialIcons name="close" size={20} color="#fff" />
        </TouchableOpacity>

        {urls.length > 0 ? (
          <>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveIndex(idx);
              }}
            >
              {urls.map((url, i) => {
                return (
                  <View key={i} style={{ width, height }}>
                    <Image 
                      source={{ uri: url }} 
                      style={{ width, height }} 
                      resizeMode="cover"
                    />
                    
                    {/* Share button bottom-right per image */}
                    <TouchableOpacity
                      onPress={() => handleShare(url)}
                      style={{
                        position: 'absolute', bottom: insets.bottom + 24, right: 20, zIndex: 20,
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        justifyContent: 'center', alignItems: 'center',
                      }}
                    >
                      <MaterialIcons name="share" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            {/* Dot indicators in the middle bottom */}
            {urls.length > 1 && (
              <View style={{ position: 'absolute', bottom: insets.bottom + 32, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6, pointerEvents: 'none' }}>
                {urls.map((_, i) => (
                  <View key={i} style={{ width: i === activeIndex ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialIcons name="image-not-supported" size={48} color="rgba(255,255,255,0.3)" />
            <Text style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12, fontFamily: 'Inter_400Regular' }}>No content images</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// TrendingCard — 4:5 portrait, image only, tap to open gallery
// ─────────────────────────────────────────────────────────────────
function TrendingCard({ item }) {
  const [modalVisible, setModalVisible] = useState(false);
  const cardW = 160;
  const cardH = cardW * (5 / 4);
  const titleImg = item.titleImageUrl || (item.imageUrls?.[0]) || null;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => setModalVisible(true)}
        delayPressIn={150} // Allows ScrollView to capture horizontal swipe first
      >
        <View style={{ width: cardW, height: cardH, borderRadius: 12, overflow: 'hidden', backgroundColor: '#dce4e8' }}>
          {titleImg ? (
            <Image source={{ uri: titleImg }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="trending-up" size={32} color="#c4cbd0" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <ContentGalleryModal item={item} visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// ExplainerCard — landscape 5:4 card, image only, tap to open gallery
// ─────────────────────────────────────────────────────────────────
function ExplainerCard({ item }) {
  const [modalVisible, setModalVisible] = useState(false);
  const cardW = SCREEN_W - 48;
  const cardH = cardW * 0.4; // Half height of previous landscape, ~21:9 ultra-wide portrait
  const titleImg = item.titleImageUrl || (item.imageUrls?.[0]) || null;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => setModalVisible(true)}
        style={{ width: cardW, marginRight: 16 }}
        delayPressIn={150} // Allows ScrollView to capture horizontal swipe first
      >
        <View style={{ width: cardW, height: cardH, borderRadius: 14, overflow: 'hidden', backgroundColor: '#dce4e8' }}>
          {titleImg ? (
            <Image source={{ uri: titleImg }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <MaterialIcons name="auto-stories" size={40} color="#c4cbd0" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <ContentGalleryModal item={item} visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Spotlight Integration
// ─────────────────────────────────────────────────────────────────
function SpotlightInterview({ spotlight }) {
  if (!spotlight) return null;
  return (
    <View style={styles.interviewSection}>
      <View style={styles.spotlightGradientWrapper}>
        <LinearGradient colors={['rgba(124,110,232,0.15)', 'rgba(34,197,94,0.05)']} style={StyleSheet.absoluteFillObject} />
      </View>
      <View style={styles.interviewBadge}>
        <Text style={styles.interviewBadgeText}>{spotlight.badge || 'SPOTLIGHT'}</Text>
      </View>
      <Text style={styles.interviewQuote}>
        "{spotlight.quote}"
      </Text>
      <View style={styles.interviewProfile}>
        {spotlight.authorAvatar ? (
          <Image source={{ uri: spotlight.authorAvatar }} style={styles.interviewAvatar} />
        ) : (
          <View style={[styles.interviewAvatar, { backgroundColor: '#526075' }]} />
        )}
        <View>
          <Text style={styles.interviewName}>{spotlight.authorName}</Text>
          <Text style={styles.interviewTitle}>{spotlight.authorTitle}</Text>
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// CommentRow — single comment with like + reply
// ─────────────────────────────────────────────────────────────────
function CommentRow({ threadId, comment, isReply, onReply }) {
  const [liked,     setLiked]     = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes ?? 0);

  useEffect(() => {
    if (auth.currentUser && comment.likedBy?.includes(auth.currentUser.uid)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
    setLikeCount(comment.likes ?? 0);
  }, [comment]);

  const handleLike = async () => {
    if (!auth.currentUser || auth.currentUser.isAnonymous) {
      alert("Please sign in from your profile to like comments.");
      return;
    }
    const nowLiked = await toggleThreadCommentLike(threadId, comment.id);
    if (nowLiked !== null) {
      setLiked(nowLiked);
      setLikeCount((c) => nowLiked ? c + 1 : c - 1);
    }
  };

  return (
    <View style={[styles.commentRow, isReply && styles.commentRowReply]}>
      {isReply && <View style={styles.replyLine} />}
      <View style={[styles.commentAvatar, comment.name === 'You' && { backgroundColor: '#526075' }]}>
        <Text style={[styles.commentInitials, comment.name === 'You' && { color: '#fff' }]}>
          {comment.initials}
        </Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeaderRow}>
          <Text style={styles.commentName}>{comment.name}</Text>
          <Text style={styles.commentTime}>{timeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.commentActionBtn} onPress={handleLike}>
            <MaterialIcons name={liked ? 'thumb-up' : 'thumb-up-off-alt'} size={14} color={liked ? '#526075' : '#a0aab0'} />
            <Text style={[styles.commentActionText, liked && { color: '#526075' }]}>{likeCount}</Text>
          </TouchableOpacity>
          {!isReply && (
            <TouchableOpacity style={styles.commentActionBtn} onPress={() => onReply(comment)}>
              <MaterialIcons name="reply" size={14} color="#a0aab0" />
              <Text style={styles.commentActionReply}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// DiscussionModal — full thread view
// ─────────────────────────────────────────────────────────────────
function DiscussionModal({ thread, visible, onClose }) {
  const insets = useSafeAreaInsets();
  const [allComments,  setAllComments]  = useState([]);
  const [newText,      setNewText]      = useState('');
  const [replyingTo,   setReplyingTo]   = useState(null); // comment object
  const inputRef = useRef(null);

  useEffect(() => {
    if (!thread) return;
    return subscribeThreadComments(thread.id, (comments) => {
      const parents = comments.filter(c => !c.parentCommentId);
      const replies = comments.filter(c => c.parentCommentId);
      parents.forEach(p => {
        p.replies = replies.filter(r => r.parentCommentId === p.id);
      });
      setAllComments(parents);
    });
  }, [thread]);

  const handlePost = async () => {
    if (!newText.trim() || !thread) return;
    try {
      await postThreadComment(thread.id, newText, replyingTo?.id ?? null);
      setNewText('');
      setReplyingTo(null);
    } catch (err) {
      if (err.message === 'ANON') {
        alert("Please log in from your profile to comment.");
      }
    }
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (!thread) return null;

  const renderComment = ({ item }) => (
    <View>
      <CommentRow threadId={thread.id} comment={item} isReply={false} onReply={handleReply} />
      {(item.replies ?? []).map((reply) => (
        <CommentRow key={reply.id} threadId={thread.id} comment={reply} isReply onReply={() => {}} />
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <MaterialIcons name="close" size={24} color="#2c3437" />
            </TouchableOpacity>
            <View style={styles.modalHeaderText}>
              <Text style={styles.modalTitle} numberOfLines={2}>{thread.title}</Text>
              <View style={styles.modalMetaRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{thread.category}</Text>
                </View>
                <Text style={styles.modalMeta}>{thread.totalComments} comments</Text>
                <Text style={styles.modalMeta}>·</Text>
                <Text style={styles.modalMeta}>{thread.totalLikes} likes</Text>
              </View>
            </View>
          </View>

          {/* Comments list */}
          <FlatList
            data={allComments}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
            contentContainerStyle={styles.commentsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled" 
            ListEmptyComponent={
              <Text style={styles.emptyComments}>Be the first to comment!</Text>
            }
          />

          {/* Reply banner */}
          {replyingTo && (
            <View style={styles.replyBanner}>
              <MaterialIcons name="reply" size={16} color="#526075" />
              <Text style={styles.replyBannerText} numberOfLines={1}>
                Replying to <Text style={{ fontFamily: 'Manrope_700Bold' }}>{replyingTo.name}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <MaterialIcons name="close" size={16} color="#526075" />
              </TouchableOpacity>
            </View>
          )}

          {/* Input bar */}
          <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TextInput
              ref={inputRef}
              style={styles.inputField}
              placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : 'Share your take...'}
              placeholderTextColor="#9ca3af"
              value={newText}
              onChangeText={setNewText}
              multiline
            />
            <TouchableOpacity
              style={[styles.postIconBtn, !newText.trim() && { opacity: 0.4 }]}
              onPress={handlePost}
              disabled={!newText.trim()}
            >
              <MaterialIcons name="send" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────
// DiscussionPreviewCard — compact card shown in the feed
// ─────────────────────────────────────────────────────────────────
function DiscussionPreviewCard({ thread, onPress }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(thread.totalLikes || 0);
  const topComment = thread.topComment || null;

  return (
    <TouchableOpacity style={styles.discPreviewCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.discPreviewHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{thread.category || 'General'}</Text>
        </View>
      </View>
      <Text style={styles.discPreviewTitle}>{thread.title}</Text>
      {topComment && (
        <View style={styles.topCommentPreview}>
          <View style={styles.topCommentAvatar}>
            <Text style={styles.topCommentInitials}>{topComment.initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.topCommentName}>{topComment.name}</Text>
            <Text style={styles.topCommentText} numberOfLines={2}>{topComment.text}</Text>
          </View>
        </View>
      )}
      {/* Like & Comment action row */}
      <View style={styles.discPreviewFooter}>
        <TouchableOpacity
          style={styles.discActionBtn}
          onPress={(e) => { e.stopPropagation?.(); setLiked(v => !v); setLikeCount(c => liked ? c - 1 : c + 1); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name={liked ? 'favorite' : 'favorite-border'} size={15} color={liked ? '#ef4444' : '#747c80'} />
          <Text style={[styles.discActionText, liked && { color: '#ef4444' }]}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.discActionBtn} onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="chat-bubble-outline" size={15} color="#747c80" />
          <Text style={styles.discActionText}>{thread.totalComments || 0}</Text>
        </TouchableOpacity>
        <Text style={styles.discViewAll}>View discussion →</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─────────────────────────────────────────────────────────────────
// DiscussionsSection — list of 3 preview cards + modal
// ─────────────────────────────────────────────────────────────────
function DiscussionsSection() {
  const [selectedThread, setSelectedThread] = useState(null);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    return subscribeDiscussions(setThreads);
  }, []);

  if (threads.length === 0) return null;

  return (
    <View style={styles.discussionSection}>
      <Text style={styles.sectionTitle}>Top Discussions</Text>
      <View style={styles.discList}>
        {threads.map((thread) => (
          <DiscussionPreviewCard
            key={thread.id}
            thread={thread}
            onPress={() => setSelectedThread(thread)}
          />
        ))}
      </View>
      <DiscussionModal
        thread={selectedThread}
        visible={!!selectedThread}
        onClose={() => setSelectedThread(null)}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// NewsScreen — main screen
// ─────────────────────────────────────────────────────────────────
export default function NewsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [activeCategory, setActiveCategory] = useState('All News');
  const [searchText, setSearchText]         = useState('');
  
  const [dbArticles, setDbArticles] = useState([]);
  const [dbTrending, setDbTrending] = useState([]);
  const [dbExplainers, setDbExplainers] = useState([]);
  const [dbSpotlights, setDbSpotlights] = useState([]);

  const CATEGORIES = ['All News', 'Tech', 'World', 'Business', 'Science', 'Health', 'Sports', 'Entertainment'];

  useEffect(() => {
    getArticles().then(setDbArticles);
    getTrending().then(setDbTrending);
    getExplainers().then(setDbExplainers);
    getSpotlights().then(setDbSpotlights);
  }, []);

  const baseArticles = activeCategory === 'All News' 
    ? dbArticles 
    : dbArticles.filter(a => a.categoryLabel === activeCategory);
    
  const filteredArticles = searchText.trim()
    ? baseArticles.filter(
        (n) =>
          (n.title || '').toLowerCase().includes(searchText.toLowerCase()) ||
          (n.tag || '').toLowerCase().includes(searchText.toLowerCase())
      )
    : baseArticles;

  const filteredExplainers = dbExplainers.filter(
    (e) => activeCategory === 'All News' || activeCategory === 'For You' || e.category === activeCategory
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 24) + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginHorizontal: -16, marginBottom: 24 }}>
          <GlobalHeader isScrollable />
        </View>

        {/* Market Ticker */}
        <View style={styles.tickerContainer}><TickerBar /></View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#747c80" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Explore current events..."
            placeholderTextColor="#747c80"
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={20} color="#747c80" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={activeCategory === cat ? styles.categoryChipActive : styles.categoryChipInactive}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={activeCategory === cat ? styles.categoryChipTextActive : styles.categoryChipTextInactive}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Spotlights (below categories) */}
        {dbSpotlights.length > 0 && <SpotlightInterview spotlight={dbSpotlights[0]} />}

        {/* Article Feed */}
        <View style={styles.sectionContainer}>
          {filteredArticles.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color="#c4cbd0" />
              <Text style={styles.emptyStateText}>No articles found</Text>
            </View>
          ) : (
            filteredArticles.map((item) => (
              <TouchableOpacity key={item.id} style={styles.feedItem} activeOpacity={0.85} onPress={() => navigation.navigate('ArticleDetail', { article: item })}>
                <Image source={{ uri: item.imageUrl || item.img }} style={styles.feedImage} />
                <View style={styles.feedContent}>
                  <Text style={styles.feedTag}>{item.tag}</Text>
                  <Text style={styles.feedTitle}>{item.title}</Text>
                  <View style={styles.feedMeta}>
                    {item.sources && item.sources.length > 0 && (
                      <View style={[styles.sourcesContainer, { marginRight: 10 }]}>
                        {item.sources.slice(0, 3).map((src, idx) => {
                          const logoUrl = getSourceLogoByName(src.label || src.name || src.source) || src.iconUrl || src.logo;
                          return (
                          <View key={idx} style={[styles.sourceAvatar, { zIndex: 3 - idx, marginLeft: idx === 0 ? 0 : -8 }]}>
                            {logoUrl ? (
                              <Image source={{ uri: logoUrl }} style={styles.avatarImage} />
                            ) : (
                              <View style={[styles.avatarImage, { backgroundColor: '#526075', alignItems: 'center', justifyContent: 'center' }]}>
                                <Text style={{ color: '#fff', fontSize: 8, fontFamily: 'Inter_700Bold' }}>
                                  {(src.label || src.name || src.source || 'L')[0].toUpperCase()}
                                </Text>
                              </View>
                            )}
                          </View>
                          );
                        })}
                        {item.sources.length > 3 && (
                          <Text style={styles.sourceText}>+{item.sources.length - 3}</Text>
                        )}
                      </View>
                    )}
                    <View style={styles.feedMetaItem}>
                      <MaterialIcons name="schedule" size={13} color="#a0aab0" />
                      <Text style={styles.feedMetaText}>{timeAgo(item.publishedAt)}</Text>
                    </View>
                    {item.readTime ? (
                      <View style={styles.feedMetaItem}>
                        <MaterialIcons name="timer" size={13} color="#a0aab0" />
                        <Text style={styles.feedMetaText}>{item.readTime}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Polls Carousel (moved above explainers) */}
        <PollsCarousel activeCategory={activeCategory} />

        {/* Trending Cards */}
        {dbTrending.length > 0 && (
          <View style={styles.carouselSection}>
            <Text style={styles.sectionTitle}>Trending Topics</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              decelerationRate="fast"
              snapToInterval={170} // cardW (160) + marginRight (10)
              style={{ marginHorizontal: -16 }} 
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 10 }}
            >
              {dbTrending.map((item) => (
                <View key={item.id}>
                  <TrendingCard item={item} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Explainers */}
        {filteredExplainers.length > 0 && (
          <View style={styles.topStoriesSection}>
            <View style={styles.topStoriesHeaderRow}>
              <Text style={styles.sectionTitle}>EXPLAINERS</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {filteredExplainers.map((item) => (
                <ExplainerCard key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>
        )}



        {/* Discussions */}
        <DiscussionsSection />
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f7f9fb' },
  
  scrollContent:{ paddingHorizontal: 16 },

  // Ticker
  tickerContainer: { backgroundColor: '#0f172a', borderRadius: 8, overflow: 'hidden', paddingVertical: 10, marginBottom: 24 },
  tickerScroll:    { paddingHorizontal: 16, gap: 32, flexDirection: 'row', alignItems: 'center' },
  tickerItem:      { flexDirection: 'row', alignItems: 'center', gap: 8, width: 148 },
  tickerLabel:     { fontFamily: 'Manrope_700Bold', fontSize: 10, color: '#94a3b8' },
  tickerValue:     { fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#ffffff' },
  tickerUp:        { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#34d399' },
  tickerDown:      { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#fb7185' },

  // Search
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e3e9ed', borderRadius: 12, paddingHorizontal: 16, height: 56, marginBottom: 24 },
  searchIcon:      { marginRight: 12 },
  searchInput:     { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 16, color: '#2c3437' },

  // Categories
  categoriesScroll:         { gap: 12, paddingRight: 32, marginBottom: 32 },
  categoryChipActive:       { backgroundColor: '#d5e3fd', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  categoryChipTextActive:   { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#455367' },
  categoryChipInactive:     { backgroundColor: '#f0f4f7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  categoryChipTextInactive: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#596064' },

  // Feed
  sectionContainer: { marginBottom: 32 },
  feedItem:         { flexDirection: 'row', gap: 16, marginBottom: 24 },
  feedImage:        { width: 96, height: 96, borderRadius: 8, backgroundColor: '#e3e9ed' },
  feedContent:      { flex: 1, justifyContent: 'center' },
  feedTag:          { fontFamily: 'Manrope_700Bold', fontSize: 10, color: '#526075', letterSpacing: 1.5, marginBottom: 4 },
  feedTitle:        { fontFamily: 'Manrope_700Bold', fontSize: 15, color: '#2c3437', lineHeight: 20, marginBottom: 6 },
  feedMeta:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feedMetaItem:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  feedMetaText:     { fontFamily: 'Inter_500Medium', fontSize: 11, color: '#747c80' },

  sourcesContainer: { flexDirection: 'row', alignItems: 'center' },
  sourceAvatar: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, borderColor: '#fff', backgroundColor: '#fff', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  sourceText: { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#526075', marginLeft: 6 },
  emptyState:       { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyStateText:   { fontFamily: 'Inter_500Medium', fontSize: 16, color: '#c4cbd0' },

  // Carousel
  carouselSection:   { marginBottom: 40 },
  carouselScroll:    { gap: 16, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16 },
  carouselCard:      { width: 140, backgroundColor: '#ffffff', borderRadius: 12, shadowColor: '#2c3437', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  carouselImage:     { width: '100%', aspectRatio: 4 / 5, borderRadius: 12 },
  carouselContent:   { padding: 12 },
  carouselBadge:     { backgroundColor: '#d4e4f6', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 },
  carouselBadgeText: { fontFamily: 'Manrope_700Bold', fontSize: 8, color: '#445362', letterSpacing: 1 },
  carouselTitle:     { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#2c3437', lineHeight: 18 },

  // Top Story
  topStoriesSection:   { marginBottom: 40 },
  topStoriesHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  topStoriesDate:      { fontFamily: 'Manrope_700Bold', fontSize: 12, color: '#526075' },
  topStoryCard:        { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden' },
  topStoryContent:     { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 },
  exclusiveBadge:      { backgroundColor: '#526075', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 12 },
  exclusiveBadgeText:  { fontFamily: 'Inter_700Bold', fontSize: 10, color: '#f8f8ff', letterSpacing: 1.5 },
  topStoryTitle:       { fontFamily: 'Manrope_800ExtraBold', fontSize: 24, color: '#ffffff', lineHeight: 30, marginBottom: 12 },
  topStoryDesc:        { fontFamily: 'Inter_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },

  // Interview
  interviewSection:   { backgroundColor: '#eef2ff', borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: '#e0e7ff' },
  quoteIcon:          { position: 'absolute', top: 16, left: 16 },
  interviewBadge:     { backgroundColor: 'rgba(79,70,229,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 24 },
  interviewBadgeText: { fontFamily: 'Manrope_700Bold', fontSize: 10, color: '#4f46e5', letterSpacing: 2 },
  interviewQuote:     { fontFamily: 'Manrope_400Regular', fontSize: 22, fontStyle: 'italic', color: '#1e293b', textAlign: 'center', lineHeight: 32, marginBottom: 24 },
  interviewProfile:   { flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  interviewAvatar:    { width: 64, height: 64, borderRadius: 32, borderWidth: 4, borderColor: '#ffffff' },
  interviewName:      { fontFamily: 'Manrope_800ExtraBold', fontSize: 14, color: '#0f172a', marginBottom: 2 },
  interviewTitle:     { fontFamily: 'Inter_600SemiBold', fontSize: 11, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8 },

  // Polls section
  pollsSection:      { backgroundColor: '#f0f4f7', borderRadius: 12, marginBottom: 40, overflow: 'hidden' },
  pollHeaderRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  pollHeaderTitle:   { fontFamily: 'Manrope_800ExtraBold', fontSize: 18, color: '#2c3437', flex: 1 },
  pollPageIndicator: { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#747c80' },

  // Single poll page
  pollPage:          { paddingHorizontal: 20, paddingBottom: 20 },
  pollTopRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  pollCategoryBadge: { backgroundColor: 'rgba(82,96,117,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pollCategoryText:  { fontFamily: 'Manrope_700Bold', fontSize: 11, color: '#526075', letterSpacing: 0.5 },
  pollTotal:         { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#747c80' },
  pollQuestion:      { fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#2c3437', lineHeight: 22, marginBottom: 16 },
  pollOptions:       { gap: 10 },
  pollOptionBtn:     { backgroundColor: '#ffffff', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden', position: 'relative' },
  pollOptionBtnChosen: { borderWidth: 2, borderColor: '#526075' },
  pollBarFill:       { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 8 },
  pollOptionText:    { fontFamily: 'Inter_500Medium', fontSize: 14, color: '#2c3437', zIndex: 1 },
  pollPctText:       { fontFamily: 'Inter_700Bold', fontSize: 13, color: '#526075', zIndex: 1 },
  pollHint:          { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 16 },

  // Poll dots
  pollDots:      { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 16 },
  pollDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#c4cbd0' },
  pollDotActive: { width: 20, backgroundColor: '#526075' },

  // Section title
  sectionTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 20, color: '#2c3437', marginBottom: 20 },

  // Discussion section
  discussionSection: { marginBottom: 40 },
  discList:          { gap: 16 },

  // Discussion preview card
  discPreviewCard:   { backgroundColor: '#ffffff', borderRadius: 14, padding: 20, shadowColor: '#2c3437', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 3 },
  discPreviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  discMetaText:      { fontFamily: 'Inter_500Medium', fontSize: 12, color: '#747c80' },
  discPreviewTitle:  { fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#2c3437', lineHeight: 22, marginBottom: 14 },
  topCommentPreview: { flexDirection: 'row', gap: 12, backgroundColor: '#f7f9fb', borderRadius: 10, padding: 12, marginBottom: 12 },
  topCommentAvatar:  { width: 32, height: 32, borderRadius: 16, backgroundColor: '#d5e3fd', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  topCommentInitials:{ fontFamily: 'Manrope_700Bold', fontSize: 12, color: '#455367' },
  topCommentName:    { fontFamily: 'Manrope_700Bold', fontSize: 12, color: '#2c3437', marginBottom: 2 },
  topCommentText:    { fontFamily: 'Inter_400Regular', fontSize: 13, color: '#596064', lineHeight: 18 },
  discPreviewFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f4f7', paddingTop: 12 },
  discActionBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 16 },
  discActionText:    { fontFamily: 'Inter_500Medium', fontSize: 13, color: '#747c80' },
  discViewAll:       { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: '#526075', marginLeft: 'auto' },

  // Category badge
  categoryBadge:     { backgroundColor: '#d4e4f6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryBadgeText: { fontFamily: 'Manrope_700Bold', fontSize: 10, color: '#445362', letterSpacing: 0.8 },

  // Discussion Modal
  modalContainer:   { flex: 1, backgroundColor: '#f7f9fb' },
  modalHeader:      { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f4f7' },
  modalCloseBtn:    { marginTop: 2, flexShrink: 0 },
  modalHeaderText:  { flex: 1 },
  modalTitle:       { fontFamily: 'Manrope_800ExtraBold', fontSize: 18, color: '#2c3437', lineHeight: 24, marginBottom: 8 },
  modalMetaRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  modalMeta:        { fontFamily: 'Inter_400Regular', fontSize: 12, color: '#747c80' },
  commentsList:     { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 8 },
  emptyComments:    { fontFamily: 'Inter_400Regular', fontSize: 15, color: '#94a3b8', textAlign: 'center', paddingVertical: 40 },

  // Comment rows
  commentRow:       { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f4f7' },
  commentRowReply:  { marginLeft: 32, paddingLeft: 12, borderLeftWidth: 0 },
  replyLine:        { position: 'absolute', left: -20, top: 0, bottom: 0, width: 2, backgroundColor: '#e3e9ed' },
  commentAvatar:    { width: 38, height: 38, borderRadius: 19, backgroundColor: '#d5e3fd', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentInitials:  { fontFamily: 'Manrope_700Bold', fontSize: 13, color: '#455367' },
  commentBody:      { flex: 1 },
  commentHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentName:      { fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#2c3437' },
  commentTime:      { fontFamily: 'Inter_400Regular', fontSize: 11, color: '#747c80' },
  commentText:      { fontFamily: 'Inter_400Regular', fontSize: 14, color: '#596064', lineHeight: 20, marginBottom: 8 },
  commentActions:   { flexDirection: 'row', gap: 16 },
  commentActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  commentActionText:  { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#a0aab0' },
  commentActionReply: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: '#a0aab0' },

  // Reply banner
  replyBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#eef2ff', borderTopWidth: 1, borderTopColor: '#e0e7ff' },
  replyBannerText: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13, color: '#526075' },

  // Input bar
  inputBar:      { flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#f0f4f7' },
  inputField:    { flex: 1, backgroundColor: '#f0f4f7', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontFamily: 'Inter_400Regular', fontSize: 15, color: '#2c3437', maxHeight: 120 },
  postIconBtn:   { width: 44, height: 44, borderRadius: 22, backgroundColor: '#526075', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
