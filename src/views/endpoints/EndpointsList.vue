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

        <EndpointsCardList 
          v-else
          :endpoints="endpoints"
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

export default {
  name: 'EndpointsList',
  components: {
    EndpointsCardList
  },
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
  }
}
</script>
