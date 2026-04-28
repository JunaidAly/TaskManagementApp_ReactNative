import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button } from '../../components';
import { useAuthStore } from '../../store';
import { login as loginApi } from '../../services/auth.service';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 8, bounciness: 5 }),
    ]).start();
  }, []);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const response = await loginApi(values);
      await login(response.data.user, response.data.token);
      Toast.show({ type: 'success', text1: 'Welcome back!', text2: response.message });
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.response?.data?.message || 'Please check your credentials',
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero gradient */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.deco1} />
          <View style={styles.deco2} />
          <View style={styles.deco3} />
          <View style={styles.logoBox}>
            <Ionicons name="checkmark-done-circle" size={44} color="#fff" />
          </View>
          <Text style={styles.brandName}>TaskMaster</Text>
          <Text style={styles.brandSub}>Stay organized. Get things done.</Text>
        </LinearGradient>

        {/* Form card */}
        <Animated.View
          style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={loginSchema}
            onSubmit={handleLogin}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <View style={styles.form}>
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email ? errors.email : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password && errors.password ? errors.password : undefined}
                  secureTextEntry={!showPassword}
                  rightIcon={
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#94A3B8"
                    />
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />

                <TouchableOpacity
                  style={styles.forgotWrap}
                  onPress={() => router.push('/auth/forgot-password')}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  size="large"
                />
              </View>
            )}
          </Formik>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { flexGrow: 1 },
  hero: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingTop: 20,
  },
  deco1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -60, right: -50,
  },
  deco2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -30, left: -20,
  },
  deco3: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.06)', top: 30, left: 40,
  },
  logoBox: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  brandName: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  brandSub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  formCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -24,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  form: { marginBottom: 4 },
  forgotWrap: { alignItems: 'flex-end', marginBottom: 24, marginTop: -4 },
  forgotText: { color: '#6366F1', fontSize: 13, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748B', fontSize: 14 },
  footerLink: { color: '#6366F1', fontWeight: '700', fontSize: 14 },
});
