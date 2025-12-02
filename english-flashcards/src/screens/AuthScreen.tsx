import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Register

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请输入邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      // Auto-append fake domain if not an email, to support "username" login
      const finalEmail = email.includes('@') ? email : `${email}@flashcards.local`;

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: finalEmail,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: finalEmail,
          password,
        });
        if (error) throw error;
        
        // Explicitly sign out to prevent auto-login
        await supabase.auth.signOut();
        
        Alert.alert(
          '注册成功', 
          '账号创建成功！\n请使用刚才的用户名和密码登录。',
          [
            {
              text: '去登录',
              onPress: () => {
                setIsLogin(true); // Switch to login mode
                // We keep the email filled, but user might need to re-enter password depending on UX preference.
                // Usually password field is cleared or kept. Let's keep it for convenience but require button press.
              }
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('操作失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>{isLogin ? '欢迎回来' : '创建账户'}</Text>
          <Text style={styles.subtitle}>English Flashcards 云端同步版</Text>

          <TextInput
            style={styles.input}
            placeholder="用户名 (Username)"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            // keyboardType="email-address" // Remove strict email keyboard
          />
          
          <TextInput
            style={styles.input}
            placeholder="密码 (Password)"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Warning Message */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              ⚠️ 请务必记住您的用户名和密码。
            </Text>
            <Text style={styles.warningSubText}>
              由于无需绑定手机/邮箱，一旦忘记将无法找回账号！建议注册后在设置中绑定真实邮箱。
            </Text>
          </View>


          <TouchableOpacity 
            style={[styles.button, loading && styles.disabledButton]} 
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{isLogin ? '登录' : '注册'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin ? '还没有账号？去注册' : '已有账号？去登录'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18, // Increased vertical padding for better height
    fontSize: 16,
    marginBottom: 20, // Increased margin
    color: '#1e293b', // Ensure text color is visible
    minHeight: 56, // Ensure minimum height
  },
  warningContainer: {
    marginBottom: 16,
    backgroundColor: '#fff1f2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  warningText: {
    color: '#be123c',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  warningSubText: {
    color: '#be123c',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchText: {
    color: '#2563eb',
    fontSize: 14,
  }
});

