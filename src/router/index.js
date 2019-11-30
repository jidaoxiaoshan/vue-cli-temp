import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const router = new Router({
  mode: "history",
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('../views/index')
    },
    {
      path: '/a',
      name: 'a',
      component: () => import(/* webpackChunkName: "a" */ '../views/a.vue')
    },
    {
      path: '/b',
      name: 'b',
      component: () => import(/* webpackChunkName: "b" */ '../views/b.vue')
    }
  ]
})
