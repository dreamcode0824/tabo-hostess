// Login
export const LoginAction = (userInfo) => ({
    type: 'LOGIN', userInfo: userInfo,
});

export const ShowBarAction = (value) => ({
    type: 'SHOW_BAR', value: value
});
export const AllowAlertAction = (status) => ({
    type: 'ALLOW_ALRET', status: status
})
export const SaveUserData = (data) => ({
    type: 'SAVE_USER_DATA', data: data
})