// API configuration
export const API_BASE_URL = 'http://localhost:8081'

// API helper functions
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    credentials: 'include', // Include cookies for session management
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  const config = { ...defaultOptions, ...options }
  
  try {
    const response = await fetch(url, config)
    
    // Handle different response types
    const contentType = response.headers.get('content-type')
    
    let data
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (jsonError) {
        data = await response.text()
      }
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      // Include status code in error message for better debugging
      const errorMessage = data || `HTTP error! status: ${response.status}`
      const error = new Error(errorMessage)
      error.status = response.status
      error.response = response
      throw error
    }

    return { data, status: response.status }
  } catch (error) {
    // Handle network errors
    if (!error.status) {
      error.message = `Network error: ${error.message}`
    }
    throw error
  }
}

// Format date helper
export const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'long',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}
