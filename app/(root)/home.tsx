import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from 'axios';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const ResearchForm = () => {
  const navigation = useNavigation(); // Use navigation hook
  const router = useRouter();
  const [language, setLanguage] = useState('arabic');
  const [lines, setLines] = useState('10');
  const [images, setImages] = useState('3');
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Cairo: require('@/assets/fonts/Cairo-VariableFont_slnt,wght.ttf'),
    CairoPlay: require('@/assets/fonts/CairoPlay-Bold.ttf'),
  });

  // Load data from AsyncStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedTopic = await AsyncStorage.getItem('topic');
        const savedLanguage = await AsyncStorage.getItem('language');
        const savedLines = await AsyncStorage.getItem('lines');
        const savedImages = await AsyncStorage.getItem('images');

        if (savedTopic) setTopic(savedTopic);
        if (savedLanguage) setLanguage(savedLanguage);
        if (savedLines) setLines(savedLines);
        if (savedImages) setImages(savedImages);
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };

    loadData();
  }, []);

  const handleCreate = useCallback(async () => {
    if (!topic.trim()) {
      Alert.alert('تنبيه', 'الرجاء إدخال موضوع البحث');
      return;
    }

    setIsLoading(true);

    const formData = {
      language,
      numLines: lines,
      numImages: images,
      topic,
    };
    try {
      const response = await axios.post(
        ' https://2d4e-196-119-60-6.ngrok-free.app/Translation/rest/generate',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10-second timeout
        }
      );

      if (response.status === 200) {
        Alert.alert('نجاح', 'تم إنشاء البحث بنجاح');

        // Save the form data to AsyncStorage for later use
        await AsyncStorage.setItem('topic', topic);
        await AsyncStorage.setItem('language', language);
        await AsyncStorage.setItem('lines', lines);
        await AsyncStorage.setItem('images', images);
        await AsyncStorage.setItem('researchResult', JSON.stringify(response.data));

        // Navigate to the results page
        router.push({
          pathname: '(root)/baht', // Assuming baht is a screen/page in your app
          query: { result: JSON.stringify(response.data) }, // Pass data as a query parameter
        });
        console.log('Success:');
      }
    } catch (error) {
      console.error('Error:', error.message);
      Alert.alert(
        'خطأ',
        'حدث خطأ أثناء إنشاء البحث. الرجاء المحاولة مرة أخرى'
      );
    } finally {
      setIsLoading(false);
    }
  }, [topic, language, lines, images]);

  const handleCancel = useCallback(() => {
    setTopic('');
    setLanguage('arabic');
    setLines('10');
    setImages('3');
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C8D5E" />
        <Text style={styles.loadingText}>المرجو الانتظار   </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { fontFamily: 'CairoPlay' }]}>بحثي</Text>
      </View>

      <View style={styles.topicContainer}>
        <TextInput
          style={[styles.topicText, { fontFamily: 'Cairo' }]}
          placeholder="موضوع البحث"
          value={topic}
          onChangeText={setTopic}
          multiline
          maxLength={200}
        />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { fontFamily: 'Cairo' }]}> اللغة :</Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              value={language}
              onValueChange={setLanguage}
              items={[
                { label: "العربية", value: "arabic" },
                { label: "الفرنسية", value: "french" },
                { label: "الانجليزية", value: "english" },
              ]}
              style={pickerSelectStyles}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { fontFamily: 'Cairo' }]}> عدد الاسطر :</Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              value={lines}
              onValueChange={setLines}
              items={Array.from({ length: 20 }, (_, i) => ({
                label: `${i + 1}`,
                value: `${i + 1}`,
              }))}
              style={pickerSelectStyles}
            />
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={[styles.label, { fontFamily: 'Cairo' }]}>عدد الصور  : </Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              value={images}
              onValueChange={setImages}
              items={Array.from({ length: 5 }, (_, i) => ({
                label: `${i + 1}`,
                value: `${i + 1}`,
              }))}
              style={pickerSelectStyles}
            />
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleCancel}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { fontFamily: 'Cairo' }]}>إلغاء</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.disabledButton]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={[styles.buttonText, { fontFamily: 'Cairo' }]}>إنشاء</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30,
    textAlign: 'right',
    fontFamily: 'Cairo',
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: 'black',
    paddingRight: 30,
    textAlign: 'right',
    fontFamily: 'Cairo',
  },
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F5E9',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#3C8D5E',
    fontFamily: 'Cairo',
  },
  container: {
    flex: 1,
    backgroundColor: '#E0F5E9',
  },
  header: {
    backgroundColor: '#3C8D5E',
    padding: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
  },
  topicContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 40,
    borderRadius: 5,
    alignItems: 'center',
  },
  topicText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    width: '100%',
  },
  formContainer: {
    padding: 20,
  },
  fieldContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#333',
    textAlign: 'right',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: '60%',
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#3C8D5E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    marginTop: 'auto',
  },
});

export default ResearchForm;
