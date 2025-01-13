import React from "react";
import { Text, TouchableOpacity, StyleSheet, View, ActivityIndicator } from "react-native";
import { ButtonProps } from "@/types/type";
import { useFonts } from "expo-font";

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  style,
  ...props
}: ButtonProps) => {
  const [fontsLoaded] = useFonts({
    Cairo: require("@/assets/fonts/Cairo-VariableFont_slnt,wght.ttf"),
    CairoBold: require("@/assets/fonts/Cairo-Bold.ttf"),
    CairoPlay: require("@/assets/fonts/CairoPlay-Bold.ttf"),
  });

  // Fallback UI while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C8D5E" />
        <Text style={styles.loadingText}>المرجو الانتظار</Text>
      </View>
    );
  }

  // Function to determine the background style based on the variant
  const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
    switch (variant) {
      case "secondary":
        return styles.bgSecondary;
      case "danger":
        return styles.bgDanger;
      case "success":
        return styles.bgSuccess;
      case "outline":
        return styles.bgOutline;
      default:
        return styles.bgPrimary;
    }
  };

  // Function to determine the text color based on the variant
  const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
    switch (variant) {
      case "primary":
        return styles.textPrimary;
      case "secondary":
        return styles.textSecondary;
      case "danger":
        return styles.textDanger;
      case "success":
        return styles.textSuccess;
      default:
        return styles.textDefault;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, getBgVariantStyle(bgVariant), style]}
      {...props}
    >
      {IconLeft && <IconLeft />}
      <Text style={[styles.text, getTextVariantStyle(textVariant)]}>{title}</Text>
      {IconRight && <IconRight />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0F5E9",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#3C8D5E",
    fontFamily: "CairoBold",
  },
  button: {
    width: "100%",
    borderRadius: 9999,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 5,
  },
  text: {
    fontFamily: "CairoBold",
    fontSize: 18,
    
  },
  // Background variants
  bgPrimary: {
    backgroundColor: "#4B7F52",
  },
  bgSecondary: {
    backgroundColor: "#6B7280",
  },
  bgDanger: {
    backgroundColor: "#EF4444",
  },
  bgSuccess: {
    backgroundColor: "#10B981",
  },
  bgOutline: {
    backgroundColor: "transparent",
    borderColor: "#D1D5DB",
    borderWidth: 0.5,
  },
  // Text variants
  textDefault: {
    color: "white",
  },
  textPrimary: {
    color: "black",
  },
  textSecondary: {
    color: "#F3F4F6",
  },
  textDanger: {
    color: "#FECACA",
  },
  textSuccess: {
    color: "#D1FAE5",
  },
});

export default CustomButton;
