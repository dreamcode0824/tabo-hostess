// Initial State
const initialState = {
    loggedIn: false,
    showbar: false,
    alertStatus: false,
    userData: ""
};
// Reducers (Modifies The State And Returns A New State)
const userReducer = (state = initialState, action) => {
    switch (action.type) {
        // Login
        case 'SHOW_BAR': {
            return { ...state, showbar: action.value }
        }
        case 'ALLOW_ALRET': {
            return { ...state, alertStatus: action.status }
        }
        case 'SAVE_USER_DATA': {
            return { ...state, userData: action.data }
        }
        default: {
            return state;
        }
    }
};
// Exports
export default userReducer;