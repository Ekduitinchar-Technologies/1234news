// ─────────────────────────────────────────────────────────────────
// Lucid Newsroom — Admin CMS
// ─────────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyAoHibwaGOztX6ZyVCZOqx2i5LR2GM9DLs",
  authDomain: "lucid-newsroom.firebaseapp.com",
  projectId: "lucid-newsroom",
  storageBucket: "lucid-newsroom.firebasestorage.app",
  messagingSenderId: "329640807064",
  appId: "1:329640807064:web:bd9796950f73141e001eed",
};

firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// ─── GLOBAL STATE ────────────────────────────────────────────────
const state = {
  currentTab: 'articles',
  editingId: null,
  editingCollection: null,
  drawerSaveCallback: null,
  articleFilter: 'all',
  allArticles: [],
  tags: [],
  sources: [],
  images: [], // for multi-image uploads
};

// ─────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────
const AUTH = {
  login: async () => {
    const btn   = document.getElementById('loginBtn');
    const email = document.getElementById('loginEmail').value.trim();
    const pass  = document.getElementById('loginPassword').value;
    const err   = document.getElementById('loginError');
    err.classList.add('hidden');

    if (!email || !pass) {
      err.textContent = 'Please enter email and password.';
      err.classList.remove('hidden');
      return;
    }

    btn.textContent = 'Signing in…';
    btn.disabled = true;

    try {
      const cred = await auth.signInWithEmailAndPassword(email, pass);
      // Check admin status
      const adminDoc = await db.collection('admins').doc(cred.user.uid).get();
      if (!adminDoc.exists) {
        await auth.signOut();
        err.textContent = 'Access denied. You are not an admin.';
        err.classList.remove('hidden');
        btn.textContent = 'Sign In';
        btn.disabled = false;
        return;
      }
      // OK — onAuthStateChanged will show the app
    } catch (e) {
      err.textContent = e.message.replace('Firebase: ', '');
      err.classList.remove('hidden');
      btn.textContent = 'Sign In';
      btn.disabled = false;
    }
  },

  logout: async () => {
    if (confirm('Sign out?')) {
      await auth.signOut();
    }
  },
};

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const adminDoc = await db.collection('admins').doc(user.uid).get();
    if (!adminDoc.exists) { await auth.signOut(); return; }

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userAvatar').textContent = user.email[0].toUpperCase();

    // Load all tabs
    ARTICLES.listen();
    TRENDING.listen();
    EXPLAINERS.listen();
    POLLS.listen();
    DISCUSSIONS.listen();
    SPOTLIGHTS.listen();
  } else {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('loginBtn').textContent = 'Sign In';
    document.getElementById('loginBtn').disabled = false;
  }
});

