<template>
  <div id="app">
    <!-- Navigation -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary" v-if="isAuthenticated">
      <div class="container">
        <router-link class="navbar-brand" to="/">Bug Hunting Record & Analysis</router-link>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/requests">Requests</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/programs">Programs</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/endpoints">Endpoints</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/notes">Notes</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/jobs">Jobs</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/import-har">Import HAR</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/import-burp-xml">Import Burp XML</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Loading indicator -->
    <div v-if="isLoading" class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="background-color: rgba(0,0,0,0.1); z-index: 9999;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error alert -->
    <div v-if="error" class="container mt-3">
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        {{ error }}
        <button type="button" class="btn-close" @click="clearError"></button>
      </div>
    </div>

    <!-- Main content -->
    <div class="container mt-4" v-if="isAuthenticated">
      <router-view />
    </div>
    
    <!-- Unauthenticated view -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapGetters(['isAuthenticated', 'isLoading', 'error'])
  },
  methods: {
    clearError() {
      this.$store.commit('CLEAR_ERROR')
    }
  }
}
</script>

<style>
/* Custom styles */
.router-link-active {
  font-weight: bold;
}

.btn-primary {
  margin-left: 0.5rem;
}

.table th {
  background-color: #f8f9fa;
  border-top: none;
  font-weight: 600;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.025);
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  font-weight: 600;
}

.text-muted {
  font-size: 0.875rem;
}

.badge {
  font-size: 0.75rem;
  font-weight: 500;
}

pre {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  border: 1px solid #dee2e6;
  max-height: 400px;
  overflow-y: auto;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.list-group-item {
  border-left: none;
  border-right: none;
}

.list-group-item:first-child {
  border-top: none;
}

.list-group-item:last-child {
  border-bottom: none;
}

.progress {
  background-color: #e9ecef;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}

.alert {
  border: none;
  border-radius: 0.5rem;
}

.navbar-brand {
  font-weight: 600;
}

.nav-link {
  font-weight: 500;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .btn-group {
    flex-direction: column;
  }
  
  .btn-group .btn {
    margin-bottom: 0.25rem;
  }
  
  .table-responsive {
    font-size: 0.875rem;
  }
}

/* Loading overlay improvements */
.position-fixed.top-0.start-0 {
  backdrop-filter: blur(2px);
}

/* Custom scrollbar for pre elements */
pre::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

pre::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

pre::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
