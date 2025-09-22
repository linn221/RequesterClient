<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Import Burp XML File</h2>
      <router-link to="/jobs" class="btn btn-outline-secondary">View Import Jobs</router-link>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <!-- Import Form -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Upload Burp XML File</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="importBurpXML">
              <div class="mb-3">
                <label for="program_id" class="form-label">Program *</label>
                <select class="form-select" id="program_id" v-model="selectedProgramId" required>
                  <option value="">Select a program</option>
                  <option v-for="program in programs" :key="program.id" :value="program.id">
                    {{ program.name }}
                  </option>
                </select>
                <div class="form-text">
                  Select the program to associate this Burp XML import with. 
                  <router-link to="/programs/create">Create a new program</router-link> if none are available.
                </div>
              </div>

              <div class="mb-3">
                <label for="burpFile" class="form-label">Burp XML File *</label>
                <input 
                  type="file" 
                  class="form-control" 
                  id="burpFile" 
                  ref="fileInput"
                  accept=".xml"
                  required
                  @change="validateFile"
                >
                <div class="form-text">
                  Select a Burp Suite XML file to import. The file should contain base64 encoded request and response data.
                </div>
                <div v-if="fileError" class="text-danger mt-2">
                  {{ fileError }}
                </div>
              </div>

              <div v-if="selectedFile" class="mb-3">
                <div class="alert alert-info">
                  <h6 class="alert-heading">File Selected</h6>
                  <p class="mb-1"><strong>Name:</strong> {{ selectedFile.name }}</p>
                  <p class="mb-1"><strong>Size:</strong> {{ formatFileSize(selectedFile.size) }}</p>
                  <p class="mb-0"><strong>Type:</strong> {{ selectedFile.type || 'Unknown' }}</p>
                </div>
              </div>

              <div class="mb-3">
                <label for="ignored_headers" class="form-label">Ignored Headers</label>
                <PillInput
                  v-model="ignoredHeaders"
                  placeholder="Type header names and press space to add..."
                />
                <div class="form-text">
                  Specify headers to ignore during processing. Each header should be added as a separate pill.
                  Common headers to ignore: User-Agent, Accept-Encoding, Connection, etc.
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" @click="clearFile" class="btn btn-outline-secondary">Clear</button>
                <button type="submit" class="btn btn-primary" :disabled="!selectedFile || !selectedProgramId">
                  Import Burp XML File
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Recent Import Jobs -->
        <div class="card" v-if="recentJobs.length > 0">
          <div class="card-header">
            <h5 class="mb-0">Recent Burp XML Import Jobs</h5>
          </div>
          <div class="card-body">
            <div class="list-group list-group-flush">
              <div 
                v-for="job in recentJobs.slice(0, 5)" 
                :key="job.id" 
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6 class="mb-1">{{ job.title }}</h6>
                  <p class="mb-1 text-muted">{{ job.description }}</p>
                  <small class="text-muted">{{ formatDate(job.created_at) }}</small>
                </div>
                <div class="d-flex align-items-center">
                  <div class="progress me-3" style="width: 100px; height: 8px;">
                    <div 
                      class="progress-bar" 
                      :class="job.progress === 100 ? 'bg-success' : 'bg-primary'"
                      :style="{ width: job.progress + '%' }"
                    ></div>
                  </div>
                  <span class="badge" :class="job.progress === 100 ? 'bg-success' : 'bg-primary'">
                    {{ job.progress }}%
                  </span>
                </div>
              </div>
            </div>
            <div class="text-center mt-3">
              <router-link to="/jobs" class="btn btn-outline-primary btn-sm">
                View All Jobs
              </router-link>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">How to Export from Burp Suite</h5>
          </div>
          <div class="card-body">
            <ol>
              <li>Open Burp Suite</li>
              <li>Go to <strong>Target</strong> tab</li>
              <li>Right-click on the site or specific requests you want to export</li>
              <li>Select <strong>Save selected items</strong></li>
              <li>Choose <strong>XML</strong> format</li>
              <li>Save the file and upload it here</li>
            </ol>
            <div class="alert alert-info mt-3">
              <strong>Note:</strong> The Burp XML format should contain base64 encoded request and response data. 
              Make sure to select the appropriate requests before exporting.
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <!-- Tips -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Import Tips</h5>
          </div>
          <div class="card-body">
            <h6>File Requirements</h6>
            <ul class="mb-3">
              <li>File must be in Burp Suite XML format</li>
              <li>Should contain base64 encoded request/response data</li>
              <li>No file size limit</li>
            </ul>

            <h6>Processing</h6>
            <ul class="mb-3">
              <li>Requests are automatically parsed and stored</li>
              <li>Endpoints are extracted and linked to programs</li>
              <li>Notes and attachments are preserved</li>
              <li>Progress can be tracked in the Jobs section</li>
            </ul>

            <h6>Best Practices</h6>
            <ul>
              <li>Export only relevant requests to reduce processing time</li>
              <li>Use ignored headers to filter out noise</li>
              <li>Associate with the correct program for better organization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from '../config/api'

