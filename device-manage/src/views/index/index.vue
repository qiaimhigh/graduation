<template>
    <div class="index-container">
        <div class="index-container__header">
            <div class="info-card">
                <img src="@/assets/img/device.svg" class="card-logo"/>
                <div class="text">
                    <p>所有设备</p>
                    <p class="color-text">{{ initData.totalDeviceCount }}台</p>
                </div>
            </div>
            <div class="dividing-line"></div>
            <div class="info-card">
                <img src="@/assets/img/user.svg" class="card-logo"/>
                <div class="text">
                    <p>所有用户</p>
                    <p class="color-text">{{ initData.userCount }}人</p>
                </div>
            </div>
            <div class="dividing-line"></div>
            <div class="info-card">
                <img src="@/assets/img/repair.svg" class="card-logo"/>
                <div class="text">
                    <p>损坏设备</p>
                    <p class="color-text">{{ initData.recordsCount }}台</p>
                </div>
            </div>
            <div class="dividing-line"></div>
            <div class="info-card">
                <img src="@/assets/img/using.svg" class="card-logo"/>
                <div class="text">
                    <p>正在使用</p>
                    <p class="color-text">{{ initData.ideviceCount }} 台</p>
                </div>
            </div>
        </div>
        <p class="echart-title">各学院七天内使用设备记录</p>
        <v-chart class="chart" :option="lineOptions" />
        <v-chart class="chart2" :option="collegeOptions" />
    </div> 
    
    
</template>
  
<script setup>
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { ref, provide, onMounted } from "vue";
import { initAPI } from '@/server/device';



const initData = ref({})
use([
  CanvasRenderer,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent
]);

// provide(THEME_KEY, "dark");

const option = ref({
  title: {
    text: "Traffic Sources",
    left: "center"
  },
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b} : {c} ({d}%)"
  },
  legend: {
    orient: "vertical",
    left: "left",
    data: ["Direct", "Email", "Ad Networks", "Video Ads", "Search Engines"]
  },
  series: [
    {
      name: "Traffic Sources",
      type: "pie",
      radius: "55%",
      center: ["50%", "60%"],
      data: [
        { value: 335, name: "Direct" },
        { value: 310, name: "Email" },
        { value: 234, name: "Ad Networks" },
        { value: 135, name: "Video Ads" },
        { value: 1548, name: "Search Engines" }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)"
        }
      }
    }
  ]
});

// 各学院在一周内的设备使用次数统计
const lineOptions = ref({
//   title: {
//     text: '学院七天内使用设备记录',
//   },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    type: 'scroll',
    data: ['计算机学院', '网络空间安全', '电子工程学院', '自动化学院', '通信与信息工程学院', '人文与外国语学院', '理学院', '经济与管理学院', '体育部']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  toolbox: {
    feature: {
      saveAsImage: {}
    }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '计算机学院',
      type: 'line',
      stack: 'Total',
      data: [120, 132, 101, 134, 90, 230, 210]
    },
    {
      name: '网络空间安全',
      type: 'line',
      stack: 'Total',
      data: [220, 182, 191, 234, 290, 330, 310]
    },
    {
      name: '电子工程学院',
      type: 'line',
      stack: 'Total',
      data: [150, 232, 201, 154, 190, 330, 410]
    },
    {
      name: '自动化学院',
      type: 'line',
      stack: 'Total',
      data: [320, 332, 301, 334, 390, 330, 320]
    },
    {
      name: '通信与信息工程学院',
      type: 'line',
      stack: 'Total',
      data: [820, 932, 901, 934, 1290, 1330, 1320]
    },
    {
      name: '人文与外国语学院',
      type: 'line',
      stack: 'Total',
      data: [820, 932, 901, 934, 1290, 1330, 1320]
    },
    {
      name: '理学院',
      type: 'line',
      stack: 'Total',
      data: [820, 932, 901, 934, 1290, 1330, 1320]
    },
    {
      name: '经济与管理学院',
      type: 'line',
      stack: 'Total',
      data: [820, 932, 901, 934, 1290, 1330, 1320]
    },
    {
      name: '体育部',
      type: 'line',
      stack: 'Total',
      data: [820, 932, 901, 934, 1290, 1330, 1320]
    }
  ]
})

// 学生柱状图--统计各学院有多少用户在使用
const collegeOptions = ref({
    title: {
        text: '各学院学生使用情况',
    },
    tooltip: {
        trigger: 'axis',
    },
    xAxis: {
        type: 'category',
        data: ['计算机学院', '\n网络空间安全', '电子工程学院', '\n自动化学院', '通信与信息工程学院', '\n人文与外国语学院', '理学院', '\n经济与管理学院', '体育部'],
        nameTextStyle: {
            fontSize: 10
        },
        axisLabel: {
    		interval: 0
    	}
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            data: [120, 200, 150, 80, 70, 110, 130, 120, 130],
            type: 'bar',
            barWidth: 40
        }
    ]
})

onMounted(() => {
  initAPI()
    .then((res) => {
      const { code, data } = res
      if (code === 200) {
        initData.value = data || {};
      }
      else {
        ElMessage.error('获取数据失败， 请刷新重试')
      }
    })
})
</script>
  
<style scoped lang="scss">

    .index-container {
        width: 100%;

        &__header {
            display: flex;
            align-items: center;
            width: 100%;
            justify-content: space-around;
            margin-bottom: 10px;

            .info-card {
                width: 160px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: space-between;

                .card-logo {
                    width: 50px;
                    height: 50px;
                    object-fit: scale-down;
                }

                .text {
                    font-size: 16px;
                    font-weight: 500;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                }

                .color-text {
                    font-size: 24px;
                    color: green;
                }

                .content {
                    font-size: 20px;
                    font-weight: 600;
                    text-align: center;
                }
            }
        }

        &__body {
            width: 100%;

            
        }

        .dividing-line {
            width: 0;
            height: 70px;
            border: 1.5px solid #324157;
            margin: 0 10px;
        }
    }
    .chart {
        width: 100%;
        height: 500px;
    }
    .chart2 {
        width: 100%;
        height: 320px;
    }
    .echart-title {
        font-size: 20px;
        font-weight: 600;
        margin: 10px;
    }

</style>