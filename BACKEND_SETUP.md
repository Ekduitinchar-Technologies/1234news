# Lucid Newsroom — Backend Setup Guide

## Step 1: Create your admin account in Firebase

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **lucid-newsroom** project
2. Click **Firestore Database** → **Start collection**
3. Collection ID: `admins`
4. Document ID: *(your Firebase Auth UID — see Step 1b)*
5. Add a field: `email` = `your-email@example.com` → **Save**

**Step 1b — Get your UID:**
- Go to **Authentication → Users**
- Create a user with your admin email + password
- Copy the **UID** column — use that as the Document ID in the `admins` collection

---

## Step 2: Deploy Firestore Rules & Indexes

Make sure you have Firebase CLI installed:
```bash
npm install -g firebase-tools
firebase login
```

Then from the project root (`e:\news69`):
```bash
firebase deploy --only firestore
```

This deploys `firestore.rules` and `firestore.indexes.json`.

---

## Step 3: Open the Admin Portal locally

Just open `admin-portal/index.html` in your browser.
Log in with the admin email + password you created in Step 1.

To deploy it live (hosted at `lucid-newsroom.web.app`):
```bash
firebase deploy --only hosting
```

---

## Step 4: Start adding content

Once logged in to the admin portal:

- **Articles tab** → New Article → fill in title, category, sources (name + URL), summary (≤69 words), body (300–400 words), tags → toggle Published + Featured → Save
- **Trending tab** → New Topic → add trending topics with rank order
- **Explainers tab** → New Explainer → long-form content, no word limit

Featured articles appear on the **Home** screen. All published articles appear on the **News** tab.

---

## Step 5: Connect the app to Firestore

The `src/services/firebaseService.js` file is ready. Wire screens:

### HomeScreen.js
```js
import { getFeaturedArticles } from '../services/firebaseService';

// In useEffect:
const articles = await getFeaturedArticles();
```

### NewsScreen.js
```js
import { getArticles } from '../services/firebaseService';
const articles = await getArticles();
```

### ArticleDetailScreen.js
```js
import { subscribeComments, postComment } from '../services/firebaseService';

// Subscribe:
const unsub = subscribeComments(article.id, setComments);
return () => unsub(); // cleanup
```

---

## Data Structure Reference

### Article fields
| Field | Type | Purpose |
|-------|------|---------|
| `title` | string | Headline |
| `categoryLabel` | string | Category tag |
| `sources` | `{name, url}[]` | Citation sources |
| `summary` | string | ≤69 words — Home feed |
| `body` | string | 300–400 words — Article Detail |
| `imageUrl` | string | Background image |
| `tags` | string[] | For personalization |
| `isFeatured` | boolean | Show on Home? |
| `isPublished` | boolean | Live vs draft |
| `publishedAt` | timestamp | Publication date |

### Comment fields
Stored at `articles/{id}/comments/{commentId}`
| Field | Value |
|-------|-------|
| `userId` | Firebase Auth UID |
| `displayName` | User's name |
| `text` | Comment body (≤1000 chars) |
| `createdAt` | Timestamp |
| `likes` | Number |

---

## Security Summary

- **Anonymous users**: can read articles, save/share, use AI — cannot comment
- **Registered users**: all of the above + can post comments
- **Admin portal**: only UIDs in the `admins` Firestore collection can login and write content
- **Rules**: enforced server-side in `firestore.rules` — cannot be bypassed by the client
