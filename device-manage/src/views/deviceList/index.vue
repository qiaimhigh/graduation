<template>
    <div class="device-list-container" >
        <div class="user-top">
            <h2 :style="{color: 'black'}">设备列表</h2>
            <div>
                <el-input
                    v-model="searchText"
                    style="width: 240px"
                    size="small"
                    placeholder="Please Input"
                    :prefix-icon="Search"
                    @input="searchIDChange"
                />
                <button @click="handleExportData" class="export-excel-btn">导出全部设备列表数据</button>
            </div>
        </div>
        <el-table :data="deviceInfo" style="width: 100%;" class="device-table" :row-style="{ height: '80px' }">
            <el-table-column fixed prop="id" label="ID" width="50"/>
            <el-table-column prop="deviceName" label="设备名称" :show-overflow-tooltip="true">
                <template #default="{row}">
                    <el-tooltip :content="row.deviceName" placement="top">
                        {{row.deviceName}}
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="deviceID" label="设备编号"  />
            <el-table-column prop="deviceStatus" label="设备状态"  />
            <el-table-column prop="devicePrice" label="设备价格"  />
            <el-table-column prop="deviceLocation" label="设备位置" />
            <el-table-column prop="buyDate" width="100" label="购买日期" />
            <el-table-column prop="deviceConfig" label="配置信息" :show-overflow-tooltip="true">
                <template #default="{row}">
                    <el-tooltip :content="row.deviceConfig" placement="top">
                        {{row.deviceConfig || '-'}}
                    </el-tooltip>
                </template>
            </el-table-column>
            <el-table-column prop="deviceManager" label="设备管理者" />
            <el-table-column prop="deviceEdit" label="操作" fixed="right" width="180">
                <template #default="{row}">
                    <el-button link size="small" type="primary" @click="editDevice(row)">编辑</el-button>
                    <el-button link size="small" type="primary" @click="delteDevice(row.deviceID)">删除</el-button>
                    <el-button v-if="!!row.qrcode" link size="small" type="primary" @click="deviceQrcode(row)">
                        查看二维码
                    </el-button>
                    <el-button v-else link size="small" type="primary" @click="generateQrcode(row)">
                        生成二维码
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination 
            background 
            layout="prev, pager, next" 
            :total="pageInfo.total" 
            class="bottom-pagination"
            @current-change="handleCurrentChange"
            @prev-click="prevClick"
            @next-click="nextClick"
            v-model:page-size="pageInfo.pageSize"
            v-model:current-page="pageInfo.curPage"
        />

        <!-- 图片展示组件 -->
        <ImageModal :isVisible="isVisible" :imageInfo="imageInfo" @changShow="closeQrcode"></ImageModal>
        <!-- 弹窗组件 -->
        <ModalCom :isVisible="isComVisible" @changShow="closeEditModal">
            <AddDevice :isEdit="true" :rowEditData="{ ...rowEditData}" @closeModal="closeEditModal"></AddDevice>
        </ModalCom>
        
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watchEffect} from 'vue'
import { DeviceInfo } from './types';
import { ElMessage, ElMessageBox } from 'element-plus';
import ImageModal from '../../components/ImageModal.vue';
import { Search } from '@element-plus/icons-vue'
// @ts-ignore
import ModalCom from '../../components/ModalCom.vue'
import AddDevice from '../addDevice/index.vue'
import { 
    getDeviceList, 
    generateQrcodeAPI, 
    deleteDevice
} from '@/server/device';
import { debounce } from 'lodash'
import { exportDeviceExcelAPi } from '@/server/device';
import { localSaveFile } from '@/utils/excel';

const searchID = ref<string>('')
const searchText = ref<string>('')
const deviceInfo = ref<DeviceInfo[]>([]);
// 控制展示ImageModal 组件的字段
const isVisible = ref<boolean>(false);
const imageInfo = ref({
    imageUrl: '',
    deviceID: '',
    deviceName: ''
});
// 分页
const pageInfo = reactive({
    total: 100, // 总数
    curPage: 1, // 当前页面
    pageSize: 10, // 页面条数
})
// 控制编辑框的显示和隐藏
const isComVisible = ref<boolean>(false);
const rowEditData = ref<DeviceInfo>({});

