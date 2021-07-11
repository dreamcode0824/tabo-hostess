const config = {
    contentHeight: 0
}

const configReducer = (state = config, action) => {
    switch (action.type) {
        case 'SET_CONTENT_HEIGHT':
            return {
                ...state,
                contentHeight: action.value
            }
        default: break;
    }
    return state;
}
export default configReducer