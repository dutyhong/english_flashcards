import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { useStore } from '../store/useStore';
import { Key, Info, ExternalLink, Trash2, Mail, LogOut } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

export default function SettingsScreen() {
  const { apiKey, setApiKey, isDemoMode, setDemoMode, clearAllWords, session } = useStore();
  const [newEmail, setNewEmail] = useState('');
  const [bindingLoading, setBindingLoading] = useState(false);

  // Check if current email is a fake one
  const isFakeEmail = session?.user?.email?.endsWith('@flashcards.local');

  const handleLogout = async () => {
    Alert.alert(
      "退出登录",
      "确定要退出当前账号吗？",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "退出", 
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
          }
        }
      ]
    );
  };

  const handleBindEmail = async () => {
    if (!newEmail.includes('@') || !newEmail.includes('.')) {
      Alert.alert("错误", "请输入有效的邮箱地址");
      return;
    }

    setBindingLoading(true);
    try {
      // @ts-ignore
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      
      Alert.alert(
        "验证邮件已发送",
        `请前往 ${newEmail} 查收验证邮件。点击邮件中的链接后，您的绑定邮箱将更新，以后可以用新邮箱找回密码。`
      );
      setNewEmail('');
    } catch (error: any) {
      Alert.alert("绑定失败", error.message);
    } finally {
      setBindingLoading(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "清空数据",
      "确定要删除复习列表中的所有单词吗？此操作无法撤销。",
      [
        { text: "取消", style: "cancel" },
        { 
          text: "确定清空", 
          style: "destructive", 
          onPress: () => {
            clearAllWords();
            Alert.alert("已清空", "生词本已重置。");
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Info size={20} color="#2563eb" />
          <Text style={styles.sectionTitle}>应用模式</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.label}>演示模式 (Demo Mode)</Text>
              <Text style={styles.description}>无需 API Key，使用模拟数据进行体验。</Text>
            </View>
            <Switch
              value={isDemoMode}
              onValueChange={setDemoMode}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isDemoMode ? "#2563eb" : "#f4f3f4"}
            />
          </View>
        </View>
      </View>

      {/* Bind Real Email Section - Only show if user is using fake email */}
      {isFakeEmail && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mail size={20} color="#f59e0b" />
            <Text style={styles.sectionTitle}>账号安全</Text>
          </View>
          
          <View style={styles.card}>
            <Text style={styles.label}>绑定密保邮箱</Text>
            <Text style={styles.description}>
              您当前使用的是仅用户名登录。建议绑定真实邮箱，以便在忘记密码时找回账号。
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="输入您的真实邮箱 (例如 qq.com)"
              value={newEmail}
              onChangeText={setNewEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <TouchableOpacity 
              style={styles.bindButton}
              onPress={handleBindEmail}
              disabled={bindingLoading}
            >
              {bindingLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.bindButtonText}>发送绑定验证邮件</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={[styles.section, isDemoMode && styles.disabledSection]}>
        <View style={styles.sectionHeader}>
          <Key size={20} color="#2563eb" />
          <Text style={styles.sectionTitle}>API 设置</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>DashScope API Key</Text>
          <Text style={styles.description}>使用阿里云通义千问 (支持 OCR 和详细解析)。</Text>
          
          <TextInput
            style={styles.input}
            placeholder="sk-..."
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
            editable={!isDemoMode}
            autoCapitalize="none"
          />
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Linking.openURL('https://dashscope.console.aliyun.com/apiKey')}
            disabled={isDemoMode}
          >
            <Text style={styles.linkText}>获取 DashScope Key</Text>
            <ExternalLink size={14} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Trash2 size={20} color="#ef4444" />
          <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>数据管理</Text>
        </View>
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Text style={styles.dangerButtonText}>清空复习列表</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#64748b" style={{ marginRight: 8 }} />
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>English Flashcards App v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowInfo: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginTop: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    marginRight: 4,
  },
  bindButton: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  bindButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledSection: {
    opacity: 0.5,
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  dangerButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
    padding: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#475569',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
  }
});

