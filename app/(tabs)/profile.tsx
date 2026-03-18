import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAuthContext } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { Feature } from '../../lib/types';
import Colors from '../../constants/Colors';

const TIER_INFO = {
  free: { label: 'Free', color: '#94a3b8', votes: 3, boosts: 0 },
  basic: { label: 'Basic', color: '#60a5fa', votes: 15, boosts: 3 },
  pro: { label: 'Pro', color: '#a78bfa', votes: '∞', boosts: 10 },
};

export default function ProfileScreen() {
  const { profile, session, signOut } = useAuthContext();
  const [myFeatures, setMyFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user.id) return;
    (async () => {
      const { data } = await supabase
        .from('features')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (data) setMyFeatures(data);
      setLoading(false);
    })();
  }, [session?.user.id]);

  if (!profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const tier = TIER_INFO[profile.tier];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.username}>@{profile.username}</Text>
        <View style={[styles.tierBadge, { backgroundColor: tier.color }]}>
          <Text style={styles.tierText}>{tier.label}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile.votes_remaining}</Text>
          <Text style={styles.statLabel}>Votes Left</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile.boosts_remaining}</Text>
          <Text style={styles.statLabel}>Boosts Left</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{myFeatures.length}</Text>
          <Text style={styles.statLabel}>Submitted</Text>
        </View>
      </View>

      {profile.tier === 'free' && (
        <View style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>Upgrade to Pro</Text>
          <Text style={styles.upgradeText}>
            Get unlimited votes, boosts, and priority support
          </Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Your Submissions</Text>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={myFeatures}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.featureItem}>
              <View style={styles.featureRow}>
                <Text style={styles.featureTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.featureScore}>▲ {item.score}</Text>
              </View>
              <Text style={styles.featureStatus}>{item.status.replace('_', ' ')}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>You haven't submitted any features yet</Text>
          }
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  tierBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.dark.surfaceBorder,
  },
  upgradeCard: {
    backgroundColor: Colors.dark.surface,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    marginBottom: 20,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
  },
  upgradeText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
    paddingHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featureItem: {
    backgroundColor: Colors.dark.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
    marginRight: 12,
  },
  featureScore: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  featureStatus: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.dark.textSecondary,
    fontSize: 14,
    marginTop: 20,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginBottom: 32,
    marginTop: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.error,
    alignItems: 'center',
  },
  signOutText: {
    color: Colors.dark.error,
    fontWeight: '600',
    fontSize: 15,
  },
});
