<template>
    <div class="login-main-container">
        <img class="logo" src="../../assets/img/logo.png"/>
        <div class="login-container">
            <img class="logobg" src="../../assets/img/loginbg.png" />
            <div class="login-box">
                <p class="title">Welcome to the XUPT management system!</p>
                <el-input
                    v-model="username"
                    style="width: 240px"
                    size="small"
                    placeholder="请输入账号"
                    :prefix-icon="User"
                />
                <el-input
                    v-model="password"
                    style="width: 240px"
                    size="small"
                    type="password"
                    placeholder="请输入密码"
                    :prefix-icon="Lock"
                    show-password
                />
                <el-button type="primary" @click="handleLogin" :loading="isLoading">登录</el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import {ref} from 'vue';
import { loginFun } from '@/server/user';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { setAccessToken, setRefershToken } from '@/utils/storage';
import { useUserStore } from '@/store/user';

const username = ref<string>('');
const password = ref<string>('');
const isLoading = ref<boolean>(false);
const router = useRouter();
const userStore = useUserStore();

// 校验账号、密码
const checkData = (username: string, password: string): Boolean => {
    if (!username || !password) {
        ElMessage.error({
            message: '账号和密码不能为空'
        })
        return false;
    }
    else {
        if (username?.length > 9 || username?.length < 4) {
            ElMessage.error({
                message: '账号长度需在 5 ~ 8位'
            })
            return false;
        }
        else if (password?.length < 4 && password?.length > 12) {
            ElMessage.error({
                message: '密码需在5 ~ 11 位之间'
            })
            return false;
        }
    }
    return true;
}

// 登录
const handleLogin = () => {
    const obj = {
        username: username.value,
        password: password.value
    }
    isLoading.value = true;

    if ( checkData(obj.username, obj.password) ) {
        loginFun(obj)
            .then((res) => {
                console.log('res---', res)
                isLoading.value = false;
                const { code, msg, data } = res;
                if (code === 200) {
                    // token
                    setAccessToken(JSON.stringify(data.accessToken));
                    setRefershToken(JSON.stringify(data.refreshToken));
                    userStore.setUserInfo(data.data);
                    ElMessage.success(msg);
                    router.push('/')
                } 
                else {
                    ElMessage.error(msg);
                }
            })
            .catch((err) => {
                console.log('err--', err)
                isLoading.value = false;
                ElMessage.error(err.message || '未知错误');
            })
    }   
    else {
        isLoading.value = false;
    }
}
</script>

<style lang="scss" scoped>
.login-main-container {
    width: 100%;
    height: 100%;
    position: relative;
    
    .logo {
        width: 280px;
        height: 100px;
        object-fit: scale-down;
    }
    
    .login-container {
        position: relative;

        .logobg {
            width: 40%;
            height: 40%;
            object-fit: cover;
            margin-left: 100px;
        }

        .login-box {
            width: 400px;
            height: 230px;
            display: flex;
            flex-direction: column;
            padding: 16px;
            align-items: center;
            position: absolute;
            top: 30%;
            right: 15%;
            border: 2px solid #eae7e7;
            border-radius: 20px;
            box-shadow: 4px 4px 6px #eae7e7;
            

            .el-input {
                width: 100% !important;
                height: 40px;
                margin-bottom: 8px;
            }

            .title {
                width: 100%;
                font-size: 20px;
                font-weight: 700;
                color: rgb(139, 207, 236);
                text-align: center;
                margin-bottom: 20px;
            }

            .el-button {
                width: 140px !important;
                height: 40px;
            }
        }
    }
}
</style>