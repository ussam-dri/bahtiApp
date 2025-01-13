import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useFonts } from 'expo-font';

const ResultScreen = () => {
  const [fontsLoaded] = useFonts({
    Cairo: require('@/assets/fonts/Cairo-VariableFont_slnt,wght.ttf'),
    CairoPlay: require('@/assets/fonts/CairoPlay-Bold.ttf'),
  });

  const router = useRouter();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Request MediaLibrary permissions
  const requestPermissions = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        return true;
      } else {
        Alert.alert(
          'Permission Required',
          'Storage permission is required to save PDFs',
          [{ text: 'OK' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  // Function to convert image URI to base64
  const getImageAsBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // Generate HTML content for PDF
  const generateHtmlContent = async () => {
    let imagesHtml = '';

    if (result.images && result.images.length > 0) {
      for (const imageUri of result.images) {
        try {
          const base64 = await getImageAsBase64(imageUri);
          if (base64) {
            imagesHtml += `
              <div style="margin: 20px 0;">
                <img src="data:image/jpeg;base64,${base64}" 
                     style="width: 300px; max-width: 100%; height: auto;" />
              </div>
            `;
          }
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Research Results</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .content {
              margin-bottom: 30px;
              line-height: 1.6;
            }
            .images-container {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <h1>Research Results</h1>
          <div class="content">
            ${result.text || 'No text available'}
          </div>
          <div class="images-container">
            ${imagesHtml}
          </div>
        </body>
      </html>
    `;
  };

  // Function to generate and save PDF
  const generatePDF = async () => {
    if (!result) {
      Alert.alert('Error', 'No data available to generate PDF');
      return;
    }

    try {
      setIsLoading(true);

      // Generate HTML content
      const htmlContent = await generateHtmlContent();

      // Generate PDF file
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        // Share the PDF file
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        // Save to media library if sharing is not available
        const permission = await requestPermissions();
        if (permission) {
          const asset = await MediaLibrary.createAssetAsync(uri);
          await MediaLibrary.createAlbumAsync('Research Results', asset, false);
          Alert.alert('Success', 'PDF has been saved to your device!');
        }
      }

      // Clean up the temporary file
      await FileSystem.deleteAsync(uri, { idempotent: true });

    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedResult = await AsyncStorage.getItem('researchResult');
        if (storedResult !== null) {
          setResult(JSON.parse(storedResult));
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };

    fetchData();
  }, []);

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.text}>No data available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <Text style={styles.logoText}>بحثي</Text>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowControls(!showControls)}
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
      </View>

      {/* Control buttons - Only show when menu is clicked */}
      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>تغيير النص</Text>
            <View style={styles.refreshIcon}>
              <Text style={styles.refreshText}>↺</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>تغيير الصور</Text>
            <View style={styles.refreshIcon}>
              <Text style={styles.refreshText}>↺</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Main content */}
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.contentText}>
          {result.text || 'No text available'}
        </Text>

        {/* Image grid */}
        <View style={styles.imageGrid}>
          {(result.images || []).map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                source={{ uri: image }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={styles.bottomButton} 
          onPress={() => router.push("/(root)/home")}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>عودة</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.bottomButton, isLoading && styles.buttonDisabled]} 
          onPress={generatePDF}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>مشاركة</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F5E9',
  },
  header: {
    backgroundColor: '#3C8D5E',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    position: 'relative',
  },
  logoText: {
   
    fontSize: 24,
    fontFamily: 'CairoPlay',
  },
  menuButton: {
    position: 'absolute',
    right: 15,
    justifyContent: 'space-between',
    height: 20,
  },
  menuLine: {
    width: 25,
    height: 2,
    backgroundColor: 'white',
    marginVertical: 2,
  },
  controls: {
    direction: 'rtl',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
  },
  controlButton: {
    backgroundColor: '#E0F5E9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  controlText: {
    
    color: '#000',
    fontSize: 16,
    fontFamily: 'Cairo',
    textAlign: 'right',
  },
  refreshIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 20,
    color: '#3C8D5E',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 5,
    padding: 15,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 5,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#E0F5E9',
  },
  bottomButton: {
    backgroundColor: '#3C8D5E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Cairo',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});

export default ResultScreen;