import PillInput from '../components/PillInput.vue'

export default {
  name: 'BurpXMLImport',
  components: {
    PillInput
  },
  data() {
    return {
      selectedFile: null,
      selectedProgramId: '',
      fileError: null,
      recentJobs: [],
      programs: [],
      ignoredHeaders: []
    }
  },
  async mounted() {
    await this.loadPrograms()
    await this.loadRecentJobs()
  },
  methods: {
    formatDate,
    async loadPrograms() {
      try {
        const result = await this.$store.dispatch('fetchPrograms')
        this.programs = result || []
      } catch (error) {
        console.error('Error loading programs:', error)
      }
    },
    async loadRecentJobs() {
      try {
        await this.$store.dispatch('fetchJobs')
        // Filter for import jobs and get recent ones
        this.recentJobs = this.$store.getters.jobs
          .filter(job => job.job_type === 'import_burp_xml')
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } catch (error) {
        console.error('Error loading recent jobs:', error)
      }
    },
    validateFile(event) {
      const file = event.target.files[0]
      this.fileError = null

      if (!file) {
        this.selectedFile = null
        return
      }

      // Validate file type
      const allowedTypes = ['text/xml', 'application/xml']
      const allowedExtensions = ['.xml']
      const hasValidExtension = allowedExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )

      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        this.fileError = 'Please select a valid XML file (.xml)'
        this.selectedFile = null
        return
      }

      // No file size limit for Burp XML imports

      this.selectedFile = file
    },
    async importBurpXML() {
      if (!this.selectedFile) {
        this.fileError = 'Please select a file first'
        return
      }

      if (!this.selectedProgramId) {
        this.fileError = 'Please select a program first'
        return
      }

      try {
        const formData = new FormData()
        formData.append('file', this.selectedFile)
        formData.append('program_id', this.selectedProgramId)
        
        // Add ignored headers as JSON string
        if (this.ignoredHeaders.length > 0) {
          formData.append('ignored_headers', JSON.stringify(this.ignoredHeaders))
        }

        const result = await this.$store.dispatch('makeApiCall', {
          endpoint: '/import_burp_xml',
          options: {
            method: 'POST',
            headers: {}, // Remove Content-Type to let browser set it for FormData
            body: formData
          }
        })
        
        // Show success message and redirect to jobs page
        this.$store.commit('SET_ERROR', null)
        this.clearFile()
        await this.loadRecentJobs() // Refresh recent jobs
        
        // Optionally redirect to jobs page
        this.$router.push(`/jobs?highlight=${result.data}`)
      } catch (error) {
        console.error('Error importing Burp XML:', error)
        this.fileError = error.message || 'Failed to import Burp XML file'
      }
    },
    clearFile() {
      this.selectedFile = null
      this.selectedProgramId = ''
      this.fileError = null
      this.ignoredHeaders = []
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}
</script>
