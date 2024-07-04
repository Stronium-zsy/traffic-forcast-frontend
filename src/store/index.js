import Vue from 'vue'
import Vuex from 'vuex'
import app from './modules/app'
import dict from './modules/dict'
import user from './modules/user'
import tagsView from './modules/tagsView'
import permission from './modules/permission'
import settings from './modules/settings'
import map_data from './modules/map_data'  // 修改导入名称为 map_data
import getters from './getters'
import websocket from './modules/websocket';

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    dict,
    user,
    tagsView,
    permission,
    settings,
    websocket,
    map_data  // 使用 map_data 作为模块名称
  },
  getters
})

export default store
