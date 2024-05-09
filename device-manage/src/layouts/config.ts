export const sideBarData = [
    {
        icon: 'Odometer',
        index: '/index',
        title: '系统首页',
        permiss: '1',
    },
    {
        icon: 'Calendar',
        index: '1',
        title: '用户管理',
        permiss: '2',
        subs: [
            {
                index: '/userList',
                title: '用户列表',
                permiss: '2',
            },
            {
                index: '/import',
                title: '使用时长',
                permiss: '2',
            },
            {
                index: '/export',
                title: '用户',
                permiss: '2',
            },
        ],
    },
    {
        icon: 'DocumentCopy',
        index: '/deviceList',
        title: '设备列表',
        permiss: '3',
    },
    {
        icon: 'DocumentCopy',
        index: '/addDevice',
        title: '新增设备',
        permiss: '4',
    },
    {
        icon: 'DocumentCopy',
        index: '/repairList',
        title: '故障设备',
        permiss: '5',
    },
    {
        icon: 'DocumentCopy',
        index: '/messageList',
        title: '留言列表',
        permiss: '6',
    },
    {
        icon: 'Calendar',
        index: '7',
        title: '移动设备',
        permiss: '2',
        subs: [
            {
                index: '/mobile/list',
                title: '设备列表',
                permiss: '8',
            },
            {
                index: '/mobile/records',
                title: '借用记录',
                permiss: '9',
            },
            {
                index: '/mobile/add',
                title: '新增设备',
                permiss: '11',
            },
        ],
    },
    {
        icon: 'User',
        index: '/self',
        title: '个人中心',
        permiss: '10'
    }
];


// {
//     icon: 'Edit',
//     index: '3',
//     title: '表单相关',
//     permiss: '4',
//     // subs: [
//     //     {
//     //         index: '/form',
//     //         title: '基本表单',
//     //         permiss: '5',
//     //     },
//     //     {
//     //         index: '/upload',
//     //         title: '文件上传',
//     //         permiss: '6',
//     //     },
//     //     {
//     //         index: '4',
//     //         title: '三级菜单',
//     //         permiss: '7',
//     //         subs: [
//     //             {
//     //                 index: '/editor',
//     //                 title: '富文本编辑器',
//     //                 permiss: '8',
//     //             },
//     //             {
//     //                 index: '/markdown',
//     //                 title: 'markdown编辑器',
//     //                 permiss: '9',
//     //             },
//     //         ],
//     //     },
//     // ],
// },