import { defineStore } from 'pinia'

interface UserInfo {
	userName: string;
    name: string;
    email: string;
    college: string;
}

export const useUserStore = defineStore('user', {
	state: () => {
		return {
			userName: '',
            name: '',
            email: '',
            college: ''
		};
	},
	getters: {},
	actions: {
		setUserInfo(userInfo: UserInfo) {
			this.userName = userInfo.userName;
            this.name = userInfo.name;
            this.email = userInfo.email;
            this.college = userInfo.college;
		}
	},
    // 开启数据持久化
    persist: true
});
