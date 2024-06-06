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
        <div class="fileContent" :disabled="chartType == null">
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
                  v-for="element in fieldsList"
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
                  v-for="element in dataList"
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
                  v-for="element in chartSeries"
                  :key="element.fieldName"
                >
                  {{ element.fieldName }}
                  <span
                    class="del"
                    @click="removeDraggable(chartSeries, index)"
                  >
                    <deleteIcon
                  /></span>
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
                  v-for="element in chartData"
                  :key="element.fieldName"
                >
                  {{ element.fieldName }}
                  <span class="del" @click="removeDraggable(chartData, index)">
                    <deleteIcon
                  /></span>
                </div>
              </draggable>
            </div>
          </div>
        </div>
        <!-- Chart customize interface-->
        <div class="fileContent">
          <div class="fields">
            <div class="col-3">
              <h3>Filter</h3>
              <draggable
                ghostClass="ghost"
                chosenClass="chosen"
                animation="300"
                class="list-group_chartOption_Data"
                :list="filterList"
                @add="toggleFilter"
                :group="dataCustomizeField"
              >
                <div
                  @click="showFilter = true"
                  class="list-group-item"
                  v-for="element in filterList"
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
        <!-- Chart container -->
        <div id="chart-container"></div>
      </el-main>
      <el-aside width="200px">
        <el-tabs v-model="activeTab" v-if="isListLoaded" class="chart-tabs">
          <el-tab-pane label="Common types" name="first">
            <div
              v-for="(item, index) in chartPreviewLinks"
              :key="index"
              @click="setChartOption(item.content, index)"
              class="preview-image"
              :class="{ 'selected-preview-image': selectedDiv == index }"
            >
              <div v-html="item.link"></div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-aside>
    </el-container>
    <el-dialog
      v-if="chartOption != null"
      title="Filter setting"
      :visible.sync="showFilter"
      width="50%"
      :destroy-on-close="true"
    >
      <div class="filter-container">
        <div
          class="filter-item"
          v-for="(item, index) in fileContent"
          :key="index"
        >
          <div class="content">
            {{ item[filterTarget] }}
          </div>
          <el-checkbox
            v-model="item.checked"
            @change="filterDataSource(item[filterTarget], $event)"
          ></el-checkbox>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <!-- <el-button type="primary" @click="removeDuplicates"
          >Remove all duplicates</el-button
        > -->
        <el-button type="primary" @click="applyFilter()">Confirm</el-button>
        <el-button @click="showFilter = false">Cancel</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Data sorting" :visible.sync="showSort" width="30%">
      <el-radio-group v-model="sortForm">
        <el-radio-button label="Low to High"></el-radio-button>
        <el-radio-button label="High to Low"></el-radio-button>
      </el-radio-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showSort = false">Cancle</el-button>
        <el-button type="primary" @click="applySort">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getFileContent } from "@/api/dataSource";
