import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../lib/AuthContext';
import { useFeatures, useVote } from '../../hooks/useFeatures';
import { Feature, FeatureStatus } from '../../lib/types';
import Colors from '../../constants/Colors';

const STATUS_COLORS: Record<FeatureStatus, string> = {
  open: '#94a3b8',
  under_review: '#fbbf24',
  planned: '#60a5fa',
  in_progress: '#a78bfa',
  shipped: '#34d399',
  declined: '#ef4444',
};

const SORT_OPTIONS = [
  { key: 'score' as const, label: 'Top' },
  { key: 'newest' as const, label: 'New' },
  { key: 'comments' as const, label: 'Hot' },
];

function FeatureCard({
  item,
  onVote,
  onPress,
}: {
  item: Feature;
  onVote: () => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity style={styles.voteCol} onPress={onVote}>
        <Text style={[styles.voteArrow, item.user_has_voted && styles.voteActive]}>▲</Text>
        <Text style={[styles.voteCount, item.user_has_voted && styles.voteActive]}>
          {item.score}
        </Text>
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          {item.category_name && (
            <View style={[styles.categoryBadge, { backgroundColor: item.category_color || Colors.primary }]}>
              <Text style={styles.categoryText}>{item.category_name}</Text>
            </View>
          )}
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
              {item.status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.meta}>@{item.author_username}</Text>
          {item.is_boosted && <Text style={styles.boostBadge}>🚀 Boosted</Text>}
          <Text style={styles.meta}>💬 {item.comment_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const { session, profile } = useAuthContext();
  const [sortBy, setSortBy] = useState<'score' | 'newest' | 'comments'>('score');
  const { features, loading, refreshing, refresh, markUserVotes } = useFeatures(sortBy);
  const { toggleVote } = useVote();

  useEffect(() => {
    if (session?.user.id && features.length > 0) {
      markUserVotes(session.user.id);
    }
  }, [session?.user.id, features.length]);

  async function handleVote(feature: Feature) {
    if (!session?.user.id) return;
    await toggleVote(feature.id, session.user.id, !!feature.user_has_voted);
    refresh();
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sortBar}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.sortButton, sortBy === opt.key && styles.sortButtonActive]}
            onPress={() => setSortBy(opt.key)}
          >
            <Text style={[styles.sortText, sortBy === opt.key && styles.sortTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={features}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <FeatureCard
            item={item}
            onVote={() => handleVote(item)}
            onPress={() => router.push(`/feature/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No feature requests yet</Text>
            <Text style={styles.emptySubtext}>Be the first to submit one!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.surface,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
  },
  sortText: {
    color: Colors.dark.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  sortTextActive: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  voteCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: Colors.dark.surfaceBorder,
  },
  voteArrow: {
    fontSize: 18,
    color: Colors.dark.textSecondary,
  },
  voteCount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  voteActive: {
    color: Colors.primary,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  meta: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  boostBadge: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
});
