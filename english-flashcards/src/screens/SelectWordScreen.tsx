import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Plus, ArrowRight } from 'lucide-react-native';
import { AIService } from '../services/ai';
import { useStore } from '../store/useStore';

export default function SelectWordScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { words } = route.params;
  const { addWord, apiKey, isDemoMode } = useStore();

  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const toggleSelection = (word: string) => {
    const newSet = new Set(selectedWords);
    if (newSet.has(word)) {
      newSet.delete(word);
    } else {
      newSet.add(word);
    }
    setSelectedWords(newSet);
  };

  const handleAddToReview = async () => {
    if (selectedWords.size === 0) return;

    setProcessing(true);
    const targets = Array.from(selectedWords);
    setProgress({ current: 0, total: targets.length });

    try {
      for (let i = 0; i < targets.length; i++) {
        const wordText = targets[i];
        try {
          const details = await AIService.enrichWord(wordText, isDemoMode ? undefined : apiKey);
          addWord({
            id: Date.now().toString() + i,
            dateAdded: Date.now(),
            ...details
          });
        } catch (err) {
          console.error(`Failed to enrich ${wordText}`, err);
        }
        setProgress((p) => ({ ...p, current: i + 1 }));
      }
      
      Alert.alert("添加成功", "已将单词加入复习列表", [
        { 
          text: "OK", 
          onPress: () => navigation.navigate('Review') 
        }
      ]);
    } catch (error) {
      Alert.alert("Error", "处理过程中发生错误");
    } finally {
      setProcessing(false);
    }
  };

  const renderItem = ({ item }: { item: string }) => {
    const isSelected = selectedWords.has(item);
    return (
      <TouchableOpacity 
        style={[styles.wordItem, isSelected && styles.selectedItem]} 
        onPress={() => toggleSelection(item)}
      >
        <Text style={[styles.wordText, isSelected && styles.selectedText]}>{item}</Text>
        <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
          {isSelected && <Check size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  if (processing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>正在生成单词卡片...</Text>
        <Text style={styles.progressText}>{progress.current} / {progress.total}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>选择生词</Text>
        <Text style={styles.headerSubtitle}>识别到 {words.length} 个单词</Text>
      </View>

      <FlatList
        data={words}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.addButton, selectedWords.size === 0 && styles.disabledButton]}
          onPress={handleAddToReview}
          disabled={selectedWords.size === 0}
        >
          <Text style={styles.addButtonText}>添加到复习列表 ({selectedWords.size})</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  wordItem: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedItem: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  wordText: {
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
    flex: 1,
  },
  selectedText: {
    color: '#2563eb',
    fontWeight: '700',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  }
});

