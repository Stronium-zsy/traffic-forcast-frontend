<template>
  <div class="app-container home">
    <div class="full-screen-video" >
      <video autoplay loop muted>
        <source src="公路视频.mp4" type="video/mp4">
      </video>
      <h1 class="centered-title" style="transform:translate(200px,-500px);">交通预测系统</h1>

    </div>
  </div>
</template>

<script>
export default {
  methods: {
    navigateToTargetPage() {
      this.$router.push('localhost/index');
    },
    navigateToNewPage() {
      this.$router.push('/new-page');
    },
  },
};
</script>

<style scoped>
.custom-btn.btn-12 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation: fadeIn 2s forwards;
}

.full-screen-video {
  position: relative;
  width: 100%;
  height: 100vh;
}

.full-screen-video video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}



.centered-title {
  position: absolute;
  top: 10%;  /* 调整标题的垂直位置 */
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  font-size: 6em;  /* 调整标题的字体大小 */
  color: #ffffff;  /* 调整标题的颜色 */
}

.app-container {
  overflow-y: hidden;
}

.centered-button {
  position: absolute;
  top: 50%;  /* 调整按钮的垂直位置 */
  left: 50%; /* 调整按钮的水平位置 */
  transform: translate(-50%, -50%); /* 使用 transform 属性将按钮的中心点定位到视频的中心 */
  z-index: 1; /* 确保按钮在视频上方 */
}

/* 定义淡入动画 */
@keyframes fadeIn {
  0% {
    opacity: 0;  /* 开始时透明 */
  }
  100% {
    opacity: 1;  /* 结束时不透明 */
  }
}
</style>



<style lang="scss" scoped>
.test{
  background-color: #fff;
  min-height: 100vh;
  padding:50px;
  width: 1000px;
}
.custom-btn {
  width: 110px;
  height: 40px;
  color: #fff;
  border-radius: 5px;
  padding: 10px 25px;
  font-family: Lato,sans-serif;
  font-weight: 500;
  margin: 0 3px;
  background: transparent;
  cursor: pointer;
  transition: all .3s ease;
  position: relative;
  display: inline-block;
  box-shadow: inset 2px 2px 2px 0 hsla(0,0%,100%,.5),7px 7px 20px 0 rgba(0,0,0,.1),4px 4px 5px 0 rgba(0,0,0,.1);
  outline: none;
  margin-bottom: 50px;
}

.custom-btn.btn-12 {
  position: relative;
  right: 24px;
  bottom: 25px;
  border: none;
  box-shadow: none;
  width: 110px;
  height: 40px;
  line-height: 42px;
  -webkit-perspective: 230px;
  perspective: 230px
}

.custom-btn.btn-12 span {
  background: #00acee;
  background: linear-gradient(0deg,#00acee,#027efb);
  display: block;
  position: absolute;
  width: 110px;
  height: 40px;
  box-shadow: inset 2px 2px 2px 0 hsla(0,0%,100%,.5),7px 7px 20px 0 rgba(0,0,0,.1),4px 4px 5px 0 rgba(0,0,0,.1);
  border-radius: 5px;
  margin: 0;
  text-align: center;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-transition: all .3s;
  transition: all .3s
}

.custom-btn.btn-12 span:first-child {
  box-shadow: -7px -7px 20px 0 hsla(0,0%,100%,.6),-4px -4px 5px 0 hsla(0,0%,100%,.6),7px 7px 20px 0 rgba(0,0,0,.13333333333333333),4px 4px 5px 0 rgba(0,0,0,.06666666666666667);
  -webkit-transform: rotateX(90deg);
  -moz-transform: rotateX(90deg);
  transform: rotateX(90deg);
  -webkit-transform-origin: 50% 50% -20px;
  -moz-transform-origin: 50% 50% -20px;
  transform-origin: 50% 50% -20px
}

.custom-btn.btn-12 span:nth-child(2) {
  -webkit-transform: rotateX(0deg);
  -moz-transform: rotateX(0deg);
  transform: rotateX(0deg);
  -webkit-transform-origin: 50% 50% -20px;
  -moz-transform-origin: 50% 50% -20px;
  transform-origin: 50% 50% -20px
}

.custom-btn.btn-12:hover span:first-child {
  -webkit-transform: rotateX(0deg);
  -moz-transform: rotateX(0deg);
  transform: rotateX(0deg)
}

.custom-btn.btn-12:hover span:first-child,.custom-btn.btn-12:hover span:nth-child(2) {
  box-shadow: inset 2px 2px 2px 0 hsla(0,0%,100%,.5),7px 7px 20px 0 rgba(0,0,0,.1),4px 4px 5px 0 rgba(0,0,0,.1)
}

.custom-btn.btn-12:hover span:nth-child(2) {
  color: transparent;
  -webkit-transform: rotateX(-81deg);
  -moz-transform: rotateX(-81deg);
  transform: rotateX(-81deg)
}

</style>
