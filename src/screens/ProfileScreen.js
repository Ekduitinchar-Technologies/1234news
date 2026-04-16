import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Platform, Switch, Modal, TextInput, FlatList, KeyboardAvoidingView, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { auth, subscribeUserProfile, updateUserProfile, subscribeBookmarks, toggleSaveArticle, loginUser, registerUser, logoutUser } from '../services/firebaseService';
import GlobalHeader from '../components/GlobalHeader';

const colors = {
  background: '#f7f9fb',
  surfaceLowest: '#ffffff',
  surfaceLow: '#f0f4f7',
  surfaceHighest: '#dce4e8',
  primary: '#526075',
  primaryContainer: '#d5e3fd',
  onPrimaryContainer: '#455367',
  onSurface: '#2c3437',
  onSurfaceVariant: '#596064',
  outline: '#747c80',
  errorContainerLight: 'rgba(250, 116, 111, 0.2)',
  error: '#a83836',
  white: '#ffffff',
  secondaryContainer: '#d4e4f6',
  onSecondaryContainer: '#445362',
};

const ALL_MOCK_SOURCES = [
  { id: '1', name: 'Kantipur', sub: 'National Daily', letter: 'K' },
  { id: '2', name: 'Online Khabar', sub: 'Digital First', letter: 'O' },
  { id: '3', name: 'Ratopati', sub: 'Breaking News', letter: 'R' },
  { id: '4', name: 'Setopati', sub: 'Social & Political', letter: 'S' },
  { id: '5', name: 'Khabarhub', sub: 'Mainstream Bias-free', letter: 'K' },
  { id: '6', name: 'Nepalnews', sub: 'Oldest Digital', letter: 'N' },
  { id: '7', name: 'The Himalayan', sub: 'English Daily', letter: 'H' },
  { id: '8', name: 'Kathmandu Post', sub: 'Premier Weekly', letter: 'K' },
  { id: '9', name: 'My Republica', sub: 'Investigative', letter: 'M' },
  { id: '10', name: 'Annapurna Post', sub: 'Visual News', letter: 'A' },
  { id: '11', name: 'Ujyaalo', sub: 'Radio Network', letter: 'U' },
  { id: '12', name: 'RSS Nepal', sub: 'News Agency', letter: 'R' },
];


export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  
  // State
  const [streakCount, setStreakCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [readingGoal, setReadingGoal] = useState(25);
  const [tags, setTags] = useState(['Tech', 'Politics', 'Sports', 'Science', 'Business', 'Art', 'Design']);
  const [language, setLanguage] = useState('English (US)');
  const [selectedSources, setSelectedSources] = useState(['1', '2', '3']);
  const [userName, setUserName] = useState('Guest Reader');
  const [userAvatar, setUserAvatar] = useState('https://picsum.photos/seed/anon/100/100');
  const [stats, setStats] = useState({ articlesRead: 0, commentsPosted: 0 });
  const [savedArticles, setSavedArticles] = useState([]);
  const [savedIds, setSavedIds] = useState([]);

  // Auth
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Modals Visibility
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [sourcesModalVisible, setSourcesModalVisible] = useState(false);
  const [savedNewsModalVisible, setSavedNewsModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [tempNameInput, setTempNameInput] = useState('');
  const [tempAvatarInput, setTempAvatarInput] = useState('');

  useEffect(() => {
    handleDailyStreak();
    loadReadingGoal();
  }, []);

  useEffect(() => {
    return subscribeUserProfile((profile) => {
      if (profile && !profile.isAnonymous) {
        setUserName(profile.displayName || 'Reader');
        setUserAvatar(profile.photoUrl || 'https://picsum.photos/seed/user/100/100');
        setStats(profile.stats || { articlesRead: 0, commentsPosted: 0 });
      } else {
        setUserName('Guest Reader');
        setUserAvatar('https://picsum.photos/seed/anon/100/100');
        setStats({ articlesRead: 0, commentsPosted: 0 });
      }
    });
  }, []);

  useEffect(() => {
    return subscribeBookmarks((bookmarks) => {
      setSavedIds(bookmarks.map(b => b.articleId));
      setSavedArticles(bookmarks.map(b => ({
        id: b.articleId,
        title: b.title,
        img: b.imageUrl,
        time: new Date(b.savedAt || Date.now()).toLocaleDateString(),
      })));
    });
  }, []);

  const handleUnsave = async (articleId) => {
    // Optimistic UI toggle
    setSavedIds(prev => prev.filter(id => id !== articleId));
    await toggleSaveArticle({ id: articleId });
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access your photo library is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setTempAvatarInput(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (auth.currentUser?.isAnonymous) {
      setEditProfileModalVisible(false);
      setAuthModalVisible(true);
      return;
    }
    const update = {};
    if (tempNameInput.trim()) update.displayName = tempNameInput.trim();
    if (tempAvatarInput.trim()) update.photoUrl = tempAvatarInput.trim();
    
    await updateUserProfile(update);
    setEditProfileModalVisible(false);
  };

  const handleAuthSubmit = async () => {
    try {
      if (isLoginMode) {
        await loginUser(authEmail, authPassword);
      } else {
        await registerUser(authEmail, authPassword, authName || 'Reader');
      }
      setAuthModalVisible(false);
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      alert("Authentication error: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {}
  };

  const handleDailyStreak = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastOpened = await AsyncStorage.getItem('LAST_OPENED_DATE');
      const currentStreakStr = await AsyncStorage.getItem('STREAK_COUNT');
      let currentStreak = parseInt(currentStreakStr) || 0;

      if (!lastOpened) {
        currentStreak = 1;
      } else if (lastOpened !== today) {
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        if (lastOpened === yesterday) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      }

      setStreakCount(currentStreak);
      await AsyncStorage.setItem('LAST_OPENED_DATE', today);
      await AsyncStorage.setItem('STREAK_COUNT', currentStreak.toString());
    } catch (e) {
      console.log('Streak parsing error', e);
    }
  };

  const loadReadingGoal = async () => {
    try {
      const val = await AsyncStorage.getItem('READING_GOAL');
      if (val) setReadingGoal(parseInt(val));
    } catch (e) {}
  };

  const saveReadingGoal = async (val) => {
    try {
      await AsyncStorage.setItem('READING_GOAL', Math.round(val).toString());
    } catch (e) {}
  };

  const handleAddTag = () => {
    if (newTagInput.trim().length > 0) {
      setTags([...tags, newTagInput.trim()]);
    }
    setNewTagInput('');
    setTagModalVisible(false);
  };

  const handleRemoveTag = (tag) => {
    Alert.alert(
      "Remove Interest",
      `Do you want to remove "${tag}" from your interests?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => {
          setTags(tags.filter(t => t !== tag));
        }},
      ]
    );
  };

  const toggleSourceSelection = (id) => {
    if (selectedSources.includes(id)) {
      setSelectedSources(selectedSources.filter(sId => sId !== id));
    } else {
      setSelectedSources([...selectedSources, id]);
    }
  };

  const visibleSources = ALL_MOCK_SOURCES.filter(s => selectedSources.includes(s.id)).slice(0, 4);

  const getBlurStyle = () => {
    if (Platform.OS === 'android') {
      return { backgroundColor: 'rgba(255,255,255,0.85)' }; // Android fallback for popup backgrounds
    }
    return {};
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginHorizontal: -24, marginBottom: 24 }}>
          <GlobalHeader isScrollable />
        </View>

        {/* User Profile Header Section */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainerWrapper}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: userAvatar }} 
                style={styles.avatarImage} 
              />
            </View>
            <View style={styles.streakBadge}>
              <MaterialIcons name="menu-book" size={14} color={colors.white} />
              <Text style={styles.streakText}>{stats.articlesRead} Reads</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <TouchableOpacity style={styles.nameRow} activeOpacity={0.7} onPress={() => { setTempNameInput(userName); setTempAvatarInput(userAvatar); setEditProfileModalVisible(true); }}>
              <Text style={styles.profileName}>{userName}</Text>
              <MaterialIcons name="edit" size={18} color={colors.primary} />
            </TouchableOpacity>
            {!auth.currentUser || auth.currentUser.isAnonymous ? (
              <TouchableOpacity onPress={() => { setIsLoginMode(true); setAuthModalVisible(true); }}>
                <Text style={[styles.profileEmail, { color: colors.primary, fontFamily: 'Inter_600SemiBold', textDecorationLine: 'underline' }]}>Sign In / Register</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.profileEmail}>{auth.currentUser?.email}</Text>
            )}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Interests</Text>
          </View>
          <View style={styles.chipContainer}>
            {tags.map((tag, i) => (
              <TouchableOpacity 
                key={i} 
                style={styles.chipActive} 
                activeOpacity={0.8}
                onLongPress={() => handleRemoveTag(tag)}
              >
                <Text style={styles.chipTextActive}>{tag}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.chipAdd} activeOpacity={0.7} onPress={() => setTagModalVisible(true)}>
              <MaterialIcons name="add" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.chipTextInactive}>Add Tag</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Your Sources */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Sources</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSourcesModalVisible(true)}>
              <Text style={styles.editAction}>See more</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sourcesGrid}>
            {visibleSources.map(source => (
               <TouchableOpacity key={source.id} style={styles.sourceCard} activeOpacity={0.7}>
                 <View style={styles.sourceIconBox}><Text style={styles.sourceIconLetter}>{source.letter}</Text></View>
                 <View style={styles.sourceInfo}>
                   <Text style={styles.sourceName} numberOfLines={1}>{source.name}</Text>
                   <Text style={styles.sourceSub} numberOfLines={1}>{source.sub}</Text>
                 </View>
               </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Saved News */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saved News</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSavedNewsModalVisible(true)}>
              <Text style={styles.editAction}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.savedNewsList}>
            {savedArticles.length === 0 ? (
              <View style={styles.savedEmpty}>
                <MaterialIcons name="bookmark-border" size={32} color={colors.onSurfaceVariant} />
                <Text style={styles.savedEmptyText}>No saved articles yet.{"\n"}Bookmark articles on the home feed!</Text>
              </View>
            ) : (
              savedArticles.slice(0, 2).map(news => (
                <TouchableOpacity 
                  key={news.id} 
                  style={styles.savedCard} 
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('ArticleDetail', { article: news })}
                >
                  <Image source={{ uri: news.img }} style={styles.savedImage} />
                  <View style={styles.savedInfo}>
                    <Text style={styles.savedTitle} numberOfLines={2}>{news.title}</Text>
                    <View style={styles.savedMetaRow}>
                      <MaterialIcons name="schedule" size={12} color={colors.onSurfaceVariant} />
                      <Text style={styles.savedMetaText}>{news.time}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleUnsave(news.id)} style={{ padding: 8 }}>
                    <MaterialIcons 
                      name={savedIds.includes(news.id) ? "bookmark" : "bookmark-outline"} 
                      size={22} 
                      color={savedIds.includes(news.id) ? colors.primary : colors.onSurfaceVariant} 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Reading Goal slider */}
        <View style={styles.goalSection}>
          <View style={styles.goalHeader}>
            <View>
              <Text style={styles.goalTitle}>Reading Goal</Text>
              <Text style={styles.goalSub}>Daily news consumption target</Text>
            </View>
            <Text style={styles.goalValue}>{Math.round(readingGoal)}m</Text>
          </View>

          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={5}
            maximumValue={120}
            value={readingGoal}
            onValueChange={setReadingGoal}
            onSlidingComplete={saveReadingGoal}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.secondaryContainer}
            thumbTintColor={colors.primary}
          />

          <View style={styles.goalLabels}>
            <Text style={styles.goalLabelText}>5 MIN</Text>
            <Text style={styles.goalLabelText}>60 MIN</Text>
            <Text style={styles.goalLabelText}>2 HOURS</Text>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Settings</Text>
          <View style={styles.settingsBlock}>
            
            {/* Theme Toggle */}
            <View style={styles.settingRowItem}>
              <View style={styles.settingRowLeft}>
                <MaterialIcons name="dark-mode" size={20} color={colors.onSurfaceVariant} />
                <Text style={styles.settingLabel}>Appearance</Text>
              </View>
              <View style={styles.themeToggleBg}>
                <TouchableOpacity style={[styles.themeBtn, !isDarkMode ? styles.themeBtnActive : null]} onPress={() => setIsDarkMode(false)}>
                  <Text style={[styles.themeBtnText, !isDarkMode ? styles.themeBtnTextActive : null]}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.themeBtn, isDarkMode ? styles.themeBtnActive : null]} onPress={() => setIsDarkMode(true)}>
                  <Text style={[styles.themeBtnText, isDarkMode ? styles.themeBtnTextActive : null]}>Dark</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.separator} />

            {/* Language */}
            <TouchableOpacity style={styles.settingRowItem} activeOpacity={0.7} onPress={() => setLanguageModalVisible(true)}>
              <View style={styles.settingRowLeft}>
                <MaterialIcons name="language" size={20} color={colors.onSurfaceVariant} />
                <Text style={styles.settingLabel}>Language</Text>
              </View>
              <Text style={styles.settingValueText}>{language}</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            {/* Notifications */}
            <View style={styles.settingRowItem}>
              <View style={styles.settingRowLeft}>
                <MaterialIcons name="notifications-active" size={20} color={colors.onSurfaceVariant} />
                <Text style={styles.settingLabel}>Breaking News Alerts</Text>
              </View>
              <Switch 
                value={alertsEnabled} 
                onValueChange={setAlertsEnabled} 
                trackColor={{ false: colors.surfaceHighest, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>Support</Text>
          
          <TouchableOpacity style={styles.supportLink} activeOpacity={0.7} onPress={() => navigation.navigate('Privacy')}>
            <Text style={styles.supportLabel}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportLink} activeOpacity={0.7} onPress={() => navigation.navigate('Terms')}>
            <Text style={styles.supportLabel}>Terms of Service</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportLink} activeOpacity={0.7} onPress={() => navigation.navigate('Contact')}>
            <Text style={styles.supportLabel}>Contact Support</Text>
            <MaterialIcons name="chevron-right" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          {auth.currentUser && !auth.currentUser.isAnonymous && (
            <View style={styles.logoutContainer}>
              <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>

      {/* --- MODALS --- */}
      
      {/* 1. Add Tag Modal */}
      <Modal visible={tagModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            {Platform.OS !== 'android' ? <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} /> : <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />}
            <View style={styles.modalDialog}>
              <Text style={styles.modalTitle}>Add New Custom Tag</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="e.g. Artificial Intelligence"
                placeholderTextColor={colors.onSurfaceVariant}
                value={newTagInput}
                onChangeText={setNewTagInput}
                autoFocus
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setTagModalVisible(false)} style={styles.modalBtnCancel}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddTag} style={styles.modalBtnSubmit}>
                  <Text style={styles.modalBtnTextSubmit}>Create Tag</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2. Language Selection Modal */}
      <Modal visible={languageModalVisible} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlayDismissable} onPress={() => setLanguageModalVisible(false)} activeOpacity={1}>
          <TouchableOpacity style={styles.bottomSheet} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Language</Text>
            {['English (US)', 'Nepali (नेपाली)', 'Spanish (ES)', 'French (FR)'].map((lang, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.sheetOption} 
                onPress={() => { setLanguage(lang); setLanguageModalVisible(false); }}
              >
                <Text style={[styles.sheetOptionText, language === lang && { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>{lang}</Text>
                {language === lang && <MaterialIcons name="check" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* 3. View All Sources Modal */}
      <Modal visible={sourcesModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlayFullscreen}>
          <View style={[styles.fullscreenModal, getBlurStyle()]}>
            {Platform.OS !== 'android' && <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFillObject} />}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>All Integrations</Text>
                <TouchableOpacity onPress={() => setSourcesModalVisible(false)}>
                  <MaterialIcons name="close" size={28} color={colors.onSurface} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView contentContainerStyle={{ paddingTop: Math.max(insets.top, 12) + 80, paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}>
              <Text style={styles.modalSubtitle}>Select which outlets aggregate to your For You feed.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {ALL_MOCK_SOURCES.map(source => {
                  const isActive = selectedSources.includes(source.id);
                  return (
                    <TouchableOpacity 
                      key={source.id} 
                      style={[styles.sourceCardFull, isActive && { borderColor: colors.primary, backgroundColor: colors.white }]} 
                      onPress={() => toggleSourceSelection(source.id)} 
                      activeOpacity={0.7}
                    >
                      <View style={[styles.sourceIconBoxLarge, isActive && { backgroundColor: colors.primaryContainer }]}>
                        <Text style={[styles.sourceIconLetter, isActive && { color: colors.primary }]}>{source.letter}</Text>
                      </View>
                      <View style={styles.sourceInfoFull}>
                        <Text style={styles.sourceNameLarge}>{source.name}</Text>
                        <Text style={styles.sourceSubLarge}>{source.sub}</Text>
                      </View>
                      <Switch 
                        value={isActive} 
                        onValueChange={() => toggleSourceSelection(source.id)} 
                        trackColor={{ true: colors.primary, false: colors.surfaceHighest }} 
                        thumbColor={colors.white} 
                        style={{ transform: [{ scale: 0.8 }] }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. View All Saved News Modal */}
      <Modal visible={savedNewsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlayFullscreen}>
          <View style={[styles.fullscreenModal, getBlurStyle()]}>
            {Platform.OS !== 'android' && <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFillObject} />}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Saved Articles</Text>
                <TouchableOpacity onPress={() => setSavedNewsModalVisible(false)}>
                  <MaterialIcons name="close" size={28} color={colors.onSurface} />
                </TouchableOpacity>
              </View>
            </View>
            <FlatList 
              data={savedArticles}
              keyExtractor={item => item.id}
              contentContainerStyle={{ paddingTop: Math.max(insets.top, 12) + 80, paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.savedCardModal, { marginBottom: 16 }]} 
                  activeOpacity={0.7}
                  onPress={() => {
                    setSavedNewsModalVisible(false);
                    navigation.navigate('ArticleDetail', { article: item });
                  }}
                >
                  <Image source={{ uri: item.img }} style={styles.savedImageLarge} />
                  <View style={styles.savedInfo}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={styles.savedTitleLarge} numberOfLines={2}>{item.title}</Text>
                      <TouchableOpacity onPress={() => handleUnsave(item.id)} style={{ padding: 4 }}>
                        <MaterialIcons 
                          name={savedIds.includes(item.id) ? "bookmark" : "bookmark-outline"} 
                          size={24} 
                          color={savedIds.includes(item.id) ? colors.primary : colors.onSurfaceVariant} 
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.savedMetaRow}>
                      <MaterialIcons name="schedule" size={12} color={colors.onSurfaceVariant} />
                      <Text style={styles.savedMetaText}>{item.time}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* 5. Edit Profile Modal */}
      <Modal visible={editProfileModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            {Platform.OS !== 'android' ? <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} /> : <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />}
            <View style={styles.modalDialog}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="Your name"
                placeholderTextColor={colors.onSurfaceVariant}
                value={tempNameInput}
                onChangeText={setTempNameInput}
              />
              
              <Text style={styles.inputLabel}>Profile Picture</Text>
              <View style={styles.avatarPickerRow}>
                <Image source={{ uri: tempAvatarInput || userAvatar }} style={styles.avatarPreview} />
                <TouchableOpacity style={styles.pickImageBtn} onPress={handlePickImage} activeOpacity={0.8}>
                  <MaterialIcons name="photo-library" size={20} color={colors.white} />
                  <Text style={styles.pickImageBtnText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Or paste Avatar URL</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="https://..."
                placeholderTextColor={colors.onSurfaceVariant}
                value={tempAvatarInput}
                onChangeText={setTempAvatarInput}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setEditProfileModalVisible(false)} style={styles.modalBtnCancel}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveProfile} style={styles.modalBtnSubmit}>
                  <Text style={styles.modalBtnTextSubmit}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* 6. Auth Modal */}
      <Modal visible={authModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            {Platform.OS !== 'android' ? <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} /> : <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />}
            <View style={styles.modalDialog}>
              <Text style={styles.modalTitle}>{isLoginMode ? 'Welcome Back' : 'Join Lucid News'}</Text>
              
              {!isLoginMode && (
                <>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput 
                    style={styles.modalInput} 
                    placeholder="John Doe"
                    placeholderTextColor={colors.onSurfaceVariant}
                    value={authName}
                    onChangeText={setAuthName}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="Email address"
                placeholderTextColor={colors.onSurfaceVariant}
                keyboardType="email-address"
                autoCapitalize="none"
                value={authEmail}
                onChangeText={setAuthEmail}
              />
              
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="Password"
                placeholderTextColor={colors.onSurfaceVariant}
                secureTextEntry
                value={authPassword}
                onChangeText={setAuthPassword}
              />

              <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)} style={{ marginBottom: 24 }}>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.primary, textAlign: 'center' }}>
                  {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setAuthModalVisible(false)} style={styles.modalBtnCancel}>
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAuthSubmit} style={styles.modalBtnSubmit}>
                  <Text style={styles.modalBtnTextSubmit}>{isLoginMode ? 'Sign In' : 'Register'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 24 },
  
  profileHeader: { alignItems: 'center', marginBottom: 40 },
  avatarContainerWrapper: { position: 'relative', marginBottom: 16 },
  avatarContainer: { width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: colors.surfaceLow, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  streakBadge: { position: 'absolute', bottom: -8, right: -16, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  streakText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.white, marginLeft: 4 },
  profileInfo: { alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 4, gap: 6 },
  profileName: { fontFamily: 'Manrope_800ExtraBold', fontSize: 24, color: colors.onSurface, letterSpacing: -0.5 },
  profileEmail: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.onSurfaceVariant },

  section: { marginBottom: 36 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: colors.onSurface },
  editAction: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.primary },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipActive: { backgroundColor: colors.primaryContainer, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  chipTextActive: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.onPrimaryContainer },
  chipAdd: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: colors.surfaceHighest, borderStyle: 'dashed', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, gap: 4 },
  chipTextInactive: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.onSurfaceVariant },

  sourcesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16 },
  sourceCard: { backgroundColor: colors.surfaceLow, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, flexBasis: '48%', flexGrow: 1 },
  sourceIconBox: { width: 40, height: 40, backgroundColor: colors.surfaceLow, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  sourceIconLetter: { fontFamily: 'Manrope_800ExtraBold', fontSize: 18, color: colors.primary },
  sourceInfo: { flex: 1 },
  sourceName: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.onSurface, marginBottom: 2 },
  sourceSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.onSurfaceVariant },

  savedNewsList: { gap: 12 },
  savedCard: { backgroundColor: colors.surfaceLowest, borderWidth: 1, borderColor: colors.surfaceLow, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 16 },
  savedImage: { width: 80, height: 64, borderRadius: 8, backgroundColor: colors.surfaceLow },
  savedInfo: { flex: 1 },
  savedTitle: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: colors.onSurface, lineHeight: 20, marginBottom: 6 },
  savedMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  savedMetaText: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.onSurfaceVariant },
  savedEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28, gap: 10 },
  savedEmptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 20 },

  goalSection: { backgroundColor: 'rgba(212, 228, 246, 0.3)', borderRadius: 16, padding: 24, marginBottom: 36 },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  goalTitle: { fontFamily: 'Manrope_700Bold', fontSize: 18, color: colors.onSecondaryContainer, marginBottom: 4 },
  goalSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(68, 83, 98, 0.7)' },
  goalValue: { fontFamily: 'Manrope_800ExtraBold', fontSize: 24, color: colors.primary },
  goalLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  goalLabelText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: 'rgba(68, 83, 98, 0.5)', letterSpacing: 1 },

  settingsBlock: { backgroundColor: colors.surfaceLowest, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  settingRowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  settingRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  settingLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.onSurface },
  settingValueText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.primary },
  separator: { height: 1, backgroundColor: colors.surfaceLow },
  themeToggleBg: { flexDirection: 'row', backgroundColor: colors.background, padding: 4, borderRadius: 20 },
  themeBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  themeBtnActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  themeBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.onSurfaceVariant },
  themeBtnTextActive: { color: colors.onSurface },

  /* Modal Specific Styles */
  sourceCardFull: { 
    backgroundColor: 'rgba(255,255,255,0.6)', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  sourceIconBoxLarge: { 
    width: 48, 
    height: 48, 
    backgroundColor: colors.surfaceLow, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  sourceInfoFull: { flex: 1 },
  sourceNameLarge: { fontFamily: 'Manrope_700Bold', fontSize: 16, color: colors.onSurface, marginBottom: 2 },
  sourceSubLarge: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.onSurfaceVariant },

  savedCardModal: { 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    borderRadius: 20, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3
  },
  savedImageLarge: { width: 100, height: 80, borderRadius: 12, backgroundColor: colors.surfaceLow },
  savedTitleLarge: { 
    fontFamily: 'Manrope_700Bold', 
    fontSize: 16, 
    color: colors.onSurface, 
    lineHeight: 22, 
    flex: 1,
    marginRight: 8
  },

  supportLink: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 4 },
  supportLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.onSurface },
  logoutContainer: { marginTop: 24, paddingHorizontal: 4 },
  logoutBtn: { backgroundColor: colors.errorContainerLight, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  logoutBtnText: { fontFamily: 'Manrope_700Bold', fontSize: 14, color: colors.error },

  /* Existing Modal Base Styles */
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalDialog: { width: '100%', backgroundColor: colors.surfaceLowest, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 18, color: colors.onSurface, marginBottom: 16 },
  inputLabel: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 8 },
  avatarPickerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatarPreview: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceLow },
  pickImageBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12 },
  pickImageBtnText: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.white },
  modalInput: { height: 50, backgroundColor: colors.surfaceLow, borderRadius: 12, paddingHorizontal: 16, fontFamily: 'Inter_500Medium', fontSize: 16, color: colors.onSurface, marginBottom: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalBtnCancel: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  modalBtnTextCancel: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: colors.onSurfaceVariant },
  modalBtnSubmit: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  modalBtnTextSubmit: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#fff' },

  modalOverlayFullscreen: { flex: 1 },
  fullscreenModal: { flex: 1, backgroundColor: colors.background },
  modalSubtitle: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.onSurfaceVariant, marginBottom: 24 },
  sourceListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLowest, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.surfaceHighest },

  modalOverlayDismissable: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomSheet: { backgroundColor: colors.surfaceLowest, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 60, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  sheetHandle: { width: 40, height: 4, backgroundColor: colors.surfaceHighest, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: 18, color: colors.onSurface, marginBottom: 24 },
  sheetOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.surfaceLow },
  sheetOptionText: { fontFamily: 'Inter_500Medium', fontSize: 16, color: colors.onSurfaceVariant },
});
