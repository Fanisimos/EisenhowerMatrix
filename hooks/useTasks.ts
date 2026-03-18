import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Quadrant = 'do' | 'schedule' | 'delegate' | 'eliminate';

export interface Subtask {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  text: string;
  quadrant: Quadrant;
  done: boolean;
  subtasks: Subtask[];
  createdAt: string;
}

export interface TaskStats {
  total: number;
  done: number;
  streak: number;
}

const STORAGE_KEY = 'prodvote_tasks';
const STREAK_KEY = 'prodvote_streak';

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const QUADRANTS: Record<Quadrant, { label: string; subtitle: string; color: string; bg: string }> = {
  do: { label: 'Do First', subtitle: 'Urgent & Important', color: '#ff4d6a', bg: 'rgba(255,77,106,0.08)' },
  schedule: { label: 'Schedule', subtitle: 'Not Urgent & Important', color: '#ffb347', bg: 'rgba(255,179,71,0.08)' },
  delegate: { label: 'Delegate', subtitle: 'Urgent & Not Important', color: '#4dc9f6', bg: 'rgba(77,201,246,0.08)' },
  eliminate: { label: 'Eliminate', subtitle: 'Not Urgent & Not Important', color: '#6e6e8a', bg: 'rgba(110,110,138,0.08)' },
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const [tasksJson, streakJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(STREAK_KEY),
        ]);
        if (tasksJson) setTasks(JSON.parse(tasksJson));
        if (streakJson) {
          const s = JSON.parse(streakJson);
          const lastDate = new Date(s.lastDate).toDateString();
          const today = new Date().toDateString();
          const yesterday = new Date(Date.now() - 86400000).toDateString();
          if (lastDate === today || lastDate === yesterday) {
            setStreak(s.count);
          } else {
            setStreak(0);
          }
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, loaded]);

  const updateStreak = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(STREAK_KEY);
      const today = new Date().toDateString();
      let count = 1;
      if (json) {
        const s = JSON.parse(json);
        const lastDate = new Date(s.lastDate).toDateString();
        if (lastDate === today) return s.count;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        count = lastDate === yesterday ? s.count + 1 : 1;
      }
      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify({ count, lastDate: new Date().toISOString() }));
      setStreak(count);
      return count;
    } catch {
      return 0;
    }
  }, []);

  function addTask(text: string, quadrant: Quadrant): Task {
    const task: Task = { id: genId(), text, quadrant, done: false, subtasks: [], createdAt: new Date().toISOString() };
    setTasks(prev => [task, ...prev]);
    return task;
  }

  function updateTask(id: string, updates: Partial<Pick<Task, 'text' | 'quadrant'>>) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nowDone = !t.done;
      if (nowDone) updateStreak();
      return { ...t, done: nowDone };
    }));
  }

  function deleteTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function moveTask(id: string, quadrant: Quadrant) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, quadrant } : t));
  }

  function addSubtask(taskId: string, text: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: [...t.subtasks, { id: genId(), text, done: false }] };
    }));
  }

  function toggleSubtask(taskId: string, subtaskId: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, done: !s.done } : s) };
    }));
  }

  function deleteSubtask(taskId: string, subtaskId: string) {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: t.subtasks.filter(s => s.id !== subtaskId) };
    }));
  }

  function getTasksByQuadrant(quadrant: Quadrant) {
    return tasks.filter(t => t.quadrant === quadrant);
  }

  const stats: TaskStats = {
    total: tasks.filter(t => !t.done).length,
    done: tasks.filter(t => t.done).length,
    streak,
  };

  return {
    tasks,
    stats,
    loaded,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    moveTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    getTasksByQuadrant,
  };
}
