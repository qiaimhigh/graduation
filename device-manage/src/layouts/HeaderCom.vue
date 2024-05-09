<template>
	<div class="header">
		<!-- 折叠按钮 -->
		<div class="collapse-btn" @click="collapseChage">
			<el-icon v-if="sidebar.collapse">
				<Expand />
			</el-icon>
			<el-icon v-else>
				<Fold />
			</el-icon>
		</div>
		<div class="logo">XUPT-实验室设备使用管理平台</div>
		<div class="header-right">
			<div class="header-user-con">
				<!-- 消息中心 -->
				<div class="btn-bell">
					<!-- <el-tooltip
						effect="dark"
						:content="message ? `有${message}条未读消息` : `消息中心`"
						placement="bottom"
					>
						<el-icon><Bell /></el-icon>
					</el-tooltip> -->
					<el-popover placement="bottom" :width="400" trigger="click">
						<template #reference>
							<el-icon>
								<Bell />
							</el-icon>
						</template>
						<div class="message-box">
							<el-tabs v-model="activeName" class="demo-tabs">
								<el-tab-pane name="userMsg">
									<template #label>
										用户留言（未处理）
										<span class="btn-bell-badge" v-if="sidebar.totalUserMsgNum">{{ sidebar.totalUserMsgNum }}</span>
									</template>

									<div class="message-item" v-for="item in userMsgList" :key="item.id"  @click="router.push('/messageList')">
										<div class="message-content ellipsis-text">{{ item.msg || '-' }}</div>
										<div class="message-time">
											<span>{{ item.studentID || '-' }}</span>
											<span>{{ item.msgTime || '-' }}</span>
										</div>
									</div>

								</el-tab-pane>
								<el-tab-pane name="repair">
									<template #label>
										故障上报（未处理）
										<span class="btn-bell-badge btn-bell-badge-repair" v-if="sidebar.totalRepairMsgNum">{{ sidebar.totalRepairMsgNum }}</span>
									</template>
									<div class="message-item" v-for="item in repairList" :key="item.id"  @click="router.push('/repairList')">
										<div class="message-content message-content-repair" @click="() => { }">
											<span>故障设备编号：{{ item.deviceID || '-' }}</span>
											<span class="ellipsis-text">故障描述：{{ item.repairCause || '-'}}</span>
										</div>
										<div class="message-time">
											<span>{{ item.studentID || '-' }}</span>
											<span>{{ item.repairTime || '-' }}</span>
										</div>
									</div>
								</el-tab-pane>
							</el-tabs>
						</div>
					</el-popover>
					<span class="btn-bell-badge" v-if="sidebar.totalUserMsgNum + sidebar.totalRepairMsgNum">{{ sidebar.totalUserMsgNum + sidebar.totalRepairMsgNum }}</span>
				</div>
				<!-- 用户头像 -->
				<el-avatar class="user-avator" :size="30" :src="imgurl" />
				<!-- 用户名下拉菜单 -->
				<el-dropdown class="user-name" trigger="click" @command="handleCommand">
					<span class="el-dropdown-link">
						{{ userStore.userName }}
						<el-icon class="el-icon--right">
							<arrow-down />
						</el-icon>
					</span>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item command="user">个人中心</el-dropdown-item>
							<el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>
		</div>
	</div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useSidebarStore } from '../store/sidebar';
import { useUserStore } from '@/store/user';
import { useRouter } from 'vue-router';
import imgurl from '../assets/img/img.jpg';
import { removeAccessToken, removeRefershToken } from '@/utils/storage';
import { getMessageList } from '@/server/user';
import { getRepairList } from '@/server/device';

// const username: string | null = localStorage.getItem('ms_username')|| 'Richie';
const userStore = useUserStore();
const sidebar = useSidebarStore();
const activeName = ref('userMsg');
// 侧边栏折叠
const collapseChage = () => {
	sidebar.handleCollapse();
};

