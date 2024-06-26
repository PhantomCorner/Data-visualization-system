<template>
  <div class="dataSource-container">
    <div style="display: flex; flex-direction: row-reverse">
      <el-upload
        class="upload-demo"
        action=""
        :show-file-list="false"
        :http-request="handleFileChange"
        accept=".XLSX, .XLSM, .XLS, .CSV"
      >
        <el-button type="success">Upload</el-button>
      </el-upload>
      <el-button type="primary" @click="getBucketList">Refresh</el-button>
    </div>
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
      <el-table-column fixed="right" label="Operations" width="120">
        <template slot-scope="scope">
          <el-button link type="danger" @click="deleteFile(scope.row.Key)">
            Remove
          </el-button>
        </template>
      </el-table-column>
    </el-table>
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
      //total page
      total: 0,
      //page size
      pagesize: 10,
      //current page
      currentPage: 1,
      fileContent: null,
      columnLabel: null,
      fileList: [],
    };
  },
  mounted() {
    this.getBucketList();
  },
  methods: {
    //handle upload file
    async handleFileChange(e) {
      let file = e.file;
      console.log("file change", file);
      if (file) {
        let params = {
          Bucket: "",
          Key: file.name,
          Body: file,
        };
        getToken() == "admin-token"
          ? (params.Bucket = "compx576-user1-bucket")
          : (params.Bucket = "compx576-user2-bucket");
        let isExist = await this.checkBucket(params.Key);
        if (isExist) {
          this.$confirm(
            "Same file exists, are you sure you want to overwrite it?",
            "Warning",
            {
              confirmButtonText: "Confirm",
              cancelButtonText: "Cancel",
              type: "warning",
            }
          )
            .then(() => {
              this.s3.upload(params, (err) => {
                if (err) {
                  this.$message.warning(`${err.code},${err.data}`);
                } else {
                  this.$message.success(`Upload success!`);
                  this.getBucketList();
                }
              });
            })
            .catch(() => {
              this.$message.warning(`Cancelled`);
            });
        } else {
          this.s3.upload(params, (err) => {
            if (err) {
              this.$message.warning(`${err.code},${err.data}`);
            } else {
              this.$message.success(`Upload success!`);
              this.getBucketList();
            }
          });
        }
      }
    },
    //pass file key
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
    //check if file exists in bucket by key
    async checkBucket(fileKey) {
      const params = {
        Bucket: "",
        Key: fileKey,
      };
      getToken() == "admin-token"
        ? (params.Bucket = "compx576-user1-bucket")
        : (params.Bucket = "compx576-user2-bucket");
      try {
        await this.s3.headObject(params).promise();
        console.log("File Found in S3");
        return true;
      } catch (err) {
        console.log("File not Found ERROR : " + err.code);
        return false;
      }
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
    //delete file by file key
    async deleteFile(fileKey) {
      let params = { Bucket: "", Key: fileKey };
      getToken() == "admin-token"
        ? (params.Bucket = "compx576-user1-bucket")
        : (params.Bucket = "compx576-user2-bucket");
      this.$confirm(
        "This will permanently delete the data source, are you sure?",
        "Warning",
        {
          confirmButtonText: "Confirm",
          cancelButtonText: "Cancel",
          type: "warning",
        }
      )
        .then(() => {
          this.s3.deleteObject(params, (err) => {
            if (err) {
              this.$message.warning(`${err.code},${err.data}`);
            } else {
              this.$message.success(`Delete success!`);
              this.getBucketList();
            }
          });
        })
        .catch(() => {
          this.$message.warning(`Cancelled`);
        });
    },
    handleClose() {
      this.total = 0;
      this.currentPage = 1;
    },
  },
};
</script>
<style lang="scss">
.dataSource-container {
  padding: 10px;
}
.custom-dialog > .el-dialog__body {
  height: 500px;
  overflow: scroll;
}
</style>
