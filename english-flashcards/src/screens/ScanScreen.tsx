import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { AIService } from '../services/ai';
import { useStore } from '../store/useStore';
import { Image as ImageIcon, Camera as CameraIcon, ScanLine } from 'lucide-react-native';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();
  const { apiKey, isDemoMode } = useStore();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.9, // Increased quality for better OCR
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.9, // Increased quality for better OCR
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    
    setLoading(true);
    try {
      const words = await AIService.recognizeText(image, isDemoMode ? undefined : apiKey, imageBase64);
      if (words.length === 0) {
        Alert.alert("未识别到单词", "请尝试更清晰的图片或调整角度。");
      } else {
        navigation.navigate('SelectWord', { words });
      }
    } catch (error: any) {
      Alert.alert("识别失败", error.message || "请检查网络或API设置");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>英语单词识别助手</Text>
        <Text style={styles.subtitle}>拍照或上传图片，自动提取生词</Text>
      </View>

      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholder}>
            <ScanLine size={64} color="#cbd5e1" />
            <Text style={styles.placeholderText}>预览区域</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
          <CameraIcon size={24} color="#fff" />
          <Text style={styles.buttonText}>拍照</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={pickImage}>
          <ImageIcon size={24} color="#2563eb" />
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>从相册选择</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <TouchableOpacity 
          style={[styles.analyzeButton, loading && styles.disabledButton]} 
          onPress={analyzeImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeButtonText}>开始识别</Text>
          )}
        </TouchableOpacity>
      )}
      
      {isDemoMode && (
        <Text style={styles.demoHint}>当前为演示模式 (无需 API Key)</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    color: '#94a3b8',
  },
  buttonGroup: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#2563eb',
  },
  analyzeButton: {
    width: '100%',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoHint: {
    marginTop: 20,
    color: '#64748b',
    fontSize: 12,
  }
});

