import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Character from '../views/Character.vue';
import Editor from '../views/Editor.vue';
import Game from '../views/Game.vue';
import Search from "../views/Search.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/search',
    name: "Search",
    component: Search
  },
  {
    path: '/character/:id',
    name: 'Character',
    component: Character
  },
  {
    path: '/edit/:id',
    name: 'Edit Character',
    component: Editor
  },
  {
    path: '/game/:id',
    name: 'Game',
    component: Game
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
