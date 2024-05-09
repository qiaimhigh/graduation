<template>
    <div class="user-list-container" >
        <div class="user-top">
            <h2 :style="{color: 'black'}">用户列表</h2>
            <div>
                <el-input
                    v-model="studentIDText"
                    style="width: 240px"
                    size="small"
                    placeholder="Please Input"
                    :prefix-icon="Search"
                    @input="handleSearch"
                />
                <button @click="handleExportData" class="export-excel-btn">导出学生信息</button>

            </div>
        </div>
        <el-table :data="users" style="width: 100%;" class="user-table" :row-style="{ height: '70px' }">
            <el-table-column fixed prop="id" label="ID" width="50"/>
            <el-table-column prop="studentID" label="学号" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="userName" label="学生姓名" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="college" label="学院" width="180" />
            <el-table-column prop="major" label="专业" width="200"/>
            <el-table-column prop="phone" label="电话号码" width="200"/>
            <el-table-column prop="useTime" width="160" label="使用时长" :show-overflow-tooltip="true"></el-table-column>
            <el-table-column prop="warningTimes" label="预警次数(/次)" />
           <el-table-column prop="deviceEdit" label="操作" fixed="right">
                <template #default="{row}"> 
                    <el-button link size="small" type="primary" @click="changeUserInfo(row.id)">修改信息</el-button>
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
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watchEffect } from 'vue';
import { Search } from '@element-plus/icons-vue'
import { UserInfo } from './types';
import { getUserList } from '@/server/user';
import { ElMessage } from 'element-plus';
import {debounce } from 'lodash'
import { exportUserList } from '@/server/user';
import { localSaveFile } from '@/utils/excel';

const users = ref<UserInfo[]>([]);
// 分页
const pageInfo = reactive({
    total: 100, // 总数
    curPage: 1, // 当前页面
    pageSize: 10, // 页面条数
})
const studentIDText = ref('');
const searchID = ref('');

// @ts-ignore
const changeUserInfo = (id: number) => {
    console.log("修改用户信息");
}

// excel
const handleExportData = () => {
    exportUserList()
        .then((res) => {
            localSaveFile({file: res, fileName: `学生信息列表.xlsx`})
        })
        .catch(() => {
            ElMessage.error({
                message: '导出失败'
            })
        })
}

// 获取用户数据
const getUserLists = (curPage = 1, pageSize = 10, searchID: string) => {
    getUserList({
        curPage,
        pageSize,
        studentID: searchID
    })
        .then((res) => {
            const { code, msg, data } = res;
            console.log('userList\n', data)
            const { curPage, pageSize, total, userList } = data;
            if (code === 200) {               
                users.value = userList;
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

// search
const handleSearch = debounce(
    (value: string) => {
        searchID.value = value;
    },
    800
)

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

// 监听 curPage、total、deviceList变化
watchEffect(() => {
    getUserLists(pageInfo.curPage, pageInfo.pageSize, searchID.value)
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