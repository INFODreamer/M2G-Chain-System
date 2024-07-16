// import Vue from 'vue'
import { createRouter, createWebHistory } from 'vue-router';
import Index from '../views/index.vue'
import Terminal from '../views/TerminalMonitor.vue'

const routes = [{
    path: '/',
    name: 'Home', 
    component: Index
}, {
    path: '/ter',
    name: 'TerminalMonitor',
    component: Terminal
}
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router