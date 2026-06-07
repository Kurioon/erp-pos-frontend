import { createRouter, createWebHistory } from 'vue-router'
import { USER_ROLES } from '@/constants/roles'

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
      meta: { requiresAuth: true, allowedRoles: [USER_ROLES.ADMIN] },
    },
    {
      path: '/pos',
      name: 'pos',
      component: () => import('../views/PosView.vue'),
      meta: { requiresAuth: true, allowedRoles: [USER_ROLES.SELLER, USER_ROLES.ADMIN] },
    },
    {
      path: '/warehouses',
      name: 'warehouses',
      component: () => import('../views/WarehousesView.vue'),
      meta: { requiresAuth: true, allowedRoles: [USER_ROLES.SELLER, USER_ROLES.ADMIN] },
    },
    {
      path: '/procurement',
      name: 'procurement',
      component: () => import('../views/ProcurementView.vue'),
      meta: { requiresAuth: true, allowedRoles: [USER_ROLES.ADMIN] },
    },
    {
      path: '/counterparties',
      name: 'counterparties',
      component: () => import('../views/CounterpartiesView.vue'),
      meta: { requiresAuth: true, allowedRoles: [USER_ROLES.ADMIN] },
    },
    {
      path: '/repairs',
      name: 'repairs',
      component: () => import('../views/RepairsView.vue'),
      meta: { requiresAuth: true, allowedRoles: [USER_ROLES.SELLER, USER_ROLES.ADMIN] },
    },
    {
      path: '/finance',
      name: 'finance',
      component: () => import('../views/FinanceView.vue'),
      meta: { requiresAuth: true, allowedRoles: [USER_ROLES.ADMIN] },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, allowedRoles: [USER_ROLES.ADMIN] },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const userRole = payload.role
      
      if (to.meta.requiresAdmin && userRole !== 'admin') {
        return { name: 'dashboard' }
      }
    } catch {
      console.error('Помилка читання ролі користувача')
    }
  }

  if (to.meta.requiresAuth && !token) {
  }
  return true
})

export default router
