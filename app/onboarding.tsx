import React, { useRef, useState } from "react";
import { Image, View, Text, StyleSheet ,ActivityIndicator} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { onboarding } from "@/constants";
import CustomButton from "@/components/CustomButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";

const OnboardingScreen = () => {
  const [fontsLoaded] = useFonts({
    Cairo: require("@/assets/fonts/Cairo-VariableFont_slnt,wght.ttf"),
    CairoBold: require("@/assets/fonts/Cairo-Bold.ttf"),

    CairoPlay: require("@/assets/fonts/CairoPlay-Bold.ttf"),
  });

  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboarding.length - 1;

  const setFirstUseTrue = () => {
    AsyncStorage.setItem("first-use", "true");
    router.push("/(root)/home");
  };

  const handleNext = () => {
    if (isLastSlide) {
      setFirstUseTrue();
    } else {
      swiperRef.current?.scrollTo(activeIndex + 1);
    }
  };

  if (!fontsLoaded) {
   return (
      <View >
        <ActivityIndicator size="large" color="#3C8D5E" />
        <Text >المرجو الانتظار   </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <LinearGradient colors={["#7DD181", "#96E8BC"]} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <Swiper
            ref={swiperRef}
            loop={false}
            dot={<View style={styles.inactiveDot} />}
            activeDot={<View style={styles.activeDot} />}
            onIndexChanged={(index) => setActiveIndex(index)}
          >
            {onboarding.map((item) => (
              <View key={item.id} style={styles.swiperItem}>
                <Image
                  source={item.image}
                  style={styles.image}
                  resizeMode="contain"
                />
                <View style={styles.titleContainer}>
                  <Text style={[styles.title, { fontFamily: "CairoBold" }]}>
                    {item.title}
                  </Text>
                </View>
                <Text style={[styles.description, { fontFamily: "Cairo" }]}>
                  {item.description}
                </Text>
              </View>
            ))}
          </Swiper>

          <CustomButton
            title={isLastSlide ? "بدأ الاستخدام" : "التالي"}
            onPress={handleNext}
            style={styles.button}
          />
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  swiperItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: "100%",
    height: 300,
  },
  titleContainer: {
   
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  title: {
    fontFamily: "Cairo",
    fontSize: 24,
   
    color: "black",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  description: {
    fontSize: 14,
    color: "#858585",
    textAlign: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  inactiveDot: {
    width: 32,
    height: 4,
    marginHorizontal: 5,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
  },
  activeDot: {
    width: 32,
    height: 4,
    marginHorizontal: 5,
    backgroundColor: "#0286ff",
    borderRadius: 2,
  },
  button: {
    fontFamily: "CairoBold",
    width: "92%",
    marginTop: 20,
    marginBottom: 20,
  },
});

export default OnboardingScreen;
