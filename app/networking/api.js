import { Constants } from '../constants'
import axios from 'axios'
import AsyncStorage from '@react-native-community/async-storage'


export default class API {
  async getToken() {
    try {
      let data = await AsyncStorage.getItem('token')
      return data
    } catch (error) {
      console.log(error);
    }
  }
  async readData() {
    try {
      const userData = await AsyncStorage.getItem("userData")
      if (userData !== null) {
        return JSON.parse(userData).business_id
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  async getPricesAPI(selectedDays, business_id) {
    try {
      let token = this.getToken()
      let data = this.readData()
      let getPrice = axios.get(`${Constants.baseUrl}/getPrices?days=${selectedDays}&id=${business_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async getReservationApi(selectedDays, business_id) {
    try {
      let token = this.getToken()
      let data = this.readData()
      let getPrice = axios.get(`${Constants.baseUrl}/getReservations?days=${selectedDays}&id=${business_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async logInAuth(name, password) {
    try {
      let auth = axios.post(`${Constants.baseUrl}/receptionLogin`, { name: name, password: password })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return auth
    } catch (err) {
      console.log(err);
    }
  }
  async getCurrentSelectApi(currentDate) {
    try {
      let getPrice = axios.get(`${Constants.baseUrl}/getTodayPrices?date=${currentDate}&id=7`)
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async ReservationSearch(searchValues, types) {
    console.log(types)
    try {
      let getPrice = axios.post(`${Constants.baseUrl}/search/reservationSearch`, { searchValue: searchValues, type: types })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async RestaurantReservationSearch(searchValues, types) {
    console.log(types, searchValues, ")))))))))))))))))))))))))")
    try {
      let getPrice = axios.post(`${Constants.baseUrl}/search/reservationRestaurantSearch`, { searchValue: searchValues, type: types })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async searchApi(text) {
    try {
      let getPrice = axios.post(`${Constants.baseUrl}/search/searchLocations`, { searchValue: text })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async receptionVerifyApi(userName, pinCode, businessId) {
    try {
      let getPrice = axios.post(`${Constants.baseUrl}/reception/verify`, { userName: userName, pinCode: pinCode, businessId: businessId })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async receptionSignUpApi(password, businessId, userId) {
    try {
      let getPrice = axios.post(`${Constants.baseUrl}/reception/signUp`, { password: password, businessId: businessId, userId: userId })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async apiChangeReservationAccept(reservation_id, status) {
    try {
      let getPrice = axios.post(`${Constants.baseUrl}/customer/generate/qrcode`, { reservation_id: reservation_id, status: status })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async getReservationByCode(code, id) {
    try {
      let getPrice = axios.post(`${Constants.baseUrl}/reception/getReservationByCode`, { code: code, businessId: id })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async getTodayRestaurantReservation(id, date) {
    try {
      let getPrice = axios.post(`${Constants.baseUrl}/reception/getRestaurantReservation`, { id: id, date: date })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
  async generateQrcode(id, status) {
    try {
      let getPrice = axios.post(`${Constants.baseUrl}/customer/generate/qrcode`, { reservation_id: id, status: status, businessType: "beach" })
        .then(data => {
          return data
        })
        .catch(err => {
          return err.response
        })
      return getPrice
    } catch (err) {
      console.log(err);
    }
  }
}