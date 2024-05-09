import request from "./index";

// 登录
export const loginFun = (data: any): Promise<any> => {
    return request.post('/login', data);
} 

// 获取用户列表
export const getUserList = (params: { curPage: number, pageSize: number, studentID?: string }): Promise<any> => {
    return request.get('/userList', { params });
}

// 用户留言列表
export const getMessageList = (params: { curPage?: number, pageSize?: number, type?: string, isNeedPage?: boolean }): Promise<any> => {
    return request.get('/message-list', { params });
}

// 修改用户留言状态
export const changeMessageStatus = (data: { id: number, isHandle: number, handlePerson: string }): Promise<any> => {
    return request.post('/edit-message', data);
}

// excel-管理员信息
export const exportAdminList = (): Promise<any> => {
    // 必须添加bolb类型，否则会报错o
    return request.get('/excel/admin', { responseType: 'blob' });
}

// excel-用户信息
export const exportUserList = (): Promise<any> => {
    // 必须添加bolb类型，否则会报错o
    return request.get('/excel/user', { responseType: 'blob' });
}