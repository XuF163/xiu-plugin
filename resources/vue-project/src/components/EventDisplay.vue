<template>
  <div class="phone-container">
    <div class="phone-screen">
      <div class="status-bar">
        <span class="time">{{ currentTime }}</span>
        <div class="status-icons">
          <span class="signal">📶</span>
          <span class="battery">🔋</span>
        </div>
      </div>
      <div class="content-container">
        <h1 class="main-title">{{ mainTitle }}</h1>
        <h2 class="sub-title">{{ subTitle }}</h2>
        <div class="detail-info">
          <p v-for="(item, index) in detailInfo" :key="index" class="info-item">
            {{ item }}
          </p>
        </div>
      </div>
      <!--      <div class="bottom-navigation">-->
      <!--&lt;!&ndash;        <button class="nav-button">选项1</button>&ndash;&gt;-->
      <!--&lt;!&ndash;        <button class="nav-button">选项2</button>&ndash;&gt;-->
      <!--&lt;!&ndash;        <button class="nav-button">选项3</button>&ndash;&gt;-->
      <!--      </div>-->
      <div class="footer-text">那拉小派蒙</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EventDisplay",
  props: {
    mainTitle: {
      type: String,
      required: true,
    },
    subTitle: {
      type: String,
      default: "",
    },
    detailInfo: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      currentTime: this.getCurrentTime(),
    };
  },
  mounted() {
    setInterval(() => {
      this.currentTime = this.getCurrentTime();
    }, 1000);
  },
  methods: {
    getCurrentTime() {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    },
  },
};
</script>

<style scoped>
.phone-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  padding: 20px;
  box-sizing: border-box;
}

.phone-screen {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #eee;
  font-size: 0.8rem;
  color: #555;
}

.status-icons {
  display: flex;
  gap: 5px;
}

.content-container {
  padding: 20px;
  box-sizing: border-box;
  flex-grow: 1; /* 让内容区域填充剩余空间 */
}

.main-title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
  color: #333;
}

.sub-title {
  font-size: 1.2rem;
  margin-bottom: 20px;
  text-align: center;
  color: #666;
}

.detail-info {
  margin-top: 20px;
  line-height: 1.6;
}

.info-item {
  font-size: 1rem;
  color: #555;
  margin-bottom: 10px;
}

.bottom-navigation {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 15px 0;
  background-color: #eee;
  border-top: 1px solid #ddd;
}

.nav-button {
  background: none;
  border: none;
  font-size: 1rem;
  color: #333;
  cursor: pointer;
  padding: 10px 15px;
}

.footer-text {
  text-align: center;
  padding: 10px 0;
  font-size: 0.8rem;
  color: #aaa;
}

@media (min-aspect-ratio: 16/9) {
  .phone-screen {
    max-width: 500px;
  }
}
</style>
