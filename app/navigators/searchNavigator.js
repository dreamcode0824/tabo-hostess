import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
	SearchHome,
} from '../screens'

const Stack = createStackNavigator();

function SearchNavigator() {
	return (
		<Stack.Navigator headerMode={'none'}>
			<Stack.Screen name="Search" component={SearchHome} />
		</Stack.Navigator>
	);
}

export default SearchNavigator;
