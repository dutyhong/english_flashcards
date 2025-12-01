import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { useStore, ReviewWord } from '../store/useStore';
import { ChevronRight, Volume2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

export default function ReviewScreen() {
  const { reviewList } = useStore();
  const navigation = useNavigation();

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

  const renderItem = ({ item }: { item: ReviewWord }) => {
    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => {
            // @ts-ignore
            navigation.navigate('WordDetail', { word: item });
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.word}>{item.word}</Text>
        
        <View style={styles.rightActions}>
            <TouchableOpacity 
                onPress={(e) => {
                    e.stopPropagation(); // Prevent triggering navigation
                    playAudio(item.word);
                }} 
                style={styles.audioButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Volume2 size={20} color="#2563eb" />
            </TouchableOpacity>
            <ChevronRight size={20} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    );
  };

  if (reviewList.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>还没有添加单词</Text>
        <Text style={styles.emptySubText}>去“识别”页面拍张照片试试吧！</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviewList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
  },
  emptySubText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  word: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
  }
});
