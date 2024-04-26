<template>
  <div class="chartGen-container">
    <el-alert :closable="false" :title="`${this.fileKey}: Chart preview`" />
    <div id="chart-container"></div>
    <hamburger
      :is-active="sideBarStatus"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <el-drawer
      :append-to-body="true"
      :modal-append-to-body="false"
      custom-class="drawer"
      size="40%"
      title="Select chart"
      :visible.sync="sideBarStatus"
      direction="rtl"
    >
      <el-tabs class="chart-tabs" v-model="activeTab" v-if="isListLoaded">
        <el-tab-pane
          v-for="(category, index) in Object.keys(chartPreviewLinks)"
          :label="category"
          :name="category"
        >
          <div
            @click="setChartOption(item.content)"
            class="preview-image"
            v-for="item in chartPreviewLinks[category]"
          >
            <el-image :src="item.link" />
            <p class="demonstration">{{ item.content }}</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
    <el-drawer
      custom-class="drawer"
      size="40%"
      title="Chart customization"
      :visible.sync="customizeChart"
      direction="rtl"
    >
    </el-drawer>
  </div>
</template>
<script>
import { getFileContent } from "@/api/dataSource";
import { getAllChartPreview, getChartOption } from "@/api/chartGen.js";

import Hamburger from "@/components/Hamburger";
import * as echarts from "echarts";

export default {
  name: "chartGen",
  components: {
    Hamburger,
  },
  data() {
    return {
      chart: null,
      activeTab: "lineCharts",
      fileKey: null,
      fileContent: null,
      chartPreviewLinks: null,
      isListLoaded: false,
      sideBarStatus: false,
      customizeChart: false,
      data: null,
    };
  },
  computed: {},
  mounted() {
    this.fileKey = this.$route.params.fileKey;
    this.init();
  },
  methods: {
    async init() {
      let res = await getFileContent({ key: this.fileKey });
      let allChartPreview = await getAllChartPreview();
      this.chartPreviewLinks = allChartPreview.data;
      this.fileContent = res.data;
      this.isListLoaded = true;
      //init echart container
      this.chart = echarts.init(document.getElementById("chart-container"));
    },
    toggleSideBar() {
      this.sideBarStatus = true;
    },
    passChartType(type) {
      console.log(type);
    },
    handleDataSource() {
      return this.fileContent.map((item) => {
        const keys = Object.keys(item);
        return {
          name: item[keys[0]],
          value: item[keys[1]],
        };
      });
    },
    async setChartOption(content) {
      let option = await getChartOption({ chart: content.replace(/ /g, "_") });
      this.customizeChart = true;
    },
  },
};
</script>
<style lang="scss">
.chartGen-container {
  padding: 10px;
}

#chart-container {
  background-color: #e8e8ff;
  flex: 2;
  height: 80vh;
}
.drawer {
  background-color: #f3f4f9;
  .chart-tabs {
    padding: 5px;
    .preview-image {
      padding: 2px;
      width: 180px;
      height: 210px;
      text-align: center;
      cursor: pointer;
      border-radius: 2px;
    }
    .demonstration {
      font-weight: bold;
    }
    .el-tab-pane {
      display: flex;
      flex-wrap: wrap;
    }
    .highlight {
      border-color: blue; /* 高亮颜色 */
    }
  }
}

.hamburger-container {
  line-height: 46px;
  height: 100%;
  float: right;
  cursor: pointer;
  transition: background 0.3s;
  -webkit-tap-highlight-color: transparent;
  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }
}
</style>
