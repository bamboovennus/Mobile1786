import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

const MainTextInput = (props) => {
  const {
    label,
    isRequired,
    style,
    errorText,
    onValid,
    validRegExp,
    onFocus,
    onBlur,
    onChangeText,
    value,
    ...rest
  } = props;
  const [isValid, setIsValid] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [isTyped, setIsTyped] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isBlur, setIsBlur] = useState(false);

  useEffect(() => {
    if (validRegExp) {
      setIsValid(validRegExp.test(value || ""));
    }
  }, [value]);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {isRequired && <Text style={styles.required}>{" *"}</Text>}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            borderColor:
              isRequired && isFocus && (isTyped || isBlur)
                ? isValid
                  ? "#ccc"
                  : "#f00"
                : "#ccc",
          },
        ]}
      >
        <TextInput
          {...rest}
          style={[styles.input, style]}
          value={value}
          onFocus={(e) => {
            setIsFocus(true);
            onFocus && onFocus(e);
          }}
          onChangeText={(text) => {
            if (!isTyped) {
              setIsTyped(true);
            }
            setInputText(text);
            onChangeText && onChangeText(text);
            if (validRegExp) {
              setIsValid(validRegExp.test(text));
              onValid && onValid(validRegExp.test(text));
            }
          }}
          onBlur={(e) => {
            if (validRegExp) {
              setIsValid(validRegExp.test(value || ""));
            }
            setIsBlur(true);
            onBlur && onBlur(e);
            onValid && onValid(isValid);
          }}
        />
      </View>
      {isRequired && isFocus && (isTyped || isBlur)
        ? !isValid &&
          errorText && (
            <View style={styles.errorContainer}>
              <Text style={styles.error}>{errorText}</Text>
            </View>
          )
        : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: "#999",
    fontWeight: "bold",
  },
  input: {
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  required: {
    fontSize: 16,
    color: "red",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  errorContainer: {
    marginTop: 8,
  },
  error: {
    color: "red",
    fontSize: 12,
    textAlign: "right",
    fontWeight: "bold",
  },
});

export default MainTextInput;
