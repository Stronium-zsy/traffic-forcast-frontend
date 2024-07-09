<template>
  <div style="width:1800px;height:1000px;">
    <div id="map_cc7d1b7fb1ad09e0732bbbd940dd9c71"></div>
    <div id="timestamp_box" class="timestamp-box">
      <p>Latest Timestamp: {{ predictLatestTimestamp }}</p>
    </div>
    <div id="speed" class="timestamp-box"></div>
    <div id="speed_rank" class="timestamp-box">
      <p>Bottom 10 Average Speeds:</p>
      <ul>
        <li v-for="rank in predictTopSpeedRanks" :key="rank.sensor_id">{{ rank.sensor_id }}: {{ rank.speed.toFixed(2) }} km/h</li>
      </ul>
    </div>
    <div id="chart" class="timestamp-box">
      <canvas id="averageSpeedChart" width="750" height="280"></canvas>
    </div>
    <div id="street_speed_rank" class="timestamp-box">
      <p>Street Average Speeds:</p>
      <ul>
        <li v-for="(avgSpeed, street) in predictStreetAverages" :key="street">{{ street }}: {{ avgSpeed !== null ? avgSpeed.toFixed(2) : 'No data' }} km/h</li>
      </ul>
    </div>
    <div id="search_bar" class="timestamp-box">
      <input type="text" v-model="searchQuery" placeholder="Enter Sensor ID or Street Name">
      <button @click="searchLocation">Search</button>
    </div>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'font-awesome/css/font-awesome.min.css';
import Chart from 'chart.js';
import {mapState, mapActions, mapGetters} from 'vuex';

export default {
  name: 'LeafletMap',
  data() {
    return {
      map: null,
      markers: [],
      searchQuery: '',
    };
  },
  computed: {
    ...mapState('predictMapData', [
      'predictLatestTimestamp',
      'predictSensorData',
      'predictTopSpeedRanks',
      'predictStreetAverages',
      'predictOverallAverageSpeed',
      'predictInitialMarkers',
      'predictCurrentSpeeds'
    ]),
    ...mapState('predictWebSocket', [
      'predictLatestTimestamp',
      'predictSensorData',
      'predictStreetAverages',
      'predictOverallAverageSpeed',
    ])
  },
  mounted() {
    this.initMap();
    this.initChart();
    this.$store.dispatch('predictWebSocket/predictConnect');
    this.$store.dispatch('predictMapData/predictInitCurrentSpeeds');
  },
  methods: {
    ...mapActions('predictMapData', [
      'predictUpdateTopSpeedRanks',
      'predictInitCurrentSpeeds'
    ]),
    initChart() {
      const ctx = document.getElementById('averageSpeedChart').getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [
            {
              label: 'Average Speed',
              data: [],
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
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
              scaleLabel: {
                display: true,
                labelString: 'Time'
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Average Speed (km/h)'
              }
            }]
          }
        }
      });
    },
    updateMarkers() {
      this.predictSensorData.forEach((point, i) => {
        const sensor_id = point.sensor_id; // 直接使用传入的 sensor_id
        if (!isNaN(point.speed)) { // 排除零值和非数字值，并确保位置有效
          if (i < this.markers.length) {
            const marker = this.markers[i];
            marker.markerInstance
              .setPopupContent(`${marker.content} <br> Speed: ${point.speed} <br> Timestamp: ${point.timestamp}`)
              .setIcon(this.createCustomIcon(point.speed));
            this.$store.commit('predictMapData/PREDICT_UPDATE_CURRENT_SPEED', {sensor_id, speed: point.speed});
          } else {
            const {sensor_id, position, content, speed} = point;
            const popup = L.popup({maxWidth: '100%'}).setContent(`<div style="width: 100%; height: 100%;">${content}</div>`);
            const markerInstance = L.marker(position, {icon: this.createCustomIcon(speed)}).addTo(this.map).bindPopup(popup);
            this.markers.push({sensor_id, position, content, markerInstance, index: i});
            this.$store.commit('predictMapData/PREDICT_UPDATE_CURRENT_SPEED', {sensor_id, speed});
          }
        }
      });
      this.predictUpdateTopSpeedRanks();
      if (this.chart) this.updateChartData();
    },
    predictUpdateTopSpeedRanks() {
      const topSpeedRanks = Object.entries(this.predictCurrentSpeeds)
        .map(([sensor_id, speed]) => ({sensor_id, speed}))
        .sort((a, b) => a.speed - b.speed)
        .slice(0, 10);
      this.$store.commit('predictMapData/PREDICT_SET_TOP_SPEED_RANKS', topSpeedRanks);
    },
    updateChartData() {
      const timestamp = new Date().toISOString(); // 使用 ISO 格式的时间戳
      if (this.predictOverallAverageSpeed === 0) return;
      // 添加新数据点到图表
      this.chart.data.labels.push(timestamp);
      this.chart.data.datasets[0].data.push(this.predictOverallAverageSpeed);
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
        html: `<i class="fa fa-map-marker fa-2x" style="color:${color};"></i>`,
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
      this.predictInitialMarkers.forEach((marker, index) => {
        const { sensor_id, position, content, speed } = marker;
        const popup = L.popup({ maxWidth: '100%' }).setContent(`<div style="width: 100%; height: 100%;">${content}</div>`);
        const markerInstance = L.marker(position, { icon: this.createCustomIcon(speed) }).addTo(this.map).bindPopup(popup);
        this.markers.push({ sensor_id, position, content, markerInstance, index });
        // 初始化 currentSpeeds 中的传感器速度
        this.$store.commit('predictMapData/PREDICT_UPDATE_CURRENT_SPEED', { sensor_id, speed: 0 });
      });
      // 更新前十名
      this.predictUpdateTopSpeedRanks();
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
      for (let street in this.predictStreetAverages) {
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
      for (let street in this.predictStreetAverages) {
        if (this.predictStreetAverages[street].includes(sensor_id)) {
          return street;
        }
      }
      return '';
    }
  },
  watch: {
    predictSensorData: 'updateMarkers'
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

.custom-div-icon .custom-icon {
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
  transform: translate(1150px, 80px);
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
  transform: translateY(100px);
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
  transform: translateY(100px);
  border: none;
  height: 45px;
  margin-left: 10px;
}
</style>
