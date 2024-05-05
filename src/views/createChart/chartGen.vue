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
          <!-- Datasource fields conetnt -->
          <div class="fields">
            <div class="col-3">
              <h3>Fields</h3>
              <draggable
                :disabled="chartType == null"
                ghostClass="ghost"
                chosenClass="chosen"
                animation="300"
                class="list-group_dataSource_Fields"
                :list="fieldsList"
                :group="dataSourceField"
                @end="draggableOnChange"
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
                :disabled="chartType == null"
                class="list-group_dataSource_Data"
                :list="dataList"
                :group="dataSourceField"
                @end="draggableOnChange"
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
                class="list-group_chartOption_Fields"
                :list="chartSeries"
                :group="chartOptionField"
                @end="draggableOnChange"
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
                class="list-group_chartOption_Data"
                :list="chartData"
                :group="chartOptionField"
                @end="draggableOnChange"
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
          <div
            style="display: flex; align-items: center"
            v-if="chartOption != null"
          >
            <el-link
              type="primary"
              @click="uploadChart"
              v-if="chartOption != null"
              >Submit</el-link
            >
            <el-link type="success" @click="resetChart">Reset</el-link>
          </div>
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
import { chartOption } from "./chartOption";

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
      chartType: null,
      chartOption: null,
      activeTab: "lineCharts",
      fileKey: null,
      fileContent: null,
      chartPreviewLinks: null,
      isListLoaded: false,
      selectedDiv: null,
      // data source content
      fieldsList: [],
      dataList: [],
      // chart option content
      chartSeries: [],
      chartData: [],
      // draggable group setting
      dataSourceField: {
        pull: "clone",
        put: false,
      },
      chartOptionField: {
        pull: true,
        put: true,
      },
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
    /* Sort data source content */
    handleDataSource() {
      let stringFields = [];
      let numberFields = [];
      function findOrCreateField(fieldsList, fieldName) {
        let field = fieldsList.find((item) => item.fieldName === fieldName);
        if (!field) {
          field = { fieldName: fieldName, values: [] };
          fieldsList.push(field);
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
      // console.log(this.fieldsList);
      // console.log(this.dataList);
    },
    /* Set chart option  */
    async setChartOption(chartType, index) {
      this.chartType = chartType;
      console.log(chartType);
      this.selectedDiv = index;
      let option = await getChartOption({
        chart: chartType.replace(/ /g, "_"),
      });
      option = option.data;
      this.chartOption = option;
      console.log(option);
      this.chartSeries = [];
      this.chartData = [];
      this.chart.clear();
    },
    /* Pass chart detail */
    async uploadChart() {
      await passChartDetail({
        chartOption: this.chartOption,
        // generate a randoom suffix
        chartName: `${this.chartName}_${(Math.random() + 1)
          .toString(36)
          .substring(4)}`,
      });
      this.$message.success("Chart Uploaded");
    },
    /* If user dragged different field, try to render the chart */
    draggableOnChange(e) {
      let from = e.from.className;
      let to = e.to.className;
      let content = e.item.innerText;
      // console.log(from, "->", to, ":", content);

      function getValuesByFieldName(fieldsList, fieldName) {
        // console.log(fieldsList, fieldName);
        const field = fieldsList.find((item) => item.fieldName === fieldName);
        return field ? field.values : null;
      }

      /* Render for line chart */
      if (this.activeTab == "lineCharts") {
        if (
          from == "list-group_dataSource_Fields" &&
          to == "list-group_chartOption_Fields"
        ) {
          this.chartOption.xAxis.data = getValuesByFieldName(
            this.fieldsList,
            content
          );
          this.chart.setOption(this.chartOption, true);
        }
        if (
          from == "list-group_dataSource_Data" &&
          to == "list-group_chartOption_Data"
        ) {
          this.chartOption.series[0].data = getValuesByFieldName(
            this.dataList,
            content
          );
          this.chart.setOption(this.chartOption, true);
        }
      }
      /* Render option for bar charts */
      if (this.activeTab == "barCharts") {
        if (
          from == "list-group_dataSource_Fields" &&
          to == "list-group_chartOption_Fields"
        ) {
          // remove duplicates
          this.chartOption.xAxis.data = [
            ...new Set(getValuesByFieldName(this.fieldsList, content)),
          ];

          this.chart.setOption(this.chartOption, true);
        }
        if (
          from == "list-group_dataSource_Data" &&
          to == "list-group_chartOption_Data"
        ) {
          // remove duplicates
          // this.chartOption.series[0].data = [
          //   ...new Set(getValuesByFieldName(this.dataList, content)),
          // ];
          this.chartOption.series[0].data = getValuesByFieldName(
            this.dataList,
            content
          );
          this.chart.setOption(this.chartOption, true);
        }
      }
      if (this.activeTab == "pieCharts") {
        //    data: [
        //   { value: 1048, name: 'Search Engine' },
        //   { value: 735, name: 'Direct' },
        //   { value: 580, name: 'Email' },
        //   { value: 484, name: 'Union Ads' },
        //   { value: 300, name: 'Video Ads' }
        // ],
        if (
          from == "list-group_dataSource_Fields" &&
          to == "list-group_chartOption_Fields"
        ) {
          this.chart.setOption(this.chartOption, true);
        }
        if (
          from == "list-group_dataSource_Data" &&
          to == "list-group_chartOption_Data"
        ) {
          this.chartOption.series[0].data = this.retainProperties(
            this.chartSeries[0].fieldName,
            this.chartData[0].fieldName
          );
          this.chart.setOption(this.chartOption, true);
        }
      }
      console.log(this.chartOption);
    },
    /* Reset chart option and field content */
    resetChart() {
      this.$confirm("Are you sure you want to reset the chart?", "Warning", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning",
      })
        .then(() => {
          this.chartType = null;
          this.chartOption = null;
          this.chart.clear();
        })
        .catch(() => {
          this.$message.warning(`Reset cancelled`);
        });
    },
    retainProperties(prop1, prop2) {
      console.log(prop1, prop2);
      let arr = this.fileContent;
      return arr.map((obj) => {
        return {
          name: obj[prop1],
          value: obj[prop2],
        };
      });
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
        display: flex;
        -ms-flex-direction: column;
        -webkit-box-orient: vertical;
        -webkit-box-direction: normal;
        flex-direction: column;
        padding-left: 0;
        margin-bottom: 0;
        &_dataSource_Data,
        &_dataSource_Fields,
        &_chartOption_Data,
        &_chartOption_Fields {
          background-color: #dfeaf8;
          .list-group-item {
            position: relative;
            display: block;
            padding: 0.75rem 1.25rem;
            margin-bottom: -1px;
            background-color: #fff;
            border: 1px solid rgba(0, 0, 0, 0.125);
            cursor: move;
          }
        }
      }
      .drag {
        background-color: blue !important;
        border: solid 3px red;
      }
      .chosen {
        background-color: #000 !important;
        color: #fff;
      }
      .ghost {
        background-color: red !important;
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
