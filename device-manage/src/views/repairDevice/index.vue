<template>
    <div class="user-list-container">
        <div class="user-top">
            <h2 :style="{ color: 'black' }">故障设备维修列表</h2>
            <div>
                <el-select v-model="repairType" placeholder="Select" style="width: 120px">
                    <el-option v-for="item in repairStatus" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <button @click="handleExportData" class="export-excel-btn">导出{{ statusArr[repairType] }}设备数据</button>
            </div>

        </div>
        <el-table :data="repairDevices" style="width: 100%;" class="user-table" :row-style="{ height: '70px' }">
            <el-table-column fixed prop="id" label="ID" width="50" />
            <el-table-column prop="studentID" label="上报学生" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="deviceID" label="设备编号" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="deviceName" label="设备名称" :show-overflow-tooltip="true" />
            <el-table-column prop="repairCause" label="故障原因" :show-overflow-tooltip="true">
                <template #default="{ row }">
                    {{ row.repairCause || '-' }}
                </template>
            </el-table-column>
            <el-table-column prop="isRepair" label="维修状态" :show-overflow-tooltip="true">
                <template #default="{ row }">
                    <span :style="{ color: row.isRepair ? '#7FFF00' : 'red' }">
                        {{ row.isRepair ? '已维修' : '维修中' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="repairPushTime" width="160" label="上报时间" :show-overflow-tooltip="true">
                <template #default="{ row }">
                    {{ row.repairPushTime || '-' }}
                </template>
            </el-table-column>
            <el-table-column prop="repairTime" width="160" label="维修时间" :show-overflow-tooltip="true">
                <template #default="{ row }">
                    {{ row.repairTime || '-' }}
                </template>
            </el-table-column>
            <el-table-column prop="deviceEdit" label="操作" fixed="right">
                <template #default="{ row }">
                    <el-button
                        v-if="row.isRepair === 0"
                        link 
                        size="small" 
                        type="primary"
                        @click="changeRepairStatus(row.id, row.isRepair)"
                    >
                        点击修改维修状态
                    </el-button>
                    <span v-else>-</span>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination background layout="prev, pager, next" :total="pageInfo.total" class="bottom-pagination"
            @current-change="handleCurrentChange" @prev-click="prevClick" @next-click="nextClick"
            v-model:page-size="pageInfo.pageSize" v-model:current-page="pageInfo.curPage" />

        <el-dialog v-model="centerDialogVisible" width="500" align-center>
            <span>是否确认修改当前的故障设备维修状态为
                <!-- <span :style="{ color: repairNum ? '#7FFF00' : 'red' }">
                    {{ repairNum ? '已维修' : '维修中' }}
                </span> -->
                <span style="color: #7FFF00">
                    已维修
                </span>
                ?
            </span>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="centerDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="comfirmRepair">
                        确认
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watchEffect } from 'vue';
import { getRepairList, changeRepairAPI } from '@/server/device';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs';
import { useSidebarStore } from '@/store/sidebar';
import { exportReapirExcelAPi } from '@/server/device';
import { localSaveFile } from '@/utils/excel';

const sidebar = useSidebarStore();
const repairDevices = ref([]);
// 分页
const pageInfo = reactive({
    total: 100, // 总数
    curPage: 1, // 当前页面
    pageSize: 10, // 页面条数
})
const repairType = ref<string>('all');
const centerDialogVisible = ref(false);
const repairNum = ref(0);
const curRepairID = ref(0);
const statusArr = {
    'all': '全部',
    'unrepaired': '维修中',
    'repaired': '已维修'
};
const repairStatus = [
    {
        value: 'all',
        label: '全部'
    },
    {
        value: 'unrepaired',
        label: '维修中'
    },
    {
        value: 'repaired',
        label: '已维修'
    }
]

// excel
const handleExportData = () => {
    exportReapirExcelAPi({ type: repairType.value })
        .then((res) => {
            localSaveFile({file: res, fileName: `${statusArr[repairType.value]}故障设备列表.xlsx`})
        })
        .catch(() => {
            ElMessage.error({
                message: '导出失败'
            })
        })
}

const changeRepairStatus = (id: number, isRepair: number) => {
    // console.log("修改用户信息", id, isRepair);
    centerDialogVisible.value = true;
    repairNum.value = isRepair ? 0 : 1;
    curRepairID.value = id;
}

const comfirmRepair =async () => {
    const curTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    await changeRepairAPI({ id: curRepairID.value, isRepair: 1, repairTime: curTime })
        .then((res: any) => {
            const { code, msg } = res;
            if (code === 200) {
                sidebar.setTotalRepairMsgNum(sidebar.totalRepairMsgNum - 1);
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
        .catch((err: any) => {
            ElMessage.error({
                message: err.message || '未知错误'
            })
        })
    getRepairLists(pageInfo.curPage, pageInfo.pageSize, repairType.value)
    centerDialogVisible.value = false
}

// 获取维修列表数据
const getRepairLists = (curPage = 1, pageSize = 10, type: string) => {
    getRepairList({
        curPage,
        pageSize,
        type
    })
        .then((res: any) => {
            const { code, msg, data } = res;
            console.log('repairList\n', data)
            const { curPage, pageSize, total, deviceList } = data;
            if (code === 200) {
                repairDevices.value = deviceList;
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

// 改变当前的页数
const handleCurrentChange = (val: number) => {
    // console.log('当期页数', val)
    pageInfo.curPage = val;
}

// onMounted(() => {
    // sidebar.setTotalRepairMsgNum(0);
// })

// 监听 curPage、total、deviceList变化
watchEffect(() => {
    getRepairLists(pageInfo.curPage, pageInfo.pageSize, repairType.value)
})
</script>

<style lang="scss" scoped>
.user-list-container {
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

    .user-table {
        min-height: calc(100% - 110px);
        // min-height: 200px
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