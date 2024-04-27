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
      list: [
        {
          head: 0,
          content: "Card 0",
          chartOption: {
            xAxis: {
              type: "category",
              data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            },
            yAxis: {
              type: "value",
            },
            series: [
              {
                data: [120, 200, 150, 80, 70, 110, 130],
                type: "bar",
              },
            ],
          },
        },
        { head: 1, content: "Card 1" },
        { head: 2, content: "Card 2" },
        { head: 3, content: "Card 3" },
        { head: 4, content: "Card 4" },
        { head: 5, content: "Card 5" },
      ],
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      let res = await getAllChart();
      console.log(JSON.stringify(res.data[2].chartOption));
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
