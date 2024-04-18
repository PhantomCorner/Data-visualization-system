<template>
  <div class="chartGen-container">
    <el-alert :closable="false" title="Chart Preview" />
    <div class="container">
      <div id="chart-container">
        <hamburger
          :is-active="sideBarStatus"
          class="hamburger-container"
          @toggleClick="toggleSideBar"
        />
      </div>
      <el-drawer
        title="Select chart"
        :visible.sync="sideBarStatus"
        direction="rtl"
      >
        <el-tabs
          type="card"
          class="demo-tabs"
          v-model="activeTab"
          v-if="isListLoaded"
        >
          <el-tab-pane
            v-for="(category, index) in Object.keys(chartPreviewLinks)"
            :label="category"
            :name="category"
          >
            <div
              class="preview-image"
              v-for="item in chartPreviewLinks[category]"
            >
              <el-image style="width: 180px; height: 180px" :src="item.link" />
              <span class="demonstration">{{ item.content }}</span>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-drawer>
    </div>
  </div>
</template>
<script>
import { getFileContent, getAllChartPreview } from "@/api/dataSource";
import Hamburger from "@/components/Hamburger";

export default {
  name: "chartGen",
  components: {
    Hamburger,
  },
  data() {
    return {
      activeTab: "lineCharts",
      fileKey: null,
      fileContent: null,
      chartPreviewLinks: null,
      isListLoaded: false,
      sideBarStatus: false,
    };
  },
  computed: {
    chart_selection() {},
  },
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
    },
    toggleSideBar() {
      this.sideBarStatus = true;
      // this.chart_selection;
    },
  },
};
</script>
<style lang="scss">
.chartGen-container {
  padding: 10px;
}
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#chart-container {
  background-color: #e8e8ff;
  height: 100vh;
  flex: 2;
}

.preview-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  text-align: center;
  border-radius: 25px;
  border: 2px #336699 solid;
  cursor: pointer;
}
.demonstration {
  font-weight: bold;
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
