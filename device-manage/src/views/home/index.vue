<template>
    <HeaderCom></HeaderCom>
    <SideBar></SideBar>
    <div class="main-container" :class="{'main-collapse': sidebar.collapse}">
        <RouterView v-slot="{ Component }">
            <Transition>
                <keep-alive>
                    <component :is="Component"></component>
                </keep-alive>
            </Transition>
        </RouterView>
    </div>
</template>

<script lang="ts" setup>
import HeaderCom from '../../layouts/HeaderCom.vue'
import SideBar from '../../layouts/SideBar.vue';
import { useSidebarStore } from '../../store/sidebar'

const sidebar = useSidebarStore();
</script>

<style>
</style>