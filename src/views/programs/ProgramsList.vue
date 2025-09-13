<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Programs</h2>
      <router-link to="/programs/create" class="btn btn-primary">Create Program</router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <div v-if="programs.length === 0" class="text-center text-muted py-4">
          <p>No programs found.</p>
          <router-link to="/programs/create" class="btn btn-primary">Create your first program</router-link>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>URL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="program in programs" :key="program.id">
                <td>
                  <router-link :to="`/programs/${program.id}`" class="text-decoration-none">
                    {{ program.name }}
                  </router-link>
                </td>
                <td>
                  <a :href="program.url" target="_blank" class="text-muted text-decoration-none">
                    {{ program.url }}
                  </a>
                </td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <router-link :to="`/programs/${program.id}`" class="btn btn-outline-primary btn-sm">View</router-link>
                    <router-link :to="`/programs/${program.id}/edit`" class="btn btn-outline-secondary btn-sm">Edit</router-link>
                    <button @click="deleteProgram(program)" class="btn btn-outline-danger btn-sm">Delete</button>
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

export default {
  name: 'ProgramsList',
  computed: {
    ...mapGetters(['programs'])
  },
  async mounted() {
    await this.loadPrograms()
  },
  methods: {
    async loadPrograms() {
      try {
        await this.$store.dispatch('fetchPrograms')
      } catch (error) {
        console.error('Error loading programs:', error)
      }
    },
    async deleteProgram(program) {
      if (confirm(`Are you sure you want to delete "${program.name}"?`)) {
        try {
          await this.$store.dispatch('deleteProgram', program.id)
          await this.loadPrograms() // Refresh the list
        } catch (error) {
          console.error('Error deleting program:', error)
        }
      }
    }
  }
}
</script>
