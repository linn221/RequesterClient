<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Notes</h2>
      <button @click="toggleFilters" class="btn btn-outline-secondary">
        <i class="bi bi-funnel"></i> Filters
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4" v-show="showFilters">
      <div class="card-header">
        <h6 class="mb-0">Filter Notes</h6>
      </div>
      <div class="card-body">
        <form @submit.prevent="applyFilters">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="type" class="form-label">Type</label>
              <select class="form-select" id="type" v-model="filters.type">
                <option value="">All Types</option>
                <option value="program">Program</option>
                <option value="endpoint">Endpoint</option>
                <option value="request">Request</option>
              </select>
            </div>

            <div class="col-md-6 mb-3">
              <label for="search" class="form-label">Search</label>
              <input 
                type="text" 
                class="form-control" 
                id="search" 
                v-model="filters.search" 
                placeholder="Search in note content..."
              >
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2">
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
          {{ notes.length }} Note{{ notes.length !== 1 ? 's' : '' }}
        </h6>
        <button @click="refreshNotes" class="btn btn-sm btn-outline-primary">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
      <div class="card-body">
        <div v-if="notes.length === 0" class="text-center text-muted py-4">
          <p>No notes found.</p>
          <p>Notes are created from Programs, Endpoints, or Requests detail pages.</p>
        </div>

        <div v-else>
          <div class="row">
            <div v-for="note in notes" :key="note.id" class="col-lg-6 col-xl-4 mb-4">
              <div class="card h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge" :class="getTypeBadgeClass(note.reference_type)">
                      {{ note.reference_type.replace('s', '') }}
                    </span>
                    <small class="text-muted">{{ formatDate(note.created_at) }}</small>
                  </div>
                  
                  <p class="card-text">{{ truncateText(note.value, 150) }}</p>
                  
                  <div class="d-flex justify-content-between align-items-center mt-auto">
                    <router-link :to="getReferenceLink(note)" class="text-decoration-none text-muted">
                      <small>View {{ note.reference_type.replace('s', '') }}</small>
                    </router-link>
                    <div class="btn-group btn-group-sm">
                      <router-link :to="`/notes/${note.id}`" class="btn btn-outline-primary btn-sm">View</router-link>
                      <button @click="deleteNote(note)" class="btn btn-outline-danger btn-sm">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatDate } from '../../config/api'

export default {
  name: 'NotesList',
  data() {
    return {
      showFilters: false,
      filters: {
        type: '',
        search: ''
      }
    }
  },
  computed: {
    ...mapGetters(['notes'])
  },
  async mounted() {
    await this.loadNotes()
  },
  methods: {
    formatDate,
    async loadNotes() {
      try {
        await this.$store.dispatch('fetchNotes', this.filters)
      } catch (error) {
        console.error('Error loading notes:', error)
      }
    },
    async applyFilters() {
      await this.loadNotes()
    },
    async refreshNotes() {
      await this.loadNotes()
    },
    clearFilters() {
      this.filters = {
        type: '',
        search: ''
      }
      this.loadNotes()
    },
    toggleFilters() {
      this.showFilters = !this.showFilters
    },
    async deleteNote(note) {
      if (confirm('Are you sure you want to delete this note?')) {
        try {
          await this.$store.dispatch('deleteNote', note.id)
          await this.loadNotes() // Refresh the list
        } catch (error) {
          console.error('Error deleting note:', error)
        }
      }
    },
    getTypeBadgeClass(type) {
      const classes = {
        'programs': 'bg-success',
        'endpoints': 'bg-info',
        'requests': 'bg-primary'
      }
      return classes[type] || 'bg-secondary'
    },
    getReferenceLink(note) {
      const baseRoutes = {
        'programs': '/programs/',
        'endpoints': '/endpoints/',
        'requests': '/requests/'
      }
      return baseRoutes[note.reference_type] + note.reference_id
    },
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  }
}
</script>