const userMsgList = ref<any[]>([]);
const repairList = ref<any[]>([]);

onMounted( async () => {
	if (document.body.clientWidth < 1200) {
		collapseChage();
	}
	await getMessageList({ isNeedPage: true, type: 'unhandled' })
		.then((res) => {
			const { code, data } = res;
			if (code == 200) {
				const { userMsgList: useMsgLists } = data;
				userMsgList.value = useMsgLists;
				sidebar.setTotalUserMsgNum(sidebar.totalUserMsgNum + userMsgList.value.length)
				console.log(userMsgList.value);
			}
			else {
				console.log('获取留言列表失败');
			}
		})
		.catch((err) => {
			console.log(err);
		})
	await getRepairList({ isNeedPage: false, type: 'unrepaired' })
		.then((res) => {
			const { code, data } = res;
			if (code == 200) {
				const { deviceList = [] } = data;
				repairList.value = deviceList;
				sidebar.setTotalRepairMsgNum(sidebar.totalRepairMsgNum + repairList.value.length)
			}
			else {
				console.log('获取故障列表失败');
			}
		})
		.catch((err) => {
			console.log(err);
		})
});

// 用户名下拉菜单选择事件
const router = useRouter();
const handleCommand = (command: string) => {
	if (command == 'loginout') {
		removeAccessToken();
		removeRefershToken();
		router.push('/login');
	} else if (command == 'user') {
		router.push('/self');
	}
};
</script>

<style scoped lang="scss">
.header {
	position: relative;
	box-sizing: border-box;
	width: 100%;
	height: 60px;
	font-size: 22px;
	background-color: #fcfafa;
	color: rgb(61, 40, 40);
	box-shadow: 2px 2px 2px #d7d4d4;

	.collapse-btn {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		float: left;
		padding: 0 10px;
		cursor: pointer;
	}

	.logo {
		float: left;
		line-height: 60px;
	}

	.header-right {
		float: right;
		padding-right: 50px;
	}

	.header-user-con {
		display: flex;
		height: 60px;
		align-items: center;

		.btn-fullscreen {
			transform: rotate(45deg);
			margin-right: 5px;
			font-size: 24px;
		}
	}

	.btn-bell,
	.btn-fullscreen {
		position: relative;
		width: 30px;
		height: 30px;
		text-align: center;
		border-radius: 15px;
		cursor: pointer;
		display: flex;
		align-items: center;
	}
}

.el-tab-pane {
	max-height: 400px;
	overflow-y: auto;
}


.message-item {
	width: 100%;
	box-sizing: border-box;
	border-bottom: 1px solid #e6e6e6;
	padding: 10px;
	cursor: pointer;
	// font-family: STFangsong,Tahoma,Helvetica,Arial,'宋体',sans-serif;

	&:hover {
		background: rgb(240, 241, 243);
	}

	.ellipsis-text {
		overflow: hidden;
		text-overflow: ellipsis;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		display: -webkit-box;
	}


	.message-content {
		width: 100%;
		color: #0e0d0d;
		font-size: 14px;

		&-repair {
			display: flex;
			flex-direction: column;
		}
	}

	.message-time {
		width: 100%;
		font-size: 12px;
		color: #2c2121;
		display: flex;
		justify-content: space-between;
		margin-top: 5px;
	}
}



.btn-bell-badge {
	position: absolute;
	right: -2px;
	top: 0px;
	width: 14px;
	height: 14px;
	border-radius: 50%;
	background: #f56c6c;
	color: #fff;
	font-size: 12px;
	display: flex;
	justify-content: center;
	align-items: center;

	&-repair {
		right: -20px;
	}
}

.user-name {
	margin-left: 10px;
}

.user-avator {
	margin-left: 20px;
}

.el-dropdown-link {
	color: #0e0d0d;
	cursor: pointer;
	display: flex;
	align-items: center;
	font-weight: 600;
}

.el-dropdown-menu__item {
	text-align: center;
}
</style>
