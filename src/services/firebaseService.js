// ─────────────────────────────────────────────────────────────────
// src/services/firebaseService.js
// All Firebase/Firestore interactions for the Lucid Newsroom app
// ─────────────────────────────────────────────────────────────────
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection, query, where, orderBy, limit,
  getDocs, getDoc, doc, addDoc, setDoc, onSnapshot,
  serverTimestamp, increment, updateDoc, deleteDoc,
  arrayUnion, arrayRemove,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            'AIzaSyAoHibwaGOztX6ZyVCZOqx2i5LR2GM9DLs',
  authDomain:        'lucid-newsroom.firebaseapp.com',
  projectId:         'lucid-newsroom',
  storageBucket:     'lucid-newsroom.firebasestorage.app',
  messagingSenderId: '329640807064',
  appId:             '1:329640807064:web:bd9796950f73141e001eed',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db   = getFirestore(app);
export const auth = getAuth(app);

// ─────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────
/** Convert Firestore Timestamps → ISO strings; nested objects supported */
export function firestoreToPlain(data) {
  if (!data) return data;
  const out = { ...data };
  for (const key of Object.keys(out)) {
    const val = out[key];
    if (val && typeof val.toDate === 'function') {
      out[key] = val.toDate().toISOString();
    } else if (Array.isArray(val)) {
      out[key] = val.map(v =>
        v && typeof v === 'object' && typeof v.toDate === 'function'
          ? v.toDate().toISOString()
          : v
      );
    }
  }
  return out;
}

function snap2arr(snap) {
  return snap.docs.map(d => ({ id: d.id, ...firestoreToPlain(d.data()) }));
}

// ─────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────

/** Ensure every app session has a Firebase uid (anonymous if not signed in) */
export async function ensureAnonymousAuth() {
  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.warn("Could not sign in anonymously:", err.message);
    }
  }
}

/** Register a new user with email + display name */
export async function registerUser(email, password, displayName) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  await _ensureUserDoc(cred.user, { displayName, email, isAnonymous: false, authProvider: 'email' });
  return cred.user;
}

/** Sign in existing registered user */
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await _ensureUserDoc(cred.user, {});
  return cred.user;
}

/** Sign out — immediately revert to anonymous */
export async function logoutUser() {
  await signOut(auth);
  await signInAnonymously(auth);
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─────────────────────────────────────────────────────────────────
// USER PROFILE
// ─────────────────────────────────────────────────────────────────
async function _ensureUserDoc(user, extraFields) {
  if (!user || user.isAnonymous) return;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName:  user.displayName || '',
      email:        user.email || '',
      isAnonymous:  false,
      authProvider: 'email',
      photoUrl:     user.photoURL || '',
      createdAt:    serverTimestamp(),
      preferences: {
        categories:     [],
        tags:           [],
        trustedSources: [],
      },
      stats: {
        articlesRead:    0,
        commentsPosted:  0,
        articlesSkipped: 0,
        lastSeen:        serverTimestamp(),
      },
      ...extraFields,
    });
  }
}

/** Get the current user's Firestore profile (null if anon/not found) */
export async function getUserProfile() {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return null;
  const snap = await getDoc(doc(db, 'users', user.uid));
  return snap.exists() ? { id: snap.id, ...firestoreToPlain(snap.data()) } : null;
}

/** Subscribe to real-time profile updates */
export function subscribeUserProfile(callback) {
  let unsubFirestore = () => {};
  const unsubAuth = onAuthStateChanged(auth, (user) => {
    unsubFirestore();
    if (!user || user.isAnonymous) {
      callback(null);
      return;
    }
    unsubFirestore = onSnapshot(doc(db, 'users', user.uid), snap => {
      callback(snap.exists() ? { id: snap.id, ...firestoreToPlain(snap.data()) } : null);
    });
  });
  return () => {
    unsubAuth();
    unsubFirestore();
  };
}

