import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView, Platform,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { Input, Button } from '../../components';
import { useAuthStore } from '../../store';
import { updateProfile, updatePassword } from '../../services/auth.service';

const profileSchema = Yup.object().shape({
  name: Yup.string().required('Name is required').min(2).max(60),
  email: Yup.string().required('Email is required').email('Invalid email'),
});

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string().required('New password is required').min(6, 'At least 6 characters'),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
});

type Tab = 'profile' | 'password';

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const handleProfileSave = async (values: { name: string; email: string }) => {
    try {
      const res = await updateProfile({ name: values.name, email: values.email });
      setUser(res.data.user);
      Toast.show({ type: 'success', text1: 'Profile Updated', text2: 'Your changes have been saved' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Failed to update profile' });
    }
  };

  const handlePasswordSave = async (
    values: { currentPassword: string; newPassword: string; confirmPassword: string },
    { resetForm }: any,
  ) => {
    try {
      await updatePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      resetForm();
      Toast.show({ type: 'success', text1: 'Password Changed', text2: 'Your new password is now active' });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.response?.data?.message || 'Failed to change password' });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.screen, isDark && styles.screenDark]}>
      {/* Header */}
      <LinearGradient colors={['#4F46E5', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroDeco1} /><View style={styles.heroDeco2} />

        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.avatarWrap}>
          <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.15)']} style={styles.avatarRing}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.avatarName}>{user?.name}</Text>
          <Text style={styles.avatarEmail}>{user?.email}</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabRow, isDark && styles.tabRowDark]}>
        {(['profile', 'password'] as Tab[]).map((tab) => {
          const active = activeTab === tab;
          const label = tab === 'profile' ? 'Profile Info' : 'Change Password';
          const icon: keyof typeof Ionicons.glyphMap = tab === 'profile' ? 'person-outline' : 'lock-closed-outline';
          return (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabBtn} activeOpacity={0.8}>
              {active ? (
                <LinearGradient colors={['#6366F1', '#8B5CF6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.tabBtnInner}>
                  <Ionicons name={icon} size={15} color="#fff" />
                  <Text style={styles.tabBtnTextActive}>{label}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.tabBtnInner, isDark ? styles.tabBtnInactiveDark : styles.tabBtnInactiveLight]}>
                  <Ionicons name={icon} size={15} color={isDark ? '#475569' : '#94A3B8'} />
                  <Text style={[styles.tabBtnTextInactive, isDark && styles.tabBtnTextInactiveDark]}>{label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {activeTab === 'profile' ? (
          <Formik initialValues={{ name: user?.name ?? '', email: user?.email ?? '' }} validationSchema={profileSchema} onSubmit={handleProfileSave}>
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <View>
                <Input
                  label="Full Name"
                  placeholder="Your name"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={touched.name && errors.name ? errors.name : undefined}
                />
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email ? errors.email : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <View style={styles.actions}>
                  <Button title="Cancel" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} />
                  <Button title="Save Changes" onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting} style={{ flex: 1 }} />
                </View>
              </View>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ currentPassword: '', newPassword: '', confirmPassword: '' }}
            validationSchema={passwordSchema}
            onSubmit={handlePasswordSave}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <View>
                <Input
                  label="Current Password"
                  placeholder="Enter current password"
                  value={values.currentPassword}
                  onChangeText={handleChange('currentPassword')}
                  onBlur={handleBlur('currentPassword')}
                  error={touched.currentPassword && errors.currentPassword ? errors.currentPassword : undefined}
                  secureTextEntry
                />
                <Input
                  label="New Password"
                  placeholder="At least 6 characters"
                  value={values.newPassword}
                  onChangeText={handleChange('newPassword')}
                  onBlur={handleBlur('newPassword')}
                  error={touched.newPassword && errors.newPassword ? errors.newPassword : undefined}
                  secureTextEntry
                />
                <Input
                  label="Confirm New Password"
                  placeholder="Repeat new password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                  secureTextEntry
                />
                <View style={[styles.passwordHint, isDark && styles.passwordHintDark]}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#6366F1" />
                  <Text style={styles.passwordHintText}>Use a strong password with letters, numbers, and symbols.</Text>
                </View>
                <View style={styles.actions}>
                  <Button title="Cancel" onPress={() => router.back()} variant="outline" style={{ flex: 1 }} />
                  <Button title="Update Password" onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting} style={{ flex: 1 }} />
                </View>
              </View>
            )}
          </Formik>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  screenDark: { backgroundColor: '#0F172A' },
  header: { paddingHorizontal: 20, paddingBottom: 28, overflow: 'hidden' },
  heroDeco1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -30 },
  heroDeco2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.05)', bottom: 0, left: 20 },
  headerNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  navBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { alignItems: 'center' },
  avatarRing: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)' },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#fff' },
  avatarName: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 2 },
  avatarEmail: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  tabRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tabRowDark: { backgroundColor: '#1E293B', borderBottomColor: '#334155' },
  tabBtn: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  tabBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  tabBtnInactiveLight: { backgroundColor: '#F1F5F9' },
  tabBtnInactiveDark: { backgroundColor: '#283548' },
  tabBtnTextActive: { fontSize: 13, fontWeight: '700', color: '#fff' },
  tabBtnTextInactive: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  tabBtnTextInactiveDark: { color: '#475569' },
  body: { padding: 20, paddingBottom: 40 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  passwordHint: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF2FF', borderRadius: 10, padding: 12, marginTop: 4 },
  passwordHintDark: { backgroundColor: '#1E293B' },
  passwordHintText: { flex: 1, fontSize: 12, color: '#6366F1', lineHeight: 16 },
});
