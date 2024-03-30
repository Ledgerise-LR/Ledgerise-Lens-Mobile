import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import React from 'react';
import axios from "axios";
import { URL, PORT } from '../serverConfig';

export default function Collections({ navigation }) {

  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (URL) {
      axios.get(`${URL}:${PORT}/auth/authenticate-verifier`)
        .then((res) => {
          if (res.data.success && res.data.company) navigation.navigate("Collections");
          if (!res.data.success && res.data.err) return { success: false, err: res.data.err }
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }, [URL, PORT])


  const handleLoginClick = () => {
    axios.post(`${URL}:${PORT}/auth/login-beneficiary`,
      {
        national_id_number: nationalId,
        password: password
      }
    )
      .then((res: { success: string, company: any }) => {
        if (res.data.beneficiary && res.data.beneficiary) {
          navigation.navigate("Needs", {
            _id: res.data.beneficiary._id,
          })
        } else {
          console.log(res.data);
        }
      })
  }

  return (
    <ScrollView style={tw`w-full h-full px-10 py-6`}>
      <View style={tw`w-full h-full`}>
        <View style={tw`w-full mb-8`}>
          <View style={tw`w-1/4 aspect-square mb-4 relative`}>
            <Image style={tw`w-full h-full absolute`} source={require("../assets/logo.png")} />
          </View>
          <Text style={tw`text-4xl font-bold mb-4`}>Hoş geldiniz değerli üyemiz</Text>
          <Text>Bağışı alan kişi olarak giriş yapın ve bağışın size ulaştığını doğrulayın.</Text>
        </View>
        <View style={tw`p-4 bg-slate-100 rounded-lg border-slate-400 border`}>
          <TextInput
            style={tw`px-2 py-4 bg-slate-200 rounded-lg mb-4`}
            placeholder='T.C. kimlik numaranız'
            onChangeText={(text) => {
              setNationalId(text);
            }}
          />
          <TextInput
            style={tw`px-2 py-4 bg-slate-200 rounded-lg`}
            placeholder='Şifreniz'
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity style={tw`w-3/5 h-14 bg-blue-900 relative rounded-lg ml-auto mt-4`} onPressOut={() => { handleLoginClick() }}>
          <View style={tw`flex flex-row h-full w-full bg-blue-900 relative items-center rounded-lg`}>
            <Text style={tw`ml-4 text-slate-50 font-bold`}>Giriş yap</Text>
            <View style={tw`right-0 absolute h-full aspect-square rounded-lg flex justify-center items-center flex-row bg-blue-700`}>
              <Text style={tw`text-slate-50`}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
