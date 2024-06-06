<template>
  <div class="dragCard">
    <div
      class="dragCard_warpper"
      ref="dragCard_warpper"
      :style="dragCardWarpperStyle"
    >
      <div
        v-for="(item, index) in list"
        :key="index"
        class="dragCard_item"
        :style="initItemStyle(index)"
        :ref="item.dragCard_id"
      >
        <div class="dragCard_content">
          <div class="dragCard_head" @mousedown="handleMousedown($event, item)">
            <slot name="head" :item="item">
              <div class="dragCard_head-defaut">
                {{ item.chartName }}
              </div>
            </slot>
          </div>
          <span
            style="float: right; cursor: pointer"
            @click="clickDelete(item.id)"
          >
            <deleteIcon
          /></span>
          <div class="dragCard_body" :id="`cardChart${index}`"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import deleteIcon from "@/assets/delete";
import { dropChart } from "@/api/chartGen";

export default {
  name: "DragCard",
  components: {
    deleteIcon,
  },
  props: {
    list: {
      type: Array,
      default: () => {
        return [];
      },
    },
    col: {
      type: Number,
      default: 3,
    },
    itemWidth: {
      type: Number,
      default: 150,
    },
    itemHeight: {
      type: Number,
      default: 150,
    },
  },
  data() {
    return {
      timer: null,
      row: 0,
      dragCardWarpperStyle: "",
      card_chart: null,
    };
  },
  created() {},
  watch: {
    list: {
      handler: function (newVal, oldVal) {
        this.init();
      },
      immediate: true,
    },
  },
  mounted() {
    this.initChart();
  },
  methods: {
    init() {
      this.row = Math.ceil(this.list.length / this.col);
      this.dragCardWarpperStyle = `width: ${
        this.col * this.itemWidth
      }px; height:${this.row * this.itemHeight}px`;
      this.list.forEach((item, index) => {
        this.$set(item, "dragCard_index", index);
        this.$set(item, "dragCard_id", "dragCard_id" + index);
      });
      // this.initChart();
    },
    initChart() {
      setTimeout(() => {
        this.list.forEach((item, index) => {
          let chart = echarts.init(
            document.getElementById(`cardChart${index}`)
          );
          chart.setOption(item.chartOption);
        });
      }, 1000);
    },
    initItemStyle(INDEX) {
      return {
        width: this.itemWidth + "px",
        height: this.itemHeight + "px",
        left:
          (INDEX < this.col ? INDEX : INDEX % this.col) * this.itemWidth + "px",
        top: Math.floor(INDEX / this.col) * this.itemHeight + "px",
      };
    },
    handleMousedown(e, optionItem) {
      e.preventDefault();
      let that = this;
      if (this.timer) return false;

      // Copy a list and add the attributes to be used later
      let itemList = that.list.map((item) => {
        let dom = this.$refs[item.dragCard_id][0];
        let left = parseInt(dom.style.left.slice(0, dom.style.left.length - 2));
        let top = parseInt(dom.style.top.slice(0, dom.style.top.length - 2));
        let isMoveing = false; // Mark the moving card. The moving card does not participate in collision detection.
        return { ...item, dom, left, top, isMoveing };
      });

      // Store the current selected card as curItem
      let curItem = itemList.find(
        (item) => item.dragCard_id === optionItem.dragCard_id
      );
      curItem.dom.style.transition = "none";
      curItem.dom.style.zIndex = "100";
      curItem.dom.childNodes[0].style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.1)";
      // Current coord data
      curItem.startLeft = curItem.left;
      curItem.startTop = curItem.top;
      curItem.OffsetLeft = 0;
      curItem.OffsetTop = 0;

      // Target item
      let targetItem = null;

      // Mouse original position
      let mousePosition = {
        startX: e.screenX,
        startY: e.screenY,
      };

      document.addEventListener("mousemove", handleMousemove);
      document.addEventListener("mouseup", handleMouseUp);

      let DectetTimer = null;

      // Handle mouse movement
      function handleMousemove(e) {
        curItem.OffsetLeft = parseInt(e.screenX - mousePosition.startX);
        curItem.OffsetTop = parseInt(e.screenY - mousePosition.startY);
        curItem.dom.style.left = curItem.startLeft + curItem.OffsetLeft + "px";
        curItem.dom.style.top = curItem.startTop + curItem.OffsetTop + "px";
        // Collision detection with timeout, reduce overflow
        if (!DectetTimer) {
          DectetTimer = setTimeout(() => {
            cardDetect();
            clearTimeout(DectetTimer);
            DectetTimer = null;
          }, 200);
        }
      }

      // Card movement detection
      function cardDetect() {
        // Calculate the position to move based on the distance moved
        let colNum = Math.round(curItem.OffsetLeft / that.itemWidth);
        let rowNum = Math.round(curItem.OffsetTop / that.itemHeight);
        // The dragCard_index here needs to use the initial position of the clicked card because curItem's dragCard_index has already changed during the subsequent card exchange
        let targetItemDragCardIndex =
          optionItem.dragCard_index + colNum + rowNum * that.col;

        // Exceeding rows and columns, target position unchanged or does not exist, directly return
        if (
          Math.abs(colNum) >= that.col ||
          Math.abs(rowNum) >= that.row ||
          Math.abs(colNum) >= that.col ||
          Math.abs(rowNum) >= that.row ||
          targetItemDragCardIndex === curItem.dragCard_index ||
          targetItemDragCardIndex < 0 ||
          targetItemDragCardIndex > that.list.length - 1
        )
          return false;

        let item = itemList.find(
          (item) => item.dragCard_index === targetItemDragCardIndex
        );
        item.isMoveing = true;
        // Copy the target card, so when the mouseup function triggers the current card can have its value
        targetItem = { ...item };
        swicthPosition();
      }

      /*
       * Card position exchange
       * Two cases;
       * 1. When the target position is after the original position of the current moving card, the separated cards and the target card should move back one position;
       * 2. When the target position is before the original position of the current moving card, the separated cards and the target card should move forward one position;
       * Note:
       * 1. One point to note here is that when we move, we take the previous or next value, so when we traverse the array, we must pay attention to traversing from the target value;
       * 2. itemList is a backup of the list. When we modify the dragCard_index of the card, we need to synchronize it to the list;
       */
      function swicthPosition() {
        const dragCardIndexList = itemList.map((item) => item.dragCard_index);
        // If target card location is after current card
        if (targetItem.dragCard_index > curItem.dragCard_index) {
          for (
            let i = targetItem.dragCard_index;
            i >= curItem.dragCard_index + 1;
            i--
          ) {
            let item = itemList[dragCardIndexList.indexOf(i)];
            let preItem = itemList[dragCardIndexList.indexOf(i - 1)];
            item.isMoveing = true;
            item.left = preItem.left;
            item.top = preItem.top;
            item.dom.style.left = item.left + "px";
            item.dom.style.top = item.top + "px";
            item.dragCard_index = that.list[
              dragCardIndexList.indexOf(i)
            ].dragCard_index -= 1;
            setTimeout(() => {
              item.isMoveing = false;
            }, 300);
          }
        }
        // If target card location is before current card
        if (targetItem.dragCard_index < curItem.dragCard_index) {
          for (
            let i = targetItem.dragCard_index;
            i <= curItem.dragCard_index - 1;
            i++
          ) {
            let item = itemList[dragCardIndexList.indexOf(i)];
            let nextItem = itemList[dragCardIndexList.indexOf(i + 1)];
            item.isMoveing = true;
            item.left = nextItem.left;
            item.top = nextItem.top;
            item.dom.style.left = item.left + "px";
            item.dom.style.top = item.top + "px";
            item.dragCard_index = that.list[
              dragCardIndexList.indexOf(i)
            ].dragCard_index += 1;
            setTimeout(() => {
              item.isMoveing = false;
            }, 300);
          }
        }
        curItem.left = targetItem.left;
        curItem.top = targetItem.top;
        curItem.dragCard_index = targetItem.dragCard_index;

        that.$emit(
          "change",
          itemList.map((item) => item.dragCard_index)
        );
      }
      // If mouse up
      function handleMouseUp() {
        // Remove all listeners
        document.removeEventListener("mousemove", handleMousemove);
        document.removeEventListener("mouseup", handleMouseUp);

        // Clear timer and detect card collision one more time
        clearTimeout(DectetTimer);
        DectetTimer = null;
        cardDetect();

        curItem.dom.style.transition = "";
        that.list.find(
          (item) => item.dragCard_id === optionItem.dragCard_id
        ).dragCard_index = curItem.dragCard_index;
        that.$emit(
          "mouseUp",
          that.list.map((item) => item.dragCard_index)
        );
        curItem.dom.style.left = curItem.left + "px";
        curItem.dom.style.top = curItem.top + "px";
        that.timer = setTimeout(() => {
          curItem.dom.style.zIndex = "";
          curItem.dom.childNodes[0].style.boxShadow = "none";
          clearTimeout(that.timer);
          that.timer = null;
        }, 300);
      }
    },
    // Add drop chart function
    async clickDelete(id) {
      this.$confirm("Are you sure you want to drop this chart?", "Warning", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "warning",
      })
        .then(() => {
          dropChart({ chartID: id }).then((res) => {
            this.$message.success(res.message);
          });
        })
        .catch(() => {
          this.$message.warning(`Operation cancelled`);
        });
    },
  },
};
</script>

<style scoped lang="scss">
.dragCard {
  text-align: center;
  margin: 0 auto;

  &_warpper {
    position: relative;
    margin: 0 auto;
  }

  &_item {
    position: absolute;
    z-index: 0;
    box-sizing: border-box;
    transition: all 300ms;
    padding: 0 5px 10px;
    // border-radius: 5px;
    & > div {
      height: 100%;
    }
  }

  &_content {
    background: #fff;
    box-sizing: border-box;
    border: 1px solid #ccc;

    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    // align-items: center;
    // overflow: hidden;
  }
  &_head {
    box-sizing: border-box;
    cursor: grab;
    outline: none;
    color: #222;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    font-size: 14px;
    &-defaut {
      border-bottom: 1px solid #ccc;
      background: #495967;
      color: #fff;
      height: 100%;
      flex-shrink: 0;

      // padding: 0 20px;
      width: 100%;
      // display: flex;
      // flex-direction: row;
      // align-items: center;
      // justify-content: flex-start;
    }
  }
  &_body {
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    // display: flex;
    // flex-direction: column;
    // justify-content: center;
    align-content: center;
    color: #838383;
  }
}
</style>
