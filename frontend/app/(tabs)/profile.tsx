import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import Toast from 'react-native-toast-message';
import { useAuthStore, useSettingsStore } from '../../store';

const THEME_OPTIONS = [
  { key: 'light',  label: 'Light',  icon: 'sunny-outline' as const },
  { key: 'dark',   label: 'Dark',   icon: 'moon-outline' as const },
  { key: 'system', label: 'Auto',   icon: 'phone-portrait-outline' as const },
] as const;

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  isDark: boolean;
  danger?: boolean;
  showChevron?: boolean;
}

function SettingRow({ icon, label, onPress, right, isDark, danger, showChevron = true }: RowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIconWrap, { backgroundColor: danger ? '#FEE2E2' : isDark ? '#283548' : '#EEF2FF' }]}>
        <Ionicons name={icon} size={18} color={danger ? '#EF4444' : '#6366F1'} />
      </View>
      <Text style={[styles.rowLabel, isDark && styles.rowLabelDark, danger && styles.rowLabelDanger]}>
        {label}
      </Text>
      {right !== undefined
        ? right
        : showChevron && onPress
          ? <Ionicons name="chevron-forward" size={16} color={isDark ? '#475569' : '#CBD5E1'} />
          : null}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { theme, notificationsEnabled, setTheme, setNotificationsEnabled } = useSettingsStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Toast.show({ type: 'success', text1: 'Logged Out', text2: 'See you soon!' });
          router.replace('/auth/login');
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <ScrollView
      style={[styles.screen, isDark && styles.screenDark]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />

      {/* Gradient header */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED', '#9333EA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top + 24 }]}
      >
        <View style={styles.deco1} />
        <View style={styles.deco2} />

        <View style={styles.avatarRing}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Appearance */}
        <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>APPEARANCE</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = theme === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setTheme(opt.key)}
                  style={styles.themeOpt}
                  activeOpacity={0.8}
                >
                  {active ? (
                    <LinearGradient
                      colors={['#6366F1', '#8B5CF6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.themeOptInner}
                    >
                      <Ionicons name={opt.icon} size={18} color="#fff" />
                      <Text style={styles.themeOptActiveText}>{opt.label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.themeOptInner, isDark ? styles.themeOptInactiveDark : styles.themeOptInactiveLight]}>
                      <Ionicons name={opt.icon} size={18} color={isDark ? '#475569' : '#94A3B8'} />
                      <Text style={[styles.themeOptInactiveText, isDark && styles.themeOptInactiveTextDark]}>
                        {opt.label}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Settings */}
        <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>PREFERENCES</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <SettingRow
            icon="notifications-outline"
            label="Push Notifications"
            isDark={isDark}
            showChevron={false}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E2E8F0', true: '#6366F1' }}
                thumbColor="#fff"
                ios_backgroundColor="#E2E8F0"
              />
            }
          />
          <View style={[styles.divider, isDark && styles.dividerDark]} />
          <SettingRow
            icon="archive-outline"
            label="Archived Tasks"
            onPress={() => router.push('/tasks/archived')}
            isDark={isDark}
          />
          <View style={[styles.divider, isDark && styles.dividerDark]} />
          <SettingRow
            icon="information-circle-outline"
            label="About TaskMaster"
            onPress={() =>
              Toast.show({ type: 'info', text1: 'TaskMaster v1.0.0', text2: 'A learning project' })
            }
            isDark={isDark}
          />
        </View>

        {/* Account */}
        <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>ACCOUNT</Text>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <SettingRow
            icon="person-outline"
            label="Edit Profile"
            onPress={() => router.push('/profile/edit')}
            isDark={isDark}
          />
          <View style={[styles.divider, isDark && styles.dividerDark]} />
          <SettingRow
            icon="log-out-outline"
            label="Log Out"
            onPress={handleLogout}
            isDark={isDark}
            danger
            showChevron={false}
          />
        </View>

        <Text style={[styles.version, isDark && styles.versionDark]}>TaskMaster v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  screenDark: { backgroundColor: '#0F172A' },
  headerGradient: {
    paddingBottom: 40,
    alignItems: 'center',
    overflow: 'hidden',
  },
  deco1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -30,
  },
  deco2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: 0, left: 20,
  },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.72)' },
  body: { padding: 16 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#94A3B8',
    letterSpacing: 1, textTransform: 'uppercase',
    marginTop: 20, marginBottom: 8, marginLeft: 4,
  },
  sectionLabelDark: { color: '#475569' },
  card: {
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardDark: { backgroundColor: '#1E293B' },
  themeRow: { flexDirection: 'row', padding: 10, gap: 8 },
  themeOpt: { flex: 1, borderRadius: 10, overflow: 'hidden' },
  themeOptInner: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 10, gap: 5,
  },
  themeOptInactiveLight: { backgroundColor: '#F1F5F9' },
  themeOptInactiveDark: { backgroundColor: '#334155' },
  themeOptActiveText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  themeOptInactiveText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  themeOptInactiveTextDark: { color: '#64748B' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  rowIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#0F172A' },
  rowLabelDark: { color: '#F1F5F9' },
  rowLabelDanger: { color: '#EF4444' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 64 },
  dividerDark: { backgroundColor: '#334155' },
  version: { textAlign: 'center', fontSize: 12, color: '#CBD5E1', marginTop: 28, marginBottom: 8 },
  versionDark: { color: '#334155' },
});
