// Initial State
const initialState = {
    timeLine: [],
    closeDays: [],
    workingHour: [],
    timeOccupied: "",
    setPositionStatus: false,
    setPositionDay: "",
    arriveTime: ""
};
// Reducers (Modifies The State And Returns A New State)
const dataReducer = (state = initialState, action) => {
    switch (action.type) {
        // Login
        case 'TIME_LINE': {
            return { ...state, timeLine: action.timeLine, closeDays: action.closeDays, workingHour: action.workingHour, timeOccupied: action.timeOccupied }
        }
        case 'SET_POSITION': {
            return { ...state, setPositionStatus: action.setPositionStatus, setPositionDay: action.setPositionDay, arriveTime: action.arriveTime }
        }
        default: {
            return state;
        }
    }
};
// Exports
export default dataReducer;