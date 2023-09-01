
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Collections from "./screens/Collections";
import Assets from "./screens/Assets";
import Asset from "./screens/Asset";


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
      </Stack.Navigator>
    </NavigationContainer >
  );
}
