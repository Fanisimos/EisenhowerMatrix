import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthContext } from '../../lib/AuthContext';
import { useCategories } from '../../hooks/useFeatures';
import Colors from '../../constants/Colors';

export default function SubmitScreen() {
  const router = useRouter();
  const { session, profile } = useAuthContext();
  const categories = useCategories();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Please add a title');
      return;
    }
    if (!description.trim()) {
      setError('Please add a description');
      return;
    }
    if (title.length > 120) {
      setError('Title must be under 120 characters');
      return;
    }
    if (!session?.user.id) return;

    setError('');
    setLoading(true);

    const { error: err } = await supabase.from('features').insert({
      user_id: session.user.id,
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId,
    });

    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    setTitle('');
    setDescription('');
    setCategoryId(1);

    if (Platform.OS === 'web') {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Submitted!', 'Your feature request is live.', [
        { text: 'View Feed', onPress: () => router.replace('/(tabs)') },
      ]);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Add dark mode support"
        placeholderTextColor="#64748b"
        value={title}
        onChangeText={setTitle}
        maxLength={120}
      />
      <Text style={styles.charCount}>{title.length}/120</Text>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the feature and why it matters..."
        placeholderTextColor="#64748b"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categories}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              categoryId === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
            ]}
            onPress={() => setCategoryId(cat.id)}
          >
            <Text
              style={[
                styles.categoryChipText,
                categoryId === cat.id && { color: '#fff' },
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {profile && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Tier: <Text style={styles.infoBold}>{profile.tier}</Text> · Votes remaining:{' '}
            <Text style={styles.infoBold}>{profile.votes_remaining}</Text>
          </Text>
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit Feature Request</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
  },
  textArea: {
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    backgroundColor: Colors.dark.surface,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  infoBox: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 24,
  },
  infoText: {
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  infoBold: {
    color: Colors.primary,
    fontWeight: '700',
  },
  error: {
    color: Colors.dark.error,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
