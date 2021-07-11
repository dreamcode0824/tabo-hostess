import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  Home,
  Price,
  Table,
  ReservationInformation,
  Reservation1
} from '../screens'

const Stack = createStackNavigator();

function HomeNavigator({ navigation }) {
  return (
    <Stack.Navigator headerMode={'none'}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Table" component={Table} />
      <Stack.Screen name="Price" component={Price} />
      <Stack.Screen name="Reservation1" component={Reservation1} />
      <Stack.Screen name="ReservationInformation" component={ReservationInformation} />
    </Stack.Navigator>
  );
}

export default HomeNavigator;
