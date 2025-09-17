<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Request Details</h2>
      <router-link to="/requests" class="btn btn-outline-secondary">Back to Requests</router-link>
    </div>

    <div v-if="request">
      <!-- Request Overview -->
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">Request Overview</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Method:</strong> 
                <span class="badge ms-2" :class="getMethodBadgeClass(request.method)">
                  {{ request.method }}
                </span>
              </p>
              <p><strong>URL:</strong> 
                <a :href="request.url" target="_blank" class="text-decoration-none">
                  {{ request.url }}
                </a>
              </p>
              <p><strong>Domain:</strong> {{ request.domain }}</p>
              <p><strong>Status Code:</strong> 
                <span class="badge ms-2" :class="getStatusBadgeClass(request.status_code)">
                  {{ request.status_code }}
                </span>
              </p>
            </div>
            <div class="col-md-6">
              <p><strong>Program:</strong> 
                <router-link 
                  v-if="request.program_id" 
                  :to="`/programs/${request.program_id}`" 
                  class="text-decoration-none"
                >
                  {{ request.program_name }}
                </router-link>
                <span v-else class="text-muted">Not linked</span>
              </p>
              <p><strong>Endpoint:</strong> 
                <router-link 
                  v-if="request.endpoint_id" 
                  :to="`/endpoints/${request.endpoint_id}`" 
                  class="text-decoration-none"
                >
                  {{ request.endpoint_name }}
                </router-link>
                <span v-else class="text-muted">Not linked</span>
              </p>
              <p><strong>Job ID:</strong> {{ request.job_id || 'N/A' }}</p>
              <p><strong>Sequence Number:</strong> {{ request.sequence_number }}</p>
              <p><strong>Latency:</strong> {{ request.latency_ms }}ms</p>
            </div>
          </div>

          <!-- Search Results -->
          <div v-if="request.search_results && request.search_results.length > 0">
            <p><strong>Search Results:</strong></p>
            <div class="bg-light p-3 rounded">
              <div v-for="(result, index) in request.search_results" :key="index" class="mb-1">
                <small>{{ result }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Request Details -->
      <div class="row">
        <div class="col-lg-6 mb-4">
          <!-- Request Headers -->
          <div class="card h-100">
            <div class="card-header">
              <h6 class="mb-0">Request Headers</h6>
            </div>
            <div class="card-body clickable-content" @click="openModal('Request Headers', request.request_headers, 'json')" style="cursor: pointer;">
              <div v-if="request.request_headers" class="mb-0">
                <div v-for="header in parseHeaders(request.request_headers)" :key="header.name" class="mb-1">
                  <strong>{{ header.name }}:</strong> {{ header.value }}
                </div>
              </div>
              <p v-else class="text-muted mb-0">No request headers</p>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <!-- Response Headers -->
          <div class="card h-100">
            <div class="card-header">
              <h6 class="mb-0">Response Headers</h6>
            </div>
            <div class="card-body clickable-content" @click="openModal('Response Headers', request.response_headers, 'json')" style="cursor: pointer;">
              <div v-if="request.response_headers" class="mb-0">
                <div v-for="header in parseHeaders(request.response_headers)" :key="header.name" class="mb-1">
                  <strong>{{ header.name }}:</strong> {{ header.value }}
                </div>
              </div>
              <p v-else class="text-muted mb-0">No response headers</p>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-lg-6 mb-4">
          <!-- Request Body -->
          <div class="card h-100">
            <div class="card-header">
              <h6 class="mb-0">Request Body</h6>
            </div>
            <div class="card-body clickable-content" @click="openModal('Request Body', request.request_body, 'json')" style="cursor: pointer;">
              <pre v-if="request.request_body" class="mb-0">{{ formatBody(request.request_body) }}</pre>
              <p v-else class="text-muted mb-0">No request body</p>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <!-- Response Body -->
          <div class="card h-100">
            <div class="card-header">
              <h6 class="mb-0">Response Body</h6>
            </div>
            <div class="card-body clickable-content" @click="openModal('Response Body', request.response_body, 'json')" style="cursor: pointer;">
              <pre v-if="request.response_body" class="mb-0">{{ formatBody(request.response_body) }}</pre>
              <p v-else class="text-muted mb-0">No response body</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Details -->
      <div class="card mb-4">
        <div class="card-header">
          <h6 class="mb-0">Technical Details</h6>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4">
              <p><strong>Request Hash:</strong><br>
                <small class="text-muted font-monospace">{{ request.req_hash || 'N/A' }}</small>
              </p>
            </div>
            <div class="col-md-4">
              <p><strong>Response Hash:</strong><br>
                <small class="text-muted font-monospace">{{ request.response_hash || 'N/A' }}</small>
              </p>
            </div>
            <div class="col-md-4">
              <p><strong>Response Body Hash:</strong><br>
                <small class="text-muted font-monospace">{{ request.response_body_hash || 'N/A' }}</small>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="card mb-4" v-if="request.notes && request.notes.length > 0">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Notes</h6>
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
            :notes="request.notes" 
            @note-updated="loadRequest"
            @note-deleted="loadRequest"
          />
        </div>
      </div>

      <!-- Attachments Section -->
      <div class="card mb-4" v-if="request.attachments && request.attachments.length > 0">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Attachments</h6>
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
            <div v-for="attachment in request.attachments" :key="attachment.id" class="list-group-item px-0 d-flex justify-content-between align-items-center">
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
      <div v-if="!request.notes || request.notes.length === 0" class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Notes</h6>
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
            :notes="request.notes || []" 
            @note-updated="loadRequest"
            @note-deleted="loadRequest"
          />
        </div>
      </div>

      <div v-if="!request.attachments || request.attachments.length === 0" class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Attachments</h6>
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

      <!-- Related Requests Section -->
      <div class="card mb-4" v-if="request && request.endpoint_id">
        <div class="card-header">
          <h6 class="mb-0">Related Requests</h6>
        </div>
        <div class="card-body">
          <RequestsCardList 
            :requests="relatedRequests" 
            :loading="loadingRelatedRequests"
            :show-filters="false"
          />
          <div v-if="!loadingRelatedRequests && relatedRequests.length === 0" class="text-center text-muted py-4">
            No related requests found for this endpoint.
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    
    <!-- Content Modal -->
    <ContentModal
      :show="showModal"
      :title="modalTitle"
      :content="modalContent"
      :language="modalLanguage"
      @close="closeModal"
    />
  </div>
</template>

<script>
import { formatDate } from '../../config/api'
import NotesListComponent from '../../components/NotesList.vue'
import ContentModal from '../../components/ContentModal.vue'
import RequestsCardList from '../../components/RequestsCardList.vue'

export default {
  name: 'RequestDetail',
  components: {
    NotesListComponent,
    ContentModal,
    RequestsCardList
  },
  props: ['id'],
  data() {
    return {
      request: null,
      showAddNote: false,
      showAddAttachment: false,
      newNote: '',
      showModal: false,
      modalTitle: '',
      modalContent: '',
      modalLanguage: 'json',
      relatedRequests: [],
      loadingRelatedRequests: false
    }
  },
  async mounted() {
    await this.loadRequest()
  },
  watch: {
    'request.endpoint_id': {
      handler(newEndpointId) {
        if (newEndpointId) {
          this.loadRelatedRequests()
        }
      },
      immediate: true
    }
  },
  methods: {
    formatDate,
    async loadRequest() {
      try {
        const result = await this.$store.dispatch('makeApiCall', {
          endpoint: `/requests/${this.id}`
        })
        this.request = result.data
      } catch (error) {
        console.error('Error loading request:', error)
        if (error.status === 404 || error.message.includes('404')) {
          this.$router.push('/requests')
        }
      }
    },
    async addNote() {
      try {
        await this.$store.dispatch('createNote', {
          reference_type: 'requests',
          reference_id: parseInt(this.id),
          value: this.newNote
        })
        this.newNote = ''
        this.showAddNote = false
        await this.loadRequest() // Refresh to show new note
      } catch (error) {
        console.error('Error adding note:', error)
      }
    },
    async uploadAttachment() {
      const file = this.$refs.fileInput.files[0]
      if (!file) return

      try {
        await this.$store.dispatch('uploadAttachment', {
          referenceType: 'requests',
          referenceId: parseInt(this.id),
          file: file
        })
        this.showAddAttachment = false
        this.$refs.fileInput.value = ''
        await this.loadRequest() // Refresh to show new attachment
      } catch (error) {
        console.error('Error uploading attachment:', error)
      }
    },
    async deleteAttachment(attachment) {
      if (confirm('Are you sure you want to delete this attachment?')) {
        try {
          await this.$store.dispatch('deleteAttachment', attachment.id)
          await this.loadRequest() // Refresh to remove deleted attachment
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
    },
    getStatusBadgeClass(statusCode) {
      if (statusCode >= 200 && statusCode < 300) return 'bg-success'
      if (statusCode >= 300 && statusCode < 400) return 'bg-info'
      if (statusCode >= 400 && statusCode < 500) return 'bg-warning'
      if (statusCode >= 500) return 'bg-danger'
      return 'bg-secondary'
    },
    parseHeaders(headers) {
      if (!headers) return []
      
      try {
        // If it's already an object (parsed JSON)
        if (typeof headers === 'object' && headers !== null) {
          // Check if it's an array of objects (common format from some APIs)
          if (Array.isArray(headers)) {
            return headers.map((header, index) => {
              if (typeof header === 'object' && header !== null) {
                // If it's an object with name/value properties
                if (header.name && header.value !== undefined) {
                  return {
                    name: header.name,
                    value: Array.isArray(header.value) ? header.value.join(', ') : String(header.value)
                  }
                }
                // If it's an object with key-value pairs, take the first entry
                const entries = Object.entries(header)
                if (entries.length > 0) {
                  const [name, value] = entries[0]
                  return {
                    name,
                    value: Array.isArray(value) ? value.join(', ') : String(value)
                  }
                }
              }
              // Fallback for other array items
              return {
                name: `Header ${index}`,
                value: String(header)
              }
            })
          }
          
          // If it's a plain object, convert to array of name-value pairs
          return Object.entries(headers).map(([name, value]) => ({
            name,
            value: Array.isArray(value) ? value.join(', ') : String(value)
          }))
        }
        
        // If it's a string, try to parse as JSON first
        if (typeof headers === 'string') {
          try {
            const parsed = JSON.parse(headers)
            if (typeof parsed === 'object' && parsed !== null) {
              // Recursively call parseHeaders to handle the parsed object
              return this.parseHeaders(parsed)
            }
          } catch {
            // If JSON parsing fails, try to parse as HTTP header format
            return headers
              .split('\n')
              .filter(line => line.trim() && line.includes(':'))
              .map(line => {
                const [name, ...valueParts] = line.split(':')
                return {
                  name: name.trim(),
                  value: valueParts.join(':').trim()
                }
              })
          }
        }
      } catch (error) {
        console.error('Error parsing headers:', error)
      }
      
      return []
    },
    formatHeaders(headers) {
      if (typeof headers === 'string') return headers
      if (typeof headers === 'object') {
        return JSON.stringify(headers, null, 2)
      }
      return String(headers)
    },
    formatBody(body) {
      if (typeof body === 'string') {
        try {
          // Try to parse and pretty-print JSON
          return JSON.stringify(JSON.parse(body), null, 2)
        } catch {
          return body
        }
      }
      if (typeof body === 'object') {
        return JSON.stringify(body, null, 2)
      }
      return String(body)
    },
    openModal(title, content, language = 'json') {
      this.modalTitle = title
      this.modalContent = content
      this.modalLanguage = language
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.modalTitle = ''
      this.modalContent = ''
      this.modalLanguage = 'json'
    },
    async loadRelatedRequests() {
      if (!this.request || !this.request.endpoint_id) {
        this.relatedRequests = []
        return
      }

      this.loadingRelatedRequests = true
      try {
        const result = await this.$store.dispatch('makeApiCall', {
          endpoint: `/requests?endpoint_id=${this.request.endpoint_id}`
        })
        this.relatedRequests = result.data || []
      } catch (error) {
        console.error('Error loading related requests:', error)
        this.relatedRequests = []
      } finally {
        this.loadingRelatedRequests = false
      }
    }
  }
}
</script>

<style scoped>
.clickable-content {
  transition: background-color 0.2s ease;
}

.clickable-content:hover {
  background-color: #f8f9fa;
}

.clickable-content:hover::after {
  content: "Click to view full content";
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.75rem;
  color: #6c757d;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 3px;
}
</style>
