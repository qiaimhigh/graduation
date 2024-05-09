<template>
  <div class="device-list-container">
    <div class="user-top">
      <h2 :style="{ color: 'black' }">借用列表</h2>
      <div>
        <el-input
          v-model="searchText"
          style="width: 240px"
          size="small"
          placeholder="请输入学生学号"
          :prefix-icon="Search"
          @input="searchNameChange"
        />
        <button @click="handleExportData" class="export-excel-btn">
          导出全部设备列表数据
        </button>
      </div>
    </div>
    <el-table
      :data="mobileRecords"
      style="width: 100%"
      class="device-table"
      :row-style="{ height: '80px' }"
    >
      <el-table-column fixed prop="id" label="ID" width="50" />
      <el-table-column
        prop="mName"
        label="设备名称"
        :show-overflow-tooltip="true"
      >
        <template #default="{ row }">
          <el-tooltip :content="row.mName" placement="top">
            {{ row.mName || "-" }}
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="studentID" label="学生学号" />
      <el-table-column prop="startTime" label="借用时间" width="200">
        <template #default="{ row }">
          {{ row.startTime || "-" }}
        </template>
      </el-table-column>
      <el-table-column prop="handleTime" width="200" label="处理时间">
        <template #default="{ row }">
          {{ row.handleTime || "-" }}
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="归还时间" width="200">
        <template #default="{ row }">
          {{ row.endTime || "-" }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="设备类型" />
      <el-table-column prop="statusType" label="借用状态">
        <template #default="{ row }">
          <span v-if="row.statusType === '1'" :style="{ color: 'green' }"
            >借用中</span
          >
          <span v-else-if="row.statusType === '2'" :style="{ color: 'red' }"
            >已归还</span
          >
          <span v-else-if="row.statusType === '3'">待确认</span>
          <span v-else-if="row.statusType === '4'" :style="{ color: 'red' }"
            >已拒绝</span
          >
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="deviceEdit" label="操作" fixed="right" width="180">
        <template #default="{ row }">
          <el-button
            link
            size="small"
            type="primary"
            @click="changeRecordsStatus(row, '1')"
            v-if="row.statusType === '3'"
            >√允许借用</el-button
          >
          <el-button
            link
            size="small"
            type="primary"
            @click="changeRecordsStatus(row, '2')"
            v-if="row.statusType === '1'"
            >√点击归还</el-button
          >
          <el-button
            link
            size="small"
            type="primary"
            @click="changeRecordsStatus(row, '4')"
            v-if="row.statusType === '3'"
            :style="{ color: 'red' }"
            >×拒绝借用</el-button
          >
          <span v-if="row.statusType === '2'">-</span>
          <span v-if="row.statusType === '4'" :style="{ color: 'red' }"
            >已拒绝借用</span
          >
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

    <!-- 弹窗组件 -->
    <ModalCom :isVisible="isComVisible" @changShow="closeEditModal">
      <AddDevice
        :isEdit="true"
        :rowEditData="{ ...rowEditData }"
        @closeModal="closeEditModal"
      ></AddDevice>
    </ModalCom>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watchEffect } from "vue";
// import { MobileInfo } from './type';
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
// @ts-ignore
import ModalCom from "../../../components/ModalCom.vue";
import AddDevice from "../../addDevice/index.vue";
import { getMobileRecordsApi, changeRecordsStatusApi } from "@/server/mobile";
import { debounce } from "lodash";
import { exportDeviceExcelAPi } from "@/server/device";
import { localSaveFile } from "@/utils/excel";

const searchID = ref<string>("");
const searchText = ref<string>("");
const mobileRecords = ref<any[]>([]);

// 分页
const pageInfo = reactive({
  total: 100, // 总数
  curPage: 1, // 当前页面
  pageSize: 10, // 页面条数
});
// 控制编辑框的显示和隐藏
const isComVisible = ref<boolean>(false);
const rowEditData = ref<any>({});

// 修改设备的状态
const changeRecordsStatus = (row: any, status: string) => {
  let statusMsg = '-';
  switch (status) {
    case '2':
      statusMsg = '已归还';
      break;
    // case '3':
    //   statusMsg = '待确认';
    //   break;
    case '4':
      statusMsg = '已拒绝';
      break;
    case '1': 
      statusMsg = '借用中';
      break;
  }
  ElMessageBox.confirm(`确认将当前的用户借用记录修改为${statusMsg}？`, "", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      changeRecordsStatusApi({
        id: row.id,
        status,
        mName: row.mName
      })
        .then((res: any) => {
          const { code, msg } = res;
          if (code === 200) {
            ElMessage.success({
              message: "操作成功",
            });
            getMobileLists(pageInfo.curPage, pageInfo.pageSize, searchID.value);
          } else {
            ElMessage.error({
              message: msg,
            });
          }
        })
        .catch((err) => {
          ElMessage.error({
            message: err.message || "未知错误",
          });
        });
    })
    .catch(() => {
      console.log("取消");
    });
};

// 获取设备列表
const getMobileLists = (
  curPageNum: number,
  pageSizeNum: number,
  searchID: string
) => {
  // console.log('getDeviceList', curPageNum, pageSizeNum)
  getMobileRecordsApi({
    curPage: curPageNum,
    pageSize: pageSizeNum,
    studentID: searchID,
  })
    .then((res: any) => {
      const { code, msg, data } = res;
      console.log("mobileList\n", data.mobileRecords);
      const { curPage, pageSize, total, mobileRecords: mData } = data;
      if (code === 200) {
        mobileRecords.value = mData;
        pageInfo.total = total;
        pageInfo.curPage = curPage;
        pageInfo.pageSize = pageSize;
        ElMessage.success({
          message: msg,
        });
      } else {
        ElMessage.error({
          message: msg,
        });
      }
    })
    .catch((err) => {
      ElMessage.error({
        message: err.message || "未知错误",
      });
    });
};

// excel
const handleExportData = () => {
  exportDeviceExcelAPi()
    .then((res) => {
      localSaveFile({ file: res, fileName: `设备列表.xlsx` });
    })
    .catch(() => {
      ElMessage.error({
        message: "导出失败",
      });
    });
};

// 编辑设备
// @ts-ignore
const editMobile = (mobileRecords) => {
  isComVisible.value = true;
  rowEditData.value = mobileRecords;
};

// 关闭编辑Modal
const closeEditModal = (value: boolean, isGetList = false) => {
  // console.log('isGetList', isGetList)
  isComVisible.value = Boolean(value);
  if (isGetList) {
    // setTimeout(() => {
    getMobileLists(pageInfo.curPage, pageInfo.pageSize, searchID.value);
    // }, 500);
  }
};

// 搜索设备
// @ts-ignore
const searchNameChange = debounce((mName: string) => {
  searchID.value = mName;
  //   console.log(mName)
}, 400);

// 改变当前的页数
const handleCurrentChange = (val: number) => {
  // console.log('当期页数', val)
  pageInfo.curPage = val;
};

// 上一页
const prevClick = () => {
  let curPage = pageInfo.curPage - 1;
  if (curPage > 0) {
    pageInfo.curPage = curPage;
  }
};

// 下一页
const nextClick = () => {
  let curPage = pageInfo.curPage + 1;
  if (curPage <= Math.ceil(pageInfo.total / pageInfo.pageSize)) {
    pageInfo.curPage = curPage;
  }
};

// 监听 curPage、total、deviceList变化
watchEffect(() => {
  getMobileLists(pageInfo.curPage, pageInfo.pageSize, searchID.value);
});

// onMounted(() => {
//     getMobileLists(pageInfo.curPage, pageInfo.pageSize, searchID.value)
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
