import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Feature } from '../lib/types';

type SortBy = 'score' | 'newest' | 'comments';
type FilterStatus = 'all' | 'open' | 'planned' | 'in_progress' | 'shipped';

export function useFeatures(sortBy: SortBy = 'score', filterStatus: FilterStatus = 'all') {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeatures = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    let query = supabase.from('features_with_details').select('*');

    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    }

    switch (sortBy) {
      case 'score':
        query = query.order('score', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'comments':
        query = query.order('comment_count', { ascending: false });
        break;
    }

    const { data, error } = await query.limit(50);

    if (!error && data) {
      setFeatures(data);
    }
    setLoading(false);
    setRefreshing(false);
  }, [sortBy, filterStatus]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Mark which features the current user has voted on
  async function markUserVotes(userId: string) {
    const { data: votes } = await supabase
      .from('votes')
      .select('feature_id')
      .eq('user_id', userId);

    if (votes) {
      const votedIds = new Set(votes.map(v => v.feature_id));
      setFeatures(prev =>
        prev.map(f => ({ ...f, user_has_voted: votedIds.has(f.id) }))
      );
    }
  }

  return {
    features,
    loading,
    refreshing,
    refresh: () => fetchFeatures(true),
    markUserVotes,
  };
}

export function useVote() {
  const [voting, setVoting] = useState(false);

  async function toggleVote(featureId: string, userId: string, hasVoted: boolean) {
    setVoting(true);
    try {
      if (hasVoted) {
        await supabase.from('votes').delete().eq('feature_id', featureId).eq('user_id', userId);
      } else {
        await supabase.from('votes').insert({ feature_id: featureId, user_id: userId, weight: 1 });
      }
      return { success: true };
    } catch {
      return { success: false };
    } finally {
      setVoting(false);
    }
  }

  return { toggleVote, voting };
}

export function useFeatureDetail(featureId: string) {
  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!featureId) return;
    (async () => {
      const { data } = await supabase
        .from('features_with_details')
        .select('*')
        .eq('id', featureId)
        .single();
      setFeature(data);
      setLoading(false);
    })();
  }, [featureId]);

  return { feature, loading, setFeature };
}

export function useComments(featureId: string) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!featureId) return;
    fetchComments();
  }, [featureId]);

  async function fetchComments() {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (username, avatar_url, tier)
      `)
      .eq('feature_id', featureId)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(
        data.map((c: any) => ({
          ...c,
          username: c.profiles?.username,
          avatar_url: c.profiles?.avatar_url,
          tier: c.profiles?.tier,
        }))
      );
    }
    setLoading(false);
  }

  async function addComment(body: string, userId: string) {
    const { error } = await supabase
      .from('comments')
      .insert({ feature_id: featureId, user_id: userId, body });
    if (!error) await fetchComments();
    return { error };
  }

  return { comments, loading, addComment, refresh: fetchComments };
}

export function useCategories() {
  const [categories, setCategories] = useState<{ id: number; name: string; color: string; icon: string }[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('categories').select('*').order('id');
      if (data) setCategories(data);
    })();
  }, []);

  return categories;
}
