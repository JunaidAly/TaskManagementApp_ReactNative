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
import { register as registerApi } from '../../services/auth.service';

const registerSchema = Yup.object().shape({
  name: Yup.string().min(2, 'At least 2 characters').max(50).required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function RegisterScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 8, bounciness: 5 }),
    ]).start();
  }, []);

  const handleRegister = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await registerApi({ name: values.name, email: values.email, password: values.password });
      await login(response.data.user, response.data.token);
      Toast.show({ type: 'success', text1: 'Account Created!', text2: 'Welcome to TaskMaster' });
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.response?.data?.message || 'Please try again',
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
          <View style={styles.logoBox}>
            <Ionicons name="person-add" size={40} color="#fff" />
          </View>
          <Text style={styles.brandName}>Join TaskMaster</Text>
          <Text style={styles.brandSub}>Create your free account today</Text>
        </LinearGradient>

        {/* Form card */}
        <Animated.View
          style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Fill in your details to get started</Text>

          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={registerSchema}
            onSubmit={handleRegister}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <View style={styles.form}>
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={values.name}
                  onChangeText={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={touched.name && errors.name ? errors.name : undefined}
                  autoCapitalize="words"
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
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  placeholder="Create a strong password"
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

                <Input
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={
                    touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : undefined
                  }
                  secureTextEntry={!showConfirm}
                  rightIcon={
                    <Ionicons
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#94A3B8"
                    />
                  }
                  onRightIconPress={() => setShowConfirm(!showConfirm)}
                />

                <Button
                  title="Create Account"
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  size="large"
                />
              </View>
            )}
          </Formik>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingTop: 20,
  },
  deco1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -50, right: -40,
  },
  deco2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: -10,
  },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  brandName: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },
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
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  form: { marginBottom: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748B', fontSize: 14 },
  footerLink: { color: '#6366F1', fontWeight: '700', fontSize: 14 },
});