import { getToken } from "@/utils/auth";
import {
  getAllChartPreview,
  getChartOption,
  passChartDetail,
} from "@/api/chartGen.js";
import draggable from "vuedraggable";
import * as echarts from "echarts";
import deleteIcon from "@/assets/delete";
import { chartOption } from "./chartOption";
export default {
  name: "chartGen",
  components: {
    draggable,
    deleteIcon,
  },
  data() {
    return {
      chart: null,
      chartName: "New chart",
      chartType: null,
      chartOption: null,
      activeTab: "first",
      fileKey: null,
      fileContent: null,
      chartPreviewLinks: null,
      isListLoaded: false,
      selectedDiv: null,
      // toggle delete button
      showDelete: false,
      // data source content
      fieldsList: [],
      // data customization content
      filterList: [],
      sortList: [],
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
        pull: false,
        put: true,
      },
      dataCustomizeField: {
        pull: false,
        put: true,
      },
      // refresh diaglog content
      refreshDialog: false,
      // toggle data customization window popup
      showFilter: false,
      filterTarget: null,
      sortTarget: null,
      showSort: false,
      sortForm: 1,
      sortTarget: null,
      headers: [],
      stack: [],
    };
  },
  mounted() {
    this.fileKey = this.$route.params.fileKey;
    this.init();
  },
  methods: {
    async init() {
      let res = await getFileContent({ token: getToken(), key: this.fileKey });
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
        // set up checkbox value for filter function
        this.$set(item, "checked", true);
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
    },
    /* Set chart option  */
    async setChartOption(chartType, index) {
      this.chartType = chartType;
      console.log(chartType);
      this.selectedDiv = index;
      let option = await getChartOption({
        chart: chartType.replace(/ /g, "_"),
      });
      this.chartSeries = [];
      this.chartData = [];
      this.sortList = [];
      this.filterList = [];
      this.chart.clear();
      option = option.data;
      this.chartOption = option;
    },
    /* Upload chart to database */
    async uploadChart() {
      await passChartDetail({
        chartOption: this.chartOption,
        // generate a randoom suffix
        // chartName: `${this.chartName}_${(Math.random() + 1)
        //   .toString(36)
        //   .substring(4)}`,
        chartName: this.chartName,
        token: getToken(),
      });
      this.$message.success("Chart Uploaded");
    },
    /* If user dragged field into field list, try to render the chart */
    draggableOnChange(e) {
      let from = e.from.className;
      let to = e.to.className;
      let content = e.item.innerText;

      function getValuesByFieldName(fieldsList, fieldName) {
        // console.log(fieldsList, fieldName);
        const field = fieldsList.find((item) => item.fieldName === fieldName);
        return field ? field.values : null;
      }

      /* Render for line chart */
      if (this.chartType == "Line chart") {
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
      /* Render for area line chart */

      if (this.chartType == "Area chart") {
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
      /* Render option for Histogram charts */
      if (this.chartType == "Histogram") {
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
          this.chartOption.series[0].data = getValuesByFieldName(
            this.dataList,
            content
          );
          this.chart.setOption(this.chartOption, true);
        }
      }
      /* Render option for pie charts */
      if (this.chartType == "Pie chart") {
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
      if (this.chartType == "Rectangular tree diagram") {
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
        }
        this.chart.setOption(this.chartOption, true);
      }
      /* Render option for Bar chart */
      if (this.chartType == "Bar graph") {
        if (
          from == "list-group_dataSource_Fields" &&
          to == "list-group_chartOption_Fields"
        ) {
          // remove duplicates
          this.chartOption.yAxis.data = [
            ...new Set(getValuesByFieldName(this.fieldsList, content)),
          ];
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
      console.log(this.chartOption);
    },
    toggleFilter(e) {
      this.filterTarget = e.item.innerText;
      this.showFilter = true;
    },
    toggleSort(e) {
      this.sortTarget = e.item.innerText;
      this.showSort = true;
    },
    applyFilter() {
      this.chart.setOption(this.chartOption, true);
      this.showFilter = false;
    },
    applySort() {
      console.log(this.sortForm);
      this.showSort = false;
    },
    // content & checkbox status
    // false = unselected
    // true = selected
    filterDataSource(conetnt, e) {
      let removeObjectsByKeyValue = (value) => {
        return this.chartOption.series[0].data.filter(
          (obj) => obj.name !== value
        );
      };
      function removeValueBySubscript(arrA, arrB, element) {
        const index = arrA.indexOf(element);
        arrA.splice(index, 1);
        arrB.splice(index, 1);
        console.log(element, arrA, arrB);
        return { arrA, arrB };
      }
      // if remove
      if (e == false) {
        // push a copy of chart option to stack
        this.stack.push(JSON.parse(JSON.stringify(this.chartOption)));
        if (
          ["Histogram", "Line chart", "Area chart"].includes(this.chartType)
        ) {
          let splice = removeValueBySubscript(
            this.chartOption.xAxis.data,
            this.chartOption.series[0].data,
            conetnt
          );
          this.chartOption.xAxis.data = splice.arrA;
          this.chartOption.series[0].data = splice.arrB;
        }

        if (this.chartType === "Bar graph") {
          let splice = removeValueBySubscript(
            this.chartOption.yAxis.data,
            this.chartOption.series[0].data,
            conetnt
          );
          this.chartOption.yAxis.data = splice.arrA;
          this.chartOption.series[0].data = splice.arrB;
        }
        if (
          ["Rectangular tree diagram", "Pie chart"].includes(this.chartType)
        ) {
          this.chartOption.series[0].data = removeObjectsByKeyValue(conetnt);
        }
      }
      // if restore
      if (e == true) {
        this.chartOption = this.stack.pop();
        this.stack.push(this.chartOption);
      }
    },
    /* remove draggable item and restore the chart container*/
    removeDraggable(list, index) {
      list.splice(index, 1);
      this.chart.clear();
    },
    /* Reset chart option and field content */
    resetChart() {
      this.$confirm("Are you sure you want to reset the chart?", "Warning", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning",
      })
        .then(() => {
          this.resetAll();
        })
        .catch(() => {
          this.$message.warning(`Reset cancelled`);
        });
    },
    resetAll() {
      this.chartType = null;
      this.chartOption = null;
      this.chartSeries = [];
      this.chartData = [];
      this.selectedDiv = null;
      this.chart.clear();
      this.filterList = [];
      this.sortList = [];
    },
    retainProperties(prop1, prop2) {
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
      }
      .el-link {
        padding-right: 6px;
      }
    }
  }
  .el-aside {
    .chart-tabs {
      padding: 5px;
      svg {
        width: 60px;
        height: 60px;
        margin: 5px;
      }
      .preview-image {
        cursor: pointer;
      }
      .selected-preview-image {
        background: skyblue;
      }
      .demonstration {
        font-weight: bold;
      }
      .el-tab-pane {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;
      }
    }
    .file {
      border-bottom: 1px solid;
    }
    .fields {
      display: flex;
      justify-content: space-between;
      .del {
        cursor: pointer;
      }

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
          background-color: #0c0d0f;
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
  // .el-dialog {
  //   height: 60vh;
  //   overflow: scroll;
  //   .el-dialog__header {
  //     position: fixed;
  //     padding: 20px 20px 10px;
  //   }
  // }
}
.table {
  width: 100%;
  margin: 1rem;
  color: #212529;
  .thead-dark th {
    color: #fff;
    background-color: #343a40;
    border-color: #454d55;
    vertical-align: bottom;
    border-bottom: 2px solid #dee2e6;
  }
}

.el-dialog {
  .filter-container {
    height: 350px;
    overflow: auto;
    .filter-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border: 1px solid #ccc;
      margin: 10px;

      .content {
        padding-right: 10px;
      }
      .checkbox {
        margin-left: 10px;
        cursor: pointer;
      }
    }
  }
}
</style>
