<template>
  <div class="chartGen-container">
    <el-alert :closable="false" title="Chart Preview" />
    <div class="container">
      <div id="chart-container"></div>
      <div class="chart-selection" v-if="isListLoaded">
        <el-tabs type="card" class="demo-tabs" v-model="activeTab">
          <el-tab-pane
            v-for="(category, index) in Object.keys(chartPreviewLinks)"
            :label="category"
            :name="category"
          >
            <div
              class="preview-image"
              v-for="item in chartPreviewLinks[category]"
            >
              <el-image :src="item.link" fit="fill" />
              <span class="demonstration">{{ item.content }}</span>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import { getFileContent, getAllChartPreview } from "@/api/dataSource";
export default {
  name: "chartGen",
  data() {
    return {
      activeTab: "lineCharts",
      fileKey: null,
      fileContent: null,
      chartPreviewLinks: null,
      isListLoaded: false,
    };
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
      console.log(this.chartPreviewLinks.lineCharts);
      this.fileContent = res.data;
      this.isListLoaded = true;
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
  background-color: green;
  height: 100vh;
  flex: 2;
}

.chart-selection {
  height: 100vh;
  flex: 0.5;
}
.preview-image {
  text-align: center;
  border-radius: 25px;
  border: 2px #336699 solid;
  cursor: pointer;
}
</style>
