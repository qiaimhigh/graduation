import request from "./index";

/**
 * ----移动设备----
 */

// 获取设备列表
export const getMobileListApi = (params?: any) => {
    return request.get('/mobile/list', { params })
}

// 新增移动设备
export const addMobileApi = (data?: any) => {
    return request.post('/mobile/add', data)
}

// 修改移动设备列表
export const editMobileApi = (data?: any) => {
    return request.post('/mobile/edit', data)
}
// 删除移动设备
export const deleteMobileApi = (data?: { mName: string }) => {
    return request.delete('/mobile/delete', { data })
}

// 获取设备借用列表
export const getMobileRecordsApi = (params?: any) => {
    return request.get('/mobile/records', { params })
}

// 修改借用设备的状态
export const changeRecordsStatusApi = (data?: any) => {
    return request.post('/mobile/records/edit', data)
}
