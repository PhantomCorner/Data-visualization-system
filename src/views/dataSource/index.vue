<template>
  <div class="dataSource-container">
    <!-- <el-upload
      class="upload-demo"
      :action="uploadURL"
      :file-list="fileList"
      accept=".XLSX, .XLSM, .XLS"
    > -->
    <el-upload
      class="upload-demo"
      :file-list="fileList"
      action=""
      :http-request="handleFileChange"
      accept=".XLSX, .XLSM, .XLS"
    >
      <el-button size="small" type="primary">Upload</el-button>
    </el-upload>
    <el-button
      size="small"
      type="primary"
      style="margin-top: 10px"
      @click="refreshAPI"
      >Refresh</el-button
    >
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="fileName" label="File Name" width="180">
      </el-table-column>
      <el-table-column label="Upload Time" width="180">
        <template slot-scope="scope">
          {{ scope.row.uploadTime }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import AWS from "aws-sdk";
import { getDataSource } from "@/api/user";
export default {
  name: "DataSource",
  // computed: {
  //   ...mapGetters(["name"]),
  // },

  data() {
    return {
      s3: new AWS.S3({
        apiVersion: "2006-03-01",
        accessKeyId: "",
        secretAccessKey: "",
        region: "ap-southeast-2",
      }),
      tableData: null,
      uploadURL:
        "http://localhost:9528/vue-admin-template/api/dataSource/upload",
      fileList: [],
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    async refreshAPI() {
      let res = await getDataSource();
      this.tableData = res.data.res;
    },
    handleFileChange(e) {
      let file = e.file;
      console.log("file change", file);

      if (file) {
        this.videoFileName = file.name;
        this.videoLoading = true;
        this.videoSuffix = this.videoFileName.split(".")[1];

        var key = new Date().getTime() + "_" + "." + this.videoSuffix;
        var params = {
          Bucket: "compx576-bucket", // 存储桶名称
          Key: key, // 文件名，重名会覆盖
          Body: file,
        };
        this.videoUpload = this.s3.upload(params, function (err, data) {
          if (err) {
            console.log("发生错误：", err.code, err.message);
            this.videoLoading = false;
          } else {
            console.log("上传成功, 返回结果");
            console.log(data);
            console.log(data.Location); //上传文件在S3的位置
          }
        });
      }
    },
    async getList() {
      let res = await getDataSource();
      this.tableData = res.data.res;
    },
  },
};
</script>
<style lang="scss">
.dataSource-container {
  padding: 10px;
}
</style>
