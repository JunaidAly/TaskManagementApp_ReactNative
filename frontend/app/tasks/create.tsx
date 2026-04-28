import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import { Input, Button } from '../../components';
import { useTaskStore, Task } from '../../store';
import { createTask } from '../../services/task.service';
import { scheduleTaskNotification } from '../../services/notification.service';

const taskSchema = Yup.object().shape({
  title: Yup.string().required('Title is required').max(100),
  description: Yup.string().max(500),
});

const PRIORITIES: { key: Task['priority']; label: string; color: string }[] = [
  { key: 'low',    label: 'Low',    color: '#10B981' },
  { key: 'medium', label: 'Medium', color: '#F59E0B' },
  { key: 'high',   label: 'High',   color: '#EF4444' },
];

const CATEGORIES: { key: Task['category']; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: 'work',     label: 'Work',     icon: 'briefcase-outline',          color: '#6366F1' },
  { key: 'personal', label: 'Personal', icon: 'heart-outline',              color: '#EC4899' },
  { key: 'health',   label: 'Health',   icon: 'fitness-outline',            color: '#10B981' },
  { key: 'shopping', label: 'Shopping', icon: 'cart-outline',               color: '#F59E0B' },
  { key: 'finance',  label: 'Finance',  icon: 'wallet-outline',             color: '#3B82F6' },
  { key: 'other',    label: 'Other',    icon: 'ellipsis-horizontal-outline', color: '#94A3B8' },
];

