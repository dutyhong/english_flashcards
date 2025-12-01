import React from 'react';
import { View, Text, StyleSheet, TextInput, Switch, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useStore } from '../store/useStore';
import { Key, Info, ExternalLink, Trash2 } from 'lucide-react-native';

export default function SettingsScreen() {
  const { apiKey, setApiKey, isDemoMode, setDemoMode, clearAllWords } = useStore();

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
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 12,
  }
});

