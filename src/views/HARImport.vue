<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Import HAR File</h2>
      <router-link to="/jobs" class="btn btn-outline-secondary">View Import Jobs</router-link>
    </div>

    <div class="row">
      <div class="col-lg-8">
        <!-- Import Form -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">Upload HAR File</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="importHAR">
              <div class="mb-3">
                <label for="harFile" class="form-label">HAR File *</label>
                <input 
                  type="file" 
                  class="form-control" 
                  id="harFile" 
                  ref="fileInput"
                  accept=".har,.json"
                  required
                  @change="validateFile"
                >
                <div class="form-text">
                  Select a HTTP Archive (.har) file to import. The file should contain HTTP request/response data.
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

              <div class="d-flex justify-content-end gap-2">
                <button type="button" @click="clearFile" class="btn btn-outline-secondary">Clear</button>
                <button type="submit" class="btn btn-primary" :disabled="!selectedFile">
                  Import HAR File
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Recent Import Jobs -->
        <div class="card" v-if="recentJobs.length > 0">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">Recent Import Jobs</h6>
            <router-link to="/jobs" class="btn btn-sm btn-outline-primary">View All Jobs</router-link>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Title</th>
                    <th>Progress</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="job in recentJobs.slice(0, 5)" :key="job.id">
                    <td>{{ job.id }}</td>
                    <td>{{ job.title || 'HAR Import' }}</td>
                    <td>
                      <div class="progress" style="height: 20px;">
                        <div 
                          class="progress-bar" 
                          :class="job.progress === 100 ? 'bg-success' : 'bg-primary'"
                          :style="`width: ${job.progress}%`"
                        >
                          {{ job.progress }}%
                        </div>
                      </div>
                    </td>
                    <td class="text-muted">{{ formatDate(job.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <!-- Information Panel -->
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">About HAR Files</h6>
          </div>
          <div class="card-body">
            <p><strong>What is a HAR file?</strong></p>
            <p class="text-muted mb-3">
              HTTP Archive (HAR) files contain a log of HTTP requests and responses between a web browser and server. 
              They're commonly used for performance analysis and debugging.
            </p>

            <p><strong>How to generate HAR files:</strong></p>
            <ul class="text-muted mb-3">
              <li>Chrome: Developer Tools → Network → Right-click → Save as HAR</li>
              <li>Firefox: Developer Tools → Network → Settings → Save All as HAR</li>
              <li>Safari: Web Inspector → Network → Export</li>
              <li>Burp Suite: HTTP history → Save selected items</li>
            </ul>

            <p><strong>What gets imported:</strong></p>
            <ul class="text-muted mb-0">
              <li>HTTP requests and responses</li>
              <li>Headers and body content</li>
              <li>Timing and performance data</li>
              <li>Status codes and error information</li>
            </ul>
          </div>
        </div>

        <!-- Tips -->
        <div class="card mt-4">
          <div class="card-header">
            <h6 class="mb-0">Tips</h6>
          </div>
          <div class="card-body">
            <ul class="text-muted mb-0">
              <li>Large HAR files may take some time to process</li>
              <li>Import jobs run in the background</li>
              <li>Check the Jobs page to monitor progress</li>
              <li>Imported requests will appear in the Requests section</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from '../config/api'

export default {
  name: 'HARImport',
  data() {
    return {
      selectedFile: null,
      fileError: null,
      recentJobs: []
    }
  },
  async mounted() {
    await this.loadRecentJobs()
  },
  methods: {
    formatDate,
    async loadRecentJobs() {
      try {
        await this.$store.dispatch('fetchJobs')
        // Filter for import jobs and get recent ones
        this.recentJobs = this.$store.getters.jobs
          .filter(job => job.job_type === 'import_har')
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
      const allowedTypes = ['application/json', 'text/json']
      const allowedExtensions = ['.har', '.json']
      const hasValidExtension = allowedExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      )

      if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        this.fileError = 'Please select a valid HAR file (.har or .json)'
        this.selectedFile = null
        return
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        this.fileError = 'File size must be less than 50MB'
        this.selectedFile = null
        return
      }

      this.selectedFile = file
    },
    async importHAR() {
      if (!this.selectedFile) {
        this.fileError = 'Please select a file first'
        return
      }

      try {
        const jobId = await this.$store.dispatch('importHAR', this.selectedFile)
        
        // Show success message and redirect to jobs page
        this.$store.commit('SET_ERROR', null)
        this.clearFile()
        await this.loadRecentJobs() // Refresh recent jobs
        
        // Optionally redirect to jobs page
        this.$router.push(`/jobs?highlight=${jobId}`)
      } catch (error) {
        console.error('Error importing HAR:', error)
        this.fileError = error.message || 'Failed to import HAR file'
      }
    },
    clearFile() {
      this.selectedFile = null
      this.fileError = null
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
