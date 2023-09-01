
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Collections from "./screens/Collections";
import Assets from "./screens/Assets";
import Asset from "./screens/Asset";
import CameraPage from "./screens/CameraPage";


const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Collections"
          component={Collections}
          options={{ title: "Browse collections" }}
        />
        <Stack.Screen
          name="Assets"
          component={Assets}
          options={{ title: "Assets" }}
        />
        <Stack.Screen
          name="Asset"
          component={Asset}
          options={{ title: "Asset Details" }}
        />
        <Stack.Screen
          name="CameraPage"
          component={CameraPage}
          options={{ title: "LedgeriseLens" }}
        />
      </Stack.Navigator>
    </NavigationContainer >
  );
}
