import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert } from 'react-native';
import { useStore, ReviewWord, WordStatus } from '../store/useStore';
import { ChevronRight, Volume2 } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// ... imports ...

export default function ReviewScreen() {
  const { reviewList, fetchWords } = useStore();
  const navigation = useNavigation();
  const [filter, setFilter] = useState<WordStatus | 'all'>('all');

  // Define styles inside component to avoid "runtime not ready" issues during early module loading
  const styles = React.useMemo(() => StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#f1f5f9',
      },
      filterContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 8,
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        justifyContent: 'space-between',
      },
      filterTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
      },
      activeFilterTab: {
        backgroundColor: '#eff6ff',
      },
      filterText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
      },
      activeFilterText: {
        color: '#2563eb',
        fontWeight: 'bold',
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
        fontSize: 16,
        color: '#94a3b8',
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
      statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
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
  }), []);


  const filteredList = reviewList.filter(word => 
    filter === 'all' ? true : word.status === filter
  );

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
    let statusColor = '#cbd5e1';
    if (item.status === 'mastered') statusColor = '#22c55e';
    if (item.status === 'review') statusColor = '#eab308';
    if (item.status === 'forgot') statusColor = '#ef4444';

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => {
            // @ts-ignore
            navigation.navigate('WordDetail', { word: item });
        }}
        activeOpacity={0.7}
      >
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
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

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {(['all', 'mastered', 'review', 'forgot'] as const).map((tab) => {
            let lightBg = '#f1f5f9'; // Default light grey
            let darkBg = '#64748b';  // Default dark grey
            let lightText = '#64748b'; 
            
            if (tab === 'all') {
                lightBg = '#eff6ff';
                darkBg = '#2563eb';
                lightText = '#2563eb';
            } else if (tab === 'mastered') {
                lightBg = '#dcfce7';
                darkBg = '#16a34a';
                lightText = '#15803d';
            } else if (tab === 'review') {
                lightBg = '#fef9c3';
                darkBg = '#ca8a04';
                lightText = '#854d0e';
            } else if (tab === 'forgot') {
                lightBg = '#fee2e2';
                darkBg = '#dc2626';
                lightText = '#991b1b';
            }

            const isActive = filter === tab;

            return (
                <TouchableOpacity
                    key={tab}
                    style={[
                        styles.filterTab, 
                        // Always have background color (light when inactive, dark when active)
                        { backgroundColor: isActive ? darkBg : lightBg },
                        // Add margin to separate buttons
                        { marginHorizontal: 4 } 
                    ]}
                    onPress={() => setFilter(tab)}
                >
                    <Text style={[
                        styles.filterText, 
                        // White text when active, colored text when inactive
                        { color: isActive ? '#ffffff' : lightText },
                        isActive && { fontWeight: 'bold' }
                    ]}>
                        {tab === 'all' ? '全部' : tab === 'mastered' ? '熟练' : tab === 'review' ? '模糊' : '忘记'}
                    </Text>
                </TouchableOpacity>
            );
        })}
      </View>

      {filteredList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>没有找到相关单词</Text>
        </View>
      ) : (
        <FlatList
            data={filteredList}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}
// Removed external StyleSheet.create to prevent runtime errors


