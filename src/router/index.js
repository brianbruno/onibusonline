import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import LoadScript from 'vue-plugin-load-script'

Vue.use(LoadScript)
Vue.use(VueRouter)

Vue.loadScript('https://unpkg.com/leaflet@1.6.0/dist/leaflet.js')

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

export default function (/* { store, ssrContext } */) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  return Router
}
