<template>
  <div class="createChart-container">
    <el-alert :closable="false" title="Select data source" />
    <el-table
      :data="tableData"
      style="width: 100%"
      highlight-current-row
      @row-click="storeKey"
    >
      <el-table-column type="index" width="50" />
      <el-table-column prop="Key" label="File Name">
        <template slot-scope="scope">
          <el-tag
            type="success"
            @click="passFileName(scope.row.Key)"
            style="cursor: pointer"
          >
            {{ scope.row.Key }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column prop="Size" label="File Size">
        <template slot-scope="scope">
          {{ formatBytes(scope.row.Size) }}
        </template>
      </el-table-column>
      <el-table-column prop="LastModified" label="Last Modified" />
    </el-table>

    <el-button type="primary" @click="passKey">Next step</el-button>

    <!-- File content display -->
    <el-dialog
      title="File Content"
      :visible.sync="dialogVisible"
      custom-class="custom-dialog"
      @close="handleClose"
    >
      <el-table
        v-if="dialogVisible"
        :data="
          fileContent.slice(
            (currentPage - 1) * pagesize,
            currentPage * pagesize
          )
        "
        style="width: 100%"
      >
        <el-table-column
          v-for="(item, index) in columnLabel"
          :key="index"
          :label="item"
          :prop="item"
        ></el-table-column>
      </el-table>
      <div style="text-align: center">
        <el-pagination
          layout="prev, pager, next"
          :total="total"
          :page-size="pagesize"
          @current-change="current_change"
        ></el-pagination>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { ak, ask } from "../../../ak.js";
import AWS from "aws-sdk";
import { getDataSource, getFileContent } from "@/api/dataSource";
import { getToken } from "@/utils/auth";
export default {
  name: "createChart",
  data() {
    return {
      dialogVisible: false,
      s3: new AWS.S3({
        apiVersion: "2006-03-01",
        accessKeyId: ak,
        secretAccessKey: ask,
        region: "ap-southeast-2",
      }),
      tableData: null,
      //total page
      total: 0,
      //page size
      pagesize: 10,
      //current page
      currentPage: 1,
      fileContent: null,
      columnLabel: null,
      fileList: [],
      fileKey: null,
    };
  },
  mounted() {
    this.getBucketList();
  },
  methods: {
    storeKey(row) {
      this.fileKey = row.Key;
    },
    passKey() {
      if (this.fileKey != null) {
        this.$router.push({
          path: `/createChart/chartGen/${this.fileKey}`,
        });
      } else {
        this.$message.warning("PLEASE SELECT A DATA SOURCE");
      }
    },
    async passFileName(key) {
      let res = await getFileContent({ token: getToken(), key: key });
      this.dialogVisible = true;
      this.fileContent = res.data;
      this.total = res.total;
      //store column label to render table
      this.columnLabel = Object.keys(this.fileContent[0]);
    },
    current_change(currentPage) {
      this.currentPage = currentPage;
    },
    formatBytes(bytes) {
      const kb = 1024;
      const mb = kb * 1024;
      if (bytes >= mb) {
        return (bytes / mb).toFixed(2) + " MB";
      } else if (bytes >= kb) {
        return (bytes / kb).toFixed(2) + " KB";
      } else {
        return bytes + " Bytes";
      }
    },
    async getBucketList() {
      let res = await getDataSource(getToken());
      this.tableData = res.data;
    },
    handleClose() {
      this.total = 0;
      this.currentPage = 1;
    },
  },
};
</script>
<style lang="scss" scoped>
.createChart-container {
  padding: 10px;
}
.el-table {
  cursor: pointer;
}
.custom-dialog > .el-dialog__body {
  height: 500px;
  overflow: scroll;
}
</style>
