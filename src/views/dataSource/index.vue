<template>
  <div class="dataSource-container">
    <el-table :data="tableData" style="width: 100%">
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
      <el-table-column>
        <template slot="header" slot-scope="scope">
          <el-button type="primary" @click="getBucketList">Refresh</el-button>
        </template>
      </el-table-column>
      <el-table-column>
        <template slot="header" slot-scope="scope">
          <el-upload
            class="upload-demo"
            action=""
            :show-file-list="false"
            :http-request="handleFileChange"
            accept=".XLSX, .XLSM, .XLS"
          >
            <el-button type="success">Upload</el-button>
          </el-upload>
        </template>
      </el-table-column>
    </el-table>
    <!-- File content display -->
    <el-dialog title="File Content" :visible.sync="dialogVisible" width="30%">
      <el-table :data="fileContent" style="width: 100%">
        <el-table-column prop="Fruit Name" label="Content 1" width="180">
        </el-table-column>
        <el-table-column prop="Price" label="Content 2" width="180">
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>
<script>
import { ak, ask } from "../../../ak.js";
import AWS from "aws-sdk";
import { getDataSource, getFileContent } from "@/api/user";
export default {
  name: "DataSource",
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
      fileList: [],
    };
  },
  mounted() {
    this.getBucketList();
  },
  methods: {
    handleFileChange(e) {
      let file = e.file;
      console.log("file change", file);
      if (file) {
        var params = {
          Bucket: "compx576-bucket",
          Key: file.name,
          Body: file,
        };
        if (this.checkBucket(params.Key)) {
          this.$alert(
            "Same file exists, are you sure you want to overwrite it?",
            "Warning",
            {
              confirmButtonText: "Confirm",
              callback: () => {
                this.s3.upload(params, (err) => {
                  if (err) {
                    this.$message.warning(`${err.code},${err.data}`);
                  } else {
                    this.$message.success(`Upload success!`);
                    this.getBucketList();
                  }
                });
              },
            }
          );
        }
      }
    },
    async passFileName(key) {
      let res = await getFileContent({ key: key });
      this.dialogVisible = true;
      this.fileContent = res.data;
    },
    async checkBucket(file) {
      await this.s3
        .headObject({
          Bucket: "compx576-bucket",
          Key: file,
        })
        .promise()
        .then(
          () => {
            return true;
          },
          (err) => {
            if (err.code === "NotFound") {
              return false;
            }
            throw err;
          }
        );
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
.dataSource-container {
  padding: 10px;
}
</style>
