import { ApolloClient, from, gql, HttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-community/async-storage';
import { Constants } from '../constants';
const link = new HttpLink({
  uri: `${Constants.graphQL}`,
});
const authLink = setContext(async (_, { headers }) => {
  // let data = await AsyncStorage.getItem('user');
  // let data = "ok"
  // let token = JSON.parse(data);
  return {
    headers: {
      ...headers,
      'x-token': '',
    },
  };
});
const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}
const getBusinessId = async () => {
  try {
    let data = await AsyncStorage.getItem('language')
    return data
  } catch (error) {
    console.log(error);
  }
}
const client = new ApolloClient({
  link: authLink.concat(link),
  cache: new InMemoryCache(),
  defaultOptions
});
export default class API {
  getElementByLocation(businessId) {
    try {
      let counts = client.query({
        query: gql`
            query business_element {
            business_element(where: {
              business_id:${businessId}
            }) {
              id
            position
            element_id
            business_id
            rotate_angle
            table_number
            element{
              type
              id
              width
              height
              structure
            }
            zone{
              id
              name
              config
            }
            }
        }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  gettingExtraSunbeds(businessId) {
    try {
      let counts = client.query({
        query: gql`
          query business_settings {
          business_settings(where: {
            business_id:${businessId}
          }) {
            id
            extra_sunbeds
          }
      }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  getReservation() {
    try {
      let counts = client.query({
        query: gql`
         query reservation_beach {
          reservation_beach(where: {
          
          }) {
            id
            protocol_status
            discount_amount
            reservation_status
          seat_position
          }
      }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  saveReservationApi(phoneValue, nameValue, commentValue, protocolStatus, individualDays, seatElement, sunbedCount, umbrellaCount, currentPercent, amountValue, additionalSunbedPrice, umbrellaPrice, type, businessId) {
    try {
      console.log(additionalSunbedPrice, umbrellaPrice, "*******************")
      let seatPositionArr = [];
      let priceValueArr = [];
      let extraSunbedCount = 0;
      let rentUmbrellaCount = 0;
      let poneNumber = phoneValue;
      poneNumber = "+40" + phoneValue;
      let exPirce = 0;
      let ruPrice = 0;
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
      seatElement.map((item, index) => {
        seatPositionArr.push(item.id)
        priceValueArr.push(`{ ${item.id}: ${item.price} }`)
      })
      exPirce = additionalSunbedPrice / extraSunbedCount;
      ruPrice = umbrellaPrice / rentUmbrellaCount;
      priceValueArr.push(`{Ex:${additionalSunbedPrice == 0 ? 0 : exPirce}}`)
      priceValueArr.push(`{Ru:${umbrellaPrice == 0 ? 0 : ruPrice}}`)
      let counts = client.query({
        query: gql`
           mutation reservation_beachCreate{
            reservation_beachCreate(
              reservation_beach:{
              element_count:${seatElement.length}
              seat_position:"${seatPositionArr}"
              selected_days:"${individualDays}"
              additional_sunbed:${extraSunbedCount}
              protocol_status:${protocolStatus}
              phone_number:"${poneNumber}"
              comment:"${commentValue}"
              name:"${nameValue}"
              paid_online:false
              reservation_status:"${type}"
              price_values:"${priceValueArr}"
              discount_amount:${amountValue ? Number(amountValue) : 0}
              business_id:${businessId},
              rent_umbrella:${rentUmbrellaCount}
              coupon_number:${0}
              }
            ){    
                id
                element_count
                seat_position
                additional_sunbed
                protocol_status
                phone_number
                comment
                selected_days
                qr_code
                paid_online
                reservation_status
                price_values
                coupon_number
                discount_amount
                completed
                released_days
                changed_position
                business_id
                time_zone
                changed_reservation
                created_at
                updated_at
                accepted_by
                rejected_by
                canceled_by
            }
          }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  getInformationAPI(businessId) {
    try {
      let counts = client.query({
        query: gql`
        query business_settings {
            business_settings(where: {
              business_id:${businessId}
            }) {
              id
            extra_sunbeds
            umbrella_requrired
            business{
              activity_period{
                start
                end
              }
              couponList{
                id
                coupon
                value
              }
            }
          }
        }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  getAllReservationAPI(ids, businessId) {
    try {
      let arr = [50];
      if (ids && ids.length > 0) {
        ids.map(item => {
          arr.push(`${item}`)
        })
      }
      let counts = client.query({
        query: gql`
        query reservation_beach {
          reservation_beach(where:
          {
            business_id:${businessId}
            id:[${ids}]
            }
          ) {
            id
            element_count
            seat_position
            additional_sunbed
            protocol_status
            phone_number
            name
            comment
            paid_online
            price_values
            coupon_number
            discount_amount
            completed
            released_days
            changed_position
            business_id
            time_zone
            changed_position
            created_at
            updated_at
            accepted_by
            rejected_by
            canceled_by
            rent_umbrella
            selected_days
            reservation_status
            total_price
          }
      }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  updateReservationStatuses(status, id) {
    try {
      let counts = client.query({
        query: gql`
       mutation reservation_beachUpdate{
            reservation_beachUpdate(
              reservation_beach:{
                 id:${id}
                reservation_status:"${status}"
              }
            ){    
              id
              element_count
              seat_position
              additional_sunbed
              protocol_status
              phone_number
              comment
              selected_days
              qr_code
              paid_online
              reservation_status
              price_values
              coupon_number
              discount_amount
              completed
              released_days
              changed_position
              business_id
              time_zone
              changed_reservation
              created_at
              updated_at
              accepted_by
              rejected_by
              canceled_by
              total_price
            }
          }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  saveReservationApis(phoneValue, nameValue, commentValue, protocolStatus, individualDays, seatElement, extraSunbedCount, rentUmbrellaCount, currentPercent, amountValue, additionalSunbedPrice, umbrellaPrice, type, priceValuesArr, rentUmArr, extraSbArr, tempTotalPrice, zoneId, businessId, userId, endHourArrs) {
    try {
      console.log(protocolStatus, individualDays, seatElement, extraSunbedCount, rentUmbrellaCount, currentPercent, amountValue, additionalSunbedPrice, umbrellaPrice, type, "_-------------->customize reservation")
      console.log(phoneValue, "phonValue---------->")
      console.log(nameValue, "nameValue---------->")
      console.log(commentValue, "commentValue---------->")
      console.log(protocolStatus, "protocolStatus---------->")
      console.log(individualDays, "individualDays---------->")
      console.log(seatElement, "seatElement---------->")
      console.log(extraSunbedCount, "extraSunbedCount---------->")
      console.log(rentUmbrellaCount, "rentUmbrellaCount---------->")
      console.log(currentPercent, "currentPercent---------->")
      console.log(amountValue, "amountValue---------->")
      console.log(additionalSunbedPrice, "additionalSunbedPrice---------->")
      console.log(umbrellaPrice, "umbrellaPrice---------->")
      console.log(type, "type---------->")
      console.log(rentUmArr, "rentUmArr---------->")
      console.log(extraSbArr, "extraSbArr---------->")
      console.log(tempTotalPrice, "tempTotalPrice---------->")
      console.log(zoneId, "zoneId---------->")
      console.log(businessId, "businessId---------->")
      console.log(userId, "userId---------->")
      let poneNumber = phoneValue;
      let selectedArr = []
      let elementArr = [];
      poneNumber = "+40" + phoneValue;
      if (individualDays.length > 0) {
        for (let i = 0; i < individualDays.length; i++) {
          selectedArr.push(`{ 
            id: ${i} 
            day:"${individualDays[i]}"}`
          )
        }
      }
      if (seatElement.length > 0) {
        for (let i = 0; i < seatElement.length; i++) {
          elementArr.push(`{
            id: ${i}
            seat_id:"${seatElement[i].id}"
          }`)
        }
      }
      console.log(endHourArrs, "*************priceValuearr")
      let counts = client.query({
        query: gql`
            mutation CreateCustomReservation{
            CreateCustomReservation(
              input:{
                element_count:${seatElement.length}
                additional_sunbed:${extraSunbedCount}
                protocol_status:${protocolStatus}
                phone_number:"${phoneValue}"
                comment:"${commentValue}"
                name:"${nameValue}"
                paid_online:false
                reservation_status:"${type}"
                discount_amount:${amountValue}
                business_id:7
                business_user_id:26
                rent_umbrella:${rentUmbrellaCount}
                total_price:${type == "reserved_not_paid" ? 0 : tempTotalPrice}
                position_seats:[${elementArr.join('')}],
                selected_days:[${selectedArr.join('')}],
                price_values_arr:[${priceValuesArr.join('')}],
                extra_sunbed_price:[${rentUmArr.join('')}],
                rent_umbrella_price:[${extraSbArr.join('')}],
                end_days_hours:[${endHourArrs.join('')}],
                zone_id:${zoneId}
              }
            ){    
              result
            }
          }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  getAllReservationAPIs(id, limitCount, offSetCount) {
    try {
      let data = getBusinessId();
      let counts = client.query({
        query: gql`
        query reservation_beach {
          reservation_beach(where:
          {
            business_id:${id}
            },
            limit:${limitCount},
            offset:${offSetCount * limitCount}
          ) {
            id
            element_count
            seat_position
            additional_sunbed
            protocol_status
            phone_number
            name
            comment
            qr_code
            paid_online
            price_values
            coupon_number
            discount_amount
            completed
            released_days
            changed_position
            business_id
            time_zone
            changed_position
            created_at
            updated_at
            accepted_by
            rejected_by
            canceled_by
            rent_umbrella
            selected_days
            reservation_status
            total_price
            customer_request
            extra_sunbed_price
            rent_umbrella_price
            released_days
          }
      }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  updateSeatPosition(seatArr, id) {
    try {
      let counts = client.query({
        query: gql`
         mutation UpdateSeatPosition{
            UpdateSeatPosition(
              input:{
                id:${id}
                seat_position:[${seatArr.join('')}],
              }
            ){    
              result
            }
          }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  apiChangeReservation(id, status, totalPrice) {
    try {
      let counts = client.query({
        query: gql`
        mutation reservation_beachUpdate{
          reservation_beachUpdate(
            reservation_beach:{
            id:${id}
            reservation_status:"${status}"
            total_price:${totalPrice}
            }
          ){    
            id
          }
        }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  apiUpdateReleaseDay(id, status, arr) {
    try {
      let counts = client.query({
        query: gql`
       mutation UpdateRelease {
          UpdateRelease(input: 
          {
            id:${id}
            released_days:[${arr.join('')}],
            reservation_status:"${status}"
          }
          ) {
          result
          }
      }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  updateReservationApi(rentUmArr, extraSbArr, extraSunbedCount, rentUmbrellaCount, priceValuesArr, reservationId, reservationState, seatElement, tempTotalPrice) {
    try {
      let elementArr = [];
      let totalPrice = 0;
      if (reservationState == "reserved_paid" || reservationState == "occupied" || reservationState == "pending") {
        totalPrice = tempTotalPrice;
      }
      if (seatElement.length > 0) {
        for (let i = 0; i < seatElement.length; i++) {
          elementArr.push(`{
            id: ${i}
            seat_id:"${seatElement[i].id}"
          }`)
        }
      }
      let counts = client.query({
        query: gql`
       mutation UpdateReservation {
          UpdateReservation(input: 
          {
            id:${reservationId}
            additional_sunbed:${extraSunbedCount},
            rent_umbrella:${rentUmbrellaCount}
            position_seats:[${elementArr.join('')}],
            price_values:[${priceValuesArr.join('')}],
            extra_sunbed_price:[${rentUmArr.join('')}],
            rent_umbrella_price:[${extraSbArr.join('')}],
          }
          ) {
          result
          }
      }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  gettingFilterStatus(status) {
    try {
      let data = getBusinessId();
      let counts = client.query({
        query: gql`
        query reservation_beach {
          reservation_beach(where:
          {
            reservation_status:${status}
            }
          ) {
            id
            element_count
            seat_position
            additional_sunbed
            protocol_status
            phone_number
            name
            comment
            qr_code
            paid_online
            price_values
            coupon_number
            discount_amount
            completed
            released_days
            changed_position
            business_id
            time_zone
            changed_position
            created_at
            updated_at
            accepted_by
            rejected_by
            canceled_by
            rent_umbrella
            selected_days
            reservation_status
            total_price
            customer_request
            extra_sunbed_price
            rent_umbrella_price
            released_days
          }
      }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  apiChangeStatusReservation(id, status) {
    try {
      let counts = client.query({
        query: gql`
        mutation reservation_beachUpdate{
          reservation_beachUpdate(
            reservation_beach:{
            id:${id}
            reservation_status:"${status}"
            }
          ){    
            id
          }
        }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  getWorkingHourApi(id) {
    try {
      let counts = client.query({
        query: gql`
        query business_week {
                business_week(where: {
                  business_id:${id}
                }) {
                  id
                mon
                mon_start
                mon_end
                mon_start_break
                mon_end_break
                tue
                tue_start
                tue_end
                tue_start_break
                tue_end_break
                thu
                thu_start
                thu_end
                thu_start_break
                thu_end_break
                fri
                fri_start
                fri_end
                fri_start_break
                fri_end_break
                sat
                sat_start
                sat_end
                sat_start_break
                sat_end_break
                sun
                sun_start
                sun_end
                sun_start_break
                sun_end_break
              }
            }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  getRestaurantReservation(id, limitCount, offSetCount) {
    try {
      let counts = client.query({
        query: gql`
        query reservation_restaurant {
          reservation_restaurant(where:
          {
            business_id:${id}
            },
            limit:${limitCount},
            offset:${offSetCount * limitCount}
          ) {
            id
            element_id
            phone_number
            comment
            name
            qr_code
            business_id
            selected_day
            price
            reservation_status
            business_user_id
            customer_id
            arrive_time
            number_persons
            created_at
            updated_at
            created_by
          }
        }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  apiChangeReservationRestaurant(id, status) {
    try {
      let counts = client.query({
        query: gql`
         mutation reservation_restaurantUpdate{
          reservation_restaurantUpdate(
            reservation_restaurant  :{
              id:${id}
              reservation_status:"${status}"
            }
          ){
            id
            reservation_status
          }
        }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  getDayJson(businessId) {
    try {
      let counts = client.query({
        query: gql`
          query grid_data{
          grid_data(where:{
            business_id:${businessId}
          }){
            id
            data
          }
        }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  changeRestaurantReservation(id, arriveTime, timeOccupied, elementId) {
    try {
      let counts = client.query({
        query: gql`
         mutation reservation_restaurantUpdate{
          reservation_restaurantUpdate(reservation_restaurant:{
            id:${id}
            arrive_time:"${arriveTime}"
            time_occupied:${timeOccupied}
            element_id:${elementId}
          }){
          id
            arrive_time
            time_occupied
            element_id
          }
        }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  removeReservation(id) {
    try {
      let counts = client.query({
        query: gql`
         mutation reservation_restaurantDelete{
            reservation_restaurantDelete(id:${id})
          }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  changeReservation(id, status) {
    try {
      let counts = client.query({
        query: gql`
         mutation reservation_restaurantUpdate{
            reservation_restaurantUpdate(reservation_restaurant:{
              id:${id}
              reservation_status:"${status}"
            }){
            id
              reservation_status
            }
          }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  createReservationApi(phone, name, comment, selectedDay, reservationStatus, userId, arriveTime, timeOccupied, persons, elementId, businessId) {
    try {
      let counts = client.query({
        query: gql`
         mutation CreateCustomRestaurantReservation{
          CreateCustomRestaurantReservation(input:{
          element_id:${elementId},
          phone_number: "${phone}",
          comment: "${comment}",
          name: "${name}",
          qr_code: "dddddd",
          business_id: ${businessId},
          selected_day: "${selectedDay}"
          reservation_status: "${reservationStatus}"
          business_user_id: ${userId}
          arrive_time: "${arriveTime}"
          time_occupied: "${timeOccupied}"
          number_persons: ${persons}
          created_by: "user"
          }){
          result
          }
        }

          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  updateRestaurantReservation(id, phoneValue, nameValue, commentValue, numberPersons, customer_late) {
    try {
      let counts = client.query({
        query: gql`
           mutation reservation_restaurantUpdate{
            reservation_restaurantUpdate(reservation_restaurant:{
              id:${id}
              phone_number:"${phoneValue}"
              comment:"${commentValue}"
              name:"${nameValue}"
              number_persons:${numberPersons}
              customer_lated:${customer_late}
            }){
              id
              phone_number
              comment
              name
              number_persons
            }
          }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  getClosedDayAPI(businessId) {
    try {
      let counts = client.query({
        query: gql`
            query business_year{
              business_year(where:{
                business_id:${businessId}
              }){
                id
              year
                start
                end
                closed_days
                business_id
              }
            }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  filterRestaurantReservation(status) {
    try {
      let counts = client.query({
        query: gql`
            query reservation_restaurant{
              reservation_restaurant(where:{
                reservation_status:"${status}"
              }){
                id
                element_id
                phone_number
                comment
                name
                qr_code
                business_id
                selected_day
                price
                reservation_status
                business_user_id
                customer_id
                created_by
                arrive_time
                number_persons
                time_occupied
                created_at
                updated_at
                customer_lated
              }
            }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
  getPositionReservation(selectedDay) {
    try {
      let counts = client.query({
        query: gql`
             query reservation_restaurant{
              reservation_restaurant(where:{
                selected_day:"${selectedDay}",
              }){
                id
                element_id
                phone_number
                comment
                name
                qr_code
                business_id
                selected_day
                price
                reservation_status
                business_user_id
                customer_id
                created_by
                arrive_time
                number_persons
                time_occupied
                created_at
                updated_at
                customer_lated
              }
            }
          `,
      })
        .then(result => {
          return result;
        })
        .catch(error => {
          return error;
        });
      return counts;
    } catch (err) {
      return err;
    }
  }
}

