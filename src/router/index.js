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

// Burp XML Import
import BurpXMLImport from '../views/BurpXMLImport.vue'

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
  },
  // Burp XML Import
  {
    path: '/import-burp-xml',
    name: 'BurpXMLImport',
    component: BurpXMLImport
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

// Navigation guard to set dynamic page titles
router.afterEach((to, from) => {
  // Only set titles for authenticated users
  if (!store.getters.isAuthenticated) {
    document.title = 'Bug Hunting Record & Analysis'
    return
  }

  const baseTitle = 'Bug Hunting Record & Analysis'
  let pageTitle = ''

  // Generate page title based on route
  switch (to.name) {
    case 'Home':
      pageTitle = 'Dashboard'
      break
    
    case 'ProgramsList':
      pageTitle = 'Programs'
      break
    
    case 'ProgramCreate':
      pageTitle = 'Create Program'
      break
    
    case 'ProgramDetail':
      pageTitle = `Program Details: ${to.params.id}`
      break
    
    case 'ProgramEdit':
      pageTitle = `Edit Program: ${to.params.id}`
      break
    
    case 'EndpointsList':
      pageTitle = 'Endpoints'
      break
    
    case 'EndpointCreate':
      pageTitle = 'Create Endpoint'
      break
    
    case 'EndpointDetail':
      pageTitle = `Endpoint Details: ${to.params.id}`
      break
    
    case 'EndpointEdit':
      pageTitle = `Edit Endpoint: ${to.params.id}`
      break
    
    case 'RequestsList':
      // Check for query parameters to show filters
      const queryParams = []
      if (to.query.program_id) queryParams.push(`program_id=${to.query.program_id}`)
      if (to.query.endpoint_id) queryParams.push(`endpoint_id=${to.query.endpoint_id}`)
      if (to.query.job_id) queryParams.push(`job_id=${to.query.job_id}`)
      if (to.query.search) queryParams.push(`search=${to.query.search}`)
      
      if (queryParams.length > 0) {
        pageTitle = `Request Listing: ${queryParams.join(', ')}`
      } else {
        pageTitle = 'Request Listing'
      }
      break
    
    case 'RequestDetail':
      pageTitle = `Request Details: ${to.params.id}`
      break
    
    case 'NotesList':
      // Check for query parameters to show filters
      const noteQueryParams = []
      if (to.query.reference_type) noteQueryParams.push(`type=${to.query.reference_type}`)
      if (to.query.reference_id) noteQueryParams.push(`id=${to.query.reference_id}`)
      if (to.query.search) noteQueryParams.push(`search=${to.query.search}`)
      
      if (noteQueryParams.length > 0) {
        pageTitle = `Notes: ${noteQueryParams.join(', ')}`
      } else {
        pageTitle = 'Notes'
      }
      break
    
    case 'NoteDetail':
      pageTitle = `Note Details: ${to.params.id}`
      break
    
    case 'JobsList':
      pageTitle = 'Import Jobs'
      break
    
    case 'HARImport':
      pageTitle = 'Import HAR File'
      break
    
    case 'BurpXMLImport':
      pageTitle = 'Import Burp XML File'
      break
    
    case 'Unauthenticated':
      pageTitle = 'Authentication Required'
      break
    
    default:
      pageTitle = 'Bug Hunting Record & Analysis'
  }

  // Set the document title
  document.title = pageTitle ? `${pageTitle} - ${baseTitle}` : baseTitle
})

export default router
