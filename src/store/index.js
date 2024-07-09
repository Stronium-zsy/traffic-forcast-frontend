import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import dict from './modules/dict'
import user from './modules/user'
import tagsView from './modules/tagsView'
import permission from './modules/permission'
import settings from './modules/settings'
import map_data from './modules/map_data'
import predictMapData from './modules/predictMapData'
import predictWebSocket from './modules/predictWebSocket'
import getters from './getters'
import websocket from "./modules/websocket";

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    dict,
    user,
    tagsView,
    permission,
    settings,
    map_data,
    websocket,
    predictMapData,
    predictWebSocket,
  },
  getters
})

export default store

