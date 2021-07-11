import React, { Component, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { connect } from 'react-redux';
import Phone from '../../assets/img/phone.png';
import User from '../../assets/img/userSmall.png';
import Comment from '../../assets/img/comment.png';
import Close from '../../assets/img/close.png';
import AsyncStorage from '@react-native-community/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import ApiGraphQl from '../../networking/apiGraphQl';
import I18n from '../../constants/i18n';
import { useDispatch, useSelector } from "react-redux";
import DeviceInfo from 'react-native-device-info';
const PriceClass = (props) => {
  const apigraphql = new ApiGraphQl();
  const userInfo = useSelector(({ userReducer }) => userReducer);
  const [seatElement, setSeatElement] = useState([])
  const [businessId, setBusinessId] = useState("")
  const [modalVisible, setModalVisible] = useState(false);
  const [releaseModalVisible, setReleaseModalVisible] = useState(false);
  const [priceValue, setPriceValue] = useState([])
  const [seatPosition, setSeatPosition] = useState(["1st", "2nd", "3rd", "4th", "5th"])
  const [sunbedCount, setSunbedCount] = useState([])
  const [phoneValue, setPhoneValue] = useState("")
  const [nameValue, setNameValue] = useState("")
  const [commentValue, setCommentValue] = useState("")
  const [protocolStatus, setProtocolStatus] = useState(false)
  const [discountSelectStatus, setDiscountSelectStatus] = useState(false)
  const [discountStatus, setDiscountStatus] = useState("amount");
  const [selectId, setSelectId] = useState("")
  const [rentUmbrellaStats, setRentUmbrellaStatus] = useState(false)
  const [umbrellaCount, setUmbrellaCount] = useState([
    { id: 1, status: false },
    { id: 2, status: false },
    { id: 3, status: false },
    { id: 4, status: false },
  ])
  const [currentPercent, setCurrentPercent] = useState(0)
  const [amountValue, setAmountValue] = useState(0);
  const [selectedDays, setSelectedDays] = useState([]);
  const [individualDays, setIndividualDays] = useState([]);
  const [discountDatas, setDiscountDatas] = useState([
    { id: 1, name: '5%', status: false, value: '5' },
    { id: 2, name: '10%', status: false, value: '10' },
    { id: 3, name: '15%', status: false, value: '15' },
    { id: 4, name: '20%', status: false, value: '20' },
    { id: 5, name: '25%', status: false, value: '25' },
    { id: 6, name: '30%', status: false, value: '30' },
    { id: 7, name: '40%', status: false, value: '40' },
    { id: 8, name: '50%', status: false, value: '50' },
    { id: 9, name: '70%', status: false, value: '70' },
    { id: 10, name: '75%', status: false, value: '75' },
  ])
  const [releaseDatas, setReleaseDatas] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [currentExtraSunbed, setCurrentExtraSunbed] = useState(0)
  const [rentUmbrella, setRentUmbrella] = useState(0);
  const [tempTotalPrice, setTempTotalPrice] = useState(0);
  const [additionalSunbedPrice, setAdditionSunbedPrice] = useState(0);
  const [umbrellaPrice, setUmbrellaPrice] = useState(0);
  const [currency, setCurrency] = useState("")
  const [sunbedCountStatus, setSunbedCountStatus] = useState(false);
  const [releaseStatus, setReleaseStatus] = useState(false);
  const [visibleDiscount, setVisibleDiscount] = useState(false)
  const [activeActionStatus, setActiveActionStatus] = useState(false)
  const [reservationId, setReservationId] = useState("")
  const [reservationPrice, setReservationPrice] = useState("")
  const [reservationStatus, setReservaitonStatus] = useState("");
  const [reservationState, setReservationState] = useState("");
  const [reservationInformationStatus, setReservationInformationStatus] = useState("");
  const [zoneId, setZoneId] = useState("")
  const [releasedDay, setReleasedDay] = useState([]);
  const [userId, setUserId] = useState("");
  const [workingHour, setWorkingHour] = useState([]);
  const [endDayHour, setEndDayHour] = useState("");
  const [tabletStatus, setTabletStatus] = useState(false);
  useEffect(() => {
    const isTablet = DeviceInfo.isTablet();
    setTabletStatus(isTablet);
    getBusinessId()
    if (props.route) {
      if (props.route.params) {
        console.log(props.route.params, "***************!!!!!!!!!!!!!!")
        if (props.route.params.data) {
          setReleaseStatus(true)
          let data = props.route.params.data;
          console.log(data.total_price, "###############")
          setReleasedDay(data.released_days)
          setReservationId(data.id)
          setReservationState(data.reservation_status)
          setReservationInformationStatus(data.reservation_status)
          setReservationPrice(data.total_price)
          setPhoneValue(data.phone_number)
          setNameValue(data.name)
          setCommentValue(data.comment)
          if (data.rent_umbrella > 0) {
            if (umbrellaCount.length > 0) {
              let arr = [...umbrellaCount];
              arr.map(item => {
                if (item.id == data.rent_umbrella) {
                  item.status = true;
                }
              })
              setUmbrellaCount(arr)
            }
            // if()
          }
          if (Number(data.additional_sunbed) > 0) {
            getExtraSunbed(data.additional_sunbed)
          }
          if (data.selected_days) {
            let arr = [];
            let arr1 = [];
            data.selected_days.map((item, index) => {
              arr.push(item.day)
              let filterData = data.released_days.filter(ele => ele.release_day == item.day)
              if (filterData.length > 0) {
                arr1.push(
                  { id: index, status: true, value: item.day },
                )
              } else {
                arr1.push(
                  { id: index, status: false, value: item.day },
                )
              }
            })
            setIndividualDays(arr)
            setReleaseDatas(arr1)
          }
          if (data.seat_position) {
            console.log(data.price_values)
            let seatPositionArr = [];
            data.seat_position.map((item, index) => {
              seatPositionArr.push(item.seat_id)
            })
          }
          if (data.protocol_status) {
            setProtocolStatus(true)
            setVisibleDiscount(true)
          }
          if (data.price_values) {
            let price = 0;
            let days = null;
            let avgPrice = [];
            data.price_values.map((item, index) => {
              price = price + item.price_values;
            })
            data.seat_position.map((list, i) => {
              let filterResult = data.price_values.filter(ele => ele.seat_position == list.seat_id);
              if (filterResult.length > 0) {
                console.log(filterResult)
                let priceValue = 0;
                filterResult.map((list, index) => {
                  priceValue = priceValue + list.price_values;
                })
                avgPrice.push(Math.round((priceValue / filterResult.length) * 100) / 100)
              }
            })
            let arr = [];
            data.seat_position.map((item, index) => {
              arr.push({ id: item.seat_id, price: avgPrice[index] })
            })
            setSeatElement(arr)
            setTotalPrice(price)
            setTempTotalPrice(price)
          }
        }
      } else {
        setReleaseStatus(false)
        setUmbrellaCount([
          { id: 1, status: false },
          { id: 2, status: false },
          { id: 3, status: false },
          { id: 4, status: false },
        ])
        getBusinessId()
        individualDaysReadData()
        readData()
        priceReadData()
        selectedDaysReadData()
        gettingExtraSunbed()
        readReservationStatus()
      }
    }
    readCurrency()
    readZoneId()
    workingHourData()
  }, [props.route])
  useEffect(() => {
    console.log(individualDays, "================")
    if (seatElement.length > 0) {
      let price = 0;
      // seatElement.map((item) => {
      //   price = price + item.price;
      // })
      for (let i = 0; i < seatElement.length; i++) {
        price = price + seatElement[i].price;
      }
      price = price * individualDays.length
      setTotalPrice(Math.round(price * 100) / 100)
      setTempTotalPrice(Math.round(price * 100) / 100)
      console.log(price, seatElement, "___________________ppppppppppp")
    }
  }, [selectedDays, priceValue, props.route.params, seatElement])
  useEffect(() => {
    setTempTotalPrice(totalPrice - amountValue)
  }, [discountSelectStatus, activeActionStatus])
  console.log(businessId, userId, "KK^^^^^^^^^^^^^^^^^^^^^^^^^^^")
  const readData = async () => {
    try {
      const selectElement = await AsyncStorage.getItem('selectElement')
      if (selectElement !== null) {
        let selectElementData = JSON.parse(selectElement)
        if (selectElementData.length > 0) {
          let arr = [];
          let total = 0;
          selectElementData.map((item, index) => {
            arr.push({ id: item.id, size: item.size, zoneId: item.zoneId, price: item.price, type: item.type })
          })
          setSeatElement(arr)
        }
      } else {
        setSeatElement([])
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const readExtraUmbrella = async () => {
    try {
      const selectElement = await AsyncStorage.getItem('selectElement')
      if (selectElement !== null) {
        let selectElementData = JSON.parse(selectElement)
        if (selectElementData.length > 0) {
          let arr = [];
          let total = 0;
          selectElementData.map((item, index) => {
            arr.push({ id: item.id, size: item.size, zoneId: item.zoneId, price: item.price, type: item.type })
          })
          setSeatElement(arr)
        }
      } else {
        setSeatElement([])
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const getBusinessId = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData')
      if (userData !== null) {
        let userData = JSON.parse(userData)
        setBusinessId(userData.business_id);
        setUserId(userData.id);
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const readCurrency = async () => {
    try {
      const userData = await AsyncStorage.getItem('currency')
      if (userData !== null) {
        setCurrency(userData)
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const readZoneId = async () => {
    try {
      const userData = await AsyncStorage.getItem('zoneId')
      if (userData !== null) {
        setZoneId(Number(userData))
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const readReservationStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('reservationStatus')
      if (status !== null) {
        let data = JSON.parse(status)[0];
        setReservaitonStatus(data.type)
        setReservationId(data.reservation_id)
        setReservationState(data.reservation_status)
        console.log(JSON.parse(status), "^^^^^^^^^^^^^^^^^")
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const createReservation = (type) => (event) =>
    Alert.alert(
      `${I18n.t('Create_Reservation')}`,
      `${I18n.t('Are_you_sure')}`,
      [
        {
          text: `${I18n.t('No')}`,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: `${I18n.t('Yes')}`, onPress: () => createReservations(type) }
      ],
      { cancelable: false }
    );
  const checkingEndHour = (selectedDays, workingHour) => {
    let arr = [];
    if (selectedDays.length > 0) {
      selectedDays.map((item, index) => {
        let endDayDate = checkEndDayHour(workingHour, item);
        arr.push(endDayDate);
      })
    }
    return arr;
  }
  const checkEndDayHour = (workingHourData, day) => {
    let endDayDate = "";
    if (workingHourData) {
      if (day == "sunday") {
        endDayDate = workingHourData.sun_end;
      }
      if (day == "monday") {
        endDayDate = workingHourData.mon_end;
      }
      if (day == "tuesday") {
        endDayDate = workingHourData.tue_end;
      }
      if (day == "wednesday") {
        endDayDate = workingHourData.wed_end;
      }
      if (day == "thursday") {
        endDayDate = workingHourData.thu_end;
      }
      if (day == "friday") {
        endDayDate = workingHourData.fri_end;
      }
      if (day == "saturday") {
        endDayDate = workingHourData.sat_end;
      }
    }
    return endDayDate;
  }
  const createReservations = (type) => {
    let endHourArr = checkingEndHour(selectedDays, workingHour);
    let priceValuesArr = [];
    let endHourArrs = [];
    let extraSunbedCount = 0;
    let rentUmbrellaCount = 0;
    let rentUmArr = sunbedPrice(seatElement, priceValue, selectedDays, individualDays, "umbrellaRequired")
    let extraSbArr = sunbedPrice(seatElement, priceValue, selectedDays, individualDays, "addtionalSunbed");
    if (endHourArr.length > 0) {
      endHourArr.map((item, i) => {
        endHourArrs.push(`{
              id:${i}
              hour: "${item}"
            }`)
      })
    }
    if (individualDays.length > 0 && seatElement.length > 0) {
      seatElement.map((item, i) => {
        individualDays.map((list, j) => {
          priceValuesArr.push(`{
              id:"${i}_${j}"
              seat_position: "${item.id}"
              each_day: "${list}"
              price_values:${item.price}
            }`)
        })
      })
    }
    if (sunbedCount.length > 0) {
      sunbedCount.map((item, index) => {
        if (item.status) {
          extraSunbedCount = item.id
        }
      })
    }
    if (umbrellaCount.length > 0) {
      umbrellaCount.map((item, index) => {
        if (item.status) {
          rentUmbrellaCount = item.id
        }
      })
    }
    if (priceValuesArr.length > 0) {
      apigraphql.saveReservationApis(
        phoneValue,
        nameValue,
        commentValue,
        protocolStatus,
        individualDays,
        seatElement,
        extraSunbedCount,
        rentUmbrellaCount,
        currentPercent,
        amountValue,
        additionalSunbedPrice,
        umbrellaPrice,
        type,
        priceValuesArr,
        rentUmArr,
        extraSbArr,
        tempTotalPrice,
        zoneId,
        businessId,
        userId,
        endHourArrs
      )
        .then((result) => {
          if (result.data.CreateCustomReservation) {
            Alert.alert(
              "Create",
              "Success create",
              [
                { text: "OK", onPress: () => createReservationChangeRouter() }
              ],
              { cancelable: false }
            );
            // props.navigation.navigate("Home", { customerData: [], status: "changePosition", reservationDays: individualDays, })
          }
          console.log(result, "(((((((((((((((((((")
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  const createReservationChangeRouter = () => {
    props.navigation.navigate("Home", { customerData: [], status: true, reservationDays: individualDays })
  }
  const gettingExtraSunbed = () => {
    apigraphql.gettingExtraSunbeds(7)
      .then((result) => {
        console.log(result.data, "data")
        if (result.data.business_settings.length > 0) {
          let count = Number(result.data.business_settings[0].extra_sunbeds);
          let arr = [];
          for (let i = 0; i < count; i++) {
            arr.push({ id: i + 1, status: false })
          }
          setSunbedCount(arr)
          setSunbedCountStatus(true)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const getExtraSunbed = (activeCount) => {
    apigraphql.gettingExtraSunbeds(7)
      .then((result) => {
        console.log(result.data, "data")
        if (result.data.business_settings.length > 0) {
          let count = Number(result.data.business_settings[0].extra_sunbeds);
          let arr = [];
          for (let i = 0; i < count; i++) {
            if (i == activeCount - 1) {
              arr.push({ id: i + 1, status: true })
            } else {
              arr.push({ id: i + 1, status: false })
            }
          }
          setSunbedCount(arr)
          setSunbedCountStatus(true)
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const priceReadData = async () => {
    try {
      const priceData = await AsyncStorage.getItem('price')
      console.log(priceData, "----------------------------->@@@@@@@")
      if (priceData !== null) {
        let priceDatas = JSON.parse(priceData)
        setPriceValue(priceDatas)
      } else {
        setPriceValue([])
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const workingHourData = async () => {
    try {
      const hourData = await AsyncStorage.getItem('workingHour')
      if (hourData !== null) {
        let hourDatas = JSON.parse(hourData);
        setWorkingHour(hourDatas);
        // setPriceValue(hourData)
      } else {
        // setPriceValue([])
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const selectedDaysReadData = async () => {
    try {
      const priceData = await AsyncStorage.getItem('selectedDays')
      if (priceData !== null) {
        console.log(priceData, "------------------------->priceData Value")
        let priceDatas = JSON.parse(priceData)
        setSelectedDays(priceDatas)
      } else {
        setSelectedDays([])
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const individualDaysReadData = async () => {
    try {
      const priceData = await AsyncStorage.getItem('individualDays')
      if (priceData !== null) {
        let priceDatas = JSON.parse(priceData)
        setIndividualDays(priceDatas)
      } else {
        setIndividualDays([])
      }
    } catch (e) {
      // alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const activeAction = (type, id) => (event) => {
    setActiveActionStatus(!activeActionStatus)
    if (releaseStatus) {

    } else {
      if (type == "extra_sunbed") {
        let arr = [...sunbedCount];
        arr.map((item, index) => {
          if (item.id === id) {
            const price = getTotalPrice(seatElement, priceValue, selectedDays, item.id, "addtionalSunbed")
            if (item.status) {
              setTotalPrice(totalPrice - price)
              item.status = false;
              setCurrentExtraSunbed(0)
              setAdditionSunbedPrice(0)
            } else {
              item.status = true;
              setCurrentExtraSunbed(item.id)
              if (currentExtraSunbed == 0) {
                setTotalPrice(totalPrice + price)
                setAdditionSunbedPrice(price)
              } else {
                const price1 = getTotalPrice(seatElement, priceValue, selectedDays, currentExtraSunbed, "addtionalSunbed")
                setTotalPrice(totalPrice + price - price1)
              }
            }
          } else {
            item.status = false;
          }
        })
        setSunbedCount(arr)
      }
      if (type == "rent_umbrella") {
        let arr = [...umbrellaCount];
        arr.map((item, index) => {
          if (item.id === id) {
            const price = getTotalPrice(seatElement, priceValue, selectedDays, item.id, "umbrellaRequired");
            console.log(price, "_________________>price")
            if (item.status) {
              setTotalPrice(totalPrice - price)
              item.status = false;
              setUmbrellaPrice(0)
              setRentUmbrella(0)
            } else {
              setRentUmbrella(item.id)
              item.status = true;
              if (rentUmbrella == 0) {
                setTotalPrice(totalPrice + price)
                setUmbrellaPrice(price)
              } else {
                const price1 = getTotalPrice(seatElement, priceValue, selectedDays, rentUmbrella, "umbrellaRequired")
                setTotalPrice(totalPrice + price - price1)
              }
            }
          } else {
            item.status = false;
          }
        })
        setUmbrellaCount(arr)
      }
    }
  }
  const sunbedPrice = (seatElement, priceValue, selectedDays, individualDays, type) => {
    let zoneId = 0;
    let price = [];
    let priceValueArr = [];
    if (seatElement.length > 0) {
      zoneId = seatElement[0].zoneId;
      const filterPriceValue = priceValue.filter(ele => ele.zone_id == zoneId && ele.type == type);
      console.log(filterPriceValue, selectedDays, priceValue, "@@@@@@@@@@@@@@@@@@@@@@")
      if (filterPriceValue.length > 0) {
        selectedDays.map((item, index) => {
          if (item == "sunday") {
            price.push(filterPriceValue[0].price.sunday)
          }
          if (item == "monday") {
            price.push(filterPriceValue[0].price.monday)
          }
          if (item == "tuesday") {
            price.push(filterPriceValue[0].price.tuesday)
          }
          if (item == "wednesday") {
            price.push(filterPriceValue[0].price.wednesday)
          }
          if (item == "friday") {
            price.push(filterPriceValue[0].price.friday)
          }
          if (item == "saturday") {
            price.push(filterPriceValue[0].price.saturday)
          }
          if (item == "thursday") {
            price.push(filterPriceValue[0].price.thursday)
          }
        })
        individualDays.map((item, index) => {
          priceValueArr.push(`{ 
            id: ${index},
            day:"${item}",
            price:${price[index]} 
          }`)
        })
        console.log(priceValueArr, "##########################")
        return priceValueArr;
      }
    }
  }
  const getTotalPrice = (seatElement, priceValue, selectedDays, itemId, type) => {
    let zoneId = 0;
    let price = [];
    let resultPrice = 0;
    let totalPrice = 0;
    if (seatElement.length > 0) {
      zoneId = seatElement[0].zoneId;
      const filterPriceValue = priceValue.filter(ele => ele.zone_id == zoneId && ele.type == type);
      console.log(filterPriceValue, selectedDays, priceValue)
      if (filterPriceValue.length > 0) {
        selectedDays.map((item, index) => {
          if (item == "sunday") {
            price.push(filterPriceValue[0].price.sunday)
          }
          if (item == "monday") {
            price.push(filterPriceValue[0].price.monday)
          }
          if (item == "tuesday") {
            price.push(filterPriceValue[0].price.tuesday)
          }
          if (item == "wednesday") {
            price.push(filterPriceValue[0].price.wednesday)
          }
          if (item == "friday") {
            price.push(filterPriceValue[0].price.friday)
          }
          if (item == "saturday") {
            price.push(filterPriceValue[0].price.saturday)
          }
          if (item == "thursday") {
            price.push(filterPriceValue[0].price.thursday)
          }
        })
        console.log(price)
        price.map(list => {
          totalPrice = totalPrice + list;
        })
        resultPrice = totalPrice * itemId
      }
      return resultPrice;
    }
  }
  const deleteAction = (id) => (event) => {
    let arr = [...seatElement];
    const result = arr.filter(ele => ele.id !== id);
    const filterResult = arr.filter(ele => ele.id == id)
    setTotalPrice(totalPrice - (filterResult[0].price * selectedDays.length))
    setTempTotalPrice(totalPrice - (filterResult[0].price * selectedDays.length))
    setSeatElement(result)
    priceSaveData(result)
    if (result.length == 0) {
      props.navigation.navigate("Home", { elementData: [] })
    }
  }
  const priceSaveData = async (priceData) => {
    try {
      await AsyncStorage.setItem("price", JSON.stringify(priceData))
    } catch (e) {
      alert(`${I18n.t('Failed_storage')}`)
    }
  }
  const discountPercentActive = (id, value) => (event) => {
    let arr = [...discountDatas];
    arr.map((item, index) => {
      if (item.id == id) {
        if (item.status == true) {
          item.status = false
          setSelectId("")
          setCurrentPercent("")
        } else {
          item.status = true;
          setCurrentPercent(item.value)
          setSelectId(id)
        }
      } else {
        item.status = false;
      }
    })
    setDiscountDatas(arr)
  }
  const handleChangeValue = (text) => {
    if (text < 100) {
      setCurrentPercent(text)
      let arr = [...discountDatas];
      arr.map((item, index) => {
        if (item.id == selectId) {
          setCurrentPercent(text)
          item.status = false;
        } else {
          item.status = false;
        }
        if (item.value == text) {
          item.status = true;
        }
      })
      setDiscountDatas(arr)
    }
  }
  const doneAction = () => {
    setModalVisible(!modalVisible);
    setProtocolStatus(false)
    if (discountStatus == "amount") {
      if (currentPercent.length > 0) {
        setDiscountSelectStatus(true)
      } else {
        setDiscountSelectStatus(false)
      }
    }
    if (discountStatus == "percent") {
      if (amountValue > 0) {
        setDiscountSelectStatus(true)
      } else {
        setDiscountSelectStatus(false)
      }
    }
  }
  const selectProtocolButton = () => {
    setDiscountSelectStatus(false)
    setAmountValue(0)
    setCurrentPercent("")
    let arr = [...discountDatas];
    arr.map((item, index) => {
      item.status = false;
    })
    setDiscountDatas(arr)
    if (protocolStatus) {
      setProtocolStatus(false)
    } else {
      setProtocolStatus(true)
    }
  }
  const releaseActive = (id) => (event) => {
    let arr = [...releaseDatas];
    arr.map((item, index) => {
      if (item.id == id) {
        item.status = !item.status;
      }
    })
    setReleaseDatas(arr)
    // setReleaseSelectDay
  }
  const changePositionAction = () => {
    props.navigation.navigate("Home",
      {
        customerData: [],
        status: "changePosition",
        reservationId: reservationId,
        reservationDays: individualDays,
        reservationStatus: reservationInformationStatus,
      }
    )
  }
  const updateAction = () => {
    let priceValuesArr = [];
    let extraSunbedCount = 0;
    let rentUmbrellaCount = 0;
    let rentUmArr = sunbedPrice(seatElement, priceValue, selectedDays, individualDays, "umbrellaRequired")
    let extraSbArr = sunbedPrice(seatElement, priceValue, selectedDays, individualDays, "addtionalSunbed")
    if (individualDays.length > 0 && seatElement.length > 0) {
      seatElement.map((item, i) => {
        individualDays.map((list, j) => {
          priceValuesArr.push(`{
              id:"${i}_${j}"
              seat_position: "${item.id}"
              each_day: "${list}"
              price_values:${item.price}
            }`)
        })
      })
    }
    if (sunbedCount.length > 0) {
      sunbedCount.map((item, index) => {
        if (item.status) {
          extraSunbedCount = item.id
        }
      })
    }
    if (umbrellaCount.length > 0) {
      umbrellaCount.map((item, index) => {
        if (item.status) {
          rentUmbrellaCount = item.id
        }
      })
    }
    apigraphql.updateReservationApi(
      rentUmArr,
      extraSbArr,
      extraSunbedCount,
      rentUmbrellaCount,
      priceValuesArr,
      reservationId,
      reservationState,
      seatElement,
      tempTotalPrice
    )
      .then((result) => {
        if (result.data.UpdateReservation) {
          console.log(result.data.UpdateReservation)
          Alert.alert(
            alert(`${I18n.t('Update')}`),
            alert(`${I18n.t('Success_update')}`),
            [
              { text: "OK", onPress: () => changeUpdated() }
            ],
            { cancelable: false }
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const changeUpdated = (event) => {
    props.navigation.navigate("Home", { customerData: [], status: true })
  }
  const releaseAction = () => {
    Alert.alert(
      `${I18n.t('Release')}`,
      `${I18n.t('Are_you_sure')}`,
      [
        {
          text: `${I18n.t('No')}`,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: `${I18n.t('Yes')}`, onPress: () => {
            releaseDay(reservationId, "released", individualDays)
          }
        }
      ],
      { cancelable: false }
    );
  }
  const releaseDay = (id, status, selectedDays) => {
    let arr = [];
    for (let i = 0; i < selectedDays.length; i++) {
      arr.push(`{
        id: ${i}
        release_day:"${selectedDays[i].day}"
      }`)
    }
    apigraphql.apiUpdateReleaseDay(id, status, arr)
      .then((result) => {
        console.log(result)
        if (result.data.UpdateRelease) {
          Alert.alert(
            `${I18n.t('Release')}`,
            `${I18n.t('Success_Release')}`,
            [
              { text: "OK", onPress: () => releaseChangeRouter() }
            ],
            { cancelable: false }
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const releaseChangeRouter = () => {
    props.navigation.navigate("Home", { status: true })
  }
  const partialReleaseAction = () => {
    console.log("partialreleae", releaseDatas, reservationId, reservationState, individualDays)
    const data = releaseDatas.filter(ele => ele.status == false)
    if (data.length > 0) {
      let arr = [];
      releaseDatas.map((item, index) => {
        if (item.status) {
          arr.push({ id: index, day: item.value })
        }
      })
      releaseDay(reservationId, reservationState, arr)
    } else {
      let arr = [];
      releaseDatas.map((item, index) => {
        if (item.status) {
          arr.push({ id: index, day: item.value })
        }
      })
      releaseDay(reservationId, "released", arr)
    }
    setReleaseModalVisible(!releaseModalVisible);
  }
  const changeActionAlert = (id, status) => (event) => {
    Alert.alert(
      `${status == "paid_online" ? "Pay" : "Occupied"}`,
      `${I18n.t('Are_you_sure')}`,
      [
        {
          text: `${I18n.t('No')}`,
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: `${I18n.t('Yes')}`, onPress: () => {
            changeAction(id, status)
          }
        }
      ],
      { cancelable: false }
    );
  }
  const changeAction = (id, status) => {
    apigraphql.apiChangeStatusReservation(id, status)
      .then((result) => {
        if (result.data) {
          Alert.alert(
            `${status == "paid_online" ? "Pay" : "Occupied"}`,
            `${I18n.t(Success_change_status)}`,
            [
              { text: "OK", onPress: () => createReservationChangeRouter() }
            ],
            { cancelable: false }
          );
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
  console.log(totalPrice, "------------------------->")
  return (
    <React.Fragment>
      {individualDays.length > 0 && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, alignItems: 'center' }}
        >
          <View style={[styles.layout, tabletStatus && { paddingTop: 200 }]}>
            <View style={styles.price_layout}>
              <View style={styles.sub_price_layout}>
                <View>

                  <View style={styles.input_item_view}>
                    <View style={styles.wrapper_img}>
                      <Image source={Phone} style={styles.text_img_style} />
                    </View>
                    <TextInput
                      disableFullscreenUI={true}
                      keyboardType={"phone-pad"}
                      style={styles.text_input}
                      placeholder={I18n.t('Phone')}
                      autoCorrect={false}
                      placeholderTextColor="#000"
                      onChangeText={(text) => setPhoneValue(text)}
                      value={phoneValue}
                    />
                  </View>
                  <View style={styles.input_item_view}>
                    <View style={styles.wrapper_img}>
                      <Image source={User} style={styles.text_img_style} />
                    </View>
                    <TextInput
                      keyboardType={"web-search"}
                      disableFullscreenUI={true}
                      style={styles.text_input}
                      placeholder={I18n.t('Name')}
                      placeholderTextColor="#000"
                      onChangeText={(text) => setNameValue(text)}
                      value={nameValue}
                    />
                  </View>
                  <View style={styles.input_item_view}>
                    <View style={styles.wrapper_img}>
                      <Image source={Comment} style={styles.text_img_style} />
                    </View>
                    <TextInput
                      keyboardType={"web-search"}
                      style={styles.text_input}
                      placeholder={I18n.t('Comment')}
                      placeholderTextColor="#000"
                      onChangeText={(text) => setCommentValue(text)}
                      value={commentValue}
                    />
                  </View>
                  {(!releaseStatus && reservationStatus == "create") && (
                    <View style={styles.price_layout}>
                      <TouchableOpacity style={[styles.button_style, protocolStatus && { backgroundColor: '#CC8C35' }]}
                        onPress={selectProtocolButton}
                      >
                        <Text style={[styles.button_style_font, protocolStatus && { color: '#fff' }]}>Protocol</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.button_style, { marginLeft: 13 }, discountSelectStatus && { backgroundColor: '#CC8C35' }]}>
                        <Text style={[styles.button_style_font, discountSelectStatus && { color: '#fff' }]}
                          onPress={() => {
                            setModalVisible(true);
                          }}
                        >{I18n.t('Discount')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  {(releaseStatus || reservationStatus == "update") && (
                    <View style={[styles.seats_right_layout, { marginTop: 10 }]}>
                      <View >

                      </View>
                      <TouchableOpacity style={styles.calendar_button}
                        onPress={() => {
                          setReleaseModalVisible(!releaseModalVisible);
                        }}
                      >
                        <Text style={styles.calendar_button_font}>{I18n.t('Release_days')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.sub_price_layout}>
                <View>
                  <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 }}>
                    <View>
                      <Text style={[styles.add_reservation_font, { marginBottom: 10 }]}>{I18n.t('Seats')}({seatElement.length})</Text>
                    </View>
                    <View>
                      <Text style={[styles.add_reservation_font, { marginBottom: 10, marginRight: 90 }]} > {I18n.t('Average_price')}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.close_button_style}
                    onPress={() => {
                      if (releaseStatus) {
                        if (reservationStatus == "update") {
                          props.navigation.navigate("Home", { status: "update" })
                        } else {
                          // props.navigation.navigate("Home", { status: true })
                          props.navigation.navigate("Home", { status: true, reservationDays: individualDays })
                        }
                      } else {
                        if (reservationStatus == "update") {
                          props.navigation.navigate("Home", { status: "update" })
                        } else {
                          props.navigation.navigate("Home", { elementData: seatElement, status: false })
                        }
                      }
                    }}
                  >
                    <Image source={Close} style={styles.close_img_style} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={[styles.scroll_style, { height: 10 }]}>
                  {seatElement.length > 0 && (
                    seatElement.map((item, index) => {
                      let seat = item.id.split('_')[0];
                      let position = seatPosition[Number(item.id.split('_')[1])]
                      return (
                        <View style={styles.seats_right_layout} key={index}>
                          <View style={{ paddingTop: 10 }}>
                            <Text>{item.size == 1 ? `#${seat} ` : `#${seat}, (${position})`}</Text>
                          </View>
                          <View style={{ display: 'flex', flexDirection: 'row' }}>
                            <View style={{ paddingTop: 10, paddingRight: 70 }}>
                              <Text>{item.price} {currency}</Text>
                            </View>
                            <TouchableOpacity
                              style={{ paddingTop: 10 }}
                              onPress={deleteAction(item.id)}
                            >
                              <Text>{I18n.t('Delete')}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )
                    })
                  )}
                </ScrollView>
                <View style={[styles.seats_right_layout, { justifyContent: 'flex-start' }, { marginTop: 10 }]}>
                  <View >
                    <Text style={{ fontWeight: 'bold' }}>{I18n.t('Extra_Sunbeds')}</Text>
                  </View>
                  {sunbedCount.map((item, index) => {
                    return (
                      <React.Fragment key={index} >
                        {(releaseStatus && !item.status) || (
                          <View style={{ paddingHorizontal: 5 }}>
                            <TouchableOpacity style={[styles.extra_button, item.status && { backgroundColor: '#CC8C35' }]} onPress={activeAction("extra_sunbed", item.id)}>
                              <Text style={[styles.extra_text, item.status ? { color: '#fff' } : { color: '#000' }]}>{item.id}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </React.Fragment>
                    )
                  })}
                </View>
                <View style={[styles.seats_right_layout, { justifyContent: 'flex-start' }, { marginTop: 5 }]}>
                  <View>
                    <Text style={{ fontWeight: 'bold' }}>{I18n.t('Rent_Umbrella')}</Text>
                  </View>
                  {umbrellaCount.map((item, index) => {
                    return (
                      <React.Fragment key={index}>
                        {(releaseStatus && !item.status) || (
                          <View style={{ paddingHorizontal: 5 }}>
                            <TouchableOpacity style={[styles.extra_button, item.status && { backgroundColor: '#CC8C35' }]} onPress={activeAction("rent_umbrella", item.id)}>
                              <Text style={[styles.extra_text, item.status ? { color: '#fff' } : { color: '#000' }]}>{item.id}</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </React.Fragment>
                    )
                  })}
                </View>
              </View>
            </View>
            <View style={styles.price_bottom_align}>
              <View style={styles.price_bottom_style}>
                <View>
                  <Text style={{ fontWeight: 'bold' }}>{I18n.t('Status')}</Text>
                  <Text style={[
                    reservationState == "reserved_paid" && { color: 'red' },
                    reservationState == "paid_online" && { color: 'red' },
                    reservationState == "reserved_not_paid" && { color: 'purple' },
                    reservationState == "occupied" && { color: 'black' },
                    reservationState == "pending" && { color: 'yellow' },
                  ]}>
                    {reservationState == "reserved_paid" ? 'Reserved Paid' :
                      reservationState == "paid_online" ? 'Paid Online' :
                        reservationState == "reserved_not_paid" ? 'Reserved not paid' :
                          reservationState == "occupied" ? 'Occupied' :
                            reservationState == "pending" ? 'Pending' : ""
                    }
                  </Text>
                  <Text style={styles.price_total}>{I18n.t('Total_Price')}</Text>
                  <Text style={{ fontWeight: 'bold', color: '#000' }}>
                    {reservationPrice == 0 ? protocolStatus ? 0 : discountStatus == "amount" ?
                      totalPrice - totalPrice * currentPercent / 100 :
                      Math.floor((totalPrice - amountValue) * 100) / 100 : reservationPrice} {currency}</Text>
                  <Text style={{ color: '#FF0101', paddingBottom: 10, fontSize: 12 }}> {protocolStatus ? 'Protocol' : discountSelectStatus ? discountStatus == 'amount' ? `Discount: ${currentPercent}%` : `Discount: -${amountValue}` : ""}</Text>
                </View>
                <View>
                  {releaseStatus == true ? (
                    <TouchableOpacity
                      style={[styles.mark_booked_button, releaseStatus && { backgroundColor: '#CC8C35' }]}
                      onPress={changePositionAction}
                    >
                      <Text style={styles.mark_booked_button_text}>
                        {I18n.t('Change_Position')}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <React.Fragment>
                      {reservationStatus == "update" ? (
                        <TouchableOpacity
                          style={[styles.mark_booked_button, reservationStatus == "update" && { backgroundColor: '#CC8C35' }]}
                          onPress={updateAction}
                        >
                          <Text style={styles.mark_booked_button_text}>
                            {I18n.t('Update')}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity style={styles.mark_booked_button} onPress={createReservation("reserved_not_paid")}>
                          <Text style={styles.mark_booked_button_text}>
                            {I18n.t('reserve_not_paid')}
                          </Text>
                        </TouchableOpacity>
                      )}

                    </React.Fragment>
                  )}
                  {releaseStatus == true ? (
                    <React.Fragment>
                      <TouchableOpacity
                        style={[styles.mark_booked_button, releaseStatus && { backgroundColor: '#CC8C35' }]}
                        onPress={releaseAction}
                      >
                        <Text style={styles.mark_booked_button_text}>
                          {I18n.t('Release')}
                        </Text>
                      </TouchableOpacity>
                      {reservationState == "reserved_not_paid" && (
                        <React.Fragment>
                          <TouchableOpacity
                            style={[styles.mark_booked_button, releaseStatus && { backgroundColor: '#CC8C35' }]}
                            onPress={changeActionAlert(reservationId, "paid_online")}
                          >
                            <Text style={styles.mark_booked_button_text}>
                              {I18n.t('Pay')}
                            </Text>
                          </TouchableOpacity>
                        </React.Fragment>
                      )}
                      {(reservationState == "reserved_not_paid" || reservationState == "paid_online" || reservationState == "reserved_paid") && (
                        <React.Fragment>
                          <TouchableOpacity
                            style={[styles.mark_booked_button, releaseStatus && { backgroundColor: '#CC8C35' }]}
                            onPress={changeActionAlert(reservationId, "occupied")}
                          >
                            <Text style={styles.mark_booked_button_text}>
                              {I18n.t('Confirm_Arrival')}
                            </Text>
                          </TouchableOpacity>
                        </React.Fragment>
                      )}
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      {reservationStatus == "update" ? (
                        <></>
                      ) : (
                        <TouchableOpacity style={styles.mark_booked_button_paid} onPress={createReservation("reserved_paid")}>
                          <Text style={styles.mark_booked_button_text}>
                            {I18n.t('reserved_paid')}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </React.Fragment>
                  )}
                  {!releaseStatus && (
                    <React.Fragment>
                      {reservationStatus == "update" ? (
                        <></>
                      ) : (
                        <TouchableOpacity style={styles.mark_occupied_button} onPress={createReservation("occupied")}>
                          <Text style={styles.mark_booked_button_text}>
                            {I18n.t('Mark_occupied')}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </React.Fragment>
                  )}
                </View>
              </View>
              {releaseStatus ? (
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{I18n.t('Days_of_reservation')}({individualDays.length}): </Text>
                  {releaseDatas.length > 0 && (
                    releaseDatas.map((item, index) => {
                      return (
                        <React.Fragment key={index} >
                          {!item.status && (
                            <Text style={{ fontSize: 12 }}>{item.value.split('-')[2]}.{item.value.split('-')[1]}, </Text>
                          )}
                        </React.Fragment>
                      )
                    })
                  )}
                </View>
              ) : (
                <View style={{ display: 'flex', flexDirection: 'row' }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{I18n.t('Days_selected')}({individualDays.length}): </Text>
                  {individualDays.length > 0 && (
                    individualDays.map((item, index) => {
                      return (
                        <Text key={index} style={{ fontSize: 12 }}>{item.split('-')[2]}.{item.split('-')[1]}, </Text>
                      )
                    })
                  )}
                </View>
              )}
            </View>
            <View style={styles.centeredView}>
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                  Alert.alert("Modal has been closed.");
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <TouchableOpacity style={styles.close_button_style}
                      onPress={() => {
                        setModalVisible(!modalVisible);
                      }}
                    >
                      <Image source={Close} style={styles.close_img_style} />
                    </TouchableOpacity>
                    <View>
                      <Text style={styles.modalText_Title}>{I18n.t('Select_discount_percentage')}</Text>
                    </View>
                    <View style={styles.radioButton_style}>
                      <TouchableOpacity style={styles.styles_radio_button} onPress={() => {
                        setDiscountStatus("amount")
                        setAmountValue(0)
                      }}>
                        <View style={[styles.radio_button_border, discountStatus == "amount" && { borderColor: '#CC8C35' }]}>
                          {discountStatus == "amount" && (
                            <View style={styles.radio_button}>
                            </View>
                          )}
                        </View>
                        <Text style={styles.radioButton_text}>{I18n.t('By_percent')}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.styles_radio_button} onPress={() => {
                        setDiscountStatus("percent")
                        setCurrentPercent("")
                      }}>
                        <View style={[styles.radio_button_border, discountStatus == "percent" && { borderColor: '#CC8C35' }]}>
                          {discountStatus == "percent" && (
                            <View style={styles.radio_button}>
                            </View>
                          )}
                        </View>
                        <Text style={styles.radioButton_text}>{I18n.t('By_amount')}</Text>
                      </TouchableOpacity>
                    </View>
                    {discountStatus == "percent" && (
                      <TextInput
                        keyboardType={"phone-pad"}
                        disableFullscreenUI={true}
                        style={styles.modal_text_input}
                        autoFocus={true}
                        value={Number(amountValue)}
                        onChangeText={text => {
                          let digit = text.replace(/[^0-9]/g, '');
                          setAmountValue(Number(digit))
                          if (Number(digit) < Number(totalPrice)) {
                          }
                        }}
                      />
                    )}
                    {discountStatus == "amount" && (
                      <React.Fragment>
                        <View>
                          <TextInput
                            keyboardType={"phone-pad"}
                            disableFullscreenUI={true}
                            style={styles.modal_text_input}
                            onChangeText={text => handleChangeValue(text.replace(/[^0-9]/g, ''))}
                            value={currentPercent}
                          />
                        </View>
                        <View style={[styles.discount_layout, { marginTop: 10 }]}>
                          {discountDatas.map((item, index) => {
                            return (
                              <TouchableOpacity
                                style={[styles.discount_button, item.status && { backgroundColor: '#CC8C35' }]}
                                key={index}
                                onPress={discountPercentActive(item.id, item.value)}
                              >
                                <Text style={[styles.discount_button_text, item.status && { color: '#fff' }]}>{item.name}</Text>
                              </TouchableOpacity>
                            )
                          })}
                        </View>
                      </React.Fragment>
                    )}
                    <View style={styles.border_bottom}></View>
                    {(discountStatus == "percent" && (Number(amountValue) > Number(totalPrice))) && (
                      <Text style={{ color: '#FF0101' }}>{I18n.t('discount_alert')}</Text>
                    )}
                    {(discountStatus == "percent" && (Number(amountValue) > Number(totalPrice))) ? (
                      <TouchableOpacity
                        style={styles.discount_modal_done}
                      >
                        <Text style={[styles.textStyle, { color: '#D9D9D9' }]}>{I18n.t('Done')}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.discount_modal_done}
                        onPress={doneAction}
                      >
                        <Text style={styles.textStyle}>{I18n.t('Done')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Modal>
              <Modal
                animationType="slide"
                transparent={true}
                visible={releaseModalVisible}
                onRequestClose={() => {
                  Alert.alert("Modal has been closed.");
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <TouchableOpacity style={styles.close_button_style}
                      onPress={() => {
                        setReleaseModalVisible(!releaseModalVisible);
                      }}
                    >
                      <Image source={Close} />
                    </TouchableOpacity>
                    <View>
                      <Text style={styles.modalText_Title}>{I18n.t('Reservation_days')}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 10, fontWeight: '300', paddingTop: 10 }}>
                        {I18n.t('release_detail')}
                      </Text>
                    </View>
                    <View style={[styles.discount_layout, { marginTop: 10 }]}>
                      {releaseDatas.length > 0 && releaseDatas.map((item, index) => {
                        return (
                          <TouchableOpacity
                            style={[styles.discount_button, item.status && { backgroundColor: '#CC8C35' }]}
                            key={index}
                            onPress={releaseActive(item.id, item.value)}
                          >
                            <Text style={[styles.discount_button_text, item.status && { color: '#fff' }]}>{item.value.split('-')[2]}.{item.value.split('-')[1]}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                    <View style={styles.border_bottom}></View>
                    <TouchableOpacity
                      style={styles.discount_modal_done}
                      onPress={partialReleaseAction}
                    >
                      <Text style={styles.textStyle}>{I18n.t('Release')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          </View >
        </KeyboardAvoidingView>
      )
      }
    </React.Fragment>
  )
}
export const Price = connect()(PriceClass);
const styles = StyleSheet.create({
  layout: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
    paddingLeft: 15,
    paddingRight: 35,
  },
  price_layout: {
    display: 'flex',
    flexDirection: 'row'
  },
  sub_price_layout: {
    minWidth: '48%',
  },
  add_reservation_font: {
    paddingTop: 10,
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold'
  },
  text_input: {
    borderColor: '#F3F3F3',
    borderBottomWidth: 1,
    paddingBottom: 3,
    paddingTop: 0,
    paddingLeft: 40
  },
  input_item_view: {
    position: 'relative',
    marginTop: 10
  },
  wrapper_img: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#F3F3F3',
    borderRadius: 5
  },
  text_img_style: {
    width: 17,
    height: 17,
    margin: 5
  },
  button_style: {
    width: 90,
    height: 26,
    backgroundColor: '#fff',
    borderRadius: 2,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#CC8C35'
  },
  button_style_font: {
    paddingTop: 2,
    textAlign: 'center',
    color: '#000',
  },
  seats_right_layout: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10
  },
  average_font: {
    fontSize: 10,
    paddingTop: 4
  },
  price_bottom_style: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18
  },
  price_bottom_align: {
    backgroundColor: '#F1F1F1',
    marginTop: 5,
    padding: 10
  },
  price_total: {
    fontSize: 10,
    fontWeight: '300',
    paddingTop: 8
  },
  mark_booked_button: {
    backgroundColor: '#B352FF',
    borderRadius: 2,
    marginTop: 5
  },
  mark_booked_button_paid: {
    backgroundColor: '#FF0000',
    borderRadius: 2,
    marginTop: 5
  },
  mark_occupied_button: {
    backgroundColor: '#000000',
    borderRadius: 2,
    marginTop: 5
  },
  mark_booked_button_text: {
    fontSize: 11,
    fontWeight: '500',
    paddingHorizontal: 17,
    paddingVertical: 5,
    color: '#fff',
    textAlign: 'center'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    position: 'relative',
    padding: 15,
    borderRadius: 6,
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 284,
    // height: 250
  },
  modalText_Title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left'
  },
  modal_text_input: {
    height: 26,
    width: 244,
    backgroundColor: '#E9E9E9',
    borderRadius: 2,
    marginTop: 17,
    marginBottom: 16,
    padding: 0,
    paddingLeft: 10
  },
  discount_layout: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  discount_button: {
    width: 44,
    height: 24,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#D9D9D9',
    margin: 3
  },
  discount_button_text: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    paddingTop: 2
  },
  border_bottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECECEC',
    width: '95%',
    paddingTop: 20,
  },
  textStyle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CC8C35'
  },
  discount_modal_done: {
    marginTop: 11
  },
  radioButton_style: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: 244,
    marginTop: 10
  },
  styles_radio_button: {
    display: 'flex',
    flexDirection: 'row'
  },
  radio_button_border: {
    width: 12,
    height: 12,
    borderColor: '#828282',
    borderWidth: 1,
    borderRadius: 12,
    margin: 4
  },
  radio_button: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: '#CC8C35',
    marginTop: 1.5,
    marginLeft: 1.4
  },
  radioButton_text: {
    fontSize: 12,
    fontWeight: '500',
    margin: 1
  },
  close_button_style: {
    position: 'absolute',
    right: 20,
    top: 8
  },
  close_img_style: {
    width: 12,
    height: 12,
    margin: 10
  },
  scroll_style: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  },
  extra_button: {
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#D9D9D9'
  },
  extra_text: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  calendar_button: {
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 2
  },
  calendar_button_font: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 15,
  }
})