// 获取设备列表
const getDeviceLists = (curPageNum: number, pageSizeNum: number, searchID: string) => {
    // console.log('getDeviceList', curPageNum, pageSizeNum)
    getDeviceList({
        curPage: curPageNum, 
        pageSize: pageSizeNum,
        deviceID: searchID
    })
        .then((res) => {
            const { code, msg, data } = res;
            console.log('deviceList\n', data)
            const { curPage, pageSize, total, deviceList } = data;
            if (code === 200) {               
                deviceInfo.value = deviceList;
                pageInfo.total = total;
                pageInfo.curPage = curPage;
                pageInfo.pageSize = pageSize;
                ElMessage.success({
                    message: msg
                })
            }
            else {
                ElMessage.error({
                    message: msg
                })
            }
        })
        .catch((err) => {
            ElMessage.error({
                message: err.message || '未知错误'
            })
        })
}

// excel
const handleExportData = () => {
    exportDeviceExcelAPi()
        .then((res) => {
            localSaveFile({file: res, fileName: `设备列表.xlsx`})
        })
        .catch(() => {
            ElMessage.error({
                message: '导出失败'
            })
        })
}

// 删除设备
const delteDevice = (deviceID: string) => {
    ElMessageBox.confirm(
        '确认是否删除设备？',
        '删除设备',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
        }
    )
    .then(() => {
        console.log("确认");
        deleteDevice({deviceID})
            .then((res) => {
                const { code, msg } = res;

                if (code === 200) {
                    ElMessage.success(msg)
                    getDeviceLists(pageInfo.curPage, pageInfo.pageSize, searchID.value);
                }
                else {
                    ElMessage.error(msg)
                }
            })
            .catch((err) => {
                ElMessage.error(err.message || '未知错误')
            })
    })
    .catch(() => {
        console.log('取消')
    });
}

// 编辑设备
// @ts-ignore
const editDevice = (deviceInfo: DeviceInfo) => {
    isComVisible.value = true;
    rowEditData.value = deviceInfo;
}

// 关闭编辑Modal
const closeEditModal = (value: boolean, isGetList = false) => {
    // console.log('isGetList', isGetList)
    isComVisible.value = Boolean(value);
    if (isGetList) {
        // setTimeout(() => {
        getDeviceLists(pageInfo.curPage, pageInfo.pageSize, searchID.value);
        // }, 500);
    }
}

// 查看设备二维码
const deviceQrcode = (image: any) => {
    isVisible.value = true;
    imageInfo.value = {
        imageUrl: image.qrcode,
        deviceID: image.deviceID,
        deviceName: image.deviceName
    }
}

// 关闭二维码
const closeQrcode = (value: boolean) => {
    isVisible.value = value;
}

// 生成二维码
const generateQrcode = (row: any) => {
    generateQrcodeAPI({deviceID: row.deviceID, id: row.id, deviceName: row.deviceName})
        .then((res) => {
            const { code, msg } = res;
            if (code === 200) {
                ElMessage.success(msg);
            }
            else {
                ElMessage.error(msg)
            }
            getDeviceLists(pageInfo.curPage, pageInfo.pageSize, searchID.value);
        })
        .catch((err) => {
            ElMessage.error(err.message || '未知错误')
        })
}

// 搜索设备
// @ts-ignore
const searchIDChange = debounce((deviceID: string) => {
        searchID.value = deviceID;
        console.log(deviceID)
    },
    400
)

// 改变当前的页数
const handleCurrentChange = (val: number) => {
    // console.log('当期页数', val)
    pageInfo.curPage = val;
}

// 上一页
const prevClick = () => {
    let curPage = pageInfo.curPage - 1;
    if (curPage > 0) {
        pageInfo.curPage = curPage;
    }
}

// 下一页
const nextClick = () => {
    let curPage = pageInfo.curPage + 1;
    if (curPage <= Math.ceil(pageInfo.total / pageInfo.pageSize)) {
        pageInfo.curPage = curPage;
    }
}

// 监听 curPage、total、deviceList变化
watchEffect(() => {
    getDeviceLists(pageInfo.curPage, pageInfo.pageSize, searchID.value)
})

// onMounted(() => {
//     getDeviceLists(pageInfo.curPage, pageInfo.pageSize, searchID.value)
// })

</script>

<style lang="scss" scoped>
.device-list-container {
    width: 100%;
    height: 100%;
    position: relative;

    .user-top {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;

        .el-input {
            height: 36px;
        }
    }

   

    .el-table__header,
    .el-table__footer {
        margin: 0 auto;
    }

    .bottom-pagination {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }

    
}

.el-message-box__message img {
    width: 200px;
    height: 200px;
    object-fit: scale-down;
}
</style>