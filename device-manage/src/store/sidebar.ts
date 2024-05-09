import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
	state: () => {
		return {
			collapse: false,
			totalUserMsgNum: 0,
			totalRepairMsgNum: 0,
		};
	},
	getters: {},
	actions: {
		handleCollapse() {
			this.collapse = !this.collapse;
		},
		setTotalUserMsgNum(num: number) {
			this.totalUserMsgNum = num;
		},
		setTotalRepairMsgNum(num: number) {
			this.totalRepairMsgNum = num;
		}
	}
});
