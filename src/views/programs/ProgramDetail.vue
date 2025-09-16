<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>{{ program?.name || 'Loading...' }}</h2>
      <div class="btn-group">
        <router-link to="/programs" class="btn btn-outline-secondary">Back to Programs</router-link>
        <router-link v-if="program" :to="`/programs/${program.id}/edit`" class="btn btn-primary">Edit</router-link>
      </div>
    </div>

    <div v-if="program">
      <!-- Program Details -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Program Details</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Name:</strong> {{ program.name }}</p>
              <p><strong>URL:</strong> 
                <a :href="program.url" target="_blank" class="text-decoration-none">
                  {{ program.url }}
                </a>
              </p>
              <p><strong>Scope:</strong> {{ program.scope }}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Domains:</strong> {{ program.domains }}</p>
              <p><strong>ID:</strong> {{ program.id }}</p>
            </div>
          </div>
          <div v-if="program.note">
            <p><strong>Note:</strong></p>
            <div class="bg-light p-3 rounded">{{ program.note }}</div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="card mb-4" v-if="program.notes && program.notes.length > 0">
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

          <NotesListComponent 
            :notes="program.notes" 
            @note-updated="loadProgram"
            @note-deleted="loadProgram"
          />
        </div>
      </div>

      <!-- Attachments Section -->
      <div class="card mb-4" v-if="program.attachments && program.attachments.length > 0">
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
            <div v-for="attachment in program.attachments" :key="attachment.id" class="list-group-item px-0 d-flex justify-content-between align-items-center">
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
      <div v-if="!program.notes || program.notes.length === 0" class="card mb-4">
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
          <NotesListComponent 
            v-if="!showAddNote"
            :notes="program.notes || []" 
            @note-updated="loadProgram"
            @note-deleted="loadProgram"
          />
        </div>
      </div>

      <div v-if="!program.attachments || program.attachments.length === 0" class="card">
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

      <!-- Related Endpoints Section -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Related Endpoints</h6>
          <button @click="refreshRelatedEndpoints" class="btn btn-sm btn-outline-primary">
            <i class="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div class="card-body">
          <EndpointsCardList 
            :endpoints="relatedEndpoints"
            :show-program-link="false"
            empty-message="No endpoints found for this program."
          />
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
import { formatDate, apiRequest } from '../../config/api'
import NotesListComponent from '../../components/NotesList.vue'
import EndpointsCardList from '../../components/EndpointsCardList.vue'

export default {
  name: 'ProgramDetail',
  components: {
    NotesListComponent,
    EndpointsCardList
  },
  props: ['id'],
  data() {
    return {
      program: null,
      relatedEndpoints: [],
      showAddNote: false,
      showAddAttachment: false,
      newNote: ''
    }
  },
  async mounted() {
    await this.loadProgram()
    await this.loadRelatedEndpoints()
  },
  methods: {
    formatDate,
    async loadProgram() {
      try {
        const result = await this.$store.dispatch('makeApiCall', {
          endpoint: `/programs/${this.id}`
        })
        this.program = result.data
      } catch (error) {
        console.error('Error loading program:', error)
        if (error.status === 404 || error.message.includes('404')) {
          this.$router.push('/programs')
        }
      }
    },
    async addNote() {
      try {
        await this.$store.dispatch('createNote', {
          reference_type: 'programs',
          reference_id: parseInt(this.id),
          value: this.newNote
        })
        this.newNote = ''
        this.showAddNote = false
        await this.loadProgram() // Refresh to show new note
      } catch (error) {
        console.error('Error adding note:', error)
      }
    },
    async uploadAttachment() {
      const file = this.$refs.fileInput.files[0]
      if (!file) return

      try {
        await this.$store.dispatch('uploadAttachment', {
          referenceType: 'programs',
          referenceId: parseInt(this.id),
          file: file
        })
        this.showAddAttachment = false
        this.$refs.fileInput.value = ''
        await this.loadProgram() // Refresh to show new attachment
      } catch (error) {
        console.error('Error uploading attachment:', error)
      }
    },
    async deleteAttachment(attachment) {
      if (confirm('Are you sure you want to delete this attachment?')) {
        try {
          await this.$store.dispatch('deleteAttachment', attachment.id)
          await this.loadProgram() // Refresh to remove deleted attachment
        } catch (error) {
          console.error('Error deleting attachment:', error)
        }
      }
    },
    async loadRelatedEndpoints() {
      try {
        const result = await this.$store.dispatch('fetchEndpoints')
        // Filter endpoints for this program
        this.relatedEndpoints = (result || []).filter(endpoint => 
          endpoint.program_id === parseInt(this.id)
        )
      } catch (error) {
        console.error('Error loading related endpoints:', error)
      }
    },
    async refreshRelatedEndpoints() {
      await this.loadRelatedEndpoints()
    }
  }
}
</script>
