// Imports: Dependencies
import { combineReducers } from 'redux';
// Imports: Reducers
import userReducer from './userReducer';
import dataReducer from './dataReducer';
// import counterReducer from './counterReducer';

// Redux: Root Reducer
const rootReducer = combineReducers({
    userReducer: userReducer,
    dataReducer: dataReducer,
    // counterReducer: counterReducer,
});
// Exports
export default rootReducer;