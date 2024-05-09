<template>
  <div class="device-list-container" >
      <div class="user-top">
          <h2 :style="{color: 'black'}">设备列表</h2>
          <div>
              <el-input
                  v-model="searchText"
                  style="width: 240px"
                  size="small"
                  placeholder="请输入设备名称"
                  :prefix-icon="Search"
                  @input="searchNameChange"
              />
              <button @click="handleExportData" class="export-excel-btn">导出全部设备列表数据</button>
          </div>
      </div>
      <el-table :data="mobileInfo" style="width: 100%;" class="device-table" :row-style="{ height: '80px' }">
          <el-table-column fixed prop="id" label="ID" width="50"/>
          <el-table-column prop="mName" label="设备名称" :show-overflow-tooltip="true">
              <template #default="{row}">
                  <el-tooltip :content="row.mName" placement="top">
                      {{row.mName || '-'}}
                  </el-tooltip>
              </template>
          </el-table-column>
          <!-- <el-table-column prop="mID" label="设备ID"  /> -->
          <el-table-column prop="mPrice" label="设备价格"  />
          <el-table-column prop="mLocation" label="设备位置" />
          <el-table-column prop="mBuyTime" width="100" label="购买日期" />
          <el-table-column prop="mInfo" label="设备介绍" width="300">
              <template #default="{row}">
                  <el-tooltip :content="row.mInfo" placement="top">
                      <div class="ellipsis-text-three">
                        {{row.mInfo || '-'}}
                      </div>
                  </el-tooltip>
              </template>
          </el-table-column>
          <el-table-column prop="mManager" label="管理员" />
          <el-table-column prop="type" label="设备类型" :show-overflow-tooltip="true" width="150"/>
          <el-table-column prop="count" label="设备总数（个）" />
          <el-table-column prop="canUseCount" label="可借用数量（个）" />
          <el-table-column prop="canUseCount" label="借用中数量（个）">
            <template #default="{row}">
                  {{ (row.count - row.canUseCount) }}
              </template>
          </el-table-column>
          <el-table-column prop="deviceEdit" label="操作" fixed="right" width="180">
              <template #default="{row}">
                  <el-button link size="small" type="primary" @click="editMobile(row)">编辑</el-button>
                  <el-button link size="small" type="primary" @click="deleteMobile(row.mName)">删除</el-button>
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
          <AddMobile :isEdit="true" :rowEditData="{ ...rowEditData}" @closeModal="closeEditModal"></AddMobile>
      </ModalCom>
      
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watchEffect} from 'vue'
import { MobileInfo } from './type';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search } from '@element-plus/icons-vue'
// @ts-ignore
import ModalCom from '../../../components/ModalCom.vue'
import AddMobile from '../addMobile/index.vue'
import { 
  getMobileListApi, 
  deleteMobileApi
} from '@/server/mobile';
import { debounce } from 'lodash'
import { exportDeviceExcelAPi } from '@/server/device';
import { localSaveFile } from '@/utils/excel';



const searchName = ref<string>('')
const searchText = ref<string>('')
const mobileInfo = ref<MobileInfo[]>([]);

// 分页
const pageInfo = reactive({
  total: 100, // 总数
  curPage: 1, // 当前页面
  pageSize: 10, // 页面条数
})
// 控制编辑框的显示和隐藏
const isComVisible = ref<boolean>(false);
const rowEditData = ref<MobileInfo>({});

// 获取设备列表
const getMobileLists = (curPageNum: number, pageSizeNum: number, searchName: string) => {
  // console.log('getDeviceList', curPageNum, pageSizeNum)
  getMobileListApi({
      curPage: curPageNum, 
      pageSize: pageSizeNum,
      mName: searchName
  })
      .then((res: any) => {
          const { code, msg, data } = res;
          console.log('mobileList\n', data)
          const { curPage, pageSize, total, mobileList } = data;
          if (code === 200) {               
              mobileInfo.value = mobileList;
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
const deleteMobile = (mName: string) => {
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
    //   console.log("确认");
      deleteMobileApi({mName})
          .then((res: any) => {
              const { code, msg } = res;

              if (code === 200) {
                  ElMessage.success(msg)
                  getMobileLists(pageInfo.curPage, pageInfo.pageSize, searchName.value);
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
const editMobile = (mobileInfo: DeviceInfo) => {
  isComVisible.value = true;
  rowEditData.value = mobileInfo;
}

// 关闭编辑Modal
const closeEditModal = (value: boolean, isGetList = false) => {
  // console.log('isGetList', isGetList)
  isComVisible.value = Boolean(value);
  if (isGetList) {
      // setTimeout(() => {
      getMobileLists(pageInfo.curPage, pageInfo.pageSize, searchName.value);
      // }, 500);
  }
}

// 搜索设备
// @ts-ignore
const searchNameChange = debounce((mName: string) => {
      searchName.value = mName;
    //   console.log(mName)
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
  getMobileLists(pageInfo.curPage, pageInfo.pageSize, searchName.value)
})

// onMounted(() => {
//     getMobileLists(pageInfo.curPage, pageInfo.pageSize, searchName.value)
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