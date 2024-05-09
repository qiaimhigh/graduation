import { createRouter, createWebHashHistory } from "vue-router";
import Home from '../views/home/index.vue'
import { getAccessToken } from "@/utils/storage";

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        redirect: '/index',
        children: [
            {
                path: '/index',
                name: 'index',
                component: () => import('@/views/index/index.vue')
            },
            {
                path: '/deviceList',
                name: 'device list',
                component: () => import('@/views/deviceList/index.vue')
            },
            {
                path: '/userList',
                name: 'user list',
                component: () => import('@/views/userMode/UserList.vue')
            },
            {
                path: '/addDevice',
                name: 'add device item',
                component: () => import('@/views/addDevice/index.vue')
            },
            {
                path: '/self',
                name: 'self page',
                component: () => import('@/views/selfPage/index.vue')
            },
            {
                path: '/repairList',
                name: 'repair device',
                component: () => import('@/views/repairDevice/index.vue')
            },
            {
                path: '/messageList',
                name: 'message list',
                component: () => import('@/views/messageList/index.vue')
            },
            {
                path: '/mobile/records',
                name: 'records list',
                component: () => import('@/views/mobile/recordsList/index.vue')
            },
            {
                path: '/mobile/list',
                name: 'message list',
                component: () => import('@/views/mobile/messageList/index.vue')
            },
            {
                path: '/mobile/add',
                name: 'add list',
                component: () => import('@/views/mobile/addMobile/index.vue')
            }
        ]
    },

    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/login/index.vue')
    },
    {
        path: '/404',
        name: '404',
        component: () => import('@/components/404/index.vue')
    },
    {
        path: '/:pathMatch(.*)',
        redirect: '/404'
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = getAccessToken();
    // TODO: 此处鉴权目前不完整，需要后续完善判断当前的token是否过期（双token验证机制）
    if (to.path === '/login' || token) {
        next();
    } 
    else {
        next({
            path: '/login'
        })
    }
})

export default router;