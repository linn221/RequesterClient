<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Create Endpoint</h2>
      <router-link to="/endpoints" class="btn btn-outline-secondary">Back to Endpoints</router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="createEndpoint">
          <div class="mb-3">
            <label for="program_id" class="form-label">Program *</label>
            <select class="form-select" id="program_id" v-model="form.program_id" required>
              <option value="">Select a program</option>
              <option v-for="program in programs" :key="program.id" :value="program.id">
                {{ program.name }}
              </option>
            </select>
            <div class="form-text">
              <router-link to="/programs/create">Create a new program</router-link> if none are available.
            </div>
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
            <router-link to="/endpoints" class="btn btn-secondary">Cancel</router-link>
            <button type="submit" class="btn btn-primary">Create Endpoint</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'EndpointCreate',
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
    // Load programs for the dropdown
    try {
      await this.$store.dispatch('fetchPrograms')
    } catch (error) {
      console.error('Error loading programs:', error)
    }
  },
  methods: {
    async createEndpoint() {
      try {
        const endpointData = {
          ...this.form,
          program_id: parseInt(this.form.program_id)
        }
        const endpointId = await this.$store.dispatch('createEndpoint', endpointData)
        this.$router.push(`/endpoints/${endpointId}`)
      } catch (error) {
        console.error('Error creating endpoint:', error)
      }
    }
  }
}
</script>
