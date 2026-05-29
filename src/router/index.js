import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['admin'] }, 
    },
    {
      path: '/pos',
      name: 'pos',
      component: () => import('../views/PosView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['seller', 'admin'] },
    },
    {
      path: '/warehouses',
      name: 'warehouses',
      component: () => import('../views/WarehousesView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['seller', 'admin'] }, 
    },
    {
      path: '/procurement',
      name: 'procurement',
      component: () => import('../views/ProcurementView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['admin'] }, 
    },
    {
      path: '/repairs',
      name: 'repairs',
      component: () => import('../views/RepairsView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['seller', 'admin'] },
    },
    {
      path: '/finance',
      name: 'finance',
      component: () => import('../views/FinanceView.vue'),
      meta: { requiresAuth: true, allowedRoles: ['admin'] },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach((to, from) => {
  const token = localStorage.getItem('token')
  let userRole = null

  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      userRole = JSON.parse(userStr).role
    }
  } catch (error) {
    console.error('Помилка читання ролі користувача')
  }

  if (to.meta.requiresAuth && !token) {
    return '/login'
  } else if (to.meta.guestOnly && token) {
    return userRole === 'admin' ? '/warehouses' : '/pos'
  } else if (to.meta.requiresAuth && to.meta.allowedRoles) {
    if (userRole && to.meta.allowedRoles.includes(userRole)) {
      return true
    } else {
      return userRole === 'seller' ? '/pos' : '/login'
    }
  }
  return true
})

export default router
