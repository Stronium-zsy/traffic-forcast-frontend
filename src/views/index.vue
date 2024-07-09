<template>
  <div style="width:1800px;height:1000px;">
    <div id="map_cc7d1b7fb1ad09e0732bbbd940dd9c71"></div>
    <div id="timestamp_box" class="timestamp-box">
      <p>当前时间: {{ latestTimestamp }}</p>
    </div>
    <div id="speed" class="timestamp-box"></div>
    <div id="speed_rank" class="timestamp-box">
      <p>行驶缓慢路段:</p>
      <ul>
        <li v-for="rank in topSpeedRanks" :key="rank.sensor_id">{{ rank.sensor_id }}: {{ rank.speed.toFixed(2) }} 英里/时</li>
      </ul>
    </div>
    <div id="chart" class="timestamp-box">
      <canvas id="averageSpeedChart" width="750" height="280"></canvas>
    </div>
    <div id="street_speed_rank" class="timestamp-box">
      <p>街道平均速度:</p>
      <ul>
        <li v-for="(avgSpeed, street) in streetAverages" :key="street">{{ street }}: {{ avgSpeed !== null ? avgSpeed.toFixed(2) : 'No data' }} 英里/时</li>
      </ul>
    </div>
    <div id="search_bar" class="timestamp-box">
      <input type="text" v-model="searchQuery" placeholder="输入传感器ID火车街道名称">
      <button id="search_button" @click="searchLocation">搜索</button>
      <div id="search_teach">
        <input type="text" v-model="startPoint" placeholder="输入出发位置所在传感器">
        <input type="text" v-model="endPoint" placeholder="输入目的地所在传感器">
        <button id="search_button" @click="searchRoute">搜索</button>
      </div>
    </div>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'font-awesome/css/font-awesome.min.css';