// ─────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────
const UI = {
  switchTab: (tab) => {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    state.currentTab = tab;
  },

  openDrawer: (title, bodyHTML, saveCallback) => {
    document.getElementById('drawerTitle').textContent = title;
    document.getElementById('drawerBody').innerHTML = bodyHTML;
    state.drawerSaveCallback = saveCallback;
    document.getElementById('drawerSaveBtn').onclick = saveCallback;

    document.getElementById('drawerOverlay').classList.remove('hidden');
    const drawer = document.getElementById('drawer');
    drawer.classList.remove('hidden', 'closing');

    // init tags + sources after DOM is ready
    if (state.tags !== undefined) UI._initTagsInput();
  },

  closeDrawer: () => {
    const drawer = document.getElementById('drawer');
    drawer.classList.add('closing');
    setTimeout(() => {
      drawer.classList.add('hidden');
      drawer.classList.remove('closing');
      document.getElementById('drawerOverlay').classList.add('hidden');
      state.editingId = null;
      state.editingCollection = null;
      state.tags = [];
      state.sources = [];
    }, 180);
  },

  showToast: (msg, type = 'default') => {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type}`;
    t.classList.remove('hidden');
    clearTimeout(UI._toastTimer);
    UI._toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
  },

  uploadImage: async (file) => {
    if (!file) return null;

    // Convert file to base64 for ImgBB API
    const toBase64 = (f) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload  = () => resolve(reader.result.split(',')[1]); // strip "data:...;base64,"
      reader.onerror = reject;
    });

    const base64 = await toBase64(file);
    const formData = new FormData();
    formData.append('key', 'b5a0fc6333ff583f5b1e7d00d50b75fb');
    formData.append('image', base64);
    formData.append('name', `${Date.now()}_${file.name}`);

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('ImgBB upload failed: ' + res.statusText);
    const json = await res.json();
    if (!json.success) throw new Error('ImgBB error: ' + json.error?.message);

    // Return the direct image URL
    return json.data.display_url;
  },

  showConfirm: (title, msg, onOk) => {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMsg').textContent = msg;
    document.getElementById('confirmOkBtn').onclick = () => {
      onOk();
      UI.closeConfirm();
    };
    document.getElementById('confirmOverlay').classList.remove('hidden');
    document.getElementById('confirmDialog').classList.remove('hidden');
    document.getElementById('confirmOverlay').onclick = UI.closeConfirm;
  },

  closeConfirm: () => {
    document.getElementById('confirmOverlay').classList.add('hidden');
    document.getElementById('confirmDialog').classList.add('hidden');
  },

  wordCount: (text) => text.trim() === '' ? 0 : text.trim().split(/\s+/).length,

  updateWordCount: (textareaId, barId, countId, min, max) => {
    const ta  = document.getElementById(textareaId);
    const bar = document.getElementById(barId);
    const lbl = document.getElementById(countId);
    if (!ta || !bar || !lbl) return;
    const count = UI.wordCount(ta.value);
    const pct   = Math.min((count / max) * 100, 100);
    lbl.textContent = `${count} / ${max} words`;
    bar.style.width = `${pct}%`;
    if (count < min)             { lbl.className = 'word-count warn'; bar.style.background = '#f59e0b'; }
    else if (count > max)        { lbl.className = 'word-count over'; bar.style.background = '#ef4444'; }
    else                         { lbl.className = 'word-count ok';   bar.style.background = '#22c55e'; }
  },

  previewImage: (urlInputId, previewId) => {
    const url  = document.getElementById(urlInputId)?.value.trim();
    const wrap = document.getElementById(previewId);
    if (!wrap) return;
    if (url) {
      wrap.innerHTML = `<img src="${url}" onerror="this.parentElement.classList.remove('visible')" />`;
      wrap.classList.add('visible');
    } else {
      wrap.classList.remove('visible');
    }
  },

  // Multi-image logic
  renderImages: () => {
    const wrap = document.getElementById('multiImagePreview');
    if (!wrap) return;
    wrap.innerHTML = '';
    state.images.forEach((imgObj, i) => {
      const src = imgObj.file ? URL.createObjectURL(imgObj.file) : imgObj.url;
      wrap.innerHTML += `
        <div class="multi-img-item">
          <img src="${src}" />
          <button type="button" class="img-remove-btn" onclick="UI.removeImage(${i})">×</button>
        </div>
      `;
    });
  },

  handleLocalImageSelect: (e) => {
    Array.from(e.target.files).forEach(f => state.images.push({ file: f, url: null }));
    UI.renderImages();
    e.target.value = ''; // reset
  },

  handleTitleImageSelect: (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    state.titleImageFile = file;
    state.titleImagePreviewUrl = '';
    const preview = document.getElementById('titleImagePreview');
    if (preview) {
      const src = URL.createObjectURL(file);
      preview.innerHTML = `<img src="${src}" style="width:80px;height:100px;object-fit:cover;border-radius:8px;margin-top:4px;"/>`;
    }
  },

  removeImage: (i) => {
    state.images.splice(i, 1);
    UI.renderImages();
  },

  // Tags input logic ───────────────────────────────────────────
  _initTagsInput: () => {
    const wrap  = document.getElementById('tagsInputWrap');
    const input = document.getElementById('tagsRawInput');
    if (!wrap || !input) return;
    UI._renderTags();
    input.onkeydown = (e) => {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
        e.preventDefault();
        const tag = input.value.trim().replace(/,/g, '');
        if (tag && !state.tags.includes(tag)) { state.tags.push(tag); UI._renderTags(); }
        input.value = '';
      } else if (e.key === 'Backspace' && !input.value && state.tags.length) {
        state.tags.pop(); UI._renderTags();
      }
    };
    wrap.onclick = () => input.focus();
  },

  _renderTags: () => {
    const wrap  = document.getElementById('tagsInputWrap');
    const input = document.getElementById('tagsRawInput');
    if (!wrap) return;
    // Remove old chips
    wrap.querySelectorAll('.tag-chip').forEach(c => c.remove());
    state.tags.forEach((tag, i) => {
      const chip = document.createElement('span');
      chip.className = 'tag-chip';
      chip.innerHTML = `${tag}<button onclick="UI._removeTag(${i})">×</button>`;
      wrap.insertBefore(chip, input);
    });
  },

  _removeTag: (i) => { state.tags.splice(i, 1); UI._renderTags(); },

  // Sources list logic ─────────────────────────────────────────
  renderSources: () => {
    const list = document.getElementById('sourcesList');
    if (!list) return;
    list.innerHTML = '';
    state.sources.forEach((src, i) => {
      const row = document.createElement('div');
      row.className = 'source-row';
      row.innerHTML = `
        <input type="text"  placeholder="Source name" value="${src.name || ''}"
               oninput="state.sources[${i}].name = this.value" />
        <input type="url"   placeholder="https://…" value="${src.url || ''}"
               oninput="state.sources[${i}].url = this.value" />
        <button class="remove-source" onclick="UI.removeSource(${i})">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>`;
      list.appendChild(row);
    });
  },

  addSource: () => {
    state.sources.push({ name: '', url: '' });
    UI.renderSources();
  },

  removeSource: (i) => {
    state.sources.splice(i, 1);
    UI.renderSources();
  },

  val: (id) => document.getElementById(id)?.value?.trim() ?? '',
  chk: (id) => document.getElementById(id)?.checked ?? false,
};

// ─────────────────────────────────────────────────────────────────
// ARTICLES
// ─────────────────────────────────────────────────────────────────
const ARTICLES = {
  _unsub: null,
  filter: 'all',

  listen: () => {
    if (ARTICLES._unsub) ARTICLES._unsub();
    ARTICLES._unsub = db.collection('articles')
      .orderBy('publishedAt', 'desc')
      .onSnapshot(snap => {
        state.allArticles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        document.getElementById('badge-articles').textContent = state.allArticles.length;
        ARTICLES.render();
      });
  },

  setFilter: (f, btn) => {
    ARTICLES.filter = f;
    document.querySelectorAll('#tab-articles .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ARTICLES.render();
  },

  render: () => {
    const list = document.getElementById('articlesList');
    let items = state.allArticles;
    if (ARTICLES.filter === 'published') items = items.filter(a => a.isPublished);
    if (ARTICLES.filter === 'draft')     items = items.filter(a => !a.isPublished);
    if (ARTICLES.filter === 'featured')  items = items.filter(a => a.isFeatured);

    if (!items.length) {
      list.innerHTML = `<div class="empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        <p>No articles yet. Create your first one!</p>
      </div>`;
      return;
    }

    list.innerHTML = items.map(a => {
      const pub    = a.isPublished ? '<span class="badge badge-published">Published</span>' : '<span class="badge badge-draft">Draft</span>';
      const feat   = a.isFeatured  ? '<span class="badge badge-featured">Featured</span>' : '';
      const cat    = a.categoryLabel ? `<span class="badge badge-cat">${a.categoryLabel}</span>` : '';
      const date   = a.publishedAt?.toDate ? a.publishedAt.toDate().toLocaleDateString() : '';
      const thumb  = a.imageUrl
        ? `<img class="item-thumb" src="${a.imageUrl}" alt="" onerror="this.style.display='none'" />`
        : `<div class="item-thumb" style="background:var(--surface);"></div>`;
      return `
        <div class="item-card">
          ${thumb}
          <div class="item-body">
            <div class="item-meta">${pub}${feat}${cat}${date ? `<span style="margin-left:auto;font-size:11px;color:var(--text-3)">${date}</span>` : ''}</div>
            <div class="item-title">${a.title || 'Untitled'}</div>
            <div class="item-summary">${a.summary || ''}</div>
          </div>
          <div class="item-actions">
            <button class="icon-btn" title="Edit" onclick="ARTICLES.openForm('${a.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="icon-btn" title="Delete" onclick="ARTICLES.delete('${a.id}', '${(a.title||'').replace(/'/g,"\\'")}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>`;
    }).join('');
  },

  openForm: (id = null) => {
    const article = id ? state.allArticles.find(a => a.id === id) : null;
    state.editingId = id;
    state.tags    = article?.tags    ? [...article.tags]    : [];
    state.sources = article?.sources ? [...article.sources] : [{ name: '', url: '' }];

    const categories = ['Politics','Technology','Business','Science','Health','Sports','Entertainment','World','Environment','Culture'];

    const html = `
      <div class="form-group">
        <label>Title *</label>
        <input type="text" id="f_title" placeholder="Article headline…" value="${article?.title || ''}" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Category</label>
          <select id="f_category">
            ${categories.map(c => `<option value="${c}" ${article?.categoryLabel === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Image URL</label>
          <input type="url" id="f_imageUrl" placeholder="https://…" value="${article?.imageUrl || ''}"
                 oninput="UI.previewImage('f_imageUrl','imgPreview')" />
        </div>
      </div>

      <div id="imgPreview" class="img-preview ${article?.imageUrl ? 'visible' : ''}">
        ${article?.imageUrl ? `<img src="${article.imageUrl}" />` : ''}
      </div>

      <div class="section-divider">Sources</div>
      <div id="sourcesList" class="sources-list"></div>
      <button class="add-source-btn" onclick="UI.addSource()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Source
      </button>

      <div class="section-divider">Content</div>

      <div class="form-group">
        <label>Summary <small style="color:var(--text-3);font-weight:400">(≤ 69 words — shown on Home feed)</small></label>
        <textarea id="f_summary" rows="4" placeholder="Short, punchy summary…"
                  oninput="UI.updateWordCount('f_summary','sumBar','sumCount',1,69)">${article?.summary || ''}</textarea>
        <div class="word-count-bar">
          <div class="word-bar-track"><div class="word-bar-fill" id="sumBar" style="width:0%"></div></div>
          <span class="word-count" id="sumCount">0 / 69 words</span>
        </div>
      </div>

      <div class="form-group">
        <label>Body <small style="color:var(--text-3);font-weight:400">(300–400 words — Article Detail)</small></label>
        <textarea id="f_body" rows="12" placeholder="Full article body…"
                  oninput="UI.updateWordCount('f_body','bodyBar','bodyCount',300,400)">${article?.body || ''}</textarea>
        <div class="word-count-bar">
          <div class="word-bar-track"><div class="word-bar-fill" id="bodyBar" style="width:0%"></div></div>
          <span class="word-count" id="bodyCount">0 / 400 words</span>
        </div>
      </div>

      <div class="section-divider">Tags</div>
      <div class="form-group">
        <label>Tags <small style="color:var(--text-3);font-weight:400">(press Enter or comma to add)</small></label>
        <div class="tags-input-wrap" id="tagsInputWrap">
          <input type="text" id="tagsRawInput" placeholder="Add tag…" />
        </div>
      </div>

      <div class="section-divider">Settings</div>
      <div class="toggle-row">
        <div>
          <div class="toggle-label">Published</div>
          <div class="toggle-sub">Visible to app users</div>
        </div>
        <label class="toggle"><input type="checkbox" id="f_published" ${article?.isPublished ? 'checked' : ''}/><span class="toggle-slider"></span></label>
      </div>
      <div class="toggle-row">
        <div>
          <div class="toggle-label">Featured on Home</div>
          <div class="toggle-sub">Shown in the main home feed</div>
        </div>
        <label class="toggle"><input type="checkbox" id="f_featured" ${article?.isFeatured ? 'checked' : ''}/><span class="toggle-slider"></span></label>
      </div>
    `;

    UI.openDrawer(id ? 'Edit Article' : 'New Article', html, ARTICLES.save);

    // Populate word counts + sources after DOM update
    setTimeout(() => {
      UI.updateWordCount('f_summary','sumBar','sumCount',1,69);
      UI.updateWordCount('f_body','bodyBar','bodyCount',300,400);
      UI.renderSources();
    }, 10);
  },

  save: async () => {
    const btn   = document.getElementById('drawerSaveBtn');
    const title = UI.val('f_title');
    if (!title) { UI.showToast('Title is required', 'error'); return; }

    btn.textContent = 'Saving…';
    btn.disabled = true;

    try {
      const payload = {
        title,
        categoryLabel: UI.val('f_category'),
        imageUrl:      UI.val('f_imageUrl'),
        summary:       UI.val('f_summary'),
        body:          UI.val('f_body'),
        sources:       state.sources.filter(s => s.name),
        tags:          state.tags,
        isPublished:   UI.chk('f_published'),
        isFeatured:    UI.chk('f_featured'),
        updatedAt:     firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (state.editingId) {
        await db.collection('articles').doc(state.editingId).update(payload);
        UI.showToast('Article updated', 'success');
      } else {
        payload.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('articles').add(payload);
        UI.showToast('Article created', 'success');
      }
      UI.closeDrawer();
    } catch (e) {
      UI.showToast('Error: ' + e.message, 'error');
    } finally {
      btn.textContent = 'Save';
      btn.disabled = false;
    }
  },

  delete: (id, title) => {
    UI.showConfirm(
      'Delete article?',
      `"${title}" will be permanently removed.`,
      async () => {
        await db.collection('articles').doc(id).delete();
        UI.showToast('Deleted', 'default');
      }
    );
  },
};

// ─────────────────────────────────────────────────────────────────
// TRENDING
// ─────────────────────────────────────────────────────────────────
const TRENDING = {
  _unsub: null,
  _items: [],

  listen: () => {
    if (TRENDING._unsub) TRENDING._unsub();
    TRENDING._unsub = db.collection('trending')
      .orderBy('rank', 'asc')
      .onSnapshot(snap => {
        TRENDING._items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        document.getElementById('badge-trending').textContent = TRENDING._items.length;
        TRENDING.render();
      });
  },

  render: () => {
    const list = document.getElementById('trendingList');
    if (!TRENDING._items.length) {
      list.innerHTML = `<div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg><p>No trending topics yet.</p></div>`;
      return;
    }
    list.innerHTML = TRENDING._items.map(t => {
      const thumb = t.imageUrl
        ? `<img class="item-thumb" src="${t.imageUrl}" onerror="this.style.display='none'" />`
        : `<div class="item-thumb"></div>`;
      return `
        <div class="item-card">
          ${thumb}
          <div class="item-body">
            <div class="item-meta"><span class="badge badge-rank">#${t.rank || '—'}</span></div>
            <div class="item-title">${t.title || 'Untitled'}</div>
            <div class="item-summary">${t.summary || ''}</div>
          </div>
          <div class="item-actions">
            <button class="icon-btn" onclick="TRENDING.openForm('${t.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="icon-btn" onclick="TRENDING.delete('${t.id}','${(t.title||'').replace(/'/g,"\\'")}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');
  },

  openForm: (id = null) => {
    const item = id ? TRENDING._items.find(t => t.id === id) : null;
    state.editingId = id;
    state.titleImageFile = null;
    state.titleImagePreviewUrl = item?.titleImageUrl || '';
    state.images = item?.contentImageUrls ? item.contentImageUrls.map(url => ({ url, file: null })) : [];

    const html = `
      <div class="form-group">
        <label>Title *</label>
        <input type="text" id="f_title" value="${item?.title || ''}" placeholder="Trending topic title…" />
      </div>
      <div class="form-group">
        <label>Title Image <small style="color:var(--text-3)">(4:5 portrait cover shown in feed)</small></label>
        <input type="file" id="f_title_img" accept="image/*" onchange="UI.handleTitleImageSelect(event)" />
        <div id="titleImagePreview" style="margin-top:8px;">${item?.titleImageUrl ? `<img src="${item.titleImageUrl}" style="width:80px;height:100px;object-fit:cover;border-radius:8px;"/>` : ''}</div>
      </div>
      <div class="form-group">
        <label>Content Images <small style="color:var(--text-3)">(swipeable gallery when user opens topic)</small></label>
        <input type="file" id="f_images" accept="image/*" multiple onchange="UI.handleLocalImageSelect(event)" />
        <div id="multiImagePreview" class="multi-img-preview"></div>
      </div>
      <div class="form-group">
        <label>Rank <small style="color:var(--text-3)">(1 = top)</small></label>
        <input type="number" id="f_rank" value="${item?.rank ?? (TRENDING._items.length + 1)}" min="1" />
      </div>
    `;

    UI.openDrawer(id ? 'Edit Trending Topic' : 'New Trending Topic', html, TRENDING.save);
    setTimeout(() => UI.renderImages(), 10);
  },

  save: async () => {
    const btn   = document.getElementById('drawerSaveBtn');
    const title = UI.val('f_title');
    if (!title) { UI.showToast('Title is required', 'error'); return; }

    btn.textContent = 'Saving…'; btn.disabled = true;

    try {
      // Upload title image (single cover)
      let titleImageUrl = state.titleImagePreviewUrl || '';
      if (state.titleImageFile) {
        titleImageUrl = await UI.uploadImage(state.titleImageFile);
      }

      // Upload content images (gallery)
      const contentImageUrls = [];
      for (const img of state.images) {
        if (img.url) contentImageUrls.push(img.url);
        else if (img.file) {
          const url = await UI.uploadImage(img.file);
          if (url) contentImageUrls.push(url);
        }
      }

      const payload = {
        title,
        titleImageUrl,
        contentImageUrls,
        rank:     parseInt(document.getElementById('f_rank')?.value || '1', 10),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (state.editingId) {
        await db.collection('trending').doc(state.editingId).update(payload);
        UI.showToast('Topic updated', 'success');
      } else {
        payload.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('trending').add(payload);
        UI.showToast('Topic created', 'success');
      }
      UI.closeDrawer();
    } catch (e) {
      UI.showToast('Error: ' + e.message, 'error');
    } finally {
      btn.textContent = 'Save'; btn.disabled = false;
    }
  },

  delete: (id, title) => {
    UI.showConfirm('Delete topic?', `"${title}" will be removed.`, async () => {
      await db.collection('trending').doc(id).delete();
      UI.showToast('Deleted');
    });
  },
};

// ─────────────────────────────────────────────────────────────────
// EXPLAINERS
// ─────────────────────────────────────────────────────────────────
const EXPLAINERS = {
  _unsub: null,
  _items: [],

  listen: () => {
    if (EXPLAINERS._unsub) EXPLAINERS._unsub();
    EXPLAINERS._unsub = db.collection('explainers')
      .orderBy('publishedAt', 'desc')
      .onSnapshot(snap => {
        EXPLAINERS._items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        document.getElementById('badge-explainers').textContent = EXPLAINERS._items.length;
        EXPLAINERS.render();
      }, () => {
        // First explainer may need index — show items anyway
        EXPLAINERS.render();
      });
  },

  render: () => {
    const list = document.getElementById('explainersList');
    if (!EXPLAINERS._items.length) {
      list.innerHTML = `<div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><p>No explainers yet.</p></div>`;
      return;
    }
    list.innerHTML = EXPLAINERS._items.map(e => {
      const thumb = e.imageUrl ? `<img class="item-thumb" src="${e.imageUrl}" onerror="this.style.display='none'" />` : `<div class="item-thumb"></div>`;
      const date  = e.publishedAt?.toDate ? e.publishedAt.toDate().toLocaleDateString() : '';
      return `
        <div class="item-card">
          ${thumb}
          <div class="item-body">
            <div class="item-meta">${date ? `<span style="font-size:11px;color:var(--text-3)">${date}</span>` : ''}${(e.tags||[]).slice(0,3).map(t=>`<span class="badge badge-cat">${t}</span>`).join('')}</div>
            <div class="item-title">${e.title || 'Untitled'}</div>
            <div class="item-summary">${e.body ? e.body.slice(0,120)+'…' : ''}</div>
          </div>
          <div class="item-actions">
            <button class="icon-btn" onclick="EXPLAINERS.openForm('${e.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="icon-btn" onclick="EXPLAINERS.delete('${e.id}','${(e.title||'').replace(/'/g,"\\'")}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');
  },

  openForm: (id = null) => {
    const item = id ? EXPLAINERS._items.find(e => e.id === id) : null;
    state.editingId = id;
    state.titleImageFile = null;
    state.titleImagePreviewUrl = item?.titleImageUrl || '';
    state.images = item?.contentImageUrls ? item.contentImageUrls.map(url => ({ url, file: null })) : [];

    const html = `
      <div class="form-group">
        <label>Title *</label>
        <input type="text" id="f_title" value="${item?.title || ''}" placeholder="Explainer title…" />
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="f_category">
          <option value="Tech">Tech</option>
          <option value="Politics">Politics</option>
          <option value="Global">Global</option>
          <option value="Markets">Markets</option>
          <option value="Culture">Culture</option>
          <option value="Science">Science</option>
        </select>
      </div>
      <div class="form-group">
        <label>Title Image <small style="color:var(--text-3)">(4:5 portrait cover shown in feed)</small></label>
        <input type="file" id="f_title_img" accept="image/*" onchange="UI.handleTitleImageSelect(event)" />
        <div id="titleImagePreview" style="margin-top:8px;">${item?.titleImageUrl ? `<img src="${item.titleImageUrl}" style="width:80px;height:100px;object-fit:cover;border-radius:8px;"/>` : ''}</div>
      </div>
      <div class="form-group">
        <label>Content Images <small style="color:var(--text-3)">(swipeable gallery when user opens explainer)</small></label>
        <input type="file" id="f_images" accept="image/*" multiple onchange="UI.handleLocalImageSelect(event)" />
        <div id="multiImagePreview" class="multi-img-preview"></div>
      </div>
    `;

    UI.openDrawer(id ? 'Edit Explainer' : 'New Explainer', html, EXPLAINERS.save);
    if (item?.category) setTimeout(() => { document.getElementById('f_category').value = item.category; }, 10);
    setTimeout(() => UI.renderImages(), 10);
  },

  save: async () => {
    const btn   = document.getElementById('drawerSaveBtn');
    const title = UI.val('f_title');
    if (!title) { UI.showToast('Title is required', 'error'); return; }

    btn.textContent = 'Saving…'; btn.disabled = true;

    try {
      // Upload title image
      let titleImageUrl = state.titleImagePreviewUrl || '';
      if (state.titleImageFile) {
        titleImageUrl = await UI.uploadImage(state.titleImageFile);
      }

      // Upload content images
      const contentImageUrls = [];
      for (const img of state.images) {
        if (img.url) contentImageUrls.push(img.url);
        else if (img.file) {
          const url = await UI.uploadImage(img.file);
          if (url) contentImageUrls.push(url);
        }
      }

      const payload = {
        title,
        category:         document.getElementById('f_category').value,
        titleImageUrl,
        contentImageUrls,
        updatedAt:        firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (state.editingId) {
        await db.collection('explainers').doc(state.editingId).update(payload);
        UI.showToast('Explainer updated', 'success');
      } else {
        payload.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection('explainers').add(payload);
        UI.showToast('Explainer created', 'success');
      }
      UI.closeDrawer();
    } catch (e) {
      UI.showToast('Error: ' + e.message, 'error');
    } finally {
      btn.textContent = 'Save'; btn.disabled = false;
    }
  },

  delete: (id, title) => {
    UI.showConfirm('Delete explainer?', `"${title}" will be removed.`, async () => {
      await db.collection('explainers').doc(id).delete();
      UI.showToast('Deleted');
    });
  },
};

// ─────────────────────────────────────────────────────────────────
// POLLS
// ─────────────────────────────────────────────────────────────────
const POLLS = {
  _unsub: null,
  _items: [],

  listen: () => {
    if (POLLS._unsub) POLLS._unsub();
    POLLS._unsub = db.collection('polls')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        POLLS._items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const badge = document.getElementById('badge-polls');
        if (badge) badge.textContent = POLLS._items.length;
        POLLS.render();
      });
  },

  render: () => {
    const list = document.getElementById('pollsList');
    if (!list) return;
    if (!POLLS._items.length) {
      list.innerHTML = `<div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="8" y2="16"/><line x1="16" y1="10" x2="16" y2="16"/></svg><p>No polls yet.</p></div>`;
      return;
    }
    list.innerHTML = POLLS._items.map(p => {
      const date = p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : '';
      return `
        <div class="item-card">
          <div class="item-body" style="padding-left:16px;">
            <div class="item-meta">${date ? `<span style="font-size:11px;color:var(--text-3)">${date}</span>` : ''}</div>
            <div class="item-title">${p.question || 'Untitled Poll'}</div>
            <div class="item-summary">${p.options ? p.options.length + ' Options' : '0 Options'} · ${p.category || 'General'}</div>
          </div>
          <div class="item-actions">
            <button class="icon-btn" onclick="POLLS.openForm('${p.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="icon-btn" onclick="POLLS.delete('${p.id}','${(p.question||'').replace(/'/g,"\\'")}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');
  },

  openForm: (id = null) => {
    const item = id ? POLLS._items.find(p => p.id === id) : null;
    state.editingId = id;

    const currentOpts = item?.options ? item.options.map(o => o.text || o.label || o).join(', ') : '';

    const html = `
      <div class="form-group">
        <label>Poll Question *</label>
        <input type="text" id="f_poll_q" value="${item?.question || ''}" placeholder="What is your favorite...?" />
      </div>
      <div class="form-group">
        <label>Options (comma separated) *</label>
        <textarea id="f_poll_opts" rows="3" placeholder="Option A, Option B, Option C">${currentOpts}</textarea>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="f_poll_cat">
          <option value="Tech">Tech</option>
          <option value="Politics">Politics</option>
          <option value="Global">Global</option>
          <option value="Markets">Markets</option>
          <option value="Culture">Culture</option>
          <option value="Science">Science</option>
        </select>
      </div>
    `;

    UI.openDrawer(id ? 'Edit Poll' : 'New Poll', html, POLLS.save);
    if (item?.category) setTimeout(() => { document.getElementById('f_poll_cat').value = item.category; }, 10);
  },

  save: async () => {
    const btn = document.getElementById('drawerSaveBtn');
    const q   = UI.val('f_poll_q');
    const optRaw = UI.val('f_poll_opts');
    
    if (!q || !optRaw) { UI.showToast('Question and Options are required', 'error'); return; }

    // Preserve existing vote counts when editing
    const existingItem = state.editingId ? POLLS._items.find(p => p.id === state.editingId) : null;
    const existingOpts = existingItem?.options || [];
    const options = optRaw.split(',').map(o => {
      const text = o.trim();
      const existing = existingOpts.find(e => (e.text || e.label) === text);
      return { text, votes: existing?.votes ?? 0 };
    }).filter(o => o.text);
    if (options.length < 2) { UI.showToast('At least 2 options needed', 'error'); return; }

    btn.textContent = 'Saving…'; btn.disabled = true;

    try {
      const category = document.getElementById('f_poll_cat').value;
      if (state.editingId) {
        await db.collection('polls').doc(state.editingId).update({ question: q, options, category, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        UI.showToast('Poll updated', 'success');
      } else {
        await db.collection('polls').add({ question: q, options, category, totalVotes: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        UI.showToast('Poll created', 'success');
      }
      UI.closeDrawer();
    } catch (e) {
      UI.showToast('Error: ' + e.message, 'error');
    } finally {
      btn.textContent = 'Save'; btn.disabled = false;
    }
  },

  delete: (id, q) => {
    UI.showConfirm('Delete poll?', `"${q}" will be removed.`, async () => {
      await db.collection('polls').doc(id).delete();
      UI.showToast('Deleted');
    });
  },
};

// ─────────────────────────────────────────────────────────────────
// DISCUSSIONS
// ─────────────────────────────────────────────────────────────────
const DISCUSSIONS = {
  _unsub: null,
  _items: [],

  listen: () => {
    if (DISCUSSIONS._unsub) DISCUSSIONS._unsub();
    DISCUSSIONS._unsub = db.collection('discussions')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        DISCUSSIONS._items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const badge = document.getElementById('badge-discussions');
        if (badge) badge.textContent = DISCUSSIONS._items.length;
        DISCUSSIONS.render();
      });
  },

  render: () => {
    const list = document.getElementById('discussionsList');
    if (!list) return;
    if (!DISCUSSIONS._items.length) {
      list.innerHTML = `<div class="empty-state"><p>No discussions yet.</p></div>`;
      return;
    }
    list.innerHTML = DISCUSSIONS._items.map(d => {
      const date = d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : '';
      return `
        <div class="item-card">
          <div class="item-body" style="padding-left:16px;">
            <div class="item-meta">${date ? `<span style="font-size:11px;color:var(--text-3)">${date}</span>` : ''}</div>
            <div class="item-title">${d.title || 'Untitled'}</div>
            <div class="item-summary">${d.topic || ''}</div>
          </div>
          <div class="item-actions">
            <button class="icon-btn" onclick="DISCUSSIONS.openForm('${d.id}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="icon-btn" onclick="DISCUSSIONS.delete('${d.id}','${(d.title||'').replace(/'/g,"\\'")}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');
  },

  openForm: (id = null) => {
    const item = id ? DISCUSSIONS._items.find(d => d.id === id) : null;
    state.editingId = id;
    const html = `
      <div class="form-group">
        <label>Discussion Title *</label>
        <input type="text" id="f_disc_title" value="${item?.title || ''}" placeholder="e.g. Town Hall Debate" />
      </div>
      <div class="form-group">
        <label>Topic / Description *</label>
        <textarea id="f_disc_topic" rows="3" placeholder="Discussing the new XYZ policy...">${item?.topic || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Tag (Optional)</label>
        <input type="text" id="f_disc_tag" value="${item?.tag || ''}" placeholder="Politics" />
      </div>
    `;
    UI.openDrawer(id ? 'Edit Discussion' : 'New Discussion', html, DISCUSSIONS.save);
  },

  save: async () => {
    const btn = document.getElementById('drawerSaveBtn');
    const title = UI.val('f_disc_title');
    const topic = UI.val('f_disc_topic');
    
    if (!title || !topic) { UI.showToast('Title and topic are required', 'error'); return; }

    btn.textContent = 'Saving…'; btn.disabled = true;

    try {
      const tag = UI.val('f_disc_tag') || 'Discussion';
      if (state.editingId) {
        await db.collection('discussions').doc(state.editingId).update({ title, topic, tag, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
        UI.showToast('Discussion updated', 'success');
      } else {
        await db.collection('discussions').add({ title, topic, tag, commentCount: 0, totalComments: 0, totalLikes: 0, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        UI.showToast('Discussion thread created', 'success');
      }
      UI.closeDrawer();
    } catch (e) {
      UI.showToast('Error: ' + e.message, 'error');
    } finally {
      btn.textContent = 'Save'; btn.disabled = false;
    }
  },

  delete: (id, title) => {
    UI.showConfirm('Delete discussion?', `"${title}" will be removed.`, async () => {
      await db.collection('discussions').doc(id).delete();
      UI.showToast('Deleted');
    });
  },
};

// ─────────────────────────────────────────────────────────────────
// SPOTLIGHTS
// ─────────────────────────────────────────────────────────────────
const SPOTLIGHTS = {
  _unsub: null,
  _items: [],

  listen: () => {
    if (SPOTLIGHTS._unsub) SPOTLIGHTS._unsub();
    SPOTLIGHTS._unsub = db.collection('spotlights')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        SPOTLIGHTS._items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const badge = document.getElementById('badge-spotlights');
        if (badge) badge.textContent = SPOTLIGHTS._items.length;
        SPOTLIGHTS.render();
      });
  },

  render: () => {
    const list = document.getElementById('spotlightsList');
    if (!list) return;
    if (!SPOTLIGHTS._items.length) {
      list.innerHTML = `<div class="empty-state"><p>No spotlights yet.</p></div>`;
      return;
    }
    list.innerHTML = SPOTLIGHTS._items.map(s => {
      const thumb = s.authorAvatar ? `<img class="item-thumb" src="${s.authorAvatar}" onerror="this.style.display='none'" style="border-radius:50%;" />` : `<div class="item-thumb" style="border-radius:50%;"></div>`;
      const date = s.createdAt?.toDate ? s.createdAt.toDate().toLocaleDateString() : '';
      return `
        <div class="item-card">
          ${thumb}
          <div class="item-body" style="padding-left:16px;">
            <div class="item-meta">${date ? `<span style="font-size:11px;color:var(--text-3)">${date}</span>` : ''}</div>
            <div class="item-title">${s.authorName || 'Unnamed'} — ${s.authorTitle || ''}</div>
            <div class="item-summary">"${s.quote || ''}"</div>
          </div>
          <div class="item-actions">
            <button class="icon-btn" onclick="SPOTLIGHTS.delete('${s.id}','${(s.authorName||'').replace(/'/g,"\\'")}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');
  },

  openForm: () => {
    state.images = []; // reset images
    const html = `
      <div class="form-group">
        <label>Badge</label>
        <input type="text" id="f_spot_badge" placeholder="Exclusive Interview" />
      </div>
      <div class="form-group">
        <label>Author Name *</label>
        <input type="text" id="f_spot_name" placeholder="John Doe" />
      </div>
      <div class="form-group">
        <label>Author Title *</label>
        <input type="text" id="f_spot_title" placeholder="CEO at Example" />
      </div>
      <div class="form-group">
        <label>Quote *</label>
        <textarea id="f_spot_quote" rows="4" placeholder="Their quote..."></textarea>
      </div>
      <div class="form-group">
        <label>Author Avatar</label>
        <input type="file" id="f_images" accept="image/*" onchange="UI.handleLocalImageSelect(event)" />
        <div id="multiImagePreview" class="multi-img-preview"></div>
      </div>
    `;
    UI.openDrawer('New Spotlight', html, SPOTLIGHTS.save);
  },

  save: async () => {
    const btn = document.getElementById('drawerSaveBtn');
    const name = UI.val('f_spot_name');
    const title = UI.val('f_spot_title');
    const quote = UI.val('f_spot_quote');
    
    if (!name || !title || !quote) { UI.showToast('Name, title, and quote are required', 'error'); return; }

    btn.textContent = 'Saving…'; btn.disabled = true;

    try {
      let avatarUrl = '';
      if (state.images.length > 0 && state.images[0].file) {
        avatarUrl = await UI.uploadImage(state.images[0].file);
      }

      const payload = {
        badge: UI.val('f_spot_badge') || 'Interview',
        authorName: name,
        authorTitle: title,
        quote: quote,
        authorAvatar: avatarUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await db.collection('spotlights').add(payload);
      UI.showToast('Spotlight created', 'success');
      UI.closeDrawer();
    } catch (e) {
      UI.showToast('Error: ' + e.message, 'error');
    } finally {
      btn.textContent = 'Save'; btn.disabled = false;
    }
  },

  delete: (id, name) => {
    UI.showConfirm('Delete spotlight?', `"${name}" will be removed.`, async () => {
      await db.collection('spotlights').doc(id).delete();
      UI.showToast('Deleted');
    });
  },
};

