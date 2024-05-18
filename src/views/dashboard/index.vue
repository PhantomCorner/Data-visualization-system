<template>
  <div class="dashboard-container">
    <!-- <div class="dashboard-text">
      Current User: {{ name }}
    </div> -->
    <router-link to="/createChart/all">
      <el-button type="primary">Create new chart</el-button>
    </router-link>
    <!-- <el-button type="primary" @click="addCard">Creaet new chart</el-button> -->
    <DragCard :list="list" :col="3" :itemWidth="400" :itemHeight="200">
    </DragCard>
  </div>
</template>

<script>
import DragCard from "@/components/card/index.vue";
import { mapGetters } from "vuex";
import { getAllChart } from "@/api/chartGen";
import { getToken } from "@/utils/auth";

export default {
  name: "Dashboard",
  computed: {
    ...mapGetters(["name"]),
  },
  components: {
    DragCard,
  },
  data() {
    return {
      list: [],
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      let res = await getAllChart({ token: getToken() });
      console.log(res);
      res.data.forEach((item) => {
        this.list.push({
          id: item.chartId,
          chartOption: JSON.parse(item.chartOption),
          chartName: item.chartName,
        });
      });
    },
    createChart() {
      let last = this.list[this.list.length - 1];
      this.list.push({
        head: last.head + 1,
        content: `Card ${last.head + 1}`,
      });
    },
    addCard() {
      let last = this.list[this.list.length - 1];
      this.list.push({
        head: last.head + 1,
        content: `Card ${last.head + 1}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 15px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
