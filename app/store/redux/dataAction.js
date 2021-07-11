// Login
export const SaveTimeLine = (timeLine, closeDays, workingHour, timeOccupied) => ({
    type: 'TIME_LINE', timeLine: timeLine, closeDays: closeDays, workingHour: workingHour, timeOccupied: timeOccupied
});
export const SetPositionAction = (status, selectedDay, arriveTime) => ({
    type: 'SET_POSITION', setPositionStatus: status, setPositionDay: selectedDay, arriveTime: arriveTime
});

