<template>
  <div class="d-flex align-items-center justify-content-center min-vh-100 bg-light">
    <div class="card shadow" style="max-width: 400px; width: 100%;">
      <div class="card-body text-center">
        <h3 class="card-title mb-4">Bug Hunting Record & Analysis</h3>
        <div class="alert alert-info" role="alert">
          <i class="bi bi-info-circle"></i>
          Authentication required. Please use the magic link with your secret to access the application.
        </div>
        <p class="text-muted">
          The application uses session-based authentication via cookies. 
          Access the <code>/start_session</code> endpoint with your secret parameter to authenticate.
        </p>
        <hr>
        <small class="text-muted">
          Example: <code>http://localhost:8081/start_session?secret=your_secret_key</code>
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Unauthenticated'
}
</script>
