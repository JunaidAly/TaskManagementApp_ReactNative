import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, Animated, Keyboard, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import Toast from 'react-native-toast-message';
import { useTaskStore, Task } from '../store';
import { createTask } from '../services/task.service';

const PRIORITIES: { key: Task['priority']; label: string; color: string }[] = [
  { key: 'low',    label: 'Low',    color: '#10B981' },
  { key: 'medium', label: 'Med',    color: '#F59E0B' },
  { key: 'high',   label: 'High',   color: '#EF4444' },
];

const QUICK_DATES = [
  { label: 'Today',    days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: '3 days',   days: 3 },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function QuickAddSheet({ visible, onClose }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const addTask = useTaskStore((s) => s.addTask);

  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState<number | null>(null); // days offset
  const [submitting, setSubmitting] = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 16, bounciness: 4 }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start(() => inputRef.current?.focus());
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
      setTitle('');
      setPriority('medium');
      setDueDate(null);
    }
  }, [visible]);

  const handleAdd = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      setSubmitting(true);
      Keyboard.dismiss();
      let dueDateStr: string | undefined;
      if (dueDate !== null) {
        const d = new Date();
        d.setDate(d.getDate() + dueDate);
        dueDateStr = d.toISOString();
      }
      const res = await createTask({ title: trimmed, priority, dueDate: dueDateStr });
      addTask(res.data.task);
      Toast.show({ type: 'success', text1: 'Task Added', text2: trimmed });
      onClose();
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to add task' });
    } finally {
      setSubmitting(false);
    }
  };

  const priCfg = PRIORITIES.find((p) => p.key === priority)!;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <Animated.View style={[styles.overlay, { opacity: overlayAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        </Animated.View>

        <Animated.View style={[styles.sheet, isDark && styles.sheetDark, { transform: [{ translateY: slideAnim }] }]}>
          {/* Handle */}
          <View style={[styles.handle, isDark && styles.handleDark]} />

          <Text style={[styles.sheetTitle, isDark && styles.sheetTitleDark]}>Quick Add</Text>

          {/* Input */}
          <View style={[styles.inputWrap, isDark && styles.inputWrapDark]}>
            <Ionicons name="add-circle-outline" size={20} color="#6366F1" style={{ marginRight: 8 }} />
            <TextInput
              ref={inputRef}
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="What needs to be done?"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
              maxLength={100}
            />
          </View>

          {/* Priority + Date row */}
          <View style={styles.optRow}>
            {/* Priority */}
            <View style={styles.optGroup}>
              <Text style={[styles.optLabel, isDark && styles.optLabelDark]}>Priority</Text>
              <View style={styles.optBtns}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity key={p.key} onPress={() => setPriority(p.key)} activeOpacity={0.8}
                    style={[styles.optBtn, isDark && styles.optBtnDark, priority === p.key && { backgroundColor: p.color, borderColor: p.color }]}>
                    <Text style={[styles.optBtnText, isDark && styles.optBtnTextDark, priority === p.key && styles.optBtnTextActive]}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quick date */}
            <View style={styles.optGroup}>
              <Text style={[styles.optLabel, isDark && styles.optLabelDark]}>Due Date</Text>
              <View style={styles.optBtns}>
                {QUICK_DATES.map((d) => (
                  <TouchableOpacity key={d.label} onPress={() => setDueDate(dueDate === d.days ? null : d.days)} activeOpacity={0.8}
                    style={[styles.optBtn, isDark && styles.optBtnDark, dueDate === d.days && styles.optBtnActive]}>
                    <Text style={[styles.optBtnText, isDark && styles.optBtnTextDark, dueDate === d.days && styles.optBtnTextActive]}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Add button */}
          <TouchableOpacity onPress={handleAdd} disabled={!title.trim() || submitting} activeOpacity={0.9} style={{ borderRadius: 14, overflow: 'hidden', marginTop: 4 }}>
            <LinearGradient
              colors={title.trim() ? ['#6366F1', '#8B5CF6'] : ['#CBD5E1', '#CBD5E1']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.addBtn}
            >
              <Ionicons name={submitting ? 'hourglass-outline' : 'add'} size={20} color="#fff" />
              <Text style={styles.addBtnText}>{submitting ? 'Adding...' : 'Add Task'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 24,
  },
  sheetDark: { backgroundColor: '#1E293B' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 16 },
  handleDark: { backgroundColor: '#334155' },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 14 },
  sheetTitleDark: { color: '#F1F5F9' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 16 },
  inputWrapDark: { backgroundColor: '#0F172A', borderColor: '#334155' },
  input: { flex: 1, fontSize: 15, color: '#0F172A', padding: 0 },
  inputDark: { color: '#F1F5F9' },
  optRow: { gap: 14, marginBottom: 16 },
  optGroup: {},
  optLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 },
  optLabelDark: { color: '#475569' },
  optBtns: { flexDirection: 'row', gap: 6 },
  optBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  optBtnDark: { backgroundColor: '#0F172A', borderColor: '#334155' },
  optBtnActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  optBtnText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  optBtnTextDark: { color: '#94A3B8' },
  optBtnTextActive: { color: '#fff' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 14 },
  addBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
