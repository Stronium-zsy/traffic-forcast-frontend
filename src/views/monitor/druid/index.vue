<template>
  <div class="container">
    <h1 class="text-center">数据统计面板</h1>
    <div class="card">
      <form @submit.prevent="fetchData">
        <div class="form-group">
          <label>数据统计开始日期:</label>
          <input type="datetime-local" v-model="startTime" required>
        </div>
        <div class="form-group">
          <label>数据统计结束日期:</label>
          <input type="datetime-local" v-model="endTime" required>
        </div>
        <div class="form-group">
          <label>平均速度前N的传感器ID:</label>
          <input type="number" v-model.number="topNSensors">
        </div>
        <div class="form-group">
          <label>平均速度后N的传感器ID:</label>
          <input type="number" v-model.number="bottomNSensors">
        </div>
        <div class="form-group">
          <label>平均速度前N的街道名称:</label>
          <input type="number" v-model.number="topNStreets">
        </div>
        <div class="form-group">
          <label>平均速度后N的街道名称:</label>
          <input type="number" v-model.number="bottomNStreets">
        </div>
        <div class="form-group">
          <label>传感器ID:</label>
          <input type="text" v-model="sensorid" placeholder="Sensor ID">
        </div>
        <div class="form-group">
          <label>街道名称:</label>
          <input type="text" v-model="street" placeholder="Street">
        </div>
        <button type="submit">统计数据</button>
      </form>

      <div v-if="images.length">
        <div v-for="(image, index) in images" :key="index" class="result-image-container">
          <img :src="image.src" :alt="image.alt" class="result-image">
          <p>{{ image.title }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      startTime: '2024-01-01 00:00:00',
      endTime: '2024-01-01 00:00:00',
      topNSensors: null,
      bottomNSensors: null,
      topNStreets: null,
      bottomNStreets: null,
      sensorid: '',
      street: '',
      images: [],
    };
  },
  methods: {
    roundMinutesToNearest5(datetime) {
      // 去掉时间字符串中的T
      let dateStr = datetime.replace('T', ' ');

      // 将日期和时间部分分开
      let [datePart, timePart] = dateStr.split(' ');

      // 将时间部分分成小时和分钟
      let [hours, minutes] = timePart.split(':').map(Number);

      // 四舍五入到最近的5分钟
      let roundedMinutes = Math.round(minutes / 5) * 5;

      // 如果四舍五入后的分钟数超过了59，需要处理小时和天数
      if (roundedMinutes === 60) {
        roundedMinutes = 0;
        hours += 1;
        if (hours === 24) {
          hours = 0;
          // 简单处理日期部分，假设每月有30天
          let [year, month, day] = datePart.split('-').map(Number);
          day += 1;
          if (day > 30) {
            day = 1;
            month += 1;
            if (month > 12) {
              month = 1;
              year += 1;
            }
          }
          datePart = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        }
      }

      // 构造新的时间部分字符串
      let newTimePart = `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;

      // 返回新的日期时间字符串
      return `${datePart} ${newTimePart}`;
    },
    async fetchData() {
      this.images = [];
      if (this.topNSensors) {
        await this.fetchTopSensors();
      }
      if (this.bottomNSensors) {
        await this.fetchBottomSensors();
      }
      if (this.topNStreets) {
        await this.fetchTopStreets();
      }
      if (this.bottomNStreets) {
        await this.fetchBottomStreets();
      }
      if (this.sensorid) {
        await this.fetchSensorSpeed();
      }
      if (this.street) {
        await this.fetchStreetSpeed();
      }
    },
    async fetchTopSensors() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/avg_top_sensors', {
          params: {
            start_time: this.roundMinutesToNearest5(this.startTime),
            end_time: this.roundMinutesToNearest5(this.endTime),
            n: this.topNSensors
          },
          responseType: 'blob'
        });
        this.images.push({ src: URL.createObjectURL(response.data), alt: 'Top Sensors', title: 'Top Sensors' });
      } catch (error) {
        console.error('Error fetching top sensors:', error);
      }
    },
    async fetchBottomSensors() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/avg_bottom_sensors', {
          params: {
            start_time: this.roundMinutesToNearest5(this.startTime),
            end_time: this.roundMinutesToNearest5(this.endTime),
            n: this.bottomNSensors
          },
          responseType: 'blob'
        });
        this.images.push({ src: URL.createObjectURL(response.data), alt: 'Bottom Sensors', title: 'Bottom Sensors' });
      } catch (error) {
        console.error('Error fetching bottom sensors:', error);
      }
    },
    async fetchTopStreets() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/max_top_street', {

          params: {
            timestep: this.roundMinutesToNearest5(this.startTime),
            n: this.topNStreets
          },
          responseType: 'blob'
        });
        this.images.push({ src: URL.createObjectURL(response.data), alt: 'Top Streets', title: 'Top Streets' });
      } catch (error) {
        console.error('Error fetching top streets:', error);
      }
    },
    async fetchBottomStreets() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/min_bottom_street', {
          params: {
            timestep: this.roundMinutesToNearest5(this.startTime),
            n: this.bottomNStreets
          },
          responseType: 'blob'
        });
        this.images.push({ src: URL.createObjectURL(response.data), alt: 'Bottom Streets', title: 'Bottom Streets' });
      } catch (error) {
        console.error('Error fetching bottom streets:', error);
      }
    },
    async fetchSensorSpeed() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/plot_sensor_speed', {
          params: {
            sensorid: this.sensorid,
            start_time: this.roundMinutesToNearest5(this.startTime),
            end_time: this.roundMinutesToNearest5(this.endTime)
          },
          responseType: 'blob'
        });
        this.images.push({ src: URL.createObjectURL(response.data), alt: 'Sensor Speed', title: 'Sensor Speed' });
      } catch (error) {
        console.error('Error fetching sensor speed:', error);
      }
    },
    async fetchStreetSpeed() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/plot_street_speed', {
          params: {
            street: this.street,
            start_time: this.roundMinutesToNearest5(this.startTime),
            end_time: this.roundMinutesToNearest5(this.endTime)
          },
          responseType: 'blob'
        });
        this.images.push({ src: URL.createObjectURL(response.data), alt: 'Street Speed', title: 'Street Speed' });
      } catch (error) {
        console.error('Error fetching street speed:', error);
      }
    },
  }
};
</script>

<style>
.container {
  max-width: 1500px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #1c1e24;
  color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.text-center {
  text-align: center;
  margin-bottom: 20px;
  color: #ffffff;
}

.card {
  background-color: #282c34;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.card form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.card .form-group {
  display: flex;
  flex-direction: column;
}

.card label {
  margin-bottom: 5px;
  color: #bbb;
}

.card input {
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #3a3f47;
  color: #fff;
  margin-bottom: 20px;
}

.card button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  grid-column: span 2;
}

.card button:hover {
  background-color: #0056b3;
}

.result-image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.result-image {
  max-width: 100%;
  margin-top: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
