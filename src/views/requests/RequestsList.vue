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

    <!-- Text Search -->
    <TextSearchBar
      placeholder="Search in request text field (supports regex)..."
      :total-count="allRequests.length"
      :filtered-count="filteredRequests.length"
      @search="onTextSearch"
      @clear="onTextSearchClear"
    />

    <!-- Results -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          {{ filteredRequests.length }} Request{{ filteredRequests.length !== 1 ? 's' : '' }}
          <span v-if="textSearchQuery" class="text-muted">
            (filtered from {{ allRequests.length }})
          </span>
        </h6>
        <button @click="refreshRequests" class="btn btn-sm btn-outline-primary">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
      <div class="card-body">
        <div v-if="filteredRequests.length === 0" class="text-center text-muted py-4">
          <p v-if="textSearchQuery">No requests match your search criteria.</p>
          <p v-else>No requests found.</p>
          <router-link to="/import-har" class="btn btn-primary">Import HAR file to get started</router-link>
        </div>

        <RequestsCardList 
          v-else
          :requests="filteredRequests"
          :search-query="textSearchQuery"
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
import TextSearchBar from '../../components/TextSearchBar.vue'
import { filterItemsByTextSearch } from '../../utils/textSearch.js'

export default {
  name: 'RequestsList',
  components: {
    AutocompleteInput,
    RequestsCardList,
    TextSearchBar
  },
  data() {
    return {
      showFilters: false,
      textSearchQuery: '',
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
    allRequests() {
      return this.requests
    },
    filteredRequests() {
      if (!this.textSearchQuery) {
        return this.requests.map(request => ({ ...request, search_results: [] }))
      }
      return filterItemsByTextSearch(this.requests, this.textSearchQuery, 'text')
    },
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
    this.initializeFromUrl()
    // Don't load requests on startup - only when filters are applied
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
        // Only fetch requests if there are active filters to avoid heavy load
        const hasActiveFilters = Object.values(this.filters).some(value => 
          value !== '' && value !== null && value !== undefined
        )
        
        if (hasActiveFilters) {
          await this.$store.dispatch('fetchRequests', this.filters)
        } else {
          // Clear requests if no filters are active
          this.$store.commit('SET_REQUESTS', [])
        }
      } catch (error) {
        console.error('Error loading requests:', error)
      }
    },
    async applyFilters() {
      this.updateUrl()
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
      this.updateUrl()
      this.loadRequests()
    },
    toggleFilters() {
      this.showFilters = !this.showFilters
    },
    onTextSearch(query) {
      this.textSearchQuery = query
    },
    onTextSearchClear() {
      this.textSearchQuery = ''
    },
    initializeFromUrl() {
      const query = this.$route.query
      
      // Always show filters on startup
      this.showFilters = true
      
      // Check if there are any query parameters
      const hasQueryParams = Object.keys(query).length > 0
      
      if (hasQueryParams) {
        // Apply query parameters to filters
        this.filters = {
          program_id: query.program_id || '',
          endpoint_id: query.endpoint_id || '',
          job_id: query.job_id || '',
          raw_sql: query.raw_sql || '',
          order_by1: query.order_by1 || '',
          asc1: query.asc1 === 'false' ? false : true,
          order_by2: query.order_by2 || '',
          asc2: query.asc2 === 'false' ? false : true,
          order_by3: query.order_by3 || '',
          asc3: query.asc3 === 'false' ? false : true,
          order_by4: query.order_by4 || '',
          asc4: query.asc4 === 'false' ? false : true
        }
      }
    },
    updateUrl() {
      const query = {}
      
      // Only add non-empty filter values to URL
      if (this.filters.program_id) query.program_id = this.filters.program_id
      if (this.filters.endpoint_id) query.endpoint_id = this.filters.endpoint_id
      if (this.filters.job_id) query.job_id = this.filters.job_id
      if (this.filters.raw_sql) query.raw_sql = this.filters.raw_sql
      if (this.filters.order_by1) {
        query.order_by1 = this.filters.order_by1
        query.asc1 = this.filters.asc1
      }
      if (this.filters.order_by2) {
        query.order_by2 = this.filters.order_by2
        query.asc2 = this.filters.asc2
      }
      if (this.filters.order_by3) {
        query.order_by3 = this.filters.order_by3
        query.asc3 = this.filters.asc3
      }
      if (this.filters.order_by4) {
        query.order_by4 = this.filters.order_by4
        query.asc4 = this.filters.asc4
      }
      
      // Update URL without triggering navigation
      this.$router.replace({ 
        name: 'RequestsList', 
        query: Object.keys(query).length > 0 ? query : undefined 
      })
    }
  }
}
</script>
