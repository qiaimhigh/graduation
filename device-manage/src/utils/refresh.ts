import { getRefershToken, setAccessToken, setRefershToken, removeRefershToken } from "./storage";
import request from "@/server";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

// 防止多次请求刷新token
const subsequent: any[] = [];
let flag = false;
const router = useRouter();

/**
 * 在刷新token的时候，可能存在过期的请求，故需对过期的请求进行处理
 */
export const addRequest = (request: any) => {
    subsequent.push(request);
}

/**
 * 调用过期的请求
 */
export const retryRequest = () => {
    subsequent.forEach(request => request())
    subsequent.length = 0;
}

/**
 * 刷新token
 */
export const refreshToken = () => {
    if (!flag) {
        flag = true;
        const refresh_token = getRefershToken();
        if (refresh_token) {
            request.get('/refresh', { headers: { 'refresh': refresh_token } })
                .then((res) => {
                    const { code, msg, data } = res.data;
                    if (code === 200) {
                        flag = false;
                        setAccessToken(data.accessToken);
                        setRefershToken(data.refreshToken);
                    }
                    else if (code === 401) {
                        flag = false;
                        router.push('/login');
                        ElMessage.error(msg || 'xxxxxx');
                        removeRefershToken();
                    }
                })
        }
    }
}