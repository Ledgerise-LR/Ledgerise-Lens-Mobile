
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

export default class LocalStorage {

  public async _getData() {
    try {
      const value = await AsyncStorage.getItem("authUser");
      if (value != null) {
        return JSON.parse(value);
      } else if (value == null || value == undefined) return { success: false, err: "auth_not_found" };
    } catch (err) {
      return { success: false, err: "auth_failed" };
    }
  }

  public async _storeData(_id: string, code: string) {
    try {
      const authUser = {
        _id,
        code
      };

      await AsyncStorage.setItem("authUser", JSON.stringify(authUser));
      return { success: true, err: null, authUser };

    } catch (err) {
      return { success: false, err: "store_failed" };
    }
  }

  public async _authenticateUser() {
    this._getData()
      .then((res: any) => {
        if (!res.success && res.err) {
          console.log({ success: false, err: "auth_failed" })
          return { success: false, err: "auth_failed" }
        };
        if (res._id && res.code) {
          axios.post(`http://${process.env.SERVER_URL}/auth/authenticate-verifier`, {
            _id: res._id,
            code: res.code
          }, (authRes: { success: any; err: string; company: any; }) => {
            if (!authRes.success && authRes.err == "auth_failed") return { success: false, err: "auth_failed" };
            if (authRes.company) {
              return { success: true, company: authRes.company };
            }
          });
        }
      })
  }

  public async _loginUser(code: string, password: string) {
    axios.post(`http/auth/login-verifier`, {
      code: code,
      password: password
    }, (res: { success: boolean, err: string, company: any }) => {
      if (!res.success && res.err == "verify_error") return { success: false, err: "verify_error" };
      if (res.company) {
        return { success: true, company: res.company };
      }
    }
    )
  }

}