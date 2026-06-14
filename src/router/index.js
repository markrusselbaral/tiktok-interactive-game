import { createRouter, createWebHistory } from 'vue-router'
import ArenaView from '../views/ArenaView.vue'
import RosterView from '../views/RosterView.vue'
import InstructionsView from '../views/InstructionsView.vue'
import SkillsView from '../views/SkillsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'arena',
      component: ArenaView,
    },
    {
      path: '/roster',
      name: 'roster',
      component: RosterView,
    },
    {
      path: '/instructions',
      name: 'instructions',
      component: InstructionsView,
    },
    {
      path: '/skills',
      name: 'skills',
      component: SkillsView,
    },
  ],
})

export default router
