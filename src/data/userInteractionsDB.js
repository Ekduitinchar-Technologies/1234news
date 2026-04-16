/**
 * userInteractionsDB.js
 *
 * Fake user interaction data layer backed by AsyncStorage.
 * Every exported function maps to a future REST endpoint or mutation.
 *
 * Future backend integration plan:
 *   - Replace AsyncStorage.getItem/setItem calls with fetch() calls to your API.
 *   - Keep the same function signatures so callers need zero changes.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SAVED_ARTICLES:  'USER_SAVED_ARTICLES',   // future: GET  /api/user/saved
  POLL_VOTES:      'USER_POLL_VOTES',        // future: GET  /api/user/votes
  LIKED_COMMENTS:  'USER_LIKED_COMMENTS',    // future: GET  /api/user/liked-comments
  USER_COMMENTS:   'USER_THREAD_COMMENTS',   // future: GET  /api/threads/:id/comments
};

// ─────────────────────────────────────────────────────────────────
// SAVED ARTICLES  →  future: POST /api/user/saved/:articleId
// ─────────────────────────────────────────────────────────────────

export async function getSavedArticleIds() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SAVED_ARTICLES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function isArticleSaved(articleId) {
  const saved = await getSavedArticleIds();
  return saved.includes(articleId);
}

/** Returns new saved state (true = now saved, false = now unsaved) */
export async function toggleSaveArticle(articleId) {
  const saved = await getSavedArticleIds();
  let updated;
  if (saved.includes(articleId)) {
    updated = saved.filter((id) => id !== articleId);
  } else {
    updated = [...saved, articleId];
  }
  await AsyncStorage.setItem(KEYS.SAVED_ARTICLES, JSON.stringify(updated));
  return updated.includes(articleId);
}

// ─────────────────────────────────────────────────────────────────
// POLL VOTES  →  future: POST /api/polls/:pollId/vote
// ─────────────────────────────────────────────────────────────────

async function _getPollVotes() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.POLL_VOTES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Returns the optionId the user voted for, or null */
export async function getPollVote(pollId) {
  const votes = await _getPollVotes();
  return votes[pollId] ?? null;
}

/** Persist a vote; no-op if already voted */
export async function castPollVote(pollId, optionId) {
  const votes = await _getPollVotes();
  if (votes[pollId]) return; // already voted
  votes[pollId] = optionId;
  await AsyncStorage.setItem(KEYS.POLL_VOTES, JSON.stringify(votes));
}

// ─────────────────────────────────────────────────────────────────
// COMMENT LIKES  →  future: POST /api/comments/:commentId/like
// ─────────────────────────────────────────────────────────────────

async function _getLikedComments() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.LIKED_COMMENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function isCommentLiked(commentId) {
  const liked = await _getLikedComments();
  return liked.includes(commentId);
}

/** Returns new liked state */
export async function toggleLikeComment(commentId) {
  const liked = await _getLikedComments();
  let updated;
  if (liked.includes(commentId)) {
    updated = liked.filter((id) => id !== commentId);
  } else {
    updated = [...liked, commentId];
  }
  await AsyncStorage.setItem(KEYS.LIKED_COMMENTS, JSON.stringify(updated));
  return updated.includes(commentId);
}

// ─────────────────────────────────────────────────────────────────
// USER COMMENTS  →  future: GET/POST /api/threads/:threadId/comments
// ─────────────────────────────────────────────────────────────────

async function _getAllUserComments() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER_COMMENTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Returns user-posted comments for a thread (merged on top of seed data in caller) */
export async function getUserCommentsForThread(threadId) {
  const all = await _getAllUserComments();
  return all[threadId] ?? [];
}

/**
 * Post a new comment or reply.
 * @param {string} threadId
 * @param {string} text
 * @param {string|null} parentCommentId  - null for top-level, id for reply
 * @returns {object} The created comment object
 */
export async function postComment(threadId, text, parentCommentId = null) {
  const all = await _getAllUserComments();
  if (!all[threadId]) all[threadId] = [];

  const newComment = {
    id:        `user_${Date.now()}`,
    initials:  'ME',
    name:      'You',
    time:      'just now',
    text:      text.trim(),
    likes:     0,
    parentId:  parentCommentId,
    replies:   [],
    isUserComment: true,
  };

  all[threadId] = [newComment, ...all[threadId]];
  await AsyncStorage.setItem(KEYS.USER_COMMENTS, JSON.stringify(all));
  return newComment;
}
