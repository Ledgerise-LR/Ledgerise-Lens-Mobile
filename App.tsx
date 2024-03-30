
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Collections from "./screens/Collections";
import Assets from "./screens/Assets";
import Asset from "./screens/Asset";
import CameraPage from "./screens/CameraPage";
import Auth from "./screens/Auth";
import AuthBeneficiary from "./screens/AuthBeneficiary"
import Welcome from "./screens/Welcome";
import Need from "./screens/Needs";
import React from "react";

const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{ title: "Hoşgeldiniz" }}
        />
        <Stack.Screen
          name="Auth"
          component={Auth}
          options={{ title: "Giriş yap" }}
        />
        <Stack.Screen
          name="AuthBeneficiary"
          component={AuthBeneficiary}
          options={{ title: "Giriş yap" }}
        />
        <Stack.Screen
          name="Collections"
          component={Collections}
          options={{ title: "Kampanyalara göz at!" }}
        />
        <Stack.Screen
          name="Needs"
          component={Need}
          options={{ title: "Başvurularım" }}
        />
        <Stack.Screen
          name="Assets"
          component={Assets}
          options={{ title: "Bağışlar" }}
        />
        <Stack.Screen
          name="Asset"
          component={Asset}
          options={{ title: "Bağış detayları" }}
        />
        <Stack.Screen
          name="CameraPage"
          component={CameraPage}
          options={{ title: "LR Lens" }}
        />
      </Stack.Navigator>
    </NavigationContainer >
  );
}
