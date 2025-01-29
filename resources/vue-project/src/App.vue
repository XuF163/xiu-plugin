<template>
  <EventDisplay
    :mainTitle="eventTitle"
    :subTitle="eventSubTitle"
    :detailInfo="eventDetails"
  />
</template>

<script>
import EventDisplay from "./components/EventDisplay.vue";

export default {
  name: "App",
  components: {
    EventDisplay,
  },
  data() {
    return {
      eventTitle: "狼人杀事件",
      eventSubTitle: "昨晚发生了什么？",
      eventDetails: [
        "狼人击杀了 3 号玩家",
        "女巫使用了毒药，毒死了 5 号玩家",
        "守卫守护了 1 号玩家",
        "白痴发动了装傻技能",
      ],
    };
  },
};
</script>

<style>
/* 这里可以添加全局样式，例如字体 */
body {
  font-family: "Arial", sans-serif;
  margin: 0;
  padding: 0;
}
</style>
