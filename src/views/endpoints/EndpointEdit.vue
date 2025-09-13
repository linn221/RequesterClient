<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Edit Endpoint</h2>
      <div class="btn-group">
        <router-link :to="`/endpoints/${id}`" class="btn btn-outline-secondary">Back to Endpoint</router-link>
        <router-link to="/endpoints" class="btn btn-outline-secondary">All Endpoints</router-link>
      </div>
    </div>

    <div class="card" v-if="form.domain">
      <div class="card-body">
        <form @submit.prevent="updateEndpoint">
          <div class="mb-3">
            <label for="program_id" class="form-label">Program *</label>
            <select class="form-select" id="program_id" v-model="form.program_id" required>
              <option value="">Select a program</option>
              <option v-for="program in programs" :key="program.id" :value="program.id">
                {{ program.name }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label for="domain" class="form-label">Domain *</label>
            <input 
              type="text" 
              class="form-control" 
              id="domain" 
              v-model="form.domain" 
              required
              placeholder="example.com"
            >
          </div>

          <div class="mb-3">
            <label for="method" class="form-label">Method *</label>
            <select class="form-select" id="method" v-model="form.method" required>
              <option value="">Select HTTP method</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
          </div>

          <div class="mb-3">
            <label for="uri" class="form-label">URI *</label>
            <input 
              type="text" 
              class="form-control" 
              id="uri" 
              v-model="form.uri" 
              required
              placeholder="/api/users"
            >
            <div class="form-text">The path part of the URL (e.g., /api/users, /login)</div>
          </div>

          <div class="mb-3">
            <label for="endpoint_type" class="form-label">Endpoint Type *</label>
            <select class="form-select" id="endpoint_type" v-model="form.endpoint_type" required>
              <option value="">Select endpoint type</option>
              <option value="web">Web</option>
              <option value="api">API</option>
            </select>
          </div>

          <div class="mb-3">
            <label for="description" class="form-label">Description *</label>
            <textarea 
              class="form-control" 
              id="description" 
              v-model="form.description" 
              rows="3"
              required
              placeholder="Describe what this endpoint does"
            ></textarea>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <router-link :to="`/endpoints/${id}`" class="btn btn-secondary">Cancel</router-link>
            <button type="submit" class="btn btn-primary">Update Endpoint</button>
          </div>
        </form>
      </div>
    </div>

    <div v-else class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'EndpointEdit',
  props: ['id'],
  data() {
    return {
      form: {
        domain: '',
        program_id: '',
        method: '',
        uri: '',
        endpoint_type: '',
        description: ''
      }
    }
  },
  computed: {
    ...mapGetters(['programs'])
  },
  async mounted() {
    await this.loadPrograms()
    await this.loadEndpoint()
  },
  methods: {
    async loadPrograms() {
      try {
        await this.$store.dispatch('fetchPrograms')
      } catch (error) {
        console.error('Error loading programs:', error)
      }
    },
    async loadEndpoint() {
      try {
        const result = await this.$store.dispatch('makeApiCall', {
          endpoint: `/endpoints/${this.id}`
        })
        const endpoint = result.data
        this.form = {
          domain: endpoint.domain,
          program_id: endpoint.program_id,
          method: endpoint.method,
          uri: endpoint.uri,
          endpoint_type: endpoint.endpoint_type,
          description: endpoint.description
        }
      } catch (error) {
        console.error('Error loading endpoint:', error)
        if (error.status === 404 || error.message.includes('404')) {
          this.$router.push('/endpoints')
        }
      }
    },
    async updateEndpoint() {
      try {
        const endpointData = {
          ...this.form,
          program_id: parseInt(this.form.program_id)
        }
        await this.$store.dispatch('updateEndpoint', {
          id: this.id,
          endpointData: endpointData
        })
        this.$router.push(`/endpoints/${this.id}`)
      } catch (error) {
        console.error('Error updating endpoint:', error)
      }
    }
  }
}
</script>
