// 设备excel
export const deviceExcel = [
    {
        header: 'id',
        key: 'id'
    },
    {
        header: '设备名称',
        key: 'deviceName',
        width: 20
    },
    {
        header: '设备编号',
        key: 'deviceID',
        width: 30
    },
    {
        header: '设备配置',
        key: 'deviceConfig',
        width: 30
    },
    {
        header: '生产时间',
        key: 'buyDate',
        width: 20
    },
    {
        header: '设备位置',
        key: 'deviceLocation'
    },
    {
        header: '设备价格',
        key: 'devicePrice'
    },
    {
        header: '设备二维码',
        key: 'qrcode'
    },
    {
        header: '设备管理员',
        key: 'deviceManager'
    }
]

// 故障设备excel
export const repairDeviceExcel = [
    {
        header: '设备编号',
        key: 'deviceID',
        width: 20
    },
    {
        header: '设备名称',
        key: 'deviceName'
    },
    {
        header: '上报学生',
        key: 'studentID'
    },
    {
        header: '上报时间',
        key: 'repairPushTime',
        width: 20
    },
    {
        header: '故障原因',
        key: 'repairCause',
        width: 50
    },
    {
        header: '处理状态',
        key: 'isRepair'
    },
    {
        header: '处理时间',
        key: 'repairTime',
        width: 20
    }
]