<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>{{ endpoint?.method }} {{ endpoint?.uri || 'Loading...' }}</h2>
      <div class="btn-group">
        <router-link to="/endpoints" class="btn btn-outline-secondary">Back to Endpoints</router-link>
        <router-link v-if="endpoint" :to="`/endpoints/${endpoint.id}/edit`" class="btn btn-primary">Edit</router-link>
      </div>
    </div>

    <div v-if="endpoint">
      <!-- Endpoint Details -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Endpoint Details</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Method:</strong> 
                <span class="badge ms-2" :class="getMethodBadgeClass(endpoint.method)">
                  {{ endpoint.method }}
                </span>
              </p>
              <p><strong>Domain:</strong> {{ endpoint.domain }}</p>
              <p><strong>URI:</strong> {{ endpoint.uri }}</p>
              <p><strong>Full URL:</strong> 
                <code>{{ endpoint.domain }}{{ endpoint.uri }}</code>
              </p>
            </div>
            <div class="col-md-6">
              <p><strong>Type:</strong> 
                <span class="badge ms-2" :class="endpoint.endpoint_type === 'api' ? 'bg-info' : 'bg-secondary'">
                  {{ endpoint.endpoint_type }}
                </span>
              </p>
              <p><strong>Program:</strong> 
                <router-link :to="`/programs/${endpoint.program_id}`" class="text-decoration-none">
                  {{ endpoint.program_name }}
                </router-link>
              </p>
              <p><strong>Created:</strong> {{ formatDate(endpoint.created_at) }}</p>
              <p><strong>Updated:</strong> {{ formatDate(endpoint.updated_at) }}</p>
            </div>
          </div>
          <div v-if="endpoint.description">
            <p><strong>Description:</strong></p>
            <div class="bg-light p-3 rounded">{{ endpoint.description }}</div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="card mb-4" v-if="endpoint.notes && endpoint.notes.length > 0">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Notes</h5>
          <button @click="showAddNote = !showAddNote" class="btn btn-sm btn-primary">Add Note</button>
        </div>
        <div class="card-body">
          <!-- Add Note Form -->
          <div v-if="showAddNote" class="mb-3 p-3 bg-light rounded">
            <form @submit.prevent="addNote">
              <div class="mb-2">
                <textarea 
                  v-model="newNote" 
                  class="form-control" 
                  placeholder="Enter your note..."
                  rows="3"
                  required
                ></textarea>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" @click="showAddNote = false" class="btn btn-sm btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-sm btn-primary">Add Note</button>
              </div>
            </form>
          </div>

          <div class="list-group list-group-flush">
            <div v-for="note in endpoint.notes" :key="note.id" class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                  <p class="mb-1">{{ note.value }}</p>
                  <small class="text-muted">{{ formatDate(note.created_at) }}</small>
                </div>
                <div class="btn-group btn-group-sm">
                  <router-link :to="`/notes/${note.id}`" class="btn btn-outline-primary btn-sm">View</router-link>
                  <button @click="deleteNote(note)" class="btn btn-outline-danger btn-sm">Delete</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Attachments Section -->
      <div class="card mb-4" v-if="endpoint.attachments && endpoint.attachments.length > 0">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Attachments</h5>
          <button @click="showAddAttachment = !showAddAttachment" class="btn btn-sm btn-primary">Add Attachment</button>
        </div>
        <div class="card-body">
          <!-- Add Attachment Form -->
          <div v-if="showAddAttachment" class="mb-3 p-3 bg-light rounded">
            <form @submit.prevent="uploadAttachment">
              <div class="mb-2">
                <input 
                  type="file" 
                  ref="fileInput"
                  class="form-control" 
                  required
                >
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" @click="showAddAttachment = false" class="btn btn-sm btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-sm btn-primary">Upload</button>
              </div>
            </form>
          </div>

          <div class="list-group list-group-flush">
            <div v-for="attachment in endpoint.attachments" :key="attachment.id" class="list-group-item px-0 d-flex justify-content-between align-items-center">
              <div>
                <a :href="attachment.url" target="_blank" class="text-decoration-none">
                  {{ attachment.filename }}
                </a>
              </div>
              <button @click="deleteAttachment(attachment)" class="btn btn-outline-danger btn-sm">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty states for notes and attachments -->
      <div v-if="!endpoint.notes || endpoint.notes.length === 0" class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Notes</h5>
          <button @click="showAddNote = !showAddNote" class="btn btn-sm btn-primary">Add Note</button>
        </div>
        <div class="card-body">
          <!-- Add Note Form -->
          <div v-if="showAddNote" class="mb-3 p-3 bg-light rounded">
            <form @submit.prevent="addNote">
              <div class="mb-2">
                <textarea 
                  v-model="newNote" 
                  class="form-control" 
                  placeholder="Enter your note..."
                  rows="3"
                  required
                ></textarea>
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" @click="showAddNote = false" class="btn btn-sm btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-sm btn-primary">Add Note</button>
              </div>
            </form>
          </div>
          <p class="text-muted text-center" v-if="!showAddNote">No notes yet.</p>
        </div>
      </div>

      <div v-if="!endpoint.attachments || endpoint.attachments.length === 0" class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Attachments</h5>
          <button @click="showAddAttachment = !showAddAttachment" class="btn btn-sm btn-primary">Add Attachment</button>
        </div>
        <div class="card-body">
          <!-- Add Attachment Form -->
          <div v-if="showAddAttachment" class="mb-3 p-3 bg-light rounded">
            <form @submit.prevent="uploadAttachment">
              <div class="mb-2">
                <input 
                  type="file" 
                  ref="fileInput"
                  class="form-control" 
                  required
                >
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" @click="showAddAttachment = false" class="btn btn-sm btn-secondary">Cancel</button>
                <button type="submit" class="btn btn-sm btn-primary">Upload</button>
              </div>
            </form>
          </div>
          <p class="text-muted text-center" v-if="!showAddAttachment">No attachments yet.</p>
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
  name: 'EndpointDetail',
  props: ['id'],
  data() {
    return {
      endpoint: null,
      showAddNote: false,
      showAddAttachment: false,
      newNote: ''
    }
  },
  async mounted() {
    await this.loadEndpoint()
  },
  methods: {
    formatDate,
    async loadEndpoint() {
      try {
        const result = await this.$store.dispatch('makeApiCall', {
          endpoint: `/endpoints/${this.id}`
        })
        this.endpoint = result.data
      } catch (error) {
        console.error('Error loading endpoint:', error)
        if (error.status === 404 || error.message.includes('404')) {
          this.$router.push('/endpoints')
        }
      }
    },
    async addNote() {
      try {
        await this.$store.dispatch('createNote', {
          reference_type: 'endpoints',
          reference_id: parseInt(this.id),
          value: this.newNote
        })
        this.newNote = ''
        this.showAddNote = false
        await this.loadEndpoint() // Refresh to show new note
      } catch (error) {
        console.error('Error adding note:', error)
      }
    },
    async deleteNote(note) {
      if (confirm('Are you sure you want to delete this note?')) {
        try {
          await this.$store.dispatch('deleteNote', note.id)
          await this.loadEndpoint() // Refresh to remove deleted note
        } catch (error) {
          console.error('Error deleting note:', error)
        }
      }
    },
    async uploadAttachment() {
      const file = this.$refs.fileInput.files[0]
      if (!file) return

      try {
        await this.$store.dispatch('uploadAttachment', {
          referenceType: 'endpoints',
          referenceId: parseInt(this.id),
          file: file
        })
        this.showAddAttachment = false
        this.$refs.fileInput.value = ''
        await this.loadEndpoint() // Refresh to show new attachment
      } catch (error) {
        console.error('Error uploading attachment:', error)
      }
    },
    async deleteAttachment(attachment) {
      if (confirm('Are you sure you want to delete this attachment?')) {
        try {
          await this.$store.dispatch('deleteAttachment', attachment.id)
          await this.loadEndpoint() // Refresh to remove deleted attachment
        } catch (error) {
          console.error('Error deleting attachment:', error)
        }
      }
    },
    getMethodBadgeClass(method) {
      const classes = {
        'GET': 'bg-success',
        'POST': 'bg-primary',
        'PUT': 'bg-warning',
        'PATCH': 'bg-info',
        'DELETE': 'bg-danger',
        'HEAD': 'bg-secondary',
        'OPTIONS': 'bg-dark'
      }
      return classes[method] || 'bg-secondary'
    }
  }
}
</script>
