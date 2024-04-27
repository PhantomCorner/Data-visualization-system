<template>
  <div class="chartGen-container">
    <el-container>
      <el-aside width="300px">
        <div class="file">
          <p style="font-weight: bold">Data source</p>
          <svg
            class="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fill-rule="evenodd"
              d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Z"
              clip-rule="evenodd"
            />
          </svg>
          {{ this.fileKey }}
        </div>
        <div class="fileContent">
          <!-- Datasource conetnt -->
          <div class="fields">
            <div class="col-3">
              <h3>Fields</h3>
              <draggable
                class="list-group"
                :list="fieldsList"
                group="people"
                @change="log"
              >
                <div
                  class="list-group-item"
                  v-for="(element, index) in fieldsList"
                  :key="element.fieldName"
                >
                  {{ element.fieldName }}
                </div>
              </draggable>
            </div>
            <div class="col-3">
              <h3>Data</h3>
              <draggable
                class="list-group"
                :list="dataList"
                group="people"
                @change="log"
              >
                <div
                  class="list-group-item"
                  v-for="(element, index) in dataList"
                  :key="element.fieldName"
                >
                  {{ element.fieldName }}
                </div>
              </draggable>
            </div>
          </div>
          <!-- Chart option -->
          <div class="fields">
            <div class="col-3">
              <h3>Chart Fields</h3>
              <draggable
                class="list-group"
                :list="chartSeries"
                group="people"
                @change="log"
              >
                <div
                  class="list-group-item"
                  v-for="(element, index) in chartSeries"
                  :key="element.fieldName"
                >
                  {{ element.fieldName }}
                </div>
              </draggable>
            </div>
            <div class="col-3">
              <h3>Chart Data</h3>
              <draggable
                class="list-group"
                :list="chartData"
                group="people"
                @change="log"
              >
                <div
                  class="list-group-item"
                  v-for="(element, index) in chartData"
                  :key="element.fieldName"
                >
                  {{ element.fieldName }}
                </div>
              </draggable>
            </div>
          </div>
        </div>
      </el-aside>
      <el-main>
        <div class="description">
          <el-input v-model="chartName" placeholder="Chart"></el-input>
          <el-link
            type="success"
            @click="uploadChart"
            v-if="chartOption != null"
            >Submit</el-link
          >
        </div>

        <div id="chart-container"></div>
      </el-main>
      <el-aside width="200px">
        <el-tabs
          class="chart-tabs"
          v-model="activeTab"
          v-if="isListLoaded"
          @tab-click="selectedDiv = null"
        >
          <el-tab-pane
            v-for="category in Object.keys(chartPreviewLinks)"
            :label="category"
            :name="category"
          >
            <div
              v-for="(item, index) in chartPreviewLinks[category]"
              @click="setChartOption(item.content, index)"
              class="preview-image"
              :class="{ 'selected-preview-image': selectedDiv == index }"
            >
              <el-image :src="item.link" />
            </div> </el-tab-pane
        ></el-tabs>
      </el-aside>
    </el-container>
  </div>
</template>
<script>
import { getFileContent } from "@/api/dataSource";
import {
  getAllChartPreview,
  getChartOption,
  passChartDetail,
} from "@/api/chartGen.js";
import draggable from "vuedraggable";

import Hamburger from "@/components/Hamburger";
import * as echarts from "echarts";

export default {
  name: "chartGen",
  components: {
    Hamburger,
    draggable,
  },
  data() {
    return {
      chart: null,
      chartName: "New chart",
      chartOption: null,
      activeTab: "lineCharts",
      fileKey: null,
      fileContent: null,
      chartPreviewLinks: null,
      isListLoaded: false,
      sideBarStatus: false,
      customizeChart: false,
      data: null,
      selectedDiv: 0,
      // data source content
      fieldsList: [],
      dataList: [],
      // chart option content
      chartSeries: [],
      chartData: [],
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
      this.fileContent = res.data;
      let allChartPreview = await getAllChartPreview();
      this.chartPreviewLinks = allChartPreview.data;
      this.isListLoaded = true;
      //init echart container
      this.chart = echarts.init(document.getElementById("chart-container"));
      this.handleDataSource();
    },
    toggleSideBar() {
      this.sideBarStatus = true;
    },
    passChartType(type) {
      console.log(type);
    },
    /* Sort data source content */
    handleDataSource() {
      // return
      let stringFields = [];
      let numberFields = [];
      function findOrCreateField(fieldList, fieldName) {
        let field = fieldList.find((item) => item.fieldName === fieldName);
        if (!field) {
          field = { fieldName: fieldName, values: [] };
          fieldList.push(field);
        }
        return field;
      }
      this.fileContent.forEach((item) => {
        Object.entries(item).forEach(([key, value]) => {
          if (typeof value === "string") {
            let field = findOrCreateField(stringFields, key);
            field.values.push(value);
          } else if (typeof value === "number") {
            let field = findOrCreateField(numberFields, key);
            field.values.push(value);
          }
        });
      });
      this.fieldsList = stringFields;
      this.dataList = numberFields;
      console.log(this.fieldsList[0]);
      console.log(this.dataList);
    },
    /* Set chart option  */
    async setChartOption(content, index) {
      this.selectedDiv = index;
      let option = await getChartOption({ chart: content.replace(/ /g, "_") });
      option = option.data;
      option.xAxis.data = this.fieldsList[0].values;
      option.series[0].data = this.dataList[0].values;
      this.chartOption = option;
      this.chart.setOption(this.chartOption, true);
    },
    /* Pass chart detail */
    async uploadChart() {
      let res = passChartDetail({
        chartOption: this.chartOption,
        chartName: `${this.chartName}_${(Math.random() + 1)
          .toString(36)
          .substring(4)}`,
      });
      console.log(res);
    },
    log: function (evt) {
      window.console.log(evt);
    },
  },
};
</script>
<style lang="scss">
.chartGen-container {
  background-color: #f6f8fa;
  height: calc(100vh - 90px);
  .el-main {
    background-color: #e9eef3;
    color: #333;
    text-align: center;
    padding: 0;
    #chart-container {
      background-color: #ffffff;
      flex: 2;
      height: calc(100vh - 90px);
    }
    .description {
      display: flex;
      justify-content: space-between;
      .el-input {
        width: 180px;
      }
      .el-input__inner {
        background-color: #e9eef3;
        border-top-width: 0px;
        border-left-width: 0px;
        border-right-width: 0px;
        border-bottom-width: 1px;
        /*outline: medium;*/
      }
      .el-link {
        padding-right: 6px;
      }
    }
  }
  .el-aside {
    .chart-tabs {
      padding: 5px;
      .preview-image {
        // padding: 2px;
        width: 180px;
        // height: 210px;
        text-align: center;
        cursor: pointer;
      }
      .selected-preview-image {
        // padding: 2px;
        width: 180px;
        // height: 210px;
        text-align: center;
        cursor: pointer;
        background: skyblue;
      }
      .demonstration {
        font-weight: bold;
      }
      .el-tab-pane {
        display: flex;
        flex-wrap: wrap;
      }
    }
    .file {
      border-bottom: 1px solid;
    }
    .fields {
      display: flex;
      justify-content: space-around;
      .list-group {
        display: -ms-flexbox;
        display: -webkit-box;
        display: flex;
        -ms-flex-direction: column;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        flex-direction: column;
        padding-left: 0;
        margin-bottom: 0;
        .list-group-item {
          position: relative;
          display: block;
          padding: 0.75rem 1.25rem;
          margin-bottom: -1px;
          background-color: #fff;
          border: 1px solid rgba(0, 0, 0, 0.125);
        }
      }
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
