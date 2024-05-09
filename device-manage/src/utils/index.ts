import { useRouter } from "vue-router";

const router = useRouter();

/**
 * 跳转登录
 */
export const jumpLogin = () => {
    router.push('/');
}