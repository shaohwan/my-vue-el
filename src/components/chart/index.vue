<template>
  <div class="dashboard-container">
    <el-row :gutter="16" class="chart-grid">
      <el-col v-for="(item, index) in chartData" :key="index" :span="24">
        <div class="chart-block">
          <h3>{{ item?.title || `图表 ${index + 1}` }}</h3>
          <div v-if="item && item.labels?.length" class="chart-wrapper">
            <v-chart :option="chartOptions[index]" autoresize />
          </div>
          <div v-else class="chart-placeholder">加载中...</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.chart-grid {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chart-block {
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chart-wrapper {
  flex: 1;
  height: 100%;
  width: 100%;
}
.chart-wrapper :deep(.v-chart) {
  width: 100% !important;
  height: 100% !important;
}
.chart-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  font-size: 14px;
}
h3 {
  font-size: 16px;
  margin-bottom: 8px;
  text-align: center;
  color: #000;
}
:deep(.el-col) {
  height: 50%;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { ElRow, ElCol } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import service from '@/utils/request'

use([
  CanvasRenderer,
  BarChart,
  PieChart,
  LineChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
])

const chartData = ref([null, null])
const chartOptions = ref([{}, {}])

const generateColors = (count) => {
  const colors = ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC', '#26C6DA']
  return Array.from({ length: count }, (_, i) => colors[i % colors.length])
}

const fetchChartData = async (index) => {
  const response = await service.get('/api/chart', {
    params: { chartId: index + 1 },
  })
  chartData.value[index] = {
    title: response.title || '',
    chartType: response.chartType || 'bar',
    labels: response.labels || [],
    series: response.series || [],
  }
  updateChart(index)
}

const updateChart = (index) => {
  if (!chartData.value[index] || !chartData.value[index].labels.length) {
    chartOptions.value[index] = {}
    return
  }

  const { chartType, labels, series } = chartData.value[index]
  const isPie = chartType === 'pie'

  if (isPie) {
    // 饼图逻辑
    const data =
      series.length > 0
        ? series[0].data.map((value, i) => ({
            value,
            name: labels[i],
          }))
        : []
    chartOptions.value[index] = {
      tooltip: { trigger: 'item' },
      legend: {
        top: '5%',
        textStyle: { color: '#000', fontSize: 12 },
      },
      series: [
        {
          type: 'pie',
          data,
          itemStyle: {
            borderWidth: 0,
          },
        },
      ],
    }
  } else {
    // 柱状图或折线图
    const seriesData = series.map((serie, serieIndex) => ({
      name: serie.name,
      type: chartType,
      data: serie.data,
      stack: 'total', // 保持堆叠柱状图
      itemStyle: {
        color: generateColors(series.length)[serieIndex],
        borderWidth: 0,
      },
      ...(chartType === 'line' ? { smooth: true } : {}),
    }))

    chartOptions.value[index] = {
      tooltip: { trigger: 'axis' },
      legend: {
        top: '5%',
        textStyle: { color: '#000', fontSize: 12 },
      },
      series: seriesData,
      xAxis: {
        data: labels,
        axisLabel: { color: '#000', fontSize: 12 },
        axisLine: { show: false },
      },
      yAxis: {
        axisLabel: { color: '#000', fontSize: 12 },
        axisLine: { show: false },
        splitLine: { lineStyle: { type: 'dashed', color: '#E8ECEF' } },
      },
      grid: {
        top: '15%', // 增加顶部空间以容纳图例
        bottom: '10%',
        left: '5%',
        right: '5%',
        containLabel: false,
      },
    }
  }
}

onMounted(() => {
  for (let i = 0; i < 2; i++) {
    fetchChartData(i)
  }
})
</script>
