import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography, spacing, radius } from '../theme/typography';

export function CommentItem({ comment }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: comment.avatar }} style={styles.avatar} />
      <View style={styles.body}>
        <View style={styles.header}>
          <Text style={styles.author}>{comment.author}</Text>
          <Text style={styles.time}>{comment.time}</Text>
        </View>
        <Text style={styles.text}>{comment.text}</Text>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.likeRow}>
            <Ionicons name="heart-outline" size={13} color={colors.onSurfaceVariant} />
            <Text style={styles.likeCount}>{comment.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.replyBtn}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHigh,
  },
  body: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  author: { ...typography.labelMd, color: colors.onSurface, fontFamily: 'Inter_600SemiBold' },
  time: { ...typography.labelSm, color: colors.onSurfaceVariant },
  text: { ...typography.bodyMd, color: colors.onSurface, lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeCount: { ...typography.labelSm, color: colors.onSurfaceVariant },
  replyBtn: { ...typography.labelSm, color: colors.primary, fontFamily: 'Inter_600SemiBold' },
});
