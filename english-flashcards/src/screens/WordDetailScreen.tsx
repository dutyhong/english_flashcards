import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Volume2, Trash2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { ReviewWord, useStore } from '../store/useStore';

export default function WordDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { removeWord } = useStore();
  
  // @ts-ignore - route params are not typed strictly yet
  const { word } = route.params as { word: ReviewWord };

  useEffect(() => {
    navigation.setOptions({ title: word.word });
  }, [word.word]);

  const playAudio = async (text: string) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }

      const options: Speech.SpeechOptions = {
        language: 'en-US',
        rate: 0.9,
      };
      
      if (Platform.OS === 'android') {
         const voices = await Speech.getAvailableVoicesAsync();
         const enVoice = voices.find(v => v.language.includes('en-US')) || voices.find(v => v.language.includes('en'));
         if (enVoice) {
             options.voice = enVoice.identifier;
         }
      }

      Speech.speak(text, options);
    } catch (error) {
      console.error("Speech error:", error);
      Alert.alert("Error", "发音失败，请检查手机是否安装了 TTS 语音包");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "删除单词",
      `确定要删除 "${word.word}" 吗？`,
      [
        { text: "取消", style: "cancel" },
        { 
          text: "删除", 
          style: "destructive", 
          onPress: async () => {
            await removeWord(word.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.wordRow}>
          <Text style={styles.word}>{word.word}</Text>
          <TouchableOpacity onPress={() => playAudio(word.word)} style={styles.audioButton}>
            <Volume2 size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.phoneticRow}>
          <Text style={styles.phonetic}>{word.pronunciation}</Text>
        </View>
        
        <Text style={styles.meaning}>{word.meaning}</Text>
      </View>

      <Text style={styles.sectionTitle}>例句解析</Text>
      
      {word.sentences.map((sent, idx) => (
        <View key={idx} style={styles.sentenceBlock}>
          <Text style={styles.enSentence}>{sent.english}</Text>
          <Text style={styles.cnSentence}>{sent.chinese}</Text>
          <Text style={styles.explanation}>{sent.explanation}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Trash2 size={20} color="#ef4444" />
        <Text style={styles.deleteText}>从复习列表中移除</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  word: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginRight: 12,
  },
  audioButton: {
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 50,
  },
  phoneticRow: {
    marginBottom: 16,
  },
  phonetic: {
    fontSize: 18,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  meaning: {
    fontSize: 20,
    color: '#334155',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  sentenceBlock: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  enSentence: {
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 26,
    fontWeight: '500',
  },
  cnSentence: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 8,
  },
  explanation: {
    fontSize: 14,
    color: '#2563eb',
    fontStyle: 'italic',
    marginTop: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    marginTop: 20,
  },
  deleteText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});

