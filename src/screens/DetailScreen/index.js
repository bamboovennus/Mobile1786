import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/core";
import React, { useState, useLayoutEffect } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { DB_NAME } from "../../App";
import LoadingOverlay from "../../components/LoadingOverlay";
import MainButton from "../../components/MainButton";
import MainTextInput from "../../components/MainTextInput";
import { DataType, getOneData, updateData } from "../../database/propertyDto";
import { MainRoutes } from "../../routing";

const DetailScreen = () => {
  const { id } = useRoute().params;
  const navigation = useNavigation();
  const [data, setData] = useState({
    propertyType: "",
    bedrooms: "",
    dateTime: "",
    monthlyRentPrice: "",
    reporterName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const data = await getOneData(DB_NAME, id);
      setIsLoading(false);

      if (data) {
        setData(data);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Something went wrong");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Property details",
    });
  }, [navigation, id]);

  const handleSave = async () => {
    try {
      await updateData(DB_NAME, id, data);
      Alert.alert("Success", "Update successfully", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  const renderItem = (title, value) => {
    return (
      <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value || "No data"}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.imageContainer}>
            {data?.image && data.image.length > 0 ? (
              <Image
                source={{
                  uri: data.image,
                }}
                style={styles.image}
              />
            ) : (
              <Text>No image</Text>
            )}
          </View>
          <View>
            {renderItem("Reporter", data?.reporterName)}
            {renderItem("Properties Type", data?.propertyType)}
            {renderItem("Monthly Rent Price", data?.monthlyRentPrice)}
            {renderItem("Bedrooms", data?.bedrooms)}
            {renderItem("Date&Time", data?.dateTime)}
            {renderItem("Furniture Types", data?.furnitureTypes)}
            {renderItem("Notes", data?.notes)}
            <MainTextInput
              style={{ height: 200 }}
              placeholder={"Additional Description"}
              label={"Additional Description"}
              multiline={true}
              value={data?.description}
              onChangeText={(text) => {
                setData({
                  ...data,
                  description: text,
                });
              }}
            />
          </View>

          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <MainButton
              buttonText={"Save"}
              fontSize={16}
              onPress={handleSave}
            />
          </View>
        </ScrollView>
      </View>
      <LoadingOverlay visible={isLoading} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  image: {
    width: "100%",
    height: 200,
  },
  imageContainer: {
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
  },
  item: {
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  value: {
    fontSize: 16,
  },
  valueContainer: {
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 8,
  },
});

export default DetailScreen;
