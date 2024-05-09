<template>
  <div class="add-device-container">
    <h2>{{ isEdit ? "编辑移动设备" : "新增移动设备" }}</h2>
    <el-divider />
    <el-form
      ref="formRef"
      :model="mobileForm"
      label-width="auto"
      show-message="true"
      class="device-form-container"
      size="large"
      status-icon
      :rules="rules"
    >
      <el-form-item label="设备名称" prop="mName">
        <el-input v-model="mobileForm.mName" :disabled="isEdit"></el-input>
      </el-form-item>
      <el-form-item label="设备价格" prop="mPrice">
        <el-input
          v-model.number="mobileForm.mPrice"
          type="text"
          autocomplete="off"
        >
          <template #append>元</template>
        </el-input>
      </el-form-item>
      <el-form-item label="设备位置" prop="mLocation">
        <el-select
          v-model="mobileForm.mLocation"
          placeholder="请选择设备存放教室"
          style="max-width: 350px"
        >
          <el-option
            v-for="item in classRoom"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="购买日期" prop="mBuyTime">
        <el-date-picker
          v-model="mobileForm.mBuyTime"
          type="date"
          placeholder="请选择设备购买日期"
          clearable
        />
      </el-form-item>
      <el-form-item label="设备介绍" prop="mInfo">
        <el-input
          v-model.number="mobileForm.mInfo"
          type="textarea"
          style="width: 550px"
          placeholder="请输入设备介绍"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="设备管理员" prop="mManager">
        <el-select
          v-model="mobileForm.mManager"
          placeholder="请选择设备管理老师"
          style="max-width: 350px"
        >
          <el-option
            v-for="item in teacher"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备类别" prop="type">
        <el-select
          v-model="mobileForm.type"
          placeholder="请选择设备类别"
          style="max-width: 350px"
        >
          <el-option
            v-for="item in mobileType"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="设备总数" prop="count">
        <el-input
          v-model.number="mobileForm.count"
          type="text"
          autocomplete="off"
        >
          <template #append>个</template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleAddDevice(formRef)"
          >新增</el-button
        >
        <el-button v-if="!isEdit" @click="resetForm(formRef)">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watchEffect } from "vue";
import { addMobileApi, editMobileApi } from "@/server/mobile";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
// import type { DeviceInfo } from "../deviceList/types";

interface RulesForm {
  mInfo: string;
  mPrice: number;
  mName: string;
  mManager: string;
  mBuyTime: string;
  mLocation: string;
  count: number;
  type: string
}

interface Props {
  isEdit?: boolean;
  rowEditData?: any;
}

// 关闭Modal容器
const emit = defineEmits(["closeModal"]);

//  判断是否是编辑状态
const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  rowEditData: () => {
    return {
      id: "",
      mInfo: "",
      mPrice: 0,
      mName: "",
      mManager: "",
      mBuyTime: "",
      mLocation: "",
      count: 0,
      type: ''
    };
  },
});
const formRef = ref<FormInstance>();
let mobileForm = ref<any>({
  mInfo: "",
  mPrice: 0,
  mName: "",
  mManager: "",
  mBuyTime: "",
  mLocation: "",
  count: 0,
  type: ""
});
// 表单验证规则
const rules = reactive<FormRules<RulesForm>>({
  mName: [{ required: true, message: "请输入设备名称" }],
  mManager: [{ required: true, message: "请选择设备管理员" }],
  mLocation: [{ required: true, message: "请选择设备使用教室" }],
  mBuyTime: [{ required: true, message: "请选择设备生产日期" }],
  mInfo: [{ required: true, message: "请填写设备介绍" }],
  mPrice: [
    { required: true, message: "请填写设备价格" },
    // { type: "number", message: "设备价格必须是数字" },
  ],
  count: [
    { required: true, message: "请填写设备总数" },
    { type: "number", message: "设备总数必须是数字" },
  ],
  type: [{ required: true, message: "请选择设备类别" }],
});
// 教室信息
const classRoom = [
  {
    value: "FZ304",
    label: "FZ304",
  },
  {
    value: "FZ405",
    label: "FZ405",
  },
  {
    value: "FZ302",
    label: "FZ302",
  },
  {
    value: "FF304",
    label: "FF304",
  },
  {
    value: "FZ105",
    label: "FZ105",
  },
];
// 老师
const teacher = [
  {
    value: "老师1",
    label: "老师1",
  },
  {
    value: "老师2",
    label: "老师2",
  },
  {
    value: "老师3",
    label: "老师3",
  },
];

// 设备类别
const mobileType = [
  {
    value: "嵌入式设备",
    label: "嵌入式设备",
  },
  {
    value: "物理实验设备",
    label: "物理实验设备",
  },
  {
    value: "化学实验设备",
    label: "化学实验设备",
  },
  {
    value: '其他',
    label: '其他'
  }
]

// 提交
const handleAddDevice = (formRef: FormInstance | undefined) => {
  if (!formRef) return;
  formRef.validate((valid) => {
    // console.log('valid', valid)
    // console.log('fields', fields)
    if (valid) {
      const formData = mobileForm.value;
      console.log('formData-------', formData)
      formData.mBuyTime = dayjs(mobileForm.value.mBuyTime).format("YYYY-MM-DD");
      // console.log(formData)
      // emit('closeModal', false, true);
      (props.isEdit ? editMobileApi(formData) : addMobileApi(formData))
        .then((res: any) => {
          console.log(res);
          const { code, msg } = res;
          if (code === 200) {
            emit("closeModal", false, true);
            ElMessage.success(msg);
          } else {
            ElMessage.error(msg);
          }
          resetForm(formRef);
        })
        .catch((err) => {
          ElMessage.error(err.message || "未知错误");
        });
    }
  });
  // .then(() => {
  //     emit('closeModal', false, true);
  // })
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

watchEffect(() => {
  mobileForm.value = {
    ...props.rowEditData,
    devicePrice: Number(props.rowEditData.devicePrice || "0"),
  };
});
</script>

<style lang="scss" scoped>
.el-input {
  max-width: 550px;
}

.add-device-container {
  width: 100%;
  background-color: white;
  border: 1px solid #dddbdb;
  box-shadow: 2px 2px 6px #adacac;
  padding: 16px 10px;

  .el-form-item__content {
    display: flex;
    justify-content: center;
  }
}
</style>
