const state = {
  socket: null,
  isConnected: false,
  sensorData: [],
  streetAverages: {},
  overallAverageSpeed: 0,
  latestTimestamp: '',
};

const mutations = {
  SET_SOCKET(state, socket) {
    state.socket = socket;
  },
  SET_CONNECTED(state, isConnected) {
    state.isConnected = isConnected;
  },
  SET_SENSOR_DATA(state, data) {
    state.sensorData = data;
  },
  SET_STREET_AVERAGES(state, averages) {
    state.streetAverages = averages;
  },
  SET_OVERALL_AVERAGE_SPEED(state, speed) {
    state.overallAverageSpeed = speed;
  },
  SET_LATEST_TIMESTAMP(state, timestamp) {
    state.latestTimestamp = timestamp;
  }
};

const actions = {
  connect({ commit, dispatch }) {
    if (!state.isConnected) {
      const socket = new WebSocket('ws://localhost:5002');
      socket.onopen = () => {
        commit('SET_CONNECTED', true);
        commit('SET_SOCKET', socket);
        console.log('Connected to WebSocket server');
      };
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        dispatch('handleMessage', data);
      };
      socket.onclose = () => {
        commit('SET_CONNECTED', false);
        commit('SET_SOCKET', null);
      };
    }
  },
  handleMessage({ commit }, data) {
    commit('SET_SENSOR_DATA', data.sensor_data);

    // 对 data.street_averages 进行排序，从小到大
    const sortedStreetAverages = Object.entries(data.street_averages)
      .sort((a, b) => (b[1] !== null ? b[1] : -Infinity) - (a[1] !== null ? a[1] : -Infinity))
      .reduce((obj, [street, avgSpeed]) => {
        obj[street] = avgSpeed;
        return obj;
      }, {});

    // 使用排序后的数据进行 commit
    commit('SET_STREET_AVERAGES', sortedStreetAverages);
    commit('SET_OVERALL_AVERAGE_SPEED', data.overall_average_speed);

    if (data.sensor_data.length > 0) {
      commit('SET_LATEST_TIMESTAMP', data.sensor_data[0].timestamp);
    }
  }

};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
