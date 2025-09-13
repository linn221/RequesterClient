import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

// Import components
import Home from '../views/Home.vue'
import Unauthenticated from '../views/Unauthenticated.vue'

// Programs
import ProgramsList from '../views/programs/ProgramsList.vue'
import ProgramDetail from '../views/programs/ProgramDetail.vue'
import ProgramCreate from '../views/programs/ProgramCreate.vue'
import ProgramEdit from '../views/programs/ProgramEdit.vue'

// Endpoints
import EndpointsList from '../views/endpoints/EndpointsList.vue'
import EndpointDetail from '../views/endpoints/EndpointDetail.vue'
import EndpointCreate from '../views/endpoints/EndpointCreate.vue'
import EndpointEdit from '../views/endpoints/EndpointEdit.vue'

// Requests
import RequestsList from '../views/requests/RequestsList.vue'
import RequestDetail from '../views/requests/RequestDetail.vue'

// Notes
import NotesList from '../views/notes/NotesList.vue'
import NoteDetail from '../views/notes/NoteDetail.vue'

// Jobs
import JobsList from '../views/jobs/JobsList.vue'

// HAR Import
import HARImport from '../views/HARImport.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/unauthenticated',
    name: 'Unauthenticated',
    component: Unauthenticated
  },
  // Programs routes
  {
    path: '/programs',
    name: 'ProgramsList',
    component: ProgramsList
  },
  {
    path: '/programs/create',
    name: 'ProgramCreate',
    component: ProgramCreate
  },
  {
    path: '/programs/:id',
    name: 'ProgramDetail',
    component: ProgramDetail,
    props: true
  },
  {
    path: '/programs/:id/edit',
    name: 'ProgramEdit',
    component: ProgramEdit,
    props: true
  },
  // Endpoints routes
  {
    path: '/endpoints',
    name: 'EndpointsList',
    component: EndpointsList
  },
  {
    path: '/endpoints/create',
    name: 'EndpointCreate',
    component: EndpointCreate
  },
  {
    path: '/endpoints/:id',
    name: 'EndpointDetail',
    component: EndpointDetail,
    props: true
  },
  {
    path: '/endpoints/:id/edit',
    name: 'EndpointEdit',
    component: EndpointEdit,
    props: true
  },
  // Requests routes
  {
    path: '/requests',
    name: 'RequestsList',
    component: RequestsList
  },
  {
    path: '/requests/:id',
    name: 'RequestDetail',
    component: RequestDetail,
    props: true
  },
  // Notes routes
  {
    path: '/notes',
    name: 'NotesList',
    component: NotesList
  },
  {
    path: '/notes/:id',
    name: 'NoteDetail',
    component: NoteDetail,
    props: true
  },
  // Jobs routes
  {
    path: '/jobs',
    name: 'JobsList',
    component: JobsList
  },
  // HAR Import
  {
    path: '/import-har',
    name: 'HARImport',
    component: HARImport
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  if (!store.getters.isAuthenticated && to.name !== 'Unauthenticated') {
    next({ name: 'Unauthenticated' })
  } else if (store.getters.isAuthenticated && to.name === 'Unauthenticated') {
    next({ name: 'Home' })
  } else {
    next()
  }
})

export default router
