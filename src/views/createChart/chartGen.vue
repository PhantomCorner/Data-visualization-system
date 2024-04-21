<template>
  <div class="chartGen-container">
    <el-alert :closable="false" title="Chart Preview" />
    <div id="chart-container">
      <hamburger
        :is-active="sideBarStatus"
        class="hamburger-container"
        @toggleClick="toggleSideBar"
      />
    </div>
    <el-drawer
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
            @click="passChartType(item.content)"
            class="preview-image"
            v-for="item in chartPreviewLinks[category]"
          >
            <el-image :src="item.link" />
            <p class="demonstration">{{ item.content }}</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>
<script>
import { getFileContent, getAllChartPreview } from "@/api/dataSource";
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
      let chart = echarts.init(document.getElementById("chart-container"));
    },
    toggleSideBar() {
      this.sideBarStatus = true;
    },
    passChartType(type) {
      console.log(type);
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
      width: 210px;
      height: 210px;
      text-align: center;
      cursor: pointer;
    }
    .demonstration {
      font-weight: bold;
    }
    .el-tab-pane {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
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
