import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Dimensions,
  Image, TouchableOpacity, ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function TopicDetailScreen({ route, navigation }) {
  const { topic } = route.params;
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveIndex(idx);
  };

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.page, { width: SCREEN_W }]}>
        <Image source={{ uri: item.image }} style={StyleSheet.absoluteFillObject} />
        <LinearGradient 
          colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,1)']} 
          style={StyleSheet.absoluteFillObject} 
        />

        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <View style={styles.sourceRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={{ uri: item.sourceLogo }} style={styles.sourceLogo} />
              <Text style={styles.sourceName}>{item.sourceName}</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn} activeOpacity={0.7}>
              <MaterialIcons name="share" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.textScroll}>
            <Text style={styles.articleContent}>{item.content}</Text>
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={topic.articles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Header Overlay */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]} pointerEvents="box-none">
        <View style={styles.headerLeft}>
          <Text style={styles.topicBadge}>HOT TOPIC</Text>
          <Text style={styles.topicTitle}>{topic.topic}</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Pagination Indicators */}
      <View style={[styles.pagination, { bottom: Math.max(insets.bottom, 24) }]} pointerEvents="none">
        {topic.articles.map((_, i) => (
          <View key={i} style={[styles.dot, activeIndex === i && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  page: {
    height: '100%',
    justifyContent: 'flex-end',
  },
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    zIndex: 50,
  },
  headerLeft: {
    flex: 1,
  },
  topicBadge: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: '#38bdf8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  topicTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 24,
    color: '#fff',
  },
  closeBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 16,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    maxHeight: '80%',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shareBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  sourceLogo: {
    width: 28, height: 28,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  sourceName: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
  },
  textScroll: {
    flexGrow: 0,
  },
  articleContent: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 40, // Space for pagination
  },
  pagination: {
    position: 'absolute',
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 20,
  },
});
