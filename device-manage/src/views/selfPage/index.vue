<template>
    <div class="profile-container">
        <div class="profile-container__topbg">
            <img src="@/assets/img/xy_logo.png" alt="Top Background" />
            <img src="@/assets/img/xy_topBG.png" alt="Top Background" />
        </div>
        
        <div class="profile-info">
            <div class="profile-image">
                <p class="profile-label">头像</p>
                <img src="@/assets/img/img.jpg" alt="Profile Photo" />
            </div>
            <div class="profile-image">
                <p class="profile-label">账号</p>
                <p class="profile-show-text">{{ user.userName }}</p>
            </div>
            <div class="profile-image">
                <p class="profile-label">姓名</p>
                <p class="profile-show-text">{{ user.name }}</p>
            </div>
            <div class="profile-image">
                <p class="profile-label">学院</p>
                <p class="profile-show-text">{{ user.college }}</p>
            </div>
            <div class="profile-image">
                <p class="profile-label">邮箱</p>
                <p class="profile-show-text">{{ user.email }}</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user';

const user = useUserStore();
console.log(user);
</script>

<style scoped lang="scss">
.profile-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    /* justify-content: center; */

    &__topbg {
        width: 100%;
        height: 120px;
        display: flex;
        justify-content: space-between;
        background-color: #014a95;

        img {
            object-fit: scale-down;
        }
    }

    .profile-info {
        width: 100%;
        padding: 20px;

        .profile-image {
            display: flex;
            justify-content: flex-start;
            align-items: center;

            .profile-label {
                width: 80px;
                min-height: 60px;
                font-size: 16px;
                color: #0c0c0c;
                text-align: center;
                line-height: 60px;
                font-weight: 600;
            }

            .profile-show-text {
                width: 100%;
                height: 60px;
                line-height: 60px;
                margin-left: 20px
            }

            img {
                width: 60px;
                height: 60px;
                object-fit: scale-down;
                border-radius: 50%;
                margin-left: 20px;
                cursor: pointer;
            }
        }
    }
}

</style>