/** Update display name / photoUrl */
export async function updateUserProfile(fields) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return;
  if (fields.displayName) await updateProfile(user, { displayName: fields.displayName });
  await updateDoc(doc(db, 'users', user.uid), fields);
}

// ─────────────────────────────────────────────────────────────────
// USER PREFERENCES
// ─────────────────────────────────────────────────────────────────

/** Replace entire preferences object */
export async function savePreferences(prefs) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return;
  await updateDoc(doc(db, 'users', user.uid), { preferences: prefs });
}

/** Add / remove a category from preferences */
export async function toggleCategoryPreference(category, add) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return;
  const ref = doc(db, 'users', user.uid);
  await updateDoc(ref, {
    'preferences.categories': add ? arrayUnion(category) : arrayRemove(category),
  });
}

/** Add / remove a trusted source (e.g. "BBC") */
export async function toggleTrustedSource(sourceName, add) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return;
  await updateDoc(doc(db, 'users', user.uid), {
    'preferences.trustedSources': add ? arrayUnion(sourceName) : arrayRemove(sourceName),
  });
}

/** Add / remove an interest tag */
export async function toggleInterestTag(tag, add) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return;
  await updateDoc(doc(db, 'users', user.uid), {
    'preferences.tags': add ? arrayUnion(tag) : arrayRemove(tag),
  });
}

// ─────────────────────────────────────────────────────────────────
// BOOKMARKS / SAVED ARTICLES
// ─────────────────────────────────────────────────────────────────

/** Save an article. Stored in users/{uid}/bookmarks/{articleId} */
export async function saveArticle(article) {
  const user = auth.currentUser;
  if (!user) return;
  const ref = doc(db, 'users', user.uid, 'bookmarks', article.id);
  await setDoc(ref, {
    articleId:  article.id,
    title:      article.title,
    title_en:   article.title_en || '',
    title_np:   article.title_np || '',
    summary:    article.summary || '',
    summary_en: article.summary_en || '',
    summary_np: article.summary_np || '',
    imageUrl:   article.imageUrl || '',
    categoryLabel: article.categoryLabel || '',
    savedAt:    serverTimestamp(),
  });
}

/** Remove a saved article */
export async function unsaveArticle(articleId) {
  const user = auth.currentUser;
  if (!user) return;
  await deleteDoc(doc(db, 'users', user.uid, 'bookmarks', articleId));
}

/** Check if an article is saved */
export async function isArticleSaved(articleId) {
  const user = auth.currentUser;
  if (!user) return false;
  const snap = await getDoc(doc(db, 'users', user.uid, 'bookmarks', articleId));
  return snap.exists();
}

/** Subscribe to all bookmarks for current user */
export function subscribeBookmarks(callback) {
  let unsubFirestore = () => {};
  const unsubAuth = onAuthStateChanged(auth, (user) => {
    unsubFirestore();
    if (!user) {
      callback([]);
      return;
    }
    const q = query(
      collection(db, 'users', user.uid, 'bookmarks'),
      orderBy('savedAt', 'desc')
    );
    unsubFirestore = onSnapshot(q, snap => callback(snap2arr(snap)));
  });
  return () => {
    unsubAuth();
    unsubFirestore();
  };
}

/** Toggle save/unsave — returns new saved state */
export async function toggleSaveArticle(article) {
  const saved = await isArticleSaved(article.id);
  if (saved) {
    await unsaveArticle(article.id);
    return false;
  } else {
    await saveArticle(article);
    return true;
  }
}

// ─────────────────────────────────────────────────────────────────
// READING BEHAVIOUR  (what user read, skipped, how long spent)
// ─────────────────────────────────────────────────────────────────

/**
 * Log a reading event.
 * @param {object} article  - { id, title, categoryLabel, tags }
 * @param {'read'|'skip'|'save'|'share'|'ai_query'|'expand'} type
 * @param {object} extra    - e.g. { readDurationMs: 12000 }
 */
export async function logBehaviour(article, type, extra = {}) {
  const user = auth.currentUser;
  if (!user) return;

  // Write to top-level interactions collection
  await addDoc(collection(db, 'interactions'), {
    userId:        user.uid,
    articleId:     article.id,
    articleTitle:  article.title || '',
    categoryLabel: article.categoryLabel || '',
    tags:          article.tags || [],
    type,
    ...extra,
    createdAt: serverTimestamp(),
  });

  // Update user stats
  const ref = doc(db, 'users', user.uid);
  const statField = type === 'read'  ? 'stats.articlesRead'    :
                    type === 'skip'  ? 'stats.articlesSkipped'  : null;
  try {
    const updates = { 'stats.lastSeen': serverTimestamp() };
    if (statField) updates[statField] = increment(1);
    await updateDoc(ref, updates);
  } catch (_) { /* user doc may not exist for anon */ }
}

// ─────────────────────────────────────────────────────────────────
// ARTICLES
// ─────────────────────────────────────────────────────────────────

/** Home feed — published + featured, newest first */
export async function getFeaturedArticles() {
  const q = query(
    collection(db, 'articles'),
    where('isPublished', '==', true),
    where('isFeatured',  '==', true),
    orderBy('publishedAt', 'desc'),
    limit(20),
  );
  return snap2arr(await getDocs(q));
}

/** News tab — all published, newest first */
export async function getArticles() {
  const q = query(
    collection(db, 'articles'),
    where('isPublished', '==', true),
    orderBy('publishedAt', 'desc'),
    limit(50),
  );
  return snap2arr(await getDocs(q));
}

