<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Jobs</h2>
      <div class="btn-group">
        <router-link to="/import-har" class="btn btn-primary">Import HAR</router-link>
        <router-link to="/import-burp-xml" class="btn btn-info">Import Burp XML</router-link>
        <button @click="refreshJobs" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
    </div>

    <!-- Jobs List -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          {{ jobs.length }} Job{{ jobs.length !== 1 ? 's' : '' }}
        </h6>
        <div class="d-flex align-items-center gap-2">
          <small class="text-muted">Auto-refresh in {{ autoRefreshCountdown }}s</small>
          <div class="form-check form-switch">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="autoRefresh" 
              v-model="autoRefreshEnabled"
            >
            <label class="form-check-label" for="autoRefresh">
              Auto-refresh
            </label>
          </div>
        </div>
      </div>
      <div class="card-body">
        <div v-if="jobs.length === 0" class="text-center text-muted py-4">
          <p>No jobs found.</p>
          <div class="btn-group">
            <router-link to="/import-har" class="btn btn-primary">Import HAR file</router-link>
            <router-link to="/import-burp-xml" class="btn btn-info">Import Burp XML file</router-link>
          </div>
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Progress</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="job in jobs" :key="job.id" :class="{ 'table-warning': isHighlighted(job.id) }">
                  <td>
                    <span class="badge bg-secondary">{{ job.id }}</span>
                  </td>
                  <td>
                    <span class="badge" :class="getTypeBadgeClass(job.job_type)">
                      {{ formatJobType(job.job_type) }}
                    </span>
                  </td>
                  <td>
                    <strong>{{ job.title || `Job ${job.id}` }}</strong>
                  </td>
                  <td style="min-width: 150px;">
                    <div class="d-flex align-items-center gap-2">
                      <div class="progress flex-grow-1" style="height: 20px;">
                        <div 
                          class="progress-bar" 
                          :class="getProgressBarClass(job.progress)"
                          :style="`width: ${job.progress}%`"
                          role="progressbar"
                        >
                          {{ job.progress }}%
                        </div>
                      </div>
                      <small class="text-muted">{{ job.progress }}%</small>
                    </div>
                  </td>
                  <td>
                    <small class="text-muted">
                      {{ job.description || 'No description' }}
                    </small>
                  </td>
                  <td class="text-muted">
                    {{ formatDate(job.created_at) }}
                  </td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(job.progress)">
                      {{ getStatusText(job.progress) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Job Statistics -->
    <div class="row mt-4" v-if="jobs.length > 0">
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-primary">{{ totalJobs }}</h5>
            <p class="card-text text-muted">Total Jobs</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-success">{{ completedJobs }}</h5>
            <p class="card-text text-muted">Completed</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-warning">{{ runningJobs }}</h5>
            <p class="card-text text-muted">Running</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title text-info">{{ averageProgress.toFixed(1) }}%</h5>
            <p class="card-text text-muted">Avg Progress</p>
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
  name: 'JobsList',
  data() {
    return {
      autoRefreshEnabled: true,
      autoRefreshCountdown: 10,
      autoRefreshInterval: null,
      countdownInterval: null,
      highlightedJobId: null
    }
  },
  computed: {
    ...mapGetters(['jobs']),
    totalJobs() {
      return this.jobs.length
    },
    completedJobs() {
      return this.jobs.filter(job => job.progress === 100).length
    },
    runningJobs() {
      return this.jobs.filter(job => job.progress < 100).length
    },
    averageProgress() {
      if (this.jobs.length === 0) return 0
      const totalProgress = this.jobs.reduce((sum, job) => sum + job.progress, 0)
      return totalProgress / this.jobs.length
    }
  },
  async mounted() {
    // Check if there's a job to highlight from query params
    if (this.$route.query.highlight) {
      this.highlightedJobId = parseInt(this.$route.query.highlight)
    }

    await this.loadJobs()
    this.startAutoRefresh()
  },
  beforeUnmount() {
    this.stopAutoRefresh()
  },
  methods: {
    formatDate,
    async loadJobs() {
      try {
        await this.$store.dispatch('fetchJobs')
      } catch (error) {
        console.error('Error loading jobs:', error)
      }
    },
    async refreshJobs() {
      await this.loadJobs()
      this.resetCountdown()
    },
    startAutoRefresh() {
      if (this.autoRefreshInterval) return

      this.autoRefreshInterval = setInterval(async () => {
        if (this.autoRefreshEnabled) {
          await this.loadJobs()
          this.resetCountdown()
        }
      }, 10000) // Refresh every 10 seconds

      this.startCountdown()
    },
    stopAutoRefresh() {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval)
        this.autoRefreshInterval = null
      }
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
        this.countdownInterval = null
      }
    },
    startCountdown() {
      if (this.countdownInterval) return

      this.countdownInterval = setInterval(() => {
        if (this.autoRefreshEnabled) {
          this.autoRefreshCountdown--
          if (this.autoRefreshCountdown <= 0) {
            this.resetCountdown()
          }
        }
      }, 1000)
    },
    resetCountdown() {
      this.autoRefreshCountdown = 10
    },
    isHighlighted(jobId) {
      return this.highlightedJobId === jobId
    },
    formatJobType(jobType) {
      const types = {
        'import_har': 'HAR Import',
        'import_burp_xml': 'Burp XML Import'
      }
      return types[jobType] || jobType
    },
    getTypeBadgeClass(jobType) {
      const classes = {
        'import_har': 'bg-primary',
        'import_burp_xml': 'bg-info'
      }
      return classes[jobType] || 'bg-secondary'
    },
    getProgressBarClass(progress) {
      if (progress === 100) return 'bg-success'
      if (progress >= 75) return 'bg-info'
      if (progress >= 50) return 'bg-warning'
      return 'bg-primary'
    },
    getStatusBadgeClass(progress) {
      if (progress === 100) return 'bg-success'
      if (progress > 0) return 'bg-warning'
      return 'bg-secondary'
    },
    getStatusText(progress) {
      if (progress === 100) return 'Completed'
      if (progress > 0) return 'Running'
      return 'Pending'
    }
  },
  watch: {
    autoRefreshEnabled(enabled) {
      if (enabled) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    }
  }
}
</script>
