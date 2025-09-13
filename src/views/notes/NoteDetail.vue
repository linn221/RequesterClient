<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Note Details</h2>
      <div class="btn-group">
        <router-link to="/notes" class="btn btn-outline-secondary">Back to Notes</router-link>
        <button v-if="note" @click="showEdit = !showEdit" class="btn btn-primary">
          {{ showEdit ? 'Cancel Edit' : 'Edit Note' }}
        </button>
      </div>
    </div>

    <div v-if="note">
      <!-- Note Details -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 class="mb-0">Note</h5>
            <small class="text-muted">
              Created {{ formatDate(note.created_at) }}
              <span v-if="note.updated_at !== note.created_at">
                • Updated {{ formatDate(note.updated_at) }}
              </span>
            </small>
          </div>
          <span class="badge" :class="getTypeBadgeClass(note.reference_type)">
            {{ note.reference_type.replace('s', '') }}
          </span>
        </div>
        <div class="card-body">
          <!-- Edit Form -->
          <div v-if="showEdit">
            <form @submit.prevent="updateNote">
              <div class="mb-3">
                <label for="value" class="form-label">Note Content</label>
                <textarea 
                  class="form-control" 
                  id="value" 
                  v-model="editForm.value" 
                  rows="6"
                  required
                ></textarea>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" @click="showEdit = false" class="btn btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-primary">Update Note</button>
              </div>
            </form>
          </div>

          <!-- Display Note -->
          <div v-else>
            <div class="bg-light p-4 rounded">
              <pre class="mb-0" style="white-space: pre-wrap; font-family: inherit;">{{ note.value }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Reference Information -->
      <div class="card mb-4">
        <div class="card-header">
          <h6 class="mb-0">Referenced {{ note.reference_type.replace('s', '') }}</h6>
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <p class="mb-1">
                <strong>Type:</strong> {{ note.reference_type.replace('s', '') }}
              </p>
              <p class="mb-1">
                <strong>ID:</strong> {{ note.reference_id }}
              </p>
              <p class="mb-0 text-muted">
                This note is linked to {{ note.reference_type.replace('s', '').toLowerCase() }} #{{ note.reference_id }}
              </p>
            </div>
            <router-link :to="getReferenceLink(note)" class="btn btn-outline-primary">
              View {{ note.reference_type.replace('s', '') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="card">
        <div class="card-header">
          <h6 class="mb-0">Actions</h6>
        </div>
        <div class="card-body">
          <div class="d-flex gap-2">
            <router-link :to="getReferenceLink(note)" class="btn btn-outline-primary">
              View Referenced {{ note.reference_type.replace('s', '') }}
            </router-link>
            <button @click="deleteNote" class="btn btn-outline-danger">Delete Note</button>
          </div>
        </div>
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
import { formatDate } from '../../config/api'

export default {
  name: 'NoteDetail',
  props: ['id'],
  data() {
    return {
      note: null,
      showEdit: false,
      editForm: {
        value: ''
      }
    }
  },
  async mounted() {
    await this.loadNote()
  },
  methods: {
    formatDate,
    async loadNote() {
      try {
        const result = await this.$store.dispatch('makeApiCall', {
          endpoint: `/notes/${this.id}`
        })
        this.note = result.data
        this.editForm.value = this.note.value
      } catch (error) {
        console.error('Error loading note:', error)
        if (error.status === 404 || error.message.includes('404')) {
          this.$router.push('/notes')
        }
      }
    },
    async updateNote() {
      try {
        await this.$store.dispatch('updateNote', {
          id: this.id,
          value: this.editForm.value
        })
        this.showEdit = false
        await this.loadNote() // Refresh to show updated note
      } catch (error) {
        console.error('Error updating note:', error)
      }
    },
    async deleteNote() {
      if (confirm('Are you sure you want to delete this note?')) {
        try {
          await this.$store.dispatch('deleteNote', this.id)
          this.$router.push('/notes')
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
    }
  }
}
</script>
