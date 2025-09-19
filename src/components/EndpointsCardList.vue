<template>
  <div>
    <div v-if="endpoints.length === 0" class="text-center text-muted py-4">
      <p>{{ emptyMessage }}</p>
    </div>

    <div v-else class="row">
      <div v-for="endpoint in endpoints" :key="endpoint.id" class="col-lg-6 col-xl-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex align-items-center gap-2">
                <span class="badge" :class="getMethodBadgeClass(endpoint.method)">
                  {{ endpoint.method }}
                </span>
                <span class="badge" :class="endpoint.endpoint_type === 'api' ? 'bg-info' : 'bg-secondary'">
                  {{ endpoint.endpoint_type }}
                </span>
              </div>
              <small class="text-muted">{{ formatDate(endpoint.created_at) }}</small>
            </div>
            
            <h6 class="card-title">
              <router-link :to="`/endpoints/${endpoint.id}`" class="text-decoration-none">
                {{ endpoint.uri }}
              </router-link>
            </h6>
            
            <p class="card-text text-muted mb-2">
              <strong>Domain:</strong> {{ endpoint.domain }}
            </p>

            <div v-if="showProgramLink && endpoint.program_name" class="mb-2">
              <small class="text-muted">
                <strong>Program:</strong>
                <router-link 
                  :to="`/programs/${endpoint.program_id}`" 
                  class="text-decoration-none"
                >
                  {{ endpoint.program_name }}
                </router-link>
              </small>
            </div>

            <!-- Search Results -->
            <div v-if="endpoint.search_results && endpoint.search_results.length > 0" class="mt-2">
              <small class="text-muted">
                <strong>Matched Results:</strong>
              </small>
              <div class="mt-1">
                <small v-for="(result, index) in endpoint.search_results.slice(0, 3)" :key="index" class="d-block text-truncate" v-html="highlightSearchTerms(result, searchQuery)">
                </small>
                <small v-if="endpoint.search_results.length > 3" class="text-muted">
                  +{{ endpoint.search_results.length - 3 }} more results
                </small>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-auto">
              <small class="text-muted">
                Updated {{ formatDate(endpoint.updated_at) }}
              </small>
              <div class="btn-group btn-group-sm">
                <router-link :to="`/endpoints/${endpoint.id}`" class="btn btn-outline-primary btn-sm">View</router-link>
                <router-link :to="`/endpoints/${endpoint.id}/edit`" class="btn btn-outline-secondary btn-sm">Edit</router-link>
                <button v-if="showDeleteButton" @click="deleteEndpoint(endpoint)" class="btn btn-outline-danger btn-sm">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from '../config/api'
import { highlightSearchTerms } from '../utils/textSearch.js'

export default {
  name: 'EndpointsCardList',
  props: {
    endpoints: {
      type: Array,
      default: () => []
    },
    emptyMessage: {
      type: String,
      default: 'No endpoints found.'
    },
    showProgramLink: {
      type: Boolean,
      default: true
    },
    showDeleteButton: {
      type: Boolean,
      default: false
    },
    searchQuery: {
      type: String,
      default: ''
    }
  },
  emits: ['endpoint-deleted'],
  methods: {
    formatDate,
    getMethodBadgeClass(method) {
      const classes = {
        'GET': 'bg-success',
        'POST': 'bg-primary',
        'PUT': 'bg-warning',
        'PATCH': 'bg-info',
        'DELETE': 'bg-danger',
        'HEAD': 'bg-secondary',
        'OPTIONS': 'bg-dark'
      }
      return classes[method] || 'bg-secondary'
    },
    async deleteEndpoint(endpoint) {
      if (confirm(`Are you sure you want to delete "${endpoint.method} ${endpoint.uri}"?`)) {
        try {
          await this.$store.dispatch('deleteEndpoint', endpoint.id)
          this.$emit('endpoint-deleted', endpoint.id)
        } catch (error) {
          console.error('Error deleting endpoint:', error)
        }
      }
    },
    highlightSearchTerms(text, searchQuery) {
      return highlightSearchTerms(text, searchQuery)
    }
  }
}
</script>
