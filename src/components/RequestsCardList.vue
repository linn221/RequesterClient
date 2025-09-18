<template>
  <div>
    <!-- Hash Filter Bar -->
    <HashFilterBar 
      v-if="localHashManager"
      :requests="allRequests"
      :visible-hashes="visibleHashes"
      :hash-manager="localHashManager"
      @hash-removed="removeHashFilter"
      @scroll-to-hash="scrollToHash"
      @clear-filters="clearAllFilters"
    />

    <div v-if="filteredRequests.length === 0" class="text-center text-muted py-4">
      <p v-if="visibleHashes.length > 0">No requests match the selected hash filters.</p>
      <p v-else>{{ emptyMessage }}</p>
    </div>

    <div v-else class="row">
      <div v-for="request in filteredRequests" :key="request.id" class="col-12 mb-3" :ref="`request-${request.id}`">
        <div class="card">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <div class="d-flex align-items-center mb-2">
                  <span class="badge me-2" :class="getMethodBadgeClass(request.method)">
                    {{ request.method }}
                  </span>
                  <span class="badge me-2" :class="getStatusBadgeClass(request.status_code)">
                    {{ request.status_code }}
                  </span>
                  <small class="text-muted">#{{ request.sequence_number }}</small>
                  
                  <!-- Additional info badges -->
                  <div class="ms-2 d-flex gap-1">
                    <span v-if="request.size" class="badge bg-info" :title="`Size: ${formatBytes(request.size)}`">
                      {{ formatBytes(request.size) }}
                    </span>
                    <span v-if="request.content_type" class="badge bg-secondary" :title="`Response Content Type: ${request.content_type}`">
                      {{ getContentTypeShort(request.content_type) }}
                    </span>
                  </div>
                </div>
                
                <h6 class="card-title mb-2">
                  <router-link :to="`/requests/${request.id}`" class="text-decoration-none">
                    <span class="text-muted">{{ request.domain }}</span><span class="fw-bold">{{ getTruncatedPath(request.url) }}</span>
                  </router-link>
                  <button 
                    v-if="isUrlTruncated(request.url)" 
                    @click.stop="showFullUrl(request.id)" 
                    class="btn btn-link btn-sm p-0 ms-1"
                    style="font-size: 0.75rem;"
                  >
                    see more
                  </button>
                </h6>

                <!-- Full URL display when expanded -->
                <div v-if="expandedUrls.includes(request.id)" class="mb-2">
                  <small class="text-muted d-block">
                    <strong>Full URL:</strong> {{ request.url }}
                    <button 
                      @click.stop="hideFullUrl(request.id)" 
                      class="btn btn-link btn-sm p-0 ms-1"
                      style="font-size: 0.75rem;"
                    >
                      hide
                    </button>
                  </small>
                </div>

                <div class="row" v-if="showRelatedLinks">
                  <div class="col-sm-6" v-if="request.program_id && request.program_name">
                    <small class="text-muted">
                      <strong>Program:</strong>
                      <router-link 
                        :to="`/programs/${request.program_id}`" 
                        class="text-decoration-none"
                      >
                        {{ request.program_name }}
                      </router-link>
                    </small>
                  </div>
                  <div class="col-sm-6" v-if="request.endpoint_id && request.endpoint_name">
                    <small class="text-muted">
                      <strong>Endpoint:</strong>
                      <router-link 
                        :to="`/endpoints/${request.endpoint_id}`" 
                        class="text-decoration-none"
                      >
                        {{ request.endpoint_name }}
                      </router-link>
                    </small>
                  </div>
                </div>

                <!-- Search Results -->
                <div v-if="request.search_results && request.search_results.length > 0" class="mt-2">
                  <small class="text-muted">
                    <strong>Search Results:</strong>
                  </small>
                  <div class="mt-1">
                    <small v-for="(result, index) in request.search_results.slice(0, 5)" :key="index" class="d-block text-truncate">
                      {{ result }}
                    </small>
                    <small v-if="request.search_results.length > 5" class="text-muted">
                      +{{ request.search_results.length - 5 }} more results
                    </small>
                  </div>
                </div>

                <!-- Hash Display -->
                <div v-if="hasRequestHashes(request)" class="mt-2">
                  <small class="text-muted">
                    <strong>Hashes:</strong>
                  </small>
                  <div class="mt-1 d-flex flex-wrap gap-1">
                    <span 
                      v-if="request.req_hash" 
                      class="badge" 
                      :style="{ backgroundColor: getHashColor(request.req_hash), color: 'white' }"
                      :title="`Request Hash: ${request.req_hash}`"
                    >
                      {{ getHashDisplayText(request.req_hash) }}
                    </span>
                    <span 
                      v-if="request.response_hash" 
                      class="badge" 
                      :style="{ backgroundColor: getHashColor(request.response_hash), color: 'white' }"
                      :title="`Response Hash: ${request.response_hash}`"
                    >
                      {{ getHashDisplayText(request.response_hash) }}
                    </span>
                    <span 
                      v-if="request.response_body_hash" 
                      class="badge" 
                      :style="{ backgroundColor: getHashColor(request.response_body_hash), color: 'white' }"
                      :title="`Response Body Hash: ${request.response_body_hash}`"
                    >
                      {{ getHashDisplayText(request.response_body_hash) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="col-md-4 text-end">
                <router-link :to="`/requests/${request.id}`" class="btn btn-primary">
                  View Details
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { HashColorManager } from '../utils/hashColors.js'
import HashFilterBar from './HashFilterBar.vue'

export default {
  name: 'RequestsCardList',
  components: {
    HashFilterBar
  },
  props: {
    requests: {
      type: Array,
      default: () => []
    },
    emptyMessage: {
      type: String,
      default: 'No requests found.'
    },
    showRelatedLinks: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      expandedUrls: [],
      visibleHashes: [],
      localHashManager: new HashColorManager()
    }
  },
  computed: {
    allRequests() {
      return this.requests
    },
    filteredRequests() {
      if (this.visibleHashes.length === 0 || !this.localHashManager) {
        return this.requests
      }
      return this.localHashManager.filterRequestsByVisibleHashes(this.requests, this.visibleHashes)
    }
  },
  watch: {
    requests: {
      handler(newRequests) {
        if (newRequests && newRequests.length > 0 && this.localHashManager) {
          // Count hash occurrences for current requests using local manager
          this.localHashManager.countHashOccurrences(newRequests)
          // Clear visible hashes when requests change to avoid stale filters
          this.visibleHashes = []
        } else {
          // If no requests, clear visible hashes
          this.visibleHashes = []
        }
      },
      immediate: true
    }
  },
  beforeUnmount() {
    // Clean up local hash manager when component is destroyed
    this.localHashManager = null
  },
  methods: {
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
    getPath(url) {
      try {
        return new URL(url).pathname + new URL(url).search
      } catch {
        return url
      }
    },
    getTruncatedPath(url, maxLength = 60) {
      const path = this.getPath(url)
      if (path.length <= maxLength) return path
      return path.substring(0, maxLength) + '...'
    },
    isUrlTruncated(url, maxLength = 60) {
      const path = this.getPath(url)
      return path.length > maxLength
    },
    showFullUrl(requestId) {
      if (!this.expandedUrls.includes(requestId)) {
        this.expandedUrls.push(requestId)
      }
    },
    hideFullUrl(requestId) {
      const index = this.expandedUrls.indexOf(requestId)
      if (index > -1) {
        this.expandedUrls.splice(index, 1)
      }
    },
    getHashColor(hash) {
      return this.localHashManager ? this.localHashManager.getColorForHash(hash) : null
    },
    getHashDisplayText(hash) {
      return this.localHashManager ? this.localHashManager.getHashDisplayText(hash) : ''
    },
    shouldShowHash(hash) {
      return this.localHashManager ? this.localHashManager.shouldShowHash(hash) : false
    },
    hasRequestHashes(request) {
      return !!(request.req_hash || request.response_hash || request.response_body_hash)
    },
    formatBytes(bytes) {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    },
    getContentTypeShort(contentType) {
      if (!contentType) return ''
      // Extract the main type (e.g., "application/json" -> "json")
      const parts = contentType.split('/')
      if (parts.length > 1) {
        const subtype = parts[1].split(';')[0] // Remove charset info
        return subtype.length > 10 ? subtype.substring(0, 10) + '...' : subtype
      }
      return contentType.length > 10 ? contentType.substring(0, 10) + '...' : contentType
    },
    removeHashFilter(hash) {
      const index = this.visibleHashes.indexOf(hash)
      if (index > -1) {
        this.visibleHashes.splice(index, 1)
      }
    },
    clearAllFilters() {
      this.visibleHashes = []
    },
    scrollToHash(hash) {
      // Find the first request that contains this hash from ALL requests (not filtered)
      const targetRequest = this.requests.find(request => {
        return request.req_hash === hash || 
               request.response_hash === hash || 
               request.response_body_hash === hash
      })
      
      if (targetRequest) {
        // Wait for next tick to ensure DOM is updated
        this.$nextTick(() => {
          const element = this.$refs[`request-${targetRequest.id}`]
          if (element && element[0]) {
            element[0].scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            })
            
            // Add temporary highlight animation
            element[0].classList.add('hash-highlight')
            setTimeout(() => {
              element[0].classList.remove('hash-highlight')
            }, 2000)
          }
        })
      }
    }
  }
}
</script>

<style scoped>
/* Hash highlight animation */
.hash-highlight {
  animation: hashPulse 2s ease-in-out;
}

@keyframes hashPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.7);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(13, 110, 253, 0.3);
    transform: scale(1.02);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(13, 110, 253, 0);
    transform: scale(1);
  }
}
</style>
