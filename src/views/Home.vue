<template>
  <div>
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">Bug Hunting Record & Analysis</h1>
        <p class="lead">Welcome to your bug hunting dashboard. Manage your programs, endpoints, requests, and analysis data.</p>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-collection text-primary"></i>
              Requests
            </h5>
            <p class="card-text">View and analyze HTTP requests with advanced filtering capabilities.</p>
            <router-link to="/requests" class="btn btn-primary">View Requests</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-folder text-success"></i>
              Programs
            </h5>
            <p class="card-text">Manage bug hunting programs and their associated data.</p>
            <router-link to="/programs" class="btn btn-success">Manage Programs</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-link text-info"></i>
              Endpoints
            </h5>
            <p class="card-text">Track and organize API endpoints for testing and analysis.</p>
            <router-link to="/endpoints" class="btn btn-info">View Endpoints</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-sticky text-warning"></i>
              Notes
            </h5>
            <p class="card-text">Keep track of your findings and observations.</p>
            <router-link to="/notes" class="btn btn-warning">View Notes</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-upload text-secondary"></i>
              Import HAR
            </h5>
            <p class="card-text">Import HTTP Archive (HAR) files to analyze request data.</p>
            <router-link to="/import-har" class="btn btn-secondary">Import HAR</router-link>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">
              <i class="bi bi-gear text-dark"></i>
              Jobs
            </h5>
            <p class="card-text">Monitor import jobs and their progress.</p>
            <router-link to="/jobs" class="btn btn-dark">View Jobs</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <div class="card bg-light">
          <div class="card-body">
            <h6 class="card-title">Quick Actions</h6>
            <div class="d-flex flex-wrap gap-2">
              <router-link to="/programs/create" class="btn btn-outline-success btn-sm">Create Program</router-link>
              <router-link to="/endpoints/create" class="btn btn-outline-info btn-sm">Create Endpoint</router-link>
              <router-link to="/import-har" class="btn btn-outline-secondary btn-sm">Import HAR File</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>
