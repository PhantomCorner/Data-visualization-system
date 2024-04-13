<template>
  <div class="chartGen-container">
    <el-alert :closable="false" title="Chart Preview" />
    <div class="container">
      <div class="left"></div>
      <div class="middle"></div>
      <div class="right"></div>
    </div>
  </div>
</template>
<script>
import { getDataSource, getFileContent } from "@/api/user";
export default {
  name: "chartGen",
  data() {
    return { fileKey: null, fileContent: null };
  },
  mounted() {
    this.fileKey = this.$route.params.fileKey;
    this.passFileName();
  },
  methods: {
    async passFileName() {
      let res = await getFileContent({ key: this.fileKey });
      this.fileContent = res.data;
      console.log(this.fileContent);
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
.left {
  flex: 1;
}

.middle {
  flex: 1;
}

.right {
  flex: 1;
}
</style>
