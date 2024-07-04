<template>
  <div class="container">
    <h1 class="text-center">Analysis Data Dashboard</h1>

    <!-- Top Sensor Speeds -->
    <div class="card">
      <h2>Top Sensor Speeds</h2>
      <form @submit.prevent="fetchTopSensors">
        <label>
          Start Time:
          <input type="datetime-local" v-model="topSensorsStartTime" required>
        </label>
        <label>
          End Time:
          <input type="datetime-local" v-model="topSensorsEndTime" required>
        </label>
        <label>
          Top N Sensors:
          <input type="number" v-model.number="topNSensors" required>
        </label>
        <button type="submit">Fetch</button>
      </form>
      <img v-if="topSensorsImage" :src="topSensorsImage" alt="Top Sensors" class="result-image">
    </div>

    <!-- Bottom Sensor Speeds -->
    <div class="card">
      <h2>Bottom Sensor Speeds</h2>
      <form @submit.prevent="fetchBottomSensors">
        <label>
          Start Time:
          <input type="datetime-local" v-model="bottomSensorsStartTime" required>
        </label>
        <label>
          End Time:
          <input type="datetime-local" v-model="bottomSensorsEndTime" required>
        </label>
        <label>
          Bottom N Sensors:
          <input type="number" v-model.number="bottomNSensors" required>
        </label>
        <button type="submit">Fetch</button>
      </form>
      <img v-if="bottomSensorsImage" :src="bottomSensorsImage" alt="Bottom Sensors" class="result-image">
    </div>

    <!-- Top Street Speeds -->
    <div class="card">
      <h2>Top Street Speeds</h2>
      <form @submit.prevent="fetchTopStreets">
        <label>
          Timestep:
          <input type="datetime-local" v-model="topStreetsTimestep" required>
        </label>
        <label>
          Top N Streets:
          <input type="number" v-model.number="topNStreets" required>
        </label>
        <button type="submit">Fetch</button>
      </form>
      <img v-if="topStreetsImage" :src="topStreetsImage" alt="Top Streets" class="result-image">
    </div>

    <!-- Bottom Street Speeds -->
    <div class="card">
      <h2>Bottom Street Speeds</h2>
      <form @submit.prevent="fetchBottomStreets">
        <label>
          Timestep:
          <input type="datetime-local" v-model="bottomStreetsTimestep" required>
        </label>
        <label>
          Bottom N Streets:
          <input type="number" v-model.number="bottomNStreets" required>
        </label>
        <button type="submit">Fetch</button>
      </form>
      <img v-if="bottomStreetsImage" :src="bottomStreetsImage" alt="Bottom Streets" class="result-image">
    </div>

    <!-- Sensor Speed Plot -->
    <div class="card">
      <h2>Sensor Speed Plot</h2>
      <form @submit.prevent="fetchSensorSpeed">
        <label>
          Sensor ID:
          <input type="text" v-model="sensorid" placeholder="Sensor ID" required>
        </label>
        <label>
          Start Time:
          <input type="datetime-local" v-model="sensorStartTime" required>
        </label>
        <label>
          End Time:
          <input type="datetime-local" v-model="sensorEndTime" required>
        </label>
        <button type="submit">Fetch</button>
      </form>
      <img v-if="sensorSpeedImage" :src="sensorSpeedImage" alt="Sensor Speed" class="result-image">
    </div>

    <!-- Street Speed Plot -->
    <div class="card">
      <h2>Street Speed Plot</h2>
      <form @submit.prevent="fetchStreetSpeed">
        <label>
          Street:
          <input type="text" v-model="street" placeholder="Street" required>
        </label>
        <label>
          Start Time:
          <input type="datetime-local" v-model="streetStartTime" required>
        </label>
        <label>
          End Time:
          <input type="datetime-local" v-model="streetEndTime" required>
        </label>
        <button type="submit">Fetch</button>
      </form>
      <img v-if="streetSpeedImage" :src="streetSpeedImage" alt="Street Speed" class="result-image">
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      // Top Sensors
      topSensorsStartTime: '2017-01-01 00:00:00',
      topSensorsEndTime: '2017-01-01 00:00:00',
      topNSensors: 10,
      topSensorsImage: null,

      // Bottom Sensors
      bottomSensorsStartTime: '2017-01-01 00:00:00',
      bottomSensorsEndTime: '2017-01-01 00:00:00',
      bottomNSensors: 10,
      bottomSensorsImage: null,

      // Top Streets
      topStreetsTimestep: '',
      topNStreets: 5,
      topStreetsImage: null,

      // Bottom Streets
      bottomStreetsTimestep: '',
      bottomNStreets: 5,
      bottomStreetsImage: null,

      // Sensor Speed Plot
      sensorid: '',
      sensorStartTime: '2017-01-01 00:00:00',
      sensorEndTime: '2017-01-01 00:00:00',
      sensorSpeedImage: null,

      // Street Speed Plot
      street: '',
      streetStartTime: '2017-01-01 00:00:00',
      streetEndTime: '2017-01-01 00:00:00',
      streetSpeedImage: null,
    };
  },
  methods: {
    roundMinutesToNearest5(datetime) {
      const date = new Date(datetime);
      const minutes = date.getMinutes();
      const roundedMinutes = Math.round(minutes / 5) * 5;
      date.setMinutes(roundedMinutes, 0, 0);
      return date.toISOString().slice(0, 16).replace('T', ' ');
    },
    async fetchTopSensors() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/avg_top_sensors', {
          params: {
            start_time: this.roundMinutesToNearest5(this.topSensorsStartTime),
            end_time: this.roundMinutesToNearest5(this.topSensorsEndTime),
            n: this.topNSensors
          },
          responseType: 'blob'
        });
        this.topSensorsImage = URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error fetching top sensors:', error);
      }
    },
    async fetchBottomSensors() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/avg_bottom_sensors', {
          params: {
            start_time: this.roundMinutesToNearest5(this.bottomSensorsStartTime),
            end_time: this.roundMinutesToNearest5(this.bottomSensorsEndTime),
            n: this.bottomNSensors
          },
          responseType: 'blob'
        });
        this.bottomSensorsImage = URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error fetching bottom sensors:', error);
      }
    },
    async fetchTopStreets() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/max_top_street', {
          params: {
            timestep: this.roundMinutesToNearest5(this.topStreetsTimestep),
            n: this.topNStreets
          },
          responseType: 'blob'
        });
        this.topStreetsImage = URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error fetching top streets:', error);
      }
    },
    async fetchBottomStreets() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/min_bottom_street', {
          params: {
            timestep: this.roundMinutesToNearest5(this.bottomStreetsTimestep),
            n: this.bottomNStreets
          },
          responseType: 'blob'
        });
        this.bottomStreetsImage = URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error fetching bottom streets:', error);
      }
    },
    async fetchSensorSpeed() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/plot_sensor_speed', {
          params: {
            sensorid: this.sensorid,
            start_time: this.roundMinutesToNearest5(this.sensorStartTime),
            end_time: this.roundMinutesToNearest5(this.sensorEndTime)
          },
          responseType: 'blob'
        });
        this.sensorSpeedImage = URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error fetching sensor speed:', error);
      }
    },
    async fetchStreetSpeed() {
      try {
        const response = await axios.get('http://127.0.0.1:5000/plot_street_speed', {
          params: {
            street: this.street,
            start_time: this.roundMinutesToNearest5(this.streetStartTime),
            end_time: this.roundMinutesToNearest5(this.streetEndTime)
          },
          responseType: 'blob'
        });
        this.streetSpeedImage = URL.createObjectURL(response.data);
      } catch (error) {
        console.error('Error fetching street speed:', error);
      }
    },
  }
};
</script>

<style>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.text-center {
  text-align: center;
}

.card {
  background-color: #f9f9f9;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-bottom: 20px;
}

.card form {
  display: flex;
  flex-direction: column;
}

.card label {
  margin-bottom: 10px;
}

.card input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-bottom: 20px;
}

.card button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.card button:hover {
  background-color: #0056b3;
}

.result-image {
  max-width: 100%;
  margin-top: 20px;
  border-radius: 8px;
}
</style>
