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
    <el-dialog title="File Content" :visible.sync="dialogVisible" width="30%">
      <el-table :data="fileContent" style="width: 100%">
        <el-table-column
          v-for="(item, index) in columnLabel"
          :key="index"
          :label="item"
          :prop="item"
        ></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import { ak, ask } from "../../../ak.js";
import AWS from "aws-sdk";
import { getDataSource, getFileContent } from "@/api/dataSource";
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
      let res = await getFileContent({ key: key });
      this.dialogVisible = true;
      this.fileContent = res.data;
      //store column label to render table
      this.columnLabel = Object.keys(this.fileContent[0]);
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
      let res = await getDataSource();
      this.tableData = res.data;
    },
  },
};
</script>
<style lang="scss">
.createChart-container {
  padding: 10px;
}
.el-table {
  cursor: pointer;
}
</style>
