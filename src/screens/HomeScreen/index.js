import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/core";
import React, { useState, useCallback, useLayoutEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  TouchableOpacityBase,
  Vibration,
  View,
} from "react-native";
import { DB_NAME } from "../../App";
import LoadingOverlay from "../../components/LoadingOverlay";
import MainButton from "../../components/MainButton";
import MainSearchBox from "../../components/MainSearchBox";
import {
  DataType,
  deleteAllData,
  deleteData,
  getData,
} from "../../database/propertyDto";
import { updateLoggedInStatus } from "../../database/userDto";
import { MainRoutes } from "../../routing";
const HomeScreen = () => {
  const navigation = useNavigation();
  const { username } = useRoute().params;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showButton, setshowButton] = useState(false);

  const onSearch = useCallback(
    (keyword) => {
      if (keyword.length === 0) {
        fetchData();
        return;
      }

      const result = data?.filter((item) => {
        return item.propertyType.toLowerCase().includes(keyword.toLowerCase());
      });

      if (result) {
        setData(result);
      }
    },
    [data]
  );

  const onDelete = useCallback((id) => {
    Alert.alert(
      "Delete Property",
      "Are you sure you want to delete this property?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            setIsLoading(true);
            const result = await deleteData(DB_NAME, id);

            if (result) {
              setIsLoading(false);
              fetchData();
            }
          },
        },
      ],
      { cancelable: false }
    );
  }, []);

  const handleLogout = useCallback(() => {
    Vibration.vibrate(100);
    Alert.alert(
      "Logout Confirmation",
      "When you logout, all data will be removed!",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            setIsLoading(true);
            await updateLoggedInStatus(username, 0);
            setIsLoading(false);
            navigation.goBack();
            deleteAllData(DB_NAME);
          },
        },
      ]
    );
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: "center",
      headerTitle: "Home",
      headerRight: () => (
        <TouchableHighlight
          underlayColor={"#fff"}
          activeOpacity={0.5}
          onPress={() => {
            navigation.navigate(MainRoutes.ADD_OR_EDIT, { type: "add" });
          }}
        >
          <Text style={styles.headerRight}>{"ADD"}</Text>
        </TouchableHighlight>
      ),
      headerLeft: () => (
        <TouchableHighlight
          underlayColor={"#fff"}
          activeOpacity={0.5}
          onPress={() => {
            handleLogout();
          }}
        >
          <Text style={{ color: "red", fontSize: 16, fontWeight: "bold" }}>
            {"Log out"}
          </Text>
        </TouchableHighlight>
      ),
      headerBackVisible: false,
    });
  }, [navigation]);

  const fetchData = async () => {
    const res = await getData(DB_NAME);

    if (res.length > 0) {
      setData(res);
    } else {
      setData(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const renderItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.6}
        key={index.toString()}
        onLongPress={() => {
          setshowButton(true);
          Alert.alert("Choose Action", "", [
            {
              text: "Edit",

              onPress: () => {
                navigation.navigate(MainRoutes.ADD_OR_EDIT, {
                  type: "edit",
                  id: item.id?.toString(),
                });
              },
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => {
                item.id && onDelete(item.id);
              },
            },
          ]);
        }}
        onPress={() => {
          navigation.navigate(MainRoutes.DETAIL, {
            id: item.id,
          });
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {/* <TouchableHighlight
            style={styles.deleteBox}
            onPress={() => {
              item.id && onDelete(item.id);
            }}
          >
            <Text style={{ color: "white", fontSize: 8, fontWeight: "bold" }}>
              {"Delete"}
            </Text>
          </TouchableHighlight>
          <TouchableHighlight
            style={styles.editBox}
            onPress={() => {
              navigation.navigate(MainRoutes.ADD_OR_EDIT, {
                type: "edit",
                id: item.id?.toString(),
              });
            }}
          >
            <Text style={{ color: "white", fontSize: 8, fontWeight: "bold" }}>
              {"Edit"}
            </Text>
          </TouchableHighlight> */}

          <View style={[styles.item]}>
            <View>
              <Text style={styles.itemText}>{item.propertyType}</Text>
              <Text style={styles.timeText}>{item.dateTime}</Text>
            </View>
            <View>
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.reporter}>{"Reporter: "}</Text>
                <Text style={styles.reporterText}>{item.reporterName}</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={{ color: "white" }}>
                  {item.monthlyRentPrice}$/month
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={styles.container}>
        <MainSearchBox placeholder={"Search"} onChangeText={onSearch} />
        <ScrollView style={styles.bodyContainer}>
          {data ? (
            data.map((item, index) => renderItem({ item, index }))
          ) : (
            <Text style={styles.noDataText}>
              {"No data found. Please add your first property!"}
            </Text>
          )}
        </ScrollView>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MainButton
            buttonText={"Delete all properties"}
            backgroundColor={"#ff0000"}
            fontSize={14}
            onPress={() => {
              Alert.alert(
                "Delete All Properties",
                "Are you sure you want to delete all properties?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "OK",
                    onPress: async () => {
                      setIsLoading(true);
                      try {
                        await deleteAllData(DB_NAME);
                        setIsLoading(false);
                        fetchData();
                      } catch (error) {
                        Alert.alert(
                          "Error",
                          "Something went wrong. Please try again later."
                        );
                      }
                    },
                  },
                ],
                { cancelable: false }
              );
            }}
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
    padding: 16,
  },
  item: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    flex: 1,
  },
  itemText: {
    fontSize: 32,
    fontWeight: "bold",
  },
  bodyContainer: {
    flex: 1,
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    color: "#999",
  },
  headerRight: {
    fontSize: 16,
    color: "#00a680",
    fontWeight: "bold",
  },
  reporterText: {
    fontSize: 14,
    color: "#901",
    fontWeight: "bold",
  },
  reporter: {
    fontSize: 14,
    color: "#999",
    fontWeight: "900",
  },
  greenHead: {
    position: "absolute",
    backgroundColor: "#00a680",
    width: 50,
    height: "100%",
    borderRadius: 8,
  },
  redEnd: {
    position: "absolute",
    backgroundColor: "#ff0000",
    width: 30,
    height: "100%",
    borderRadius: 8,
    right: -20,
  },
  priceBox: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    padding: 8,
    marginTop: 16,
    backgroundColor: "grey",
  },
  timeText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "bold",
  },
  editBox: {
    backgroundColor: "#00a680",
    padding: 8,
    borderRadius: 8,
    marginTop: 16,
    marginRight: 16,
    position: "absolute",
    height: "60%",
    alignItems: "flex-start",
    justifyContent: "center",
    width: 100,
  },
  deleteBox: {
    backgroundColor: "#ff0000",
    padding: 8,
    borderRadius: 8,
    marginTop: 16,
    marginRight: 16,
    position: "absolute",
    right: -16,
    height: "60%",
    alignItems: "flex-end",
    justifyContent: "center",
    width: 100,
  },
});

export default HomeScreen;
