const state = {
  predictSocket: null,
  predictIsConnected: false,
  predictSensorData: [],
  predictStreetAverages: {},
  predictOverallAverageSpeed: 0,
  predictLatestTimestamp: '',
};

const mutations = {
  PREDICT_SET_SOCKET(state, socket) {
    state.predictSocket = socket;
  },
  PREDICT_SET_CONNECTED(state, isConnected) {
    state.predictIsConnected = isConnected;
  },
  PREDICT_SET_SENSOR_DATA(state, data) {

    state.predictSensorData = data;
  },
  PREDICT_SET_STREET_AVERAGES(state, averages) {
    state.predictStreetAverages = averages;
  },
  PREDICT_SET_OVERALL_AVERAGE_SPEED(state, speed) {
    state.predictOverallAverageSpeed = speed;
  },
  PREDICT_SET_LATEST_TIMESTAMP(state, timestamp) {
    state.predictLatestTimestamp = timestamp;
  }
};

const actions = {
  predictConnect({ commit, dispatch }) {
    if (!state.predictIsConnected) {
      const socket = new WebSocket('ws://172.20.10.2:5001');
      socket.onopen = () => {
        commit('PREDICT_SET_CONNECTED', true);
        commit('PREDICT_SET_SOCKET', socket);
        console.log('Connected to WebSocket server');
        // 发送预测时间和预测时间长度
      };
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        dispatch('predictHandleMessage', data);
      };
      socket.onclose = () => {
        commit('PREDICT_SET_CONNECTED', false);
        commit('PREDICT_SET_SOCKET', null);
      };
    }
  },
  predictHandleMessage({ commit }, data) {
    commit('PREDICT_SET_SENSOR_DATA', data.sensor_data);
    console.log(data);

    // 对 data.street_averages 进行排序，从小到大
    const sortedStreetAverages = Object.entries(data.street_averages)
      .sort((a, b) => (b[1] !== null ? b[1] : -Infinity) - (a[1] !== null ? a[1] : -Infinity))
      .reduce((obj, [street, avgSpeed]) => {
        obj[street] = avgSpeed;
        return obj;
      }, {});

    // 使用排序后的数据进行 commit
    commit('PREDICT_SET_STREET_AVERAGES', sortedStreetAverages);
    commit('PREDICT_SET_OVERALL_AVERAGE_SPEED', data.overall_average_speed);

    if (data.sensor_data.length > 0) {
      commit('PREDICT_SET_LATEST_TIMESTAMP', data.sensor_data[0].timestamp);
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