const RECUR_TYPES = [
  { key: 'daily',   label: 'Daily' },
  { key: 'weekly',  label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
] as const;

function SectionLabel({ label, isDark }: { label: string; isDark: boolean }) {
  return <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>{label}</Text>;
}

export default function CreateTaskScreen() {
  const router = useRouter();
  const addTask = useTaskStore((s) => s.addTask);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [category, setCategory] = useState<Task['category']>('other');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const addSubtask = () => {
    const trimmed = newSubtask.trim();
    if (!trimmed) return;
    setSubtasks([...subtasks, trimmed]);
    setNewSubtask('');
  };

  const removeSubtask = (i: number) => setSubtasks(subtasks.filter((_, idx) => idx !== i));

  const handleSubmit = async (values: { title: string; description: string }) => {
    try {
      const response = await createTask({
        title: values.title,
        description: values.description || undefined,
        priority,
        status,
        category,
        dueDate: dueDate?.toISOString(),
        subtasks: subtasks.map((t) => ({ title: t, completed: false })),
        recurrence: { enabled: recurrenceEnabled, type: recurrenceEnabled ? recurrenceType : undefined },
      });
      addTask(response.data.task);

      if (dueDate) {
        await scheduleTaskNotification(response.data.task._id, response.data.task.title, dueDate);
      }

      Toast.show({ type: 'success', text1: 'Task Created', text2: 'Your task has been added' });
      router.back();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.response?.data?.message || 'Failed to create task' });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.screen, isDark && styles.screenDark]}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          <Formik initialValues={{ title: '', description: '' }} validationSchema={taskSchema} onSubmit={handleSubmit}>
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit: submit, isSubmitting }) => (
              <>
                <Input label="Task Title" placeholder="What do you need to do?" value={values.title} onChangeText={handleChange('title')} onBlur={handleBlur('title')} error={touched.title && errors.title ? errors.title : undefined} />
                <Input label="Description (optional)" placeholder="Add more details..." value={values.description} onChangeText={handleChange('description')} onBlur={handleBlur('description')} error={touched.description && errors.description ? errors.description : undefined} multiline numberOfLines={3} style={{ height: 80, textAlignVertical: 'top' }} />

                {/* Priority */}
                <SectionLabel label="PRIORITY" isDark={isDark} />
                <View style={styles.segmentRow}>
                  {PRIORITIES.map((p) => (
                    <TouchableOpacity key={p.key} onPress={() => setPriority(p.key)} style={[styles.segment, priority === p.key && { backgroundColor: p.color, borderColor: p.color }, isDark && priority !== p.key && styles.segmentDark]} activeOpacity={0.8}>
                      <Text style={[styles.segmentText, isDark && priority !== p.key && styles.segmentTextDark, priority === p.key && styles.segmentTextActive]}>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Status */}
                <SectionLabel label="STATUS" isDark={isDark} />
                <View style={styles.segmentRow}>
                  {(['todo', 'in-progress', 'done'] as const).map((s) => {
                    const labels = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
                    const active = status === s;
                    return (
                      <TouchableOpacity key={s} onPress={() => setStatus(s)} activeOpacity={0.8}
                        style={[styles.segment, active && styles.segmentActive, isDark && !active && styles.segmentDark]}>
                        <Text style={[styles.segmentText, isDark && !active && styles.segmentTextDark, active && styles.segmentTextActive]}>{labels[s]}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Category */}
                <SectionLabel label="CATEGORY" isDark={isDark} />
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity key={c.key} onPress={() => setCategory(c.key)} activeOpacity={0.8}
                      style={[styles.catItem, isDark && styles.catItemDark, category === c.key && { borderColor: c.color, backgroundColor: c.color + '15' }]}>
                      <Ionicons name={c.icon} size={20} color={category === c.key ? c.color : isDark ? '#475569' : '#94A3B8'} />
                      <Text style={[styles.catItemText, isDark && styles.catItemTextDark, category === c.key && { color: c.color }]}>{c.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Due Date */}
                <SectionLabel label="DUE DATE" isDark={isDark} />
                <View style={styles.dueDateRow}>
                  {[
                    { label: 'Today', days: 0 },
                    { label: 'Tomorrow', days: 1 },
                    { label: 'In 3 days', days: 3 },
                    { label: 'Next week', days: 7 },
                  ].map((opt) => {
                    const d = new Date(); d.setDate(d.getDate() + opt.days);
                    const isActive = dueDate && d.toDateString() === dueDate.toDateString();
                    return (
                      <TouchableOpacity key={opt.label} onPress={() => setDueDate(isActive ? null : d)} activeOpacity={0.8}
                        style={[styles.dateBtn, isDark && styles.dateBtnDark, isActive && styles.dateBtnActive]}>
                        <Text style={[styles.dateBtnText, isDark && styles.dateBtnTextDark, isActive && styles.dateBtnTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {dueDate && (
                  <TouchableOpacity onPress={() => setDueDate(null)} style={styles.clearDate}>
                    <Ionicons name="close-circle-outline" size={14} color="#EF4444" />
                    <Text style={styles.clearDateText}> Clear: {dueDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>
                )}

                {/* Recurrence */}
                <View style={styles.recurrRow}>
                  <SectionLabel label="REPEAT" isDark={isDark} />
                  <TouchableOpacity onPress={() => setRecurrenceEnabled(!recurrenceEnabled)}
                    style={[styles.toggle, recurrenceEnabled && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, recurrenceEnabled && styles.toggleThumbActive]} />
                  </TouchableOpacity>
                </View>
                {recurrenceEnabled && (
                  <View style={styles.segmentRow}>
                    {RECUR_TYPES.map((r) => (
                      <TouchableOpacity key={r.key} onPress={() => setRecurrenceType(r.key)} activeOpacity={0.8}
                        style={[styles.segment, recurrenceType === r.key && styles.segmentActive, isDark && recurrenceType !== r.key && styles.segmentDark]}>
                        <Text style={[styles.segmentText, isDark && recurrenceType !== r.key && styles.segmentTextDark, recurrenceType === r.key && styles.segmentTextActive]}>{r.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Subtasks */}
                <SectionLabel label="SUBTASKS" isDark={isDark} />
                <View style={[styles.subtaskInputRow]}>
                  <TextInput
                    style={[styles.subtaskInput, isDark && styles.subtaskInputDark]}
                    placeholder="Add a subtask..."
                    placeholderTextColor="#94A3B8"
                    value={newSubtask}
                    onChangeText={setNewSubtask}
                    onSubmitEditing={addSubtask}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={addSubtask} style={styles.subtaskAddBtn}>
                    <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.subtaskAddBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                      <Ionicons name="add" size={20} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                {subtasks.map((st, i) => (
                  <View key={i} style={[styles.subtaskItem, isDark && styles.subtaskItemDark]}>
                    <Ionicons name="ellipse-outline" size={16} color="#94A3B8" style={{ marginRight: 8 }} />
                    <Text style={[styles.subtaskItemText, isDark && styles.subtaskItemTextDark]} numberOfLines={1}>{st}</Text>
                    <TouchableOpacity onPress={() => removeSubtask(i)} style={styles.subtaskRemove}>
                      <Ionicons name="close-circle" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Actions */}
                <View style={styles.actions}>
                  <Button title="Cancel" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} />
                  <Button title="Create Task" onPress={submit} loading={isSubmitting} disabled={isSubmitting} style={{ flex: 1 }} />
                </View>
              </>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  screenDark: { backgroundColor: '#0F172A' },
  body: { padding: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  sectionLabelDark: { color: '#475569' },
  segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', alignItems: 'center' },
  segmentDark: { borderColor: '#334155', backgroundColor: '#1E293B' },
  segmentActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  segmentTextDark: { color: '#94A3B8' },
  segmentTextActive: { color: '#fff' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catItem: { width: '30%', alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff', gap: 4 },
  catItemDark: { backgroundColor: '#1E293B', borderColor: '#334155' },
  catItemText: { fontSize: 11, fontWeight: '600', color: '#94A3B8' },
  catItemTextDark: { color: '#475569' },
  dueDateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  dateBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#fff' },
  dateBtnDark: { borderColor: '#334155', backgroundColor: '#1E293B' },
  dateBtnActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  dateBtnText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  dateBtnTextDark: { color: '#94A3B8' },
  dateBtnTextActive: { color: '#6366F1', fontWeight: '700' },
  clearDate: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  clearDateText: { fontSize: 12, color: '#EF4444' },
  recurrRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#E2E8F0', justifyContent: 'center', paddingHorizontal: 2, marginBottom: 10 },
  toggleActive: { backgroundColor: '#6366F1' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  toggleThumbActive: { marginLeft: 20 },
  subtaskInputRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  subtaskInput: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0F172A', borderWidth: 1.5, borderColor: '#E2E8F0' },
  subtaskInputDark: { backgroundColor: '#1E293B', borderColor: '#334155', color: '#F1F5F9' },
  subtaskAddBtn: { borderRadius: 12, overflow: 'hidden' },
  subtaskAddBtnGrad: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  subtaskItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  subtaskItemDark: { backgroundColor: '#1E293B', borderColor: '#334155' },
  subtaskItemText: { flex: 1, fontSize: 14, color: '#0F172A' },
  subtaskItemTextDark: { color: '#F1F5F9' },
  subtaskRemove: { padding: 2 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
});
