import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Camera, BookOpen, Settings, LogOut } from 'lucide-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';

import ScanScreen from './src/screens/ScanScreen';
import SelectWordScreen from './src/screens/SelectWordScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthScreen from './src/screens/AuthScreen';

import { useStore } from './src/store/useStore';
import { supabase } from './src/lib/supabase';

import WordDetailScreen from './src/screens/WordDetailScreen';

const Tab = createBottomTabNavigator();
const ScanStack = createStackNavigator();
const ReviewStack = createStackNavigator();

function ScanStackNavigator() {
  return (
    <ScanStack.Navigator>
      <ScanStack.Screen name="ScanInput" component={ScanScreen} options={{ title: '拍照识别' }} />
      <ScanStack.Screen name="SelectWord" component={SelectWordScreen} options={{ title: '选择单词' }} />
    </ScanStack.Navigator>
  );
}

function ReviewStackNavigator() {
  return (
    <ReviewStack.Navigator>
      <ReviewStack.Screen name="ReviewList" component={ReviewScreen} options={{ title: '复习列表' }} />
      <ReviewStack.Screen name="WordDetail" component={WordDetailScreen} options={{ title: '单词详情' }} />
    </ReviewStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Scan') return <Camera size={size} color={color} />;
          if (route.name === 'Review') return <BookOpen size={size} color={color} />;
          if (route.name === 'Settings') return <Settings size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Scan" 
        component={ScanStackNavigator} 
        options={{ headerShown: false, title: '识别' }} 
      />
      <Tab.Screen 
        name="Review" 
        component={ReviewStackNavigator} 
        options={{ headerShown: false, title: '复习列表' }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: '设置',
          headerRight: () => (
            <TouchableOpacity 
              style={{ marginRight: 16 }}
              onPress={() => supabase.auth.signOut()}
            >
              <LogOut size={20} color="#ef4444" />
            </TouchableOpacity>
          )
        }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { session, setSession } = useStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {session ? <MainTabs /> : <AuthScreen />}
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
