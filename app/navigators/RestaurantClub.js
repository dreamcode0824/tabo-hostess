import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
    NotifHome1,
    Table1
} from '../screens'

const Stack = createStackNavigator();

function RestaurantClub() {
    return (
        <Stack.Navigator headerMode={'none'}>
            <Stack.Screen name="NotifHome1" component={NotifHome1} />
            <Stack.Screen name="Table1" component={Table1} />
        </Stack.Navigator>
    );
}

export default RestaurantClub;
