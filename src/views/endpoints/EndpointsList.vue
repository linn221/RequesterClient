<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Endpoints</h2>
      <router-link to="/endpoints/create" class="btn btn-primary">Create Endpoint</router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <div v-if="endpoints.length === 0" class="text-center text-muted py-4">
          <p>No endpoints found.</p>
          <router-link to="/endpoints/create" class="btn btn-primary">Create your first endpoint</router-link>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Method</th>
                <th>Domain</th>
                <th>URI</th>
                <th>Type</th>
                <th>Program</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="endpoint in endpoints" :key="endpoint.id">
                <td>
                  <span class="badge" :class="getMethodBadgeClass(endpoint.method)">
                    {{ endpoint.method }}
                  </span>
                </td>
                <td>{{ endpoint.domain }}</td>
                <td>
                  <router-link :to="`/endpoints/${endpoint.id}`" class="text-decoration-none">
                    {{ endpoint.uri }}
                  </router-link>
                </td>
                <td>
                  <span class="badge" :class="endpoint.endpoint_type === 'api' ? 'bg-info' : 'bg-secondary'">
                    {{ endpoint.endpoint_type }}
                  </span>
                </td>
                <td>
                  <router-link :to="`/programs/${endpoint.program_id}`" class="text-decoration-none text-muted">
                    {{ endpoint.program_name }}
                  </router-link>
                </td>
                <td class="text-muted">{{ formatDate(endpoint.created_at) }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <router-link :to="`/endpoints/${endpoint.id}`" class="btn btn-outline-primary btn-sm">View</router-link>
                    <router-link :to="`/endpoints/${endpoint.id}/edit`" class="btn btn-outline-secondary btn-sm">Edit</router-link>
                    <button @click="deleteEndpoint(endpoint)" class="btn btn-outline-danger btn-sm">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatDate } from '../../config/api'

export default {
  name: 'EndpointsList',
  computed: {
    ...mapGetters(['endpoints'])
  },
  async mounted() {
    await this.loadEndpoints()
  },
  methods: {
    formatDate,
    async loadEndpoints() {
      try {
        await this.$store.dispatch('fetchEndpoints')
      } catch (error) {
        console.error('Error loading endpoints:', error)
      }
    },
    async deleteEndpoint(endpoint) {
      if (confirm(`Are you sure you want to delete "${endpoint.method} ${endpoint.uri}"?`)) {
        try {
          await this.$store.dispatch('deleteEndpoint', endpoint.id)
          await this.loadEndpoints() // Refresh the list
        } catch (error) {
          console.error('Error deleting endpoint:', error)
        }
      }
    },
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
    }
  }
}
</script>
