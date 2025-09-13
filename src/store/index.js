import { createStore } from 'vuex'
import { apiRequest } from '../config/api'

export default createStore({
  state: {
    isAuthenticated: true, // Start as authenticated, will be set to false on 401
    loading: false,
    error: null,
    programs: [],
    endpoints: [],
    requests: [],
    notes: [],
    jobs: []
  },

  mutations: {
    SET_AUTHENTICATED(state, value) {
      state.isAuthenticated = value
    },
    SET_LOADING(state, value) {
      state.loading = value
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    CLEAR_ERROR(state) {
      state.error = null
    },
    SET_PROGRAMS(state, programs) {
      state.programs = programs
    },
    SET_ENDPOINTS(state, endpoints) {
      state.endpoints = endpoints
    },
    SET_REQUESTS(state, requests) {
      state.requests = requests
    },
    SET_NOTES(state, notes) {
      state.notes = notes
    },
    SET_JOBS(state, jobs) {
      state.jobs = jobs
    }
  },

  actions: {
    async makeApiCall({ commit }, { endpoint, options = {} }) {
      commit('SET_LOADING', true)
      commit('CLEAR_ERROR')
      
      try {
        const result = await apiRequest(endpoint, options)
        commit('SET_LOADING', false)
        return result
      } catch (error) {
        commit('SET_LOADING', false)
        
        // Handle 401 as unauthenticated
        if (error.status === 401 || error.message.includes('401')) {
          commit('SET_AUTHENTICATED', false)
          commit('SET_ERROR', 'Authentication required')
        } else {
          commit('SET_ERROR', error.message || 'An unexpected error occurred')
        }
        throw error
      }
    },

    // Programs
    async fetchPrograms({ commit, dispatch }) {
      try {
        const result = await dispatch('makeApiCall', { endpoint: '/programs' })
        commit('SET_PROGRAMS', result.data)
        return result.data
      } catch (error) {
        console.error('Error fetching programs:', error)
        throw error
      }
    },

    async createProgram({ dispatch }, programData) {
      try {
        const result = await dispatch('makeApiCall', {
          endpoint: '/programs',
          options: {
            method: 'POST',
            body: JSON.stringify(programData)
          }
        })
        return result.data
      } catch (error) {
        console.error('Error creating program:', error)
        throw error
      }
    },

    async updateProgram({ dispatch }, { id, programData }) {
      try {
        const result = await dispatch('makeApiCall', {
          endpoint: `/programs/${id}`,
          options: {
            method: 'PUT',
            body: JSON.stringify(programData)
          }
        })
        return result
      } catch (error) {
        console.error('Error updating program:', error)
        throw error
      }
    },

    async deleteProgram({ dispatch }, id) {
      try {
        const result = await dispatch('makeApiCall', {
          endpoint: `/programs/${id}`,
          options: {
            method: 'DELETE'
          }
        })
        return result
      } catch (error) {
        console.error('Error deleting program:', error)
        throw error
      }
    },

    // Endpoints
    async fetchEndpoints({ commit, dispatch }) {
      try {
        const result = await dispatch('makeApiCall', { endpoint: '/endpoints' })
        commit('SET_ENDPOINTS', result.data)
        return result.data
      } catch (error) {
        console.error('Error fetching endpoints:', error)
        throw error
      }
    },

    async createEndpoint({ dispatch }, endpointData) {
      try {
        const result = await dispatch('makeApiCall', {
          endpoint: '/endpoints',
          options: {
            method: 'POST',
            body: JSON.stringify(endpointData)
          }
        })
        return result.data
      } catch (error) {
        console.error('Error creating endpoint:', error)
        throw error
      }
    },

    async updateEndpoint({ dispatch }, { id, endpointData }) {
      try {
        const result = await dispatch('makeApiCall', {
          endpoint: `/endpoints/${id}`,
          options: {
            method: 'PUT',
            body: JSON.stringify(endpointData)
          }
        })
        return result
      } catch (error) {
        console.error('Error updating endpoint:', error)
        throw error
      }
    },

    async deleteEndpoint({ dispatch }, id) {
      try {
        const result = await dispatch('makeApiCall', {
          endpoint: `/endpoints/${id}`,
          options: {
            method: 'DELETE'
          }
        })
        return result
      } catch (error) {
        console.error('Error deleting endpoint:', error)
        throw error
      }
    },

    // Requests (read-only)
    async fetchRequests({ commit, dispatch }, filters = {}) {
      try {
        const queryParams = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, value)
          }
        })
        
        const endpoint = `/requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        const result = await dispatch('makeApiCall', { endpoint })
        commit('SET_REQUESTS', result.data)
        return result.data
      } catch (error) {
        console.error('Error fetching requests:', error)
        throw error
      }
    },

    // Notes
    async fetchNotes({ commit, dispatch }, filters = {}) {
      try {
        const queryParams = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, value)
          }
        })
        
        const endpoint = `/notes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
        const result = await dispatch('makeApiCall', { endpoint })
        commit('SET_NOTES', result.data)
        return result.data
      } catch (error) {
        console.error('Error fetching notes:', error)
        throw error
      }
    },

    async createNote({ dispatch }, noteData) {
      try {
        const result = await dispatch('makeApiCall', {
          endpoint: '/notes',
          options: {
            method: 'POST',
            body: JSON.stringify(noteData)
          }
        })
        return result.data
      } catch (error) {
        console.error('Error creating note:', error)
        throw error
      }
    },

    async updateNote({ dispatch }, { id, value }) {
      try {
        const result = await dispatch('makeApiCall', {
          endpoint: `/notes/${id}?value=${encodeURIComponent(value)}`,
          options: {
            method: 'PATCH'
          }
        })
        return result
      } catch (error) {
        console.error('Error updating note:', error)
        throw error
      }
    },

    async deleteNote({ dispatch }, id) {
      try {
        const result = await dispatch('makeApiCall', {
          endpoint: `/notes/${id}`,
          options: {
            method: 'DELETE'
          }
        })
        return result
      } catch (error) {
        console.error('Error deleting note:', error)
        throw error
      }
    },

    // Jobs (read-only)
    async fetchJobs({ commit, dispatch }) {
      try {
        const result = await dispatch('makeApiCall', { endpoint: '/jobs' })
        commit('SET_JOBS', result.data)
        return result.data
      } catch (error) {
        console.error('Error fetching jobs:', error)
        throw error
      }
    },

    // HAR Import
    async importHAR({ dispatch }, file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        const result = await dispatch('makeApiCall', {
          endpoint: '/import_har',
          options: {
            method: 'POST',
            headers: {}, // Remove Content-Type to let browser set it for FormData
            body: formData
          }
        })
        return result.data
      } catch (error) {
        console.error('Error importing HAR:', error)
        throw error
      }
    },

    // Attachments
    async uploadAttachment({ dispatch }, { referenceType, referenceId, file }) {
      try {
        const formData = new FormData()
        formData.append('reference_type', referenceType)
        formData.append('reference_id', referenceId)
        formData.append('file', file)
        
        const result = await dispatch('makeApiCall', {
          endpoint: '/attachments',
          options: {
            method: 'POST',
            headers: {}, // Remove Content-Type to let browser set it for FormData
            body: formData
          }
        })
        return result.data
      } catch (error) {
        console.error('Error uploading attachment:', error)
        throw error
      }
    },

    async deleteAttachment({ dispatch }, id) {
      try {
        const result = await dispatch('makeApiCall', {
          endpoint: `/attachments?id=${id}`,
          options: {
            method: 'DELETE'
          }
        })
        return result
      } catch (error) {
        console.error('Error deleting attachment:', error)
        throw error
      }
    }
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    isLoading: state => state.loading,
    error: state => state.error,
    programs: state => state.programs,
    endpoints: state => state.endpoints,
    requests: state => state.requests,
    notes: state => state.notes,
    jobs: state => state.jobs
  }
})
