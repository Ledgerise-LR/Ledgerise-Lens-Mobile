import { StyleSheet, Text, View, Dimensions, Image, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import React from 'react';
import axios from 'axios';
import { URL, PORT } from '../serverConfig';

export default function Collections({ navigation }) {

  useEffect(() => {
    axios.get(`${URL}:${PORT}/auth/authenticate-verifier`)
      .then((res) => {
        if (res.data.success && res.data.company) navigation.navigate("Auth");
        if (!res.data.success && res.data.err) return { success: false, err: res.data.err }
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <View style={tw`w-full h-full px-10 py-6`}>
      <View style={tw`w-full h-full`}>
        <View style={tw`w-full mb-8`}>
          <View style={tw`w-1/4 aspect-square mb-4 relative`}>
            <Image style={tw`w-full h-full absolute`} source={require("../assets/logo.png")} />
          </View>
          <Text style={tw`text-4xl`}>Ledgerise'a Hoşgeldiniz</Text>
          <Text>Aşağıdaki doğrulayıcı seçeneklerinden birine tıklayınız.</Text>
        </View>
        <View style={tw`w-full flex flex-col justify-center items-center`}>
          <TouchableOpacity style={tw`w-2/3 relative aspect-square mb-4 flex flex-col-reverse`} onPressOut={() => { navigation.navigate("Auth") }}>
            <View style={tw`w-full h-full absolute`}>
              <Image style={tw`w-full h-full`} source={require("../assets/delivery_employee.png")} />
            </View>
            <View style={tw`bg-slate-800 bg-opacity-75 p-4`}>
              <Text style={tw`text-lg text-slate-50 font-bold`}>Kargo Görevlisi</Text>
              <Text style={tw`text-sm text-slate-50`}>Bir şirkette kurye olarak çalışıyorum</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={tw`w-2/3 relative aspect-square mb-4 flex flex-col-reverse`} onPressOut={() => { navigation.navigate("AuthBeneficiary") }}>
            <View style={tw`w-full h-full absolute`}>
              <Image style={tw`w-full h-full`} source={require("../assets/companion.png")} />
            </View>
            <View style={tw`bg-slate-800 bg-opacity-75 p-4`}>
              <Text style={tw`text-lg text-slate-50 font-bold`}>Bağışı alan veya refakatçi</Text>
              <Text style={tw`text-sm text-slate-50`}>Bağışı bizzat teslim alacağım.</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View >
  );
}
