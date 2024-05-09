<template>
    <div class="user-list-container">
        <div class="user-top">
            <h2 :style="{ color: 'black' }">用户留言列表</h2>
            <el-select v-model="messageType" placeholder="Select" style="width: 120px">
                <el-option v-for="item in messageStatus" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <!-- <button @click="handleExportData" class="export-excel-btn">导出全部数据</button> -->

        </div>
        <el-table :data="messageList" style="width: 100%;" class="user-table" :row-style="{ height: '70px' }">
            <el-table-column fixed prop="id" label="ID" width="50" />
            <el-table-column prop="studentID" label="留言学生" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="msg" label="留言内容" width="400"></el-table-column>
            <el-table-column prop="msgTime" label="留言时间" width="160" :show-overflow-tooltip="true">
                <template #default="{ row }">
                    {{ row.msgTime || '-' }}
                </template>
            </el-table-column>
            <el-table-column prop="isHandle" label="是否处理" :show-overflow-tooltip="true">
                <template #default="{ row }">
                    <span :style="{ color: row.isHandle ? '#7FFF00' : 'red' }">
                        {{ row.isHandle ? '已处理' : '未处理' }}
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="handlePerson" label="处理人" :show-overflow-tooltip="true">
                <template #default="{ row }">
                    {{ row.handlePerson || '-' }}
                </template>
            </el-table-column>
            <el-table-column prop="messageEdit" label="操作" fixed="right">
                <template #default="{ row }">
                    <el-button
                        v-if="row.isHandle === 0"
                        link 
                        size="small" 
                        type="primary"
                        @click="changeHandleStatus(row.id)"
                    >
                        点击修改处理状态
                    </el-button>
                    <span v-else>-</span>
                </template>
            </el-table-column>
        </el-table>
        <el-pagination background layout="prev, pager, next" :total="pageInfo.total" class="bottom-pagination"
            @current-change="handleCurrentChange" @prev-click="prevClick" @next-click="nextClick"
            v-model:page-size="pageInfo.pageSize" v-model:current-page="pageInfo.curPage" />

        <el-dialog v-model="centerDialogVisible" width="500" align-center>
            <span>是否确认修改当前的留言信息的状态为
                <!-- <span :style="{ color: repairNum ? '#7FFF00' : 'red' }">
                    {{ repairNum ? '已维修' : '维修中' }}
                </span> -->
                <span style="color: #7FFF00">
                    已处理
                </span>
                ?
            </span>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="centerDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="comfirmMessageStatus">
                        确认
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watchEffect } from 'vue';
import { getMessageList, changeMessageStatus } from '@/server/user';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';
import { useSidebarStore } from '@/store/sidebar';
// import { localSaveFile } from '@/utils/excel'

const sidebar = useSidebarStore();
const messageList = ref([]);
// 分页
const pageInfo = reactive({
    total: 100, // 总数
    curPage: 1, // 当前页面
    pageSize: 10, // 页面条数
})
const messageType = ref('all');
const centerDialogVisible = ref(false);
const curMessageID = ref(0);
const messageStatus = [
    {
        value: 'all',
        label: '全部'
    },
    {
        value: 'unhandled',
        label: '未处理'
    },
    {
        value: 'handled',
        label: '已处理'
    }
]

const { userName } = useUserStore();

const changeHandleStatus = (id: number) => {
    // console.log("修改用户信息", id, isRepair);
    centerDialogVisible.value = true;
    curMessageID.value = id;
}

const comfirmMessageStatus =async () => {
    await changeMessageStatus({ id: curMessageID.value, isHandle: 1, handlePerson: userName })
        .then((res: any) => {
            const { code, msg } = res;
            if (code === 200) {
                sidebar.setTotalUserMsgNum(sidebar.totalUserMsgNum - 1);
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
    getMessageLists(pageInfo.curPage, pageInfo.pageSize, messageType.value)
    centerDialogVisible.value = false
}

// 导出excel
// const handleExportData = () => {
//     exportAdminList()
//         .then((res) => {
//             localSaveFile({file: res, fileName: '管理员信息表.xlsx'})
//         })
//         .catch((err) => {
//             ElMessage.error({
//                 message: err.message || '未知错误'
//             })
//         })
// }

// 获取维修列表数据
const getMessageLists = (curPage = 1, pageSize = 10, type: string) => {
    getMessageList({
        curPage,
        pageSize,
        type
    })
        .then((res: any) => {
            const { code, msg, data } = res;
            console.log('repairList\n', data)
            const { curPage, pageSize, total, userMsgList } = data;
            if (code === 200) {
                messageList.value = userMsgList;
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
    // sidebar.setTotalUserMsgNum(0);
//     // getMessageLists(pageInfo.curPage, pageInfo.pageSize, messageType.value)
// })

// 监听 curPage、total、deviceList变化
watchEffect(() => {
    getMessageLists(pageInfo.curPage, pageInfo.pageSize, messageType.value)
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

.export-excel-btn {
    background-color: #a6eded;
    border: 1px solid #a6eded;
    border-radius: 5px;
    height: 40px;
    font-weight: 600;
    padding: 5px;
}
</style>