import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, Text } from 'react-native';
import Colors from '../../constants/Colors';

function BackButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.navigate('/(tabs)/apps')}
      style={{ paddingLeft: 12, paddingRight: 16, marginTop: -6 }}
    >
      <Text style={{ fontSize: 28, color: Colors.primary, fontWeight: '300', lineHeight: 28 }}>‹</Text>
    </TouchableOpacity>
  );
}

export default function AppsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.dark.background },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: { fontWeight: '700' },
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen name="eisenhower" options={{ title: 'Eisenhower Matrix' }} />
      <Stack.Screen name="pomodoro" options={{ title: 'Pomodoro Timer' }} />
      <Stack.Screen name="habits" options={{ title: 'Habit Tracker' }} />
      <Stack.Screen name="notes" options={{ title: 'Quick Notes' }} />
      <Stack.Screen name="kanban" options={{ title: 'Kanban Board' }} />
      <Stack.Screen name="journal" options={{ title: 'Daily Journal' }} />
      <Stack.Screen name="whiteboard" options={{ title: 'Whiteboard' }} />
      <Stack.Screen name="breathe" options={{ title: 'Breathe' }} />
      <Stack.Screen name="hiit" options={{ title: 'HIIT Timer' }} />
    </Stack>
  );
}
