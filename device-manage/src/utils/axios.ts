import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ElMessage, ElLoading } from 'element-plus';
import { jumpLogin } from '.';
import { getAccessToken, removeAccessToken } from './storage';
import { addRequest, refreshToken } from './refresh';
import request from '@/server';

// 配置全局Loading
let loadingInstance: any = null;
let requestNum = 0;

// 添加loading
const addLoading = () => {
    // 当有多个请求时，当且仅当请求数为1的时候弹出loading，防止重复弹出
    requestNum++;
    if (requestNum === 1) {
        loadingInstance = ElLoading.service({
            text: '加载中...',
            background: 'rgba(0, 0, 0, 0.7)'
        })
    }
}

// 取消loading
const cancelLoading = () => {
    requestNum--;
    if (requestNum === 0) {
        loadingInstance?.close();
    }
}

export const createAxios = (config: AxiosRequestConfig): AxiosInstance => {
    const instance = axios.create({
        timeout: 10000,
        // 配置跨域携带cookie
        // withCredentials: true,
        ...config
    })

    // 请求拦截器
    instance.interceptors.request.use(
        (config: any) => {
            // 可以控制loading的显示和影藏
            const { loading = true } = config;
            console.log('config：', config);

            const token = getAccessToken() ? JSON.parse(getAccessToken() as string) : '';
            if (token) {
                config.headers.Authorization = `${token}`
            }
            if (loading) {
                addLoading();
            }
            console.log('loading', loading)
            return config;
        },
        (error) => {
            console.log('err0r', error)
            return Promise.reject(error);
        }
    )

    // 响应拦截器
    instance.interceptors.response.use(
        (response: any) => {
            // 可以对获取数据做一些处理
            // console.log('response：', response);
            const { config, data } = response;
            const { loading = true} = config;
            if (loading) {
                cancelLoading();
            }

            return new Promise((resolve) => {
                const { code, msg } = data;
                if (code) {
                    if (code === 200) {
                        resolve(data);
                    }
                    //  accessToken 过期
                    else if (code === 401) {
                        removeAccessToken();
                        addRequest(() => resolve(request(response.config)));
                        refreshToken();
                    }
                    else {
                        ElMessage.error(msg);
                        return Promise.reject(response);
                    }
                }
                else {
                    resolve(data);
                }
            })
        },
        (error) => {
            console.log('error', error);
            const { loading = true } = error.config;
            if (loading) {
                cancelLoading();
            }

            if (error.response) {
                if (error.response.status) {
                    jumpLogin();
                    console.log('登录')
                }
            }
            ElMessage.error(error?.response?.data?.msg || '服务异常');
            return Promise.reject(error);
        }
    )

    return instance;
}