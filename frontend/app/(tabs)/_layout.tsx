import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabIcon({ name, focused, color }: { name: IoniconName; focused: boolean; color: string }) {
  return (
    <View style={styles.iconWrap}>
      {focused ? (
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <Ionicons name={name} size={20} color={focused ? '#fff' : color} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'sunny' : 'sunny-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'bar-chart' : 'bar-chart-outline'} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'person' : 'person-outline'} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 24,
  },
  tabLabel: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  iconWrap: {
    width: 40, height: 28, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  header: { backgroundColor: '#fff', elevation: 0, shadowOpacity: 0 },
  headerTitle: { fontWeight: '700', fontSize: 17, color: '#0F172A' },
});
