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

            <div class="col-12 mb-3">
              <label for="endpoint_id" class="form-label">Endpoint</label>
              <AutocompleteInput
                v-model="filters.endpoint_id"
                :options="endpointOptions"
                placeholder="Search endpoints..."
                label-key="label"
                value-key="value"
                subtext-key="subtext"
              />
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

            <div class="col-12 mb-3">
              <label class="form-label">Sorting (Multiple Ordering)</label>
              <div class="row">
                <!-- Primary Sort -->
                <div class="col-md-6 mb-2">
                  <div class="d-flex gap-2 align-items-center">
                    <select class="form-select" v-model="filters.order_by1">
                      <option value="">Primary Sort</option>
                      <option value="method">Method</option>
                      <option value="content_type">Content Type</option>
                      <option value="size">Size</option>
                      <option value="latency">Latency</option>
                      <option value="url">URL</option>
                      <option value="sequence_number">Sequence Number</option>
                    </select>
                    <select class="form-select" style="width: 100px;" v-model="filters.asc1">
                      <option :value="true">ASC</option>
                      <option :value="false">DESC</option>
                    </select>
                  </div>
                </div>

                <!-- Secondary Sort -->
                <div class="col-md-6 mb-2">
                  <div class="d-flex gap-2 align-items-center">
                    <select class="form-select" v-model="filters.order_by2">
                      <option value="">Secondary Sort</option>
                      <option value="method">Method</option>
                      <option value="content_type">Content Type</option>
                      <option value="size">Size</option>
                      <option value="latency">Latency</option>
                      <option value="url">URL</option>
                      <option value="sequence_number">Sequence Number</option>
                    </select>
                    <select class="form-select" style="width: 100px;" v-model="filters.asc2">
                      <option :value="true">ASC</option>
                      <option :value="false">DESC</option>
                    </select>
                  </div>
                </div>

                <!-- Tertiary Sort -->
                <div class="col-md-6 mb-2">
                  <div class="d-flex gap-2 align-items-center">
                    <select class="form-select" v-model="filters.order_by3">
                      <option value="">Tertiary Sort</option>
                      <option value="method">Method</option>
                      <option value="content_type">Content Type</option>
                      <option value="size">Size</option>
                      <option value="latency">Latency</option>
                      <option value="url">URL</option>
                      <option value="sequence_number">Sequence Number</option>
                    </select>
                    <select class="form-select" style="width: 100px;" v-model="filters.asc3">
                      <option :value="true">ASC</option>
                      <option :value="false">DESC</option>
                    </select>
                  </div>
                </div>

                <!-- Quaternary Sort -->
                <div class="col-md-6 mb-2">
                  <div class="d-flex gap-2 align-items-center">
                    <select class="form-select" v-model="filters.order_by4">
                      <option value="">Quaternary Sort</option>
                      <option value="method">Method</option>
                      <option value="content_type">Content Type</option>
                      <option value="size">Size</option>
                      <option value="latency">Latency</option>
                      <option value="url">URL</option>
                      <option value="sequence_number">Sequence Number</option>
                    </select>
                    <select class="form-select" style="width: 100px;" v-model="filters.asc4">
                      <option :value="true">ASC</option>
                      <option :value="false">DESC</option>
                    </select>
                  </div>
                </div>
              </div>
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

        <RequestsCardList 
          v-else
          :requests="requests"
          empty-message="No requests found. Import HAR file to get started"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AutocompleteInput from '../../components/AutocompleteInput.vue'
import RequestsCardList from '../../components/RequestsCardList.vue'

export default {
  name: 'RequestsList',
  components: {
    AutocompleteInput,
    RequestsCardList
  },
  data() {
    return {
      showFilters: false,
      filters: {
        program_id: '',
        endpoint_id: '',
        job_id: '',
        raw_sql: '',
        order_by1: '',
        asc1: true,
        order_by2: '',
        asc2: true,
        order_by3: '',
        asc3: true,
        order_by4: '',
        asc4: true
      }
    }
  },
  computed: {
    ...mapGetters(['requests', 'programs', 'endpoints', 'jobs']),
    endpointOptions() {
      return this.endpoints.map(endpoint => ({
        label: `${endpoint.method} ${endpoint.uri}`,
        value: endpoint.id,
        subtext: `${endpoint.domain} - ${endpoint.program_name}`
      }))
    }
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
        order_by1: '',
        asc1: true,
        order_by2: '',
        asc2: true,
        order_by3: '',
        asc3: true,
        order_by4: '',
        asc4: true
      }
      this.loadRequests()
    },
    toggleFilters() {
      this.showFilters = !this.showFilters
    }
  }
}
</script>
