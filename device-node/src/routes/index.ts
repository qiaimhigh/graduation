const express = require('express')
const router = express.Router();
const { verifyAuthorization } = require('./user/auth');
const { 
    loginFun, 
    getUserList, 
    refreshTokenApi,
    getMessageList,
    editMessage,
    pushUserMsg,
    exportManagerList,
    exportUserList,
} = require('./user/index');
const { 
    getDeviceList, 
    generateQrcode, 
    checkInDevice, 
    checkOutDevice, 
    deleteDevice, 
    addDevice,
    editDevice,
    getRepairList,
    editRepair,
    exportDeviceExcel,
    exportRepairDeviceExcel
} = require('./device/index');
const { 
    getUserDeviceRecords,
    pushRepair,
    appLoginFun,
    verifyToken
} = require('./app/index')
const { 
    getMobileList,
    addMobile,
    getMobileRecordsList,
    editMobileInfo,
    changeMobileStatus,
    deleteMobile,
    appGetRecordsList,
    borrowMobile
} = require('./mobile/index')
const { getIndexInitData } = require('./other/index')

router.get('/init', getIndexInitData)

router.post('/login', loginFun);

// 先去掉 verifyAuthorization 验证token的方法
// 获取用户列表
router.get('/userList', getUserList)

// 获取设备列表
router.get('/deviceList', getDeviceList)

// 生成设备二维码
router.post('/qrcode', generateQrcode)

// 签到设备
router.post('/app/check-in', checkInDevice)

// 签退设备
router.post('/app/check-out', checkOutDevice)

// 删除设备
router.delete('/delete', deleteDevice)

// 新增设备
router.post('/add', addDevice)

// 刷新token
router.get('/refesh', refreshTokenApi)

// 修改设备
router.post('/edit', editDevice)

// 搜索
// router.get('/device/search', queryDeviceWithID)

// 小程序获取设备使用记录
router.get('/app/user-device', getUserDeviceRecords)

// 小程序推送维修记录
router.post('/app/push-repair', pushRepair)

// 获取维修记录
router.get('/repair-list', getRepairList)

// 修改故障设备状态
router.post('/edit-repair', editRepair);

// 获取用户留言列表
router.get('/message-list', getMessageList)

// 修改用户留言状态
router.post('/edit-message', editMessage);

// 留言
router.post('/app/push-message', pushUserMsg);

// excel导出所有管理员信息
router.get('/excel/admin', exportManagerList);

// excel导出所有用户信息
router.get('/excel/user', exportUserList);

// excel到处故障设备
router.get('/excel/repair-device', exportRepairDeviceExcel);

// excel到处故障设备
router.get('/excel/device', exportDeviceExcel);

// 小程序登录
router.post('/app/login', appLoginFun);

// 小程序验证token
router.post('/app/verify', verifyToken);

/**
 * ----------------------------------------=
 */
// 移动设备
router.get('/mobile/list', getMobileList);
// 移动设备添加
router.post('/mobile/add', addMobile);
// 移动设备修改
router.post('/mobile/edit', editMobileInfo);
// 移动设备记录列表
router.get('/mobile/records', getMobileRecordsList)
// 修改设备状态
router.post('/mobile/records/edit', changeMobileStatus);
// 删除设备
router.delete('/mobile/delete', deleteMobile);
// 小程序获取设备使用记录
router.get('/app/mobile/list', appGetRecordsList)
// 借用设备
router.post('/app/mobile/borrow', borrowMobile);

module.exports = router;
export { };