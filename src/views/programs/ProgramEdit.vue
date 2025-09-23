<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Edit Program</h2>
      <div class="btn-group">
        <router-link :to="`/programs/${id}`" class="btn btn-outline-secondary">Back to Program</router-link>
        <router-link to="/programs" class="btn btn-outline-secondary">All Programs</router-link>
      </div>
    </div>

    <div class="card" v-if="form.name">
      <div class="card-body">
        <form @submit.prevent="updateProgram">
          <div class="mb-3">
            <label for="name" class="form-label">Name *</label>
            <input 
              type="text" 
              class="form-control" 
              id="name" 
              v-model="form.name" 
              required
              placeholder="Enter program name"
            >
          </div>

          <div class="mb-3">
            <label for="url" class="form-label">URL *</label>
            <input 
              type="url" 
              class="form-control" 
              id="url" 
              v-model="form.url" 
              required
              placeholder="https://example.com"
            >
          </div>

          <div class="mb-3">
            <label for="scope" class="form-label">Scope</label>
            <input 
              type="text" 
              class="form-control" 
              id="scope" 
              v-model="form.scope" 
              placeholder="e.g., internal, external, public"
            >
          </div>

          <div class="mb-3">
            <label for="domains" class="form-label">Domains</label>
            <input 
              type="text" 
              class="form-control" 
              id="domains" 
              v-model="form.domains" 
              placeholder="example.com, api.example.com"
            >
            <div class="form-text">Comma-separated list of domains</div>
          </div>

          <div class="mb-3">
            <label for="note" class="form-label">Note</label>
            <textarea 
              class="form-control" 
              id="note" 
              v-model="form.note" 
              rows="3"
              placeholder="Enter note about this program"
            ></textarea>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <router-link :to="`/programs/${id}`" class="btn btn-secondary">Cancel</router-link>
            <button type="submit" class="btn btn-primary">Update Program</button>
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
export default {
  name: 'ProgramEdit',
  props: ['id'],
  data() {
    return {
      form: {
        name: '',
        url: '',
        scope: '',
        domains: '',
        note: ''
      }
    }
  },
  async mounted() {
    await this.loadProgram()
  },
  methods: {
    async loadProgram() {
      try {
        const result = await this.$store.dispatch('makeApiCall', {
          endpoint: `/programs/${this.id}`
        })
        const program = result.data
        this.form = {
          name: program.name,
          url: program.url,
          scope: program.scope,
          domains: program.domains,
          note: program.note
        }
      } catch (error) {
        console.error('Error loading program:', error)
        if (error.status === 404 || error.message.includes('404')) {
          this.$router.push('/programs')
        }
      }
    },
    async updateProgram() {
      try {
        await this.$store.dispatch('updateProgram', {
          id: this.id,
          programData: this.form
        })
        this.$router.push(`/programs/${this.id}`)
      } catch (error) {
        console.error('Error updating program:', error)
      }
    }
  }
}
</script>