/** Get a single article by ID */
export async function getArticleById(id) {
  const snap = await getDoc(doc(db, 'articles', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...firestoreToPlain(snap.data()) };
}

// ─────────────────────────────────────────────────────────────────
// TRENDING
// ─────────────────────────────────────────────────────────────────
export async function getTrending() {
  const q = query(collection(db, 'trending'), orderBy('rank', 'asc'));
  return snap2arr(await getDocs(q));
}

// ─────────────────────────────────────────────────────────────────
// EXPLAINERS
// ─────────────────────────────────────────────────────────────────
export async function getExplainers() {
  const q = query(collection(db, 'explainers'), orderBy('publishedAt', 'desc'));
  return snap2arr(await getDocs(q));
}

// ─────────────────────────────────────────────────────────────────
// SPOTLIGHTS
// ─────────────────────────────────────────────────────────────────
export async function getSpotlights() {
  const q = query(collection(db, 'spotlights'), orderBy('createdAt', 'desc'));
  return snap2arr(await getDocs(q));
}

export function subscribeSpotlights(callback) {
  const q = query(collection(db, 'spotlights'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => callback(snap2arr(snap)), () => callback([]));
}

// ─────────────────────────────────────────────────────────────────
// COMMENTS on Articles (ArticleDetailScreen)
// ─────────────────────────────────────────────────────────────────

/** Real-time comments for an article. Returns unsubscribe fn. */
export function subscribeArticleComments(articleId, callback) {
  const q = query(
    collection(db, 'articles', articleId, 'comments'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, snap => callback(snap2arr(snap)));
}

/** Post a comment on an article. Throws if user is anonymous. */
export async function postArticleComment(articleId, text) {
  const user = auth.currentUser;
  if (!user)            throw new Error('Not signed in');
  if (user.isAnonymous) throw new Error('ANON'); // caller shows upgrade prompt
  const ref = await addDoc(collection(db, 'articles', articleId, 'comments'), {
    userId:      user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoUrl:    user.photoURL || '',
    text:        text.trim(),
    createdAt:   serverTimestamp(),
    likes:       0,
    likedBy:     [],
  });
  // update commentsPosted count
  await updateDoc(doc(db, 'users', user.uid), {
    'stats.commentsPosted': increment(1),
  }).catch(() => {});
  return ref.id;
}

/** Toggle like on an article comment */
export async function toggleArticleCommentLike(articleId, commentId) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return null;
  const ref  = doc(db, 'articles', articleId, 'comments', commentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const likedBy = snap.data().likedBy || [];
  const alreadyLiked = likedBy.includes(user.uid);
  await updateDoc(ref, {
    likes:   increment(alreadyLiked ? -1 : 1),
    likedBy: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
  });
  return !alreadyLiked;
}

// ─────────────────────────────────────────────────────────────────
// POLLS (stored in 'polls' collection)
// ─────────────────────────────────────────────────────────────────

/** Get all active polls */
export async function getPolls() {
  const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
  return snap2arr(await getDocs(q));
}

/** Real-time polls */
export function subscribePolls(callback) {
  const q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => callback(snap2arr(snap)), () => callback([]));
}

/** Cast a vote on a poll option */
export async function castPollVote(pollId, optionId) {
  const user = auth.currentUser;
  if (!user)            return { error: 'not_signed_in' };
  if (user.isAnonymous) return { error: 'anon' };

  const voteRef = doc(db, 'polls', pollId, 'votes', user.uid);
  const existing = await getDoc(voteRef);
  if (existing.exists()) return { error: 'already_voted', vote: existing.data().optionId };

  // Record the vote
  await setDoc(voteRef, { optionId, userId: user.uid, votedAt: serverTimestamp() });

  // Increment the count on the poll option
  const pollRef = doc(db, 'polls', pollId);
  const pollSnap = await getDoc(pollRef);
  if (pollSnap.exists()) {
    const options = pollSnap.data().options || [];
    const updated = options.map(o =>
      o.id === optionId ? { ...o, votes: (o.votes || 0) + 1 } : o
    );
    await updateDoc(pollRef, { options: updated });
  }
  return { success: true };
}

/** Check if current user has already voted on a poll */
export async function getPollVote(pollId) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return null;
  const snap = await getDoc(doc(db, 'polls', pollId, 'votes', user.uid));
  return snap.exists() ? snap.data().optionId : null;
}

// ─────────────────────────────────────────────────────────────────
// DISCUSSION THREADS (in NewsScreen)
// ─────────────────────────────────────────────────────────────────

/** Get all active discussion threads */
export async function getDiscussionThreads() {
  const q = query(collection(db, 'discussions'), orderBy('createdAt', 'desc'), limit(10));
  return snap2arr(await getDocs(q));
}

/** Real-time discussions */
export function subscribeDiscussions(callback) {
  const q = query(collection(db, 'discussions'), orderBy('createdAt', 'desc'), limit(10));
  return onSnapshot(q, snap => callback(snap2arr(snap)), () => callback([]));
}

/** Subscribe to comments on a discussion thread */
export function subscribeThreadComments(threadId, callback) {
  const q = query(
    collection(db, 'discussions', threadId, 'comments'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, snap => callback(snap2arr(snap)));
}

/** Post a comment in a discussion thread */
export async function postThreadComment(threadId, text, parentCommentId = null) {
  const user = auth.currentUser;
  if (!user)            throw new Error('Not signed in');
  if (user.isAnonymous) throw new Error('ANON');
  const name = user.displayName || user.email?.split('@')[0] || 'User';
  const initials = name.slice(0, 2).toUpperCase();
  const ref = await addDoc(collection(db, 'discussions', threadId, 'comments'), {
    userId:    user.uid,
    name,
    initials,
    photoUrl:  user.photoURL || '',
    text:      text.trim(),
    createdAt: serverTimestamp(),
    likes:     0,
    likedBy:   [],
    parentCommentId: parentCommentId || null,
    replies:   [],
  });
  // Increment totalComments on the thread
  await updateDoc(doc(db, 'discussions', threadId), {
    totalComments: increment(1),
  }).catch(() => {});
  return ref.id;
}

/** Toggle like on a discussion comment */
export async function toggleThreadCommentLike(threadId, commentId) {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return null;
  const ref  = doc(db, 'discussions', threadId, 'comments', commentId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const liked = (snap.data().likedBy || []).includes(user.uid);
  await updateDoc(ref, {
    likes:   increment(liked ? -1 : 1),
    likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
  });
  return !liked;
}
