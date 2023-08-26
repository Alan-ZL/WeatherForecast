import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "home",
            component: () => import('@/views/HomeView.vue')
        },
        {
            path: "/result",
            name: "result",
            component: () => import('@/views/SearchResultView.vue'),
            props: true,
        },
    ],

})

export default router