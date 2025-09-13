<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Requests</h2>
      <div class="btn-group">
        <router-link to="/import-har" class="btn btn-primary">Import HAR</router-link>
        <button @click="toggleFilters" class="btn btn-outline-secondary">
          <i class="bi bi-funnel"></i> Filters
        </button>
      </div>
    </div>

    <!-- Advanced Filters -->
    <div class="card mb-4" v-show="showFilters">
      <div class="card-header">
        <h6 class="mb-0">Advanced Filters</h6>
      </div>
      <div class="card-body">
        <form @submit.prevent="applyFilters">
          <div class="row">
            <div class="col-md-6 col-lg-3 mb-3">
              <label for="program_id" class="form-label">Program</label>
              <select class="form-select" id="program_id" v-model="filters.program_id">
                <option value="">All Programs</option>
                <option v-for="program in programs" :key="program.id" :value="program.id">
                  {{ program.name }}
                </option>
              </select>
            </div>

            <div class="col-md-6 col-lg-3 mb-3">
              <label for="endpoint_id" class="form-label">Endpoint</label>
              <select class="form-select" id="endpoint_id" v-model="filters.endpoint_id">
                <option value="">All Endpoints</option>
                <option v-for="endpoint in endpoints" :key="endpoint.id" :value="endpoint.id">
                  {{ endpoint.method }} {{ endpoint.uri }}
                </option>
              </select>
            </div>

            <div class="col-md-6 col-lg-3 mb-3">
              <label for="job_id" class="form-label">Job</label>
              <select class="form-select" id="job_id" v-model="filters.job_id">
                <option value="">All Jobs</option>
                <option v-for="job in jobs" :key="job.id" :value="job.id">
                  {{ job.title || `Job ${job.id}` }}
                </option>
              </select>
            </div>

            <div class="col-md-6 col-lg-3 mb-3">
              <label for="order_by" class="form-label">Sort By</label>
              <select class="form-select" id="order_by" v-model="filters.order_by">
                <option value="">Default</option>
                <option value="method">Method</option>
                <option value="content_type">Content Type</option>
                <option value="size">Size</option>
                <option value="latency">Latency</option>
                <option value="url">URL</option>
                <option value="sequence_number">Sequence Number</option>
              </select>
            </div>

            <div class="col-12 mb-3">
              <label for="raw_sql" class="form-label">Custom SQL Filter</label>
              <textarea 
                class="form-control" 
                id="raw_sql" 
                v-model="filters.raw_sql" 
                rows="2"
                placeholder="Enter custom SQL WHERE clause (advanced users only)"
              ></textarea>
              <div class="form-text">
                Example: <code>status_code = 200 AND method = 'GET'</code>
              </div>
            </div>

            <div class="col-12">
              <div class="form-check">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="asc" 
                  v-model="filters.asc"
                >
                <label class="form-check-label" for="asc">
                  Ascending Order
                </label>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-3">
            <button type="button" @click="clearFilters" class="btn btn-outline-secondary">Clear</button>
            <button type="submit" class="btn btn-primary">Apply Filters</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Results -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          {{ requests.length }} Request{{ requests.length !== 1 ? 's' : '' }}
        </h6>
        <button @click="refreshRequests" class="btn btn-sm btn-outline-primary">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
      <div class="card-body">
        <div v-if="requests.length === 0" class="text-center text-muted py-4">
          <p>No requests found.</p>
          <router-link to="/import-har" class="btn btn-primary">Import HAR file to get started</router-link>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover table-sm">
            <thead>
              <tr>
                <th>Method</th>
                <th>URL</th>
                <th>Status</th>
                <th>Program</th>
                <th>Endpoint</th>
                <th>Sequence</th>
                <th>Search Results</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in requests" :key="request.id">
                <td>
                  <span class="badge" :class="getMethodBadgeClass(request.method)">
                    {{ request.method }}
                  </span>
                </td>
                <td>
                  <router-link :to="`/requests/${request.id}`" class="text-decoration-none">
                    <span class="text-muted">{{ request.domain }}</span><span class="fw-bold">{{ getPath(request.url) }}</span>
                  </router-link>
                </td>
                <td>
                  <span class="badge" :class="getStatusBadgeClass(request.status_code)">
                    {{ request.status_code }}
                  </span>
                </td>
                <td>
                  <router-link 
                    v-if="request.program_id" 
                    :to="`/programs/${request.program_id}`" 
                    class="text-decoration-none text-muted"
                  >
                    {{ request.program_name }}
                  </router-link>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <router-link 
                    v-if="request.endpoint_id" 
                    :to="`/endpoints/${request.endpoint_id}`" 
                    class="text-decoration-none text-muted"
                  >
                    {{ request.endpoint_name }}
                  </router-link>
                  <span v-else class="text-muted">-</span>
                </td>
                <td class="text-muted">{{ request.sequence_number }}</td>
                <td>
                  <div v-if="request.search_results && request.search_results.length > 0">
                    <small v-for="(result, index) in request.search_results.slice(0, 2)" :key="index" class="d-block text-truncate" style="max-width: 200px;">
                      {{ result }}
                    </small>
                    <small v-if="request.search_results.length > 2" class="text-muted">
                      +{{ request.search_results.length - 2 }} more
                    </small>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <router-link :to="`/requests/${request.id}`" class="btn btn-outline-primary btn-sm">View</router-link>
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

export default {
  name: 'RequestsList',
  data() {
    return {
      showFilters: false,
      filters: {
        program_id: '',
        endpoint_id: '',
        job_id: '',
        raw_sql: '',
        order_by: '',
        asc: false
      }
    }
  },
  computed: {
    ...mapGetters(['requests', 'programs', 'endpoints', 'jobs'])
  },
  async mounted() {
    await this.loadDependencies()
    await this.loadRequests()
  },
  methods: {
    async loadDependencies() {
      try {
        // Load programs, endpoints, and jobs for filter dropdowns
        await Promise.all([
          this.$store.dispatch('fetchPrograms'),
          this.$store.dispatch('fetchEndpoints'),
          this.$store.dispatch('fetchJobs')
        ])
      } catch (error) {
        console.error('Error loading dependencies:', error)
      }
    },
    async loadRequests() {
      try {
        await this.$store.dispatch('fetchRequests', this.filters)
      } catch (error) {
        console.error('Error loading requests:', error)
      }
    },
    async applyFilters() {
      await this.loadRequests()
    },
    async refreshRequests() {
      await this.loadRequests()
    },
    clearFilters() {
      this.filters = {
        program_id: '',
        endpoint_id: '',
        job_id: '',
        raw_sql: '',
        order_by: '',
        asc: false
      }
      this.loadRequests()
    },
    toggleFilters() {
      this.showFilters = !this.showFilters
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
    },
    getStatusBadgeClass(statusCode) {
      if (statusCode >= 200 && statusCode < 300) return 'bg-success'
      if (statusCode >= 300 && statusCode < 400) return 'bg-info'
      if (statusCode >= 400 && statusCode < 500) return 'bg-warning'
      if (statusCode >= 500) return 'bg-danger'
      return 'bg-secondary'
    },
    getPath(url) {
      try {
        return new URL(url).pathname + new URL(url).search
      } catch {
        return url
      }
    }
  }
}
</script>
