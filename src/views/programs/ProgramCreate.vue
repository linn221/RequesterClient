<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Create Program</h2>
      <router-link to="/programs" class="btn btn-outline-secondary">Back to Programs</router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="createProgram">
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
            <label for="note" class="form-label">Initial Note</label>
            <textarea 
              class="form-control" 
              id="note" 
              v-model="form.note" 
              rows="3"
              placeholder="Enter initial note about this program"
            ></textarea>
          </div>

          <div class="d-flex justify-content-end gap-2">
            <router-link to="/programs" class="btn btn-secondary">Cancel</router-link>
            <button type="submit" class="btn btn-primary">Create Program</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgramCreate',
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
  methods: {
    async createProgram() {
      try {
        const programId = await this.$store.dispatch('createProgram', this.form)
        this.$router.push(`/programs/${programId}`)
      } catch (error) {
        console.error('Error creating program:', error)
      }
    }
  }
}
</script>
