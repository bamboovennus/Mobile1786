import { useFocusEffect, useNavigation } from "@react-navigation/core";
import React, { useState, useCallback, useLayoutEffect } from "react";
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

const LoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

  const handleLogin = async () => {
    if (
      !validUsernameRegex.test(username) &&
      !validPasswordRegex.test(password)
    ) {
      Alert.alert("Error", "Username and password must follow the requirement");
      return;
    }

    setIsLoading(true);
    try {
      const user = await getOneUser(username);
      setIsLoading(false);

      if (user) {
        await updateLoggedInStatus(username, 1);
        if (user.password === password) {
          navigation.navigate(MainRoutes.HOME, { username });
        } else {
          Alert.alert("Error", "Invalid password");
          setPassword("");
        }

        return;
      }

      Alert.alert("User not found", "You may want to register!");
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const handleRegister = async () => {
    if (
      !validUsernameRegex.test(username) &&
      !validPasswordRegex.test(password)
    ) {
      Alert.alert("Error", "Username and password must follow the requirement");
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
        </View>
        <View style={styles.buttonContainer}>
          <MainButton
            buttonText={"Login"}
            fontSize={16}
            onPress={handleLogin}
            backgroundColor={"#290"}
          />
          <View
            style={{
              marginHorizontal: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={styles.separateText}>{"OR"}</Text>
          </View>
          <MainButton
            buttonText={"Register now!"}
            fontSize={16}
            backgroundColor={"blue"}
            onPress={handleRegister}
          />
        </View>
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
    marginBottom: 64,
    flex: 1,
    justifyContent: "flex-end",
  },
  bodyContainer: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 36,
  },
  separateText: {
    fontSize: 16,
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

export default LoginScreen;
