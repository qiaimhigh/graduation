import request from "./index";


// 获取设备列表
export const getDeviceList = (params: any): Promise<any> => {
    return request.get('/deviceList', { params });
}

// 生成设备二维码
export const generateQrcodeAPI = (data: { deviceID:string, id: number, deviceName: string }): Promise<any> => {
    return request.post('/qrcode', data)
}

// 新增设备
export const addDeviceAPI = (data: any): Promise<any> => {
    console.log(data)
    return request.post('/add', data)
}

// 删除设备
export const deleteDevice = (data: { deviceID: string }): Promise<any> => {
    return request.delete('/delete', { data })
}

// 编辑设备
export const editDeviceAPI = (data: any): Promise<any> => {
    return request.post('/edit', data)
}

// 搜索设备
// export const searchDeviceAPI = (params: { deviceID: string }): Promise<any> => {
//     return request.get('/device/search', { params })
// }

// 获取故障列表
export const getRepairList = (params?: any): Promise<any> => {
    return request.get('/repair-list', { params })
}

// 修改设备维修状态
export const changeRepairAPI = (data: { id: number, isRepair: number, repairTime: string }) => {
    return request.post('/edit-repair', data)
}

// 修改留言处理状态
export const changeMessageAPI = (data: { id: number, isHandle: number, handleTime: string }) => {
    return request.post('/edit-message', data)
}

// excel导出故障设备
export const exportReapirExcelAPi = (params?: any) => {
    return request.get('/excel/repair-device', { params, responseType: 'blob' })
}

// excel导出所有设备
export const exportDeviceExcelAPi = () => {
    return request.get('/excel/device', { responseType: 'blob' })
}

// 初始化
export const initAPI = () => {
    return request.get('/init')
}