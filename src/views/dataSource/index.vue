<template>
  <div class="dataSource-container">
    <el-upload
      class="upload-demo"
      :action="uploadURL"
      :file-list="fileList"
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
import { getDataSource } from "@/api/user";
export default {
  name: "DataSource",
  // computed: {
  //   ...mapGetters(["name"]),
  // },

  data() {
    return {
      tableData: null,
      uploadURL:
        "http://localhost:9528/vue-admin-template/api/dataSource/upload",
      fileList: [],
    };
  },
  methods: {
    async refreshAPI() {
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
