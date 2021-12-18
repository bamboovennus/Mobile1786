import { createNativeStackNavigator } from "@react-navigation/native-stack";

export const MainRoutes = {
  HOME: "HomeScreen",
  ADD_OR_EDIT: "AddOrEditScreen",
  DETAIL: "DetailScreen",
  SEARCH: "SearchScreen",
  AUTH: "AuthScreen",
};

export const MainStack = createNativeStackNavigator();
