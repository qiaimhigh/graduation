<template>
    <div class="add-device-container">
        <h2>{{ isEdit ? '编辑设备' : '新增设备' }}</h2>
        <el-divider />
        <el-form
            ref="formRef"
            :model="deviceForm"
            label-width="auto"
            show-message="true"
            class="device-form-container"
            size="large"
            status-icon
            :rules="rules"
        >
            <el-form-item 
                label="设备名称"
                prop="deviceName"
            >
                <el-input v-model="deviceForm.deviceName"></el-input>
            </el-form-item>
            <el-form-item 
                label="设备编号"
                prop="deviceID"
            >
                <el-input v-model="deviceForm.deviceID" :disabled="isEdit"></el-input>
            </el-form-item>
            <el-form-item 
                label="设备配置"
                prop="deviceConfig"
            >
                <el-input v-model="deviceForm.deviceConfig"></el-input>
            </el-form-item>
            <el-form-item 
                label="生产日期"
                prop="buyDate"
            >
                <el-date-picker
                    v-model="deviceForm.buyDate"
                    type="date"
                    placeholder="请选择设备生产日期"
                    clearable
                />
            </el-form-item>
            <el-form-item
                label="设备价格"
                prop="devicePrice"
            >
                <el-input
                    v-model.number="deviceForm.devicePrice"
                    type="text"
                    autocomplete="off"
                >
                    <template #append>元</template>
                </el-input>
            </el-form-item>
            <el-form-item 
                label="设备管理员"
                prop="deviceManager"
            >
                <el-select
                    v-model="deviceForm.deviceManager"
                    placeholder="请选择设备管理老师"
                    style="max-width: 350px;"
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
            <el-form-item 
                label="设备教室"
                prop="deviceLocation"
            >
                <el-select
                    v-model="deviceForm.deviceLocation"
                    placeholder="请选择设备使用教室"
                    style="max-width: 350px;"
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

            <el-form-item>
                <el-button type="primary" @click="handleAddDevice(formRef)">新增</el-button>
                <el-button v-if="!isEdit" @click="resetForm(formRef)">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watchEffect } from 'vue'
import { addDeviceAPI, editDeviceAPI } from '@/server/device'
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import dayjs from 'dayjs'
import type { DeviceInfo } from '../deviceList/types';

interface RulesForm {
    deviceID: string
    deviceLocation: string
    deviceManager: string
    devicePrice: number
    deviceName: string
    buyDate: string;
}

interface Props {
    isEdit?: boolean
    rowEditData?: DeviceInfo
}

// 关闭Modal容器
const emit = defineEmits(['closeModal'])

//  判断是否是编辑状态
const props = withDefaults(defineProps<Props>(), {
    isEdit: false,
    rowEditData: () => {
        return {
            deviceID: '',
            deviceConfig: '',
            devicePrice: 0,
            deviceName: '',
            deviceManager: '',
            buyDate: '',
            deviceLocation: ''
        }
    }
})
const formRef = ref<FormInstance>();
let deviceForm = ref<DeviceInfo>({
    deviceID: '',
    deviceConfig: '',
    devicePrice: 0,
    deviceName: '',
    deviceManager: '',
    buyDate: '',
    deviceLocation: ''
})
// 表单验证规则
const rules = reactive<FormRules<RulesForm>>({
    deviceName: [
        { required: true, message: '请输入设备名称'}
    ],
    deviceManager: [
        { required: true, message: '请选择设备管理员'}
    ],
    deviceLocation: [
        { required: true, message: '请选择设备使用教室'}
    ],
    buyDate: [
        { required: true, message: '请选择设备生产日期'}
    ],
    deviceID: [
        { required: true, message: '请选择设备编号'}
    ],
    devicePrice: [
        { required: true, message: '请填写设备价格' },
        { type: 'number', message: '设备价格必须是数字' },
    ]
});
// 教室信息
const classRoom = [
    {
        value: 'FZ304',
        label: 'FZ304'
    },
    {
        value: 'FZ405',
        label: 'FZ405'
    },
    {
        value: 'FZ302',
        label: 'FZ302'
    },
    {
        value: 'FF304',
        label: 'FF304'
    },
    {
        value: 'FZ105',
        label: 'FZ105'
    }
]
// 老师
const teacher = [
    {
        value: '老师1',
        label: '老师1'
    },
    {
        value: '老师2',
        label: '老师2'
    },
    {
        value: '老师3',
        label: '老师3'
    }
]

// 提交
const handleAddDevice = (formRef: FormInstance | undefined) => {
    if (!formRef) return;
    formRef.validate((valid) => {
        // console.log('valid', valid)
        // console.log('fields', fields)
        if (valid) {
            const formData = deviceForm.value;
            formData.buyDate = dayjs(deviceForm.value.buyDate).format('YYYY-MM-DD');
            // console.log(formData)
            // emit('closeModal', false, true);
            (props.isEdit ? editDeviceAPI(formData) : addDeviceAPI(formData))
                .then((res) => {
                    console.log(res)
                    const { code, msg } = res;
                    if (code === 200) {
                        emit('closeModal', false, true);  
                        ElMessage.success(msg)
                    }
                    else {
                        ElMessage.error(msg)
                    }
                    resetForm(formRef);
                })
                .catch((err) => {
                    ElMessage.error(err.message || '未知错误')
                })
        }
    })
    // .then(() => {
    //     emit('closeModal', false, true);  
    // })
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

watchEffect(() => {
    deviceForm.value = { 
        ...props.rowEditData,
        devicePrice: Number(props.rowEditData.devicePrice || '0') 
    };
})

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
    padding:16px 10px;

    .el-form-item__content {
        display: flex;
        justify-content: center;
    }
}
</style>