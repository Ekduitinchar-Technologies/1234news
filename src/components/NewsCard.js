import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography, spacing, radius } from '../theme/typography';

const { width } = Dimensions.get('window');

export function FeaturedCard({ article, onPress, onBookmark }) {
  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.92}>
      <Image source={{ uri: article.imageUrl }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay} />
      <View style={styles.featuredContent}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{article.categoryLabel}</Text>
        </View>
        <Text style={styles.featuredTitle} numberOfLines={3}>{article.title}</Text>
        <View style={styles.featuredMeta}>
          <Text style={styles.featuredMetaText}>{article.author} · {article.publishedAt}</Text>
          <View style={styles.metaRight}>
            <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.8)" />
            <Text style={styles.featuredMetaText}> {article.readTime}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.bookmarkBtn} onPress={onBookmark}>
        <Ionicons
          name={article.isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={20}
          color={article.isBookmarked ? colors.primaryContainer : colors.white}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export function NewsCard({ article, onPress, onBookmark }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.cardContent}>
        <View style={styles.cardTextArea}>
          <View style={styles.categoryChipSmall}>
            <Text style={styles.categoryChipSmallText}>{article.categoryLabel}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={3}>{article.title}</Text>
          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaText}>{article.publishedAt}</Text>
            <View style={styles.dot} />
            <Text style={styles.cardMetaText}>{article.readTime}</Text>
          </View>
        </View>
        <View style={styles.cardImageWrap}>
          <Image source={{ uri: article.imageUrl }} style={styles.cardImage} />
          <TouchableOpacity style={styles.cardBookmark} onPress={onBookmark}>
            <Ionicons
              name={article.isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={article.isBookmarked ? colors.primary : colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.cardStat}>
          <Ionicons name="heart-outline" size={13} color={colors.onSurfaceVariant} />
          <Text style={styles.cardStatText}>{article.likes.toLocaleString()}</Text>
        </View>
        <View style={styles.cardStat}>
          <Ionicons name="chatbubble-outline" size={13} color={colors.onSurfaceVariant} />
          <Text style={styles.cardStatText}>{article.comments.toLocaleString()}</Text>
        </View>
        <View style={styles.cardStat}>
          <Ionicons name="share-outline" size={13} color={colors.onSurfaceVariant} />
          <Text style={styles.cardStatText}>Share</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function StoryLoomCard({ article, onPress }) {
  return (
    <TouchableOpacity style={styles.storyCard} onPress={onPress} activeOpacity={0.9}>
      <Image source={{ uri: article.imageUrl }} style={styles.storyImage} />
      <View style={styles.storyOverlay} />
      <View style={styles.storyContent}>
        <View style={styles.categoryChipTiny}>
          <Text style={styles.categoryChipTinyText}>{article.categoryLabel}</Text>
        </View>
        <Text style={styles.storyTitle} numberOfLines={3}>{article.title}</Text>
        <Text style={styles.storyMeta}>{article.readTime}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Featured Card
  featuredCard: {
    width: width - 32,
    height: 300,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHighest,
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    background: 'transparent',
    backgroundColor: 'rgba(20,28,38,0.55)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  featuredTitle: {
    ...typography.headlineLg,
    color: colors.white,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredMetaText: {
    ...typography.labelSm,
    color: 'rgba(255,255,255,0.8)',
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Category Chip (on dark bg)
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  categoryChipText: {
    ...typography.labelSm,
    color: colors.white,
    textTransform: 'uppercase',
  },

  // News Card
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.xl,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTextArea: {
    flex: 1,
    gap: spacing.xs,
  },
  categoryChipSmall: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  categoryChipSmallText: {
    ...typography.labelSm,
    color: colors.onPrimaryContainer,
    textTransform: 'uppercase',
  },
  cardTitle: {
    ...typography.titleMd,
    color: colors.onSurface,
    marginTop: 2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 4,
  },
  cardMetaText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.outlineVariant,
  },
  cardImageWrap: {
    width: 90,
    height: 90,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardBookmark: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.full,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 0,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    gap: spacing.lg,
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardStatText: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
  },

  // Story Loom Card
  storyCard: {
    width: 160,
    height: 220,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHighest,
    marginLeft: spacing.lg,
  },
  storyImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  storyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,28,38,0.52)',
  },
  storyContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  categoryChipTiny: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  categoryChipTinyText: {
    ...typography.labelSm,
    color: colors.white,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  storyTitle: {
    ...typography.titleSm,
    color: colors.white,
    fontSize: 12,
    lineHeight: 16,
  },
  storyMeta: {
    ...typography.labelSm,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 4,
  },
});
