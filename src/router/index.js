import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    component: () => import('@/views/login')
  },
  {
    path: '/',
    component: () => import('@/views/layout'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard')
      },
      {
        path: 'article',
        component: () => import('@/views/article')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

const whiteList = ['/login']

router.beforeEach((to, from, next) => {
  const token = store.state.user.token
  if (whiteList.includes(to.path)) {
    if (token) {
      next(from.path)
    } else {
      next()
    }
  } else {
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
