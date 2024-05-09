export interface DeviceInfo {
    // 设备ID
    id?: number | string;
    // 设备编号 - 唯一标识
    deviceID?: string;
    // 设备名称
    deviceName?: string;
    // 设备状态
    deviceStatus?: string;
    // 设备管理员
    deviceManager?: string;
    // 设备位置信息 如：1号楼2层304，方便定位设备
    deviceLocation?: string;
    // 电脑配置信息
    deviceConfig?: string;
    // 设备价格
    devicePrice?: number;
    // 设备二维码
    qrcode?: string;
    // 购买日期
    buyDate?: string;
}