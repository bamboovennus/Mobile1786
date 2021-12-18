import { useFocusEffect, useNavigation } from "@react-navigation/core";
import React, { useState, useCallback, useLayoutEffect } from "react";
import { TouchableOpacity } from "react-native";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoadingOverlay from "../../../components/LoadingOverlay";
import MainButton from "../../../components/MainButton";
import MainTextInput from "../../../components/MainTextInput";
import {
  getAllUsers,
  getOneUser,
  insertUser,
  updateLoggedInStatus,
} from "../../../database/userDto";
import { MainRoutes } from "../../../routing";

const validUsernameRegex = /^[a-zA-Z0-9]+$/;
const validPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

const RegisterScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      getAllUsers().then((users) => {
        if (users.length > 0) {
          users.forEach((user) => {
            if (user.isLoggedIn) {
              navigation.navigate(MainRoutes.HOME, { username: user.username });
              return;
            }
          });
        }
      });
    }, [navigation])
  );

  const handleRegister = async () => {
    if (
      !validUsernameRegex.test(username) &&
      !validPasswordRegex.test(password)
    ) {
      Alert.alert("Error", "Username and password must follow the requirement");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Password and Confirm password must be the same");
      return;
    }

    setIsLoading(true);

    try {
      const user = await getOneUser(username);

      if (!user) {
        await insertUser({ username, password, isLoggedIn: 0 });
        setIsLoading(false);

        Alert.alert("Success", "You have successfully registered!");
        return;
      }

      Alert.alert("User already exists", "Please login!");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Something went wrong");
    }
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>RentalZ</Text>
        </View>
        <View style={styles.bodyContainer}>
          <MainTextInput
            label={"Username"}
            isRequired
            validRegExp={validUsernameRegex}
            errorText={"Username must be alphanumeric"}
            value={username}
            onChangeText={setUsername}
          />
          <MainTextInput
            label={"Password"}
            isRequired
            validRegExp={validPasswordRegex}
            errorText={
              "Password must be at least 6 characters\nand contain at least one letter and one number"
            }
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <MainTextInput
            label={"Confirm Password"}
            isRequired
            validRegExp={validPasswordRegex}
            errorText={
              "Password must be at least 6 characters\nand contain at least one letter and one number"
            }
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <View style={styles.buttonContainer}>
          <MainButton
            buttonText={"Register"}
            fontSize={16}
            onPress={handleRegister}
            backgroundColor={"blue"}
          />
        </View>

        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + 64,
            left: 32,
          }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Text
            style={{
              fontWeight: "700",
            }}
          >
            {"Back to Login"}
          </Text>
        </TouchableOpacity>
      </View>
      <LoadingOverlay visible={isLoading} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  headerText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#290",
  },
  headerContainer: {
    marginBottom: 16,
    flex: 1,
    justifyContent: "flex-end",
  },
  bodyContainer: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 125,
  },
  separateText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#aaa",
    alignSelf: "center",
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: "column",
    flex: 2,
  },
});

export default RegisterScreen;
