# Learning Guide for TaskMaster

## Project Overview

TaskMaster is designed as an educational project to teach full-stack mobile app development. This guide explains the key concepts and patterns used.

## Table of Contents
1. [State Management](#state-management)
2. [API Integration](#api-integration)
3. [Navigation](#navigation)
4. [Form Handling](#form-handling)
5. [Styling](#styling)
6. [Backend Architecture](#backend-architecture)

---

## State Management

### Why Zustand?

We chose Zustand over Redux for several reasons:
- **Simpler API**: No boilerplate, no actions/reducers
- **Smaller bundle**: ~1KB vs Redux's ~6KB
- **Better DX**: Direct state access without connect/useSelector
- **TypeScript-friendly**: Built-in type inference

### Example: Auth Store

```typescript
// frontend/store/index.ts
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  
  login: async (user, token) => {
    await AsyncStorage.setItem('authToken', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));

// Usage in component
function MyComponent() {
  const { user, login, logout } = useAuthStore();
  // Use directly, no provider needed!
}
```

**Learning Points:**
- State is directly accessible via hooks
- Async operations are just regular async functions
- No need for Context providers or Redux middleware

---

## API Integration

### Axios Instance with Interceptors

We created a centralized API client in `frontend/services/api.ts`:

```typescript
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);
```

**Learning Points:**
- Interceptors attach tokens automatically
- Centralized error handling
- 401 errors trigger auto-logout

---

## Navigation

### Expo Router (File-based Routing)

Expo Router uses the file system to define routes:

```
frontend/app/
├── _layout.tsx          → Root layout
├── (tabs)/              → Tab navigation group
│   ├── _layout.tsx      → Tab bar configuration
│   ├── index.tsx        → Home screen (/)
│   └── tasks.tsx        → Tasks screen (/tasks)
├── auth/
│   ├── login.tsx        → Login screen (/auth/login)
│   └── register.tsx     → Register screen (/auth/register)
└── tasks/
    ├── [id].tsx         → Dynamic route (/tasks/123)
    └── create.tsx       → Create task (/tasks/create)
```

**Benefits:**
- No manual route configuration
- Type-safe navigation
- Automatic deep linking
- Easy to understand structure

**Usage:**
```typescript
import { useRouter } from 'expo-router';

function MyScreen() {
  const router = useRouter();
  
  // Navigate
  router.push('/tasks/create');
  router.push(`/tasks/${taskId}`);
  router.back();
  router.replace('/auth/login'); // No back
}
```

---

## Form Handling

### Formik + Yup Pattern

We use Formik for form state and Yup for validation:

```typescript
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

function LoginForm() {
  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={loginSchema}
      onSubmit={handleLogin}
    >
      {({ values, errors, touched, handleChange, handleSubmit }) => (
        <View>
          <Input
            value={values.email}
            onChangeText={handleChange('email')}
            error={touched.email && errors.email}
          />
          <Button title="Login" onPress={handleSubmit} />
        </View>
      )}
    </Formik>
  );
}
```

**Learning Points:**
- Schema-based validation (declarative)
- Automatic error handling
- Touch tracking (errors show after field is touched)
- Reduces boilerplate significantly

---

## Styling

### NativeWind (Tailwind CSS)

NativeWind brings Tailwind CSS to React Native:

```typescript
// Instead of StyleSheet:
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
});

// Use Tailwind classes:
<View className="flex-1 bg-white p-4">
  <Text className="text-2xl font-bold text-gray-900">
    Hello World
  </Text>
</View>
```

**Responsive Design:**
```typescript
<View className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, 50% on tablet, 33% on desktop */}
</View>
```

**Dark Mode:**
```typescript
<View className="bg-white dark:bg-gray-800">
  <Text className="text-gray-900 dark:text-white">
    Adapts to system theme
  </Text>
</View>
```

---

## Backend Architecture

### MVC Pattern

```
backend/src/
├── models/          → Data schemas (MongoDB/Mongoose)
├── controllers/     → Business logic
├── routes/          → API endpoints
├── middleware/      → Auth, validation, error handling
└── server.js        → Express app setup
```

### Example Flow: Creating a Task

1. **Client sends request:**
```typescript
POST /api/tasks
Authorization: Bearer <token>
Body: { title: "Task", priority: "high" }
```

2. **Route receives request:**
```javascript
// routes/task.routes.js
router.post('/', protect, taskValidation, createTask);
```

3. **Middleware runs:**
```javascript
// middleware/auth.middleware.js
protect() → Verifies JWT token, attaches user to req.user

// express-validator
taskValidation → Validates input
```

4. **Controller processes:**
```javascript
// controllers/task.controller.js
createTask(req, res) {
  const task = await Task.create({
    ...req.body,
    userId: req.user._id
  });
  res.json({ status: 'success', data: { task } });
}
```

5. **Model saves to DB:**
```javascript
// models/Task.model.js
const task = new Task({ title, priority, userId });
await task.save();
```

### Security Layers

1. **Rate Limiting**: Prevent brute force
2. **CORS**: Control allowed origins
3. **JWT**: Stateless authentication
4. **bcrypt**: Password hashing
5. **express-validator**: Input sanitization

---

## Best Practices Demonstrated

### 1. **Error Handling**
```typescript
try {
  const response = await createTask(data);
  // Success
  Toast.show({ type: 'success', text1: 'Task created!' });
} catch (error) {
  // Error
  Toast.show({
    type: 'error',
    text1: 'Failed to create task',
    text2: error.response?.data?.message
  });
}
```

### 2. **Loading States**
```typescript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    await api.getData();
  } finally {
    setLoading(false); // Always run
  }
};

return loading ? <Loading /> : <DataView />;
```

### 3. **Type Safety**
```typescript
interface Task {
  _id: string;
  title: string;
  priority: 'low' | 'medium' | 'high'; // Union type
}

// TypeScript prevents invalid values:
task.priority = 'urgent'; // ❌ Error!
task.priority = 'high';   // ✅ OK
```

### 4. **Component Reusability**
```typescript
// Generic Button component
<Button
  title="Save"
  variant="primary"   // or "secondary", "outline", "danger"
  size="large"        // or "medium", "small"
  loading={saving}
  onPress={handleSave}
/>
```

---

## Exercises for Learning

1. **Add a new field to tasks**
   - Add "category" to Task model
   - Update create/edit forms
   - Add filter by category

2. **Implement password reset**
   - Create backend endpoint
   - Send email (use nodemailer)
   - Create reset flow in app

3. **Add task search**
   - Implement debounced search
   - Highlight search terms
   - Search in title and description

4. **Improve notifications**
   - Schedule multiple reminders
   - Custom notification times
   - Notification settings page

---

## Additional Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Formik Documentation](https://formik.org/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

---

**Keep building and learning! 🚀**
