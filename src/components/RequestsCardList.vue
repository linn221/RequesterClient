<template>
  <div>
    <div v-if="requests.length === 0" class="text-center text-muted py-4">
      <p>{{ emptyMessage }}</p>
    </div>

    <div v-else class="row">
      <div v-for="request in requests" :key="request.id" class="col-12 mb-3">
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
                </div>
                
                <h6 class="card-title mb-2">
                  <router-link :to="`/requests/${request.id}`" class="text-decoration-none">
                    <span class="text-muted">{{ request.domain }}</span><span class="fw-bold">{{ getTruncatedPath(request.url) }}</span>
                    <button 
                      v-if="isUrlTruncated(request.url)" 
                      @click="showFullUrl(request.id)" 
                      class="btn btn-link btn-sm p-0 ms-1"
                      style="font-size: 0.75rem;"
                    >
                      see more
                    </button>
                  </router-link>
                </h6>

                <!-- Full URL display when expanded -->
                <div v-if="expandedUrls.includes(request.id)" class="mb-2">
                  <small class="text-muted d-block">
                    <strong>Full URL:</strong> {{ request.url }}
                    <button 
                      @click="hideFullUrl(request.id)" 
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
                    <small v-for="(result, index) in request.search_results.slice(0, 3)" :key="index" class="d-block text-truncate">
                      {{ result }}
                    </small>
                    <small v-if="request.search_results.length > 3" class="text-muted">
                      +{{ request.search_results.length - 3 }} more results
                    </small>
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
export default {
  name: 'RequestsCardList',
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
      expandedUrls: []
    }
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
    }
  }
}
</script>