import Chart from 'chart.js/dist/Chart';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'LeafletMap',
  data() {
    return {
      map: null,
      startPoint: '',
      endPoint: '',
      markers: [], // 保存标记和位置
      searchQuery: '', // 搜索查询
      chart: null,
      polyline: null
    };
  },
  computed: {
    ...mapState('map_data', ['latestTimestamp', 'sensorData', 'topSpeedRanks', 'streetAverages', 'overallAverageSpeed', 'initialMarkers', 'currentSpeeds']),
    ...mapState('websocket', ['sensorData', 'streetAverages', 'overallAverageSpeed', 'latestTimestamp'])
  },
  mounted() {
    this.initMap();
    this.initChart();
    this.$store.dispatch('websocket/connect'); // 连接 WebSocket
    this.initCurrentSpeeds(); // 初始化 currentSpeeds
  },
  methods: {
    ...mapActions('map_data', [
      'updateTopSpeedRanks',
      'initCurrentSpeeds'
    ]),
    initChart() {
      const ctx = document.getElementById('averageSpeedChart').getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: '平均速度(英里/h)',
              data: [],
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            }
          ]
        },
        options: {
          responsive: true,
          title: {
            display: true,
            text: '所有传感器此刻平均速度',
            fontColor: '#FFFFFF'
          },
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                unit: 'minute',
                stepSize: 5, // 每5分钟一个时间间隔
                tooltipFormat: 'YYYY-MM-DD HH:mm', // 显示格式
                displayFormats: {
                  minute: 'YYYY-MM-DD HH:mm'
                }
              },
              ticks: {
                fontColor: '#FFFFFF'
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: '平均速度(英里/时)',
                fontColor: '#FFFFFF'
              },
              ticks: {
                fontColor: '#FFFFFF'
              }
            }]
          }
        }
      });
    },
    updateMarkers() {
      // 根据数据更新标记
      this.sensorData.forEach((point, i) => {
        const sensor_id = point.sensor_id; // 直接使用传入的 sensor_id
        if (!isNaN(point.speed)) { // 排除零值和非数字值，并确保位置有效
          if (i < this.markers.length) {
            const marker = this.markers[i];
            // 更新标记的颜色和popup内容
            marker.markerInstance
              .setPopupContent(`${marker.content} <br> Speed: ${point.speed} <br> Timestamp: ${point.timestamp}`)
              .setIcon(this.createCustomIcon(point.speed));
            // 更新当前速度
            this.$store.commit('map_data/UPDATE_CURRENT_SPEED', { sensor_id, speed: point.speed });
          } else {
            const { sensor_id, position, content, speed } = point;
            const popup = L.popup({ maxWidth: '100%' }).setContent(`<div style="width: 100%; height: 100%;">${content}</div>`);
            const markerInstance = L.marker(position, { icon: this.createCustomIcon(speed) }).addTo(this.map).bindPopup(popup);
            this.markers.push({ sensor_id, position, content, markerInstance, index: i });
            // 更新当前速度
            this.$store.commit('map_data/UPDATE_CURRENT_SPEED', { sensor_id, speed });
          }
        }
      });
      // 更新前十名
      this.updateTopSpeedRanks();
      // 更新图表数据
      if (this.chart) this.updateChartData();
    },
    updateTopSpeedRanks() {
      const topSpeedRanks = Object.entries(this.currentSpeeds)
        .map(([sensor_id, speed]) => ({ sensor_id, speed }))
        .filter(({ speed }) => speed > 0)  // 过滤掉速度为零的数据
        .sort((a, b) => a.speed - b.speed) // 按速度降序排序
        .slice(0, 10);                     // 截取前10个数据
      this.$store.commit('map_data/SET_TOP_SPEED_RANKS', topSpeedRanks);
    },
    updateChartData() {
      const timestamp = new Date().toISOString(); // 使用 ISO 格式的时间戳
      if (this.overallAverageSpeed === 0) return;
      // 添加新数据点到图表
      this.chart.data.labels.push(timestamp);
      this.chart.data.datasets[0].data.push(this.overallAverageSpeed);
      // 保持数据点在一定数量之内
      if (this.chart.data.labels.length > 100) {
        this.chart.data.labels.shift();
        this.chart.data.datasets[0].data.shift();
      }
      // 更新图表
      this.chart.update();
    },
    createCustomIcon(speed) {
      // 根据速度返回不同颜色的图标
      let color = 'rgb(172,31,20)'; //深红
      if (speed < 35) color = 'rgb(234,67,53)';
      else if (speed < 45) color = 'rgb(250,122,19)';
      else if (speed < 50) color = 'rgb(251,188,5)';
      else if (speed < 55) color = 'rgb(84,201,57)';
      else if (speed < 60) color = 'rgb(52,168,83)';
      else if (speed < 70) color = 'rgb(36,108,55)';
      else color = 'darkgreen';

      return L.divIcon({
        html: `<i class="fa fa-map-marker fa-2x map-marker" style="color:${color};"></i>`,
        iconSize: [20, 20],
        className: 'custom-div-icon'
      });
    },
    initMap() {
      this.map = L.map('map_cc7d1b7fb1ad09e0732bbbd940dd9c71', {
        center: [37.344741424615385, -121.94008344615385],
        zoom: 12,
        zoomControl: false,
      });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        detectRetina: false,
        maxNativeZoom: 19,
        maxZoom: 19,
        minZoom: 0,
        noWrap: false,
        opacity: 1,
        subdomains: 'abc',
        tms: false,
      }).addTo(this.map);

      // 初始化标记数据
      this.initialMarkers.forEach((marker, index) => {
        const { sensor_id, position, content, speed } = marker;
        const popup = L.popup({ maxWidth: '100%' }).setContent(`<div style="width: 100%; height: 100%;">${content}</div>`);
        const markerInstance = L.marker(position, { icon: this.createCustomIcon(speed) }).addTo(this.map).bindPopup(popup);
        this.markers.push({ sensor_id, position, content, markerInstance, index });
        // 初始化 currentSpeeds 中的传感器速度
        this.$store.commit('map_data/UPDATE_CURRENT_SPEED', { sensor_id, speed: 0 });
      });
      // 更新前十名
      this.updateTopSpeedRanks();
    },
    searchLocation() {
      const query = this.searchQuery.trim().toLowerCase();
      if (!query) return;
      // 根据传感器ID查找
      let found = false;
      for (let marker of this.markers) {
        if (marker.sensor_id.toString() === query) {
          this.map.setView(marker.position, 15);
          marker.markerInstance.openPopup();
          found = true;
          break;
        }
      }
      if (found) return;
      // 根据街道名查找
      for (let street in this.streetAverages) {
        if (street.toLowerCase().includes(query)) {
          const streetMarkers = this.markers.filter(marker => this.getStreetNameForSensor(marker.sensor_id).toLowerCase().includes(query));
          if (streetMarkers.length > 0) {
            this.map.setView(streetMarkers[0].position, 15);
            streetMarkers.forEach(marker => marker.markerInstance.openPopup());
            break;
          }
        }
      }
    },
    getStreetNameForSensor(sensor_id) {
      for (let street in this.streetAverages) {
        if (this.streetAverages[street].includes(sensor_id)) {
          return street;
        }
      }
      return '';
    },
    async searchRoute() {
      const startPoint = this.startPoint.trim();
      const endPoint = this.endPoint.trim();

      if (!startPoint || !endPoint) {
        alert('请填写起点和终点');
        return;
      }

      try {
        const response = await fetch('http://localhost:4999/search_route', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ startPoint, endPoint })
        });

        const result = await response.json();

        if (result.route) {
          this.plotRoute(result.route);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    plotRoute(route) {
      if (this.polyline) {
        this.map.removeLayer(this.polyline);
      }

      const latlngs = route.map(sensor_id => {
        const marker = this.markers.find(m => m.sensor_id === sensor_id);
        return marker ? marker.position : null;
      }).filter(position => position !== null);

      this.polyline = L.polyline(latlngs, { color: 'blue' }).addTo(this.map);

      this.map.fitBounds(this.polyline.getBounds());

      this.plotSpeedChart(route);
    },
    plotSpeedChart(route) {
      const speeds = route.map(sensor_id => {
        const speedData = this.currentSpeeds[sensor_id];
        return speedData ? speedData : 0;
      });

      const labels = route.map(sensor_id => sensor_id);

      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = speeds;

      this.chart.update();
    }
  },
  watch: {
    sensorData: 'updateMarkers'
  }
};
</script>

