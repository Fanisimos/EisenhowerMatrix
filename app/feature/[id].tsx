import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useAuthContext } from '../../lib/AuthContext';
import { useFeatureDetail, useComments, useVote } from '../../hooks/useFeatures';
import { FeatureStatus } from '../../lib/types';
import Colors from '../../constants/Colors';

const STATUS_COLORS: Record<FeatureStatus, string> = {
  open: '#94a3b8',
  under_review: '#fbbf24',
  planned: '#60a5fa',
  in_progress: '#a78bfa',
  shipped: '#34d399',
  declined: '#ef4444',
};

export default function FeatureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthContext();
  const { feature, loading: featureLoading } = useFeatureDetail(id);
  const { comments, loading: commentsLoading, addComment } = useComments(id);
  const { toggleVote } = useVote();
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);

  async function handleComment() {
    if (!newComment.trim() || !session?.user.id) return;
    setSending(true);
    await addComment(newComment.trim(), session.user.id);
    setNewComment('');
    setSending(false);
  }

  async function handleVote() {
    if (!session?.user.id || !feature) return;
    await toggleVote(feature.id, session.user.id, !!feature.user_has_voted);
  }

  if (featureLoading || !feature) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Loading...' }} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen
        options={{
          title: 'Feature',
          headerStyle: { backgroundColor: Colors.dark.background },
          headerTintColor: Colors.dark.text,
        }}
      />

      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.featureSection}>
            <View style={styles.headerRow}>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[feature.status] + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[feature.status] }]}>
                  {feature.status.replace('_', ' ')}
                </Text>
              </View>
              {feature.is_boosted && <Text style={styles.boostBadge}>🚀 Boosted</Text>}
            </View>

            <Text style={styles.title}>{feature.title}</Text>
            <Text style={styles.description}>{feature.description}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.author}>@{feature.author_username}</Text>
              {feature.category_name && (
                <View style={[styles.categoryBadge, { backgroundColor: feature.category_color || Colors.primary }]}>
                  <Text style={styles.categoryText}>{feature.category_name}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.voteButton, feature.user_has_voted && styles.voteButtonActive]}
                onPress={handleVote}
              >
                <Text style={[styles.voteButtonText, feature.user_has_voted && styles.voteButtonTextActive]}>
                  ▲ {feature.score}
                </Text>
              </TouchableOpacity>
              <Text style={styles.commentCountText}>💬 {feature.comment_count} comments</Text>
            </View>

            {feature.dev_response && (
              <View style={styles.devResponse}>
                <Text style={styles.devLabel}>Developer Response</Text>
                <Text style={styles.devText}>{feature.dev_response}</Text>
              </View>
            )}

            <Text style={styles.commentsTitle}>Comments</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.commentCard, item.is_dev_reply && styles.commentDev]}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUser}>
                @{item.username}
                {item.is_dev_reply && <Text style={styles.devTag}> DEV</Text>}
              </Text>
              <Text style={styles.commentDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.commentBody}>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={
          !commentsLoading ? (
            <Text style={styles.noComments}>No comments yet. Be the first!</Text>
          ) : null
        }
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          placeholderTextColor="#64748b"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newComment.trim() || sending) && styles.sendDisabled]}
          onPress={handleComment}
          disabled={!newComment.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  featureSection: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  boostBadge: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  author: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
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
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.dark.surfaceBorder,
    backgroundColor: Colors.dark.surface,
  },
  voteButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '22',
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark.textSecondary,
  },
  voteButtonTextActive: {
    color: Colors.primary,
  },
  commentCountText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  devResponse: {
    backgroundColor: Colors.primary + '15',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  devLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  devText: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.surfaceBorder,
    paddingTop: 16,
  },
  commentCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  commentDev: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentUser: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  devTag: {
    color: Colors.primary,
    fontSize: 11,
  },
  commentDate: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  commentBody: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  noComments: {
    textAlign: 'center',
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginTop: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.surfaceBorder,
    backgroundColor: Colors.dark.surface,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.dark.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
