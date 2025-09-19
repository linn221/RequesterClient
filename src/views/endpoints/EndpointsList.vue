<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Endpoints</h2>
      <router-link to="/endpoints/create" class="btn btn-primary">Create Endpoint</router-link>
    </div>

    <!-- Text Search -->
    <TextSearchBar
      placeholder="Search in endpoint text field (supports regex)..."
      :total-count="allEndpoints.length"
      :filtered-count="filteredEndpoints.length"
      @search="onTextSearch"
      @clear="onTextSearchClear"
    />

    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          {{ filteredEndpoints.length }} Endpoint{{ filteredEndpoints.length !== 1 ? 's' : '' }}
          <span v-if="textSearchQuery" class="text-muted">
            (filtered from {{ allEndpoints.length }})
          </span>
        </h6>
      </div>
      <div class="card-body">
        <div v-if="filteredEndpoints.length === 0" class="text-center text-muted py-4">
          <p v-if="textSearchQuery">No endpoints match your search criteria.</p>
          <p v-else>No endpoints found.</p>
          <router-link to="/endpoints/create" class="btn btn-primary">Create your first endpoint</router-link>
        </div>

        <EndpointsCardList 
          v-else
          :endpoints="filteredEndpoints"
          :search-query="textSearchQuery"
          empty-message="No endpoints found. Create your first endpoint"
          :show-delete-button="true"
          @endpoint-deleted="loadEndpoints"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatDate } from '../../config/api'
import EndpointsCardList from '../../components/EndpointsCardList.vue'
import TextSearchBar from '../../components/TextSearchBar.vue'
import { filterItemsByTextSearch } from '../../utils/textSearch.js'

export default {
  name: 'EndpointsList',
  components: {
    EndpointsCardList,
    TextSearchBar
  },
  data() {
    return {
      textSearchQuery: ''
    }
  },
  computed: {
    ...mapGetters(['endpoints']),
    allEndpoints() {
      return this.endpoints
    },
    filteredEndpoints() {
      if (!this.textSearchQuery) {
        return this.endpoints.map(endpoint => ({ ...endpoint, search_results: [] }))
      }
      return filterItemsByTextSearch(this.endpoints, this.textSearchQuery, 'text')
    }
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
    onTextSearch(query) {
      this.textSearchQuery = query
    },
    onTextSearchClear() {
      this.textSearchQuery = ''
    }
  }
}
</script>
