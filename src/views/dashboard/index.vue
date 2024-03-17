<template>
  <div class="dashboard-container">
    <div class="dashboard-text">
      Current User: {{ name }}
      <el-button type="info" @click="addCard">Add card</el-button>
    </div>
    <DragCard :list="list" :col="3" :itemWidth="350" :itemHeight="350">
    </DragCard>
  </div>
</template>

<script>
import DragCard from "@/components/card/index.vue";
import { mapGetters } from "vuex";

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
        { head: 0, content: "Card 0" },
        { head: 1, content: "Card 1" },
        { head: 2, content: "Card 2" },
        { head: 3, content: "Card 3" },
        { head: 4, content: "Card 4" },
        { head: 5, content: "Card 5" },
      ],
    };
  },
  methods: {
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
    margin: 30px;
  }

  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