<style scoped>
#map_cc7d1b7fb1ad09e0732bbbd940dd9c71 {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: black;
  left: 0;
  top: 0;
}
.timestamp-box {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 16px;
  z-index: 1000;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: pulse 2s infinite;
}
.map-marker {
  position: relative;
  display: inline-block;
}

#speed_rank {
  width: 310px;
  height: 320px;
  transform: translateY(80px);
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.4);
  }
}
.leaflet-container {
  font-size: 1rem;
}
.custom-div-icon{
  text-shadow: 0 0 2px #000; /* 添加阴影效果 */
}
#chart {
  width: 750px;
  height: 280px;
  transform: translate(0px, 410px);
}
#street_speed_rank {
  width: 310px;
  height: 320px;
  transform: translate(1150px,80px);
}
#search_bar {
  width: 705px;
  height: 280px;
  transform: translate(755px, 410px);
}
#search_bar input {
  width: 500px;
  padding: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 5px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: background-color 0.3s ease;
  transform: translateY(10px);
}
#search_bar input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}
#search_bar input:focus {
  background-color: rgba(255, 255, 255, 0.2);
  outline: none;
}
#speed {
  width: 310px;
  height: 70px;
  transform: translate(1150px, 0px);
  background-image: url("/speed.png");
  background-size: cover;
  background-repeat: no-repeat;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
#search_bar button {
  padding: 5px 10px;
  background-color: #3b82f6;
  color: white;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  transform: translateY(10px);
  border: none;
  height: 45px;
  width:100px;
  margin-left: 10px;
}
#search_teach{
  width: 91%;
  height: 170px;
  border-radius:5px;
  transform: translate(5%,10px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 0.2);
}
#des_sensor,#des_street{
  width:90%;
  height:40%;
  margin-left:20px;
  margin-top:15px;
  padding:0px;
}
#des_sensor{
  transform:translateY(20px);
}
</style>
