import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
    NotifHome,
} from '../screens'

const Stack = createStackNavigator();

function BeachPool() {
    return (
        <Stack.Navigator headerMode={'none'}>
            <Stack.Screen name="NotifHome" component={NotifHome} />
        </Stack.Navigator>
    );
}

export default BeachPool;
