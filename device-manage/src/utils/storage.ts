export const ACCESS_TOKEN = 'access_token';
export const REFRESH_TOKEN = 'refresh_token';

// 存储短token
export const setAccessToken = (token: string) => localStorage.setItem(ACCESS_TOKEN, token)
// 存储长token
export const setRefershToken = (token: string) => localStorage.setItem(REFRESH_TOKEN, token)
// 获取短token
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN)
// 获取长token
export const getRefershToken = () => localStorage.getItem(REFRESH_TOKEN)
// 删除短token
export const removeAccessToken = () => localStorage.removeItem(ACCESS_TOKEN)
// 删除长token
export const removeRefershToken = () => localStorage.removeItem(REFRESH_TOKEN)