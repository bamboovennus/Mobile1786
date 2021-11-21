import React from "react";
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableHighlightProps,
} from "react-native";

const MainButton = (props) => {
  const { buttonText, fontSize, backgroundColor, ...rest } = props;

  return (
    <TouchableHighlight
      underlayColor={"#999"}
      activeOpacity={0.5}
      style={[
        styles.container,
        { backgroundColor: backgroundColor || "green" },
      ]}
      {...rest}
    >
      <Text style={[styles.buttonText, { fontSize: fontSize || 20 }]}>
        {buttonText}
      </Text>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
    borderRadius: 12,
    width: 300,
  },
  buttonText: {
    color: "#fff",
    padding: 16,
  },
});

export default MainButton;
