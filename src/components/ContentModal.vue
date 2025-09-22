<template>
  <div 
    v-if="show" 
    class="modal fade show d-block" 
    tabindex="-1" 
    role="dialog"
    @click.self="close"
  >
    <div class="modal-dialog modal-xl" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="close"></button>
        </div>
        <div class="modal-body p-0">
          <div class="d-flex flex-column" style="height: 70vh;">
            <!-- Search Bar -->
            <div class="p-3 border-bottom">
              <div class="input-group mb-2">
                <span class="input-group-text">
                  🔍
                </span>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="searchTerm"
                  placeholder="Search in content (supports regex)..."
                />
                <button 
                  class="btn btn-outline-secondary" 
                  type="button" 
                  @click="previousMatch"
                  :disabled="searchResults.length === 0"
                  title="Previous match"
                >
                  ↑
                </button>
                <button 
                  class="btn btn-outline-secondary" 
                  type="button" 
                  @click="nextMatch"
                  :disabled="searchResults.length === 0"
                  title="Next match"
                >
                  ↓
                </button>
                <button 
                  class="btn btn-outline-secondary" 
                  type="button" 
                  @click="clearSearch"
                  v-if="searchTerm"
                  title="Clear search"
                >
                  ✕
                </button>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div v-if="searchTerm">
                  <small class="text-muted" v-if="searchResults.length > 0">
                    {{ currentSearchIndex + 1 }} of {{ searchResults.length }} matches
                  </small>
                  <small class="text-muted" v-else-if="searchTerm">
                    No matches found
                  </small>
                  <small class="text-danger" v-if="regexError">
                    Invalid regex: {{ regexError }}
                  </small>
                </div>
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    id="wordWrapToggle"
                    v-model="wordWrap"
                  >
                  <label class="form-check-label" for="wordWrapToggle">
                    <small>Word wrap</small>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Content Area -->
            <div class="flex-grow-1" style="overflow: auto; height: 100%;">
              <pre 
                ref="contentRef"
                class="p-3 mb-0" 
                :class="languageClass"
                v-html="highlightedContent"
                :style="wordWrap ? 'white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; margin: 0;' : 'white-space: pre; word-wrap: normal; overflow-wrap: normal; min-width: max-content; margin: 0;'"
              ></pre>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="close">Close</button>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Backdrop -->
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script>
import Prism from 'prismjs'
import 'prismjs/themes/prism.css'
import 'prismjs/components/prism-json.js'
import 'prismjs/components/prism-javascript.js'
import 'prismjs/components/prism-xml-doc.js'

export default {
  name: 'ContentModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Content'
    },
    content: {
      type: [String, Object],
      default: ''
    },
    language: {
      type: String,
      default: 'json'
    }
  },
  emits: ['close'],
  data() {
    return {
      searchTerm: '',
      searchResults: [],
      currentSearchIndex: 0,
      regexError: null,
      wordWrap: false
    }
  },
  computed: {
    languageClass() {
      return `language-${this.language}`
    },
    formattedContent() {
      if (typeof this.content === 'object') {
        return JSON.stringify(this.content, null, 2)
      }
      if (typeof this.content === 'string') {
        try {
          // Try to parse and pretty-print JSON
          return JSON.stringify(JSON.parse(this.content), null, 2)
        } catch {
          return this.content
        }
      }
      return String(this.content)
    },
    highlightedContent() {
      if (!this.formattedContent) return ''
      
      let content = this.formattedContent
      
      // Apply syntax highlighting
      if (this.language === 'json') {
        content = Prism.highlight(content, Prism.languages.json, 'json')
      } else if (this.language === 'javascript') {
        content = Prism.highlight(content, Prism.languages.javascript, 'javascript')
      } else if (this.language === 'xml') {
        content = Prism.highlight(content, Prism.languages.xml, 'xml')
      }
      
      // Apply search highlighting
      if (this.searchTerm) {
        const regex = new RegExp(`(${this.escapeRegExp(this.searchTerm)})`, 'gi')
        content = content.replace(regex, '<mark>$1</mark>')
      }
      
      return content
    }
  },
  watch: {
    show(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.searchResults = []
          this.currentSearchIndex = 0
          this.searchTerm = ''
          this.regexError = null
          // Reset scroll position to top
          this.resetScrollPosition()
          // Add keyboard event listeners
          if (typeof document !== 'undefined') {
            document.addEventListener('keydown', this.handleKeydown)
          }
        })
      } else {
        // Remove keyboard event listeners
        if (typeof document !== 'undefined') {
          document.removeEventListener('keydown', this.handleKeydown)
        }
      }
    },
    searchTerm(newVal) {
      if (newVal && newVal.length > 0) {
        this.searchContent()
      } else {
        this.searchResults = []
        this.currentSearchIndex = 0
        this.regexError = null
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    searchContent() {
      if (!this.searchTerm) {
        this.searchResults = []
        this.currentSearchIndex = 0
        this.regexError = null
        return
      }
      
      const content = this.formattedContent
      this.searchResults = []
      this.regexError = null
      
      try {
        // Try to create regex from the search term
        let regex
        try {
          // First try as literal regex (if it starts and ends with /)
          if (this.searchTerm.startsWith('/') && this.searchTerm.lastIndexOf('/') > 0) {
            const lastSlashIndex = this.searchTerm.lastIndexOf('/')
            const pattern = this.searchTerm.slice(1, lastSlashIndex)
            const flags = this.searchTerm.slice(lastSlashIndex + 1) || 'gi'
            regex = new RegExp(pattern, flags)
          } else {
            // Try as regex pattern directly
            regex = new RegExp(this.searchTerm, 'gi')
          }
        } catch (regexError) {
          // If regex fails, fall back to literal string search
          regex = new RegExp(this.escapeRegExp(this.searchTerm), 'gi')
        }
        
        let match
        while ((match = regex.exec(content)) !== null) {
          this.searchResults.push({
            index: match.index,
            text: match[0]
          })
        }
        
        if (this.searchResults.length > 0) {
          this.currentSearchIndex = 0
          this.scrollToMatch()
        }
      } catch (error) {
        this.regexError = error.message
        this.searchResults = []
        this.currentSearchIndex = 0
      }
    },
    nextMatch() {
      if (this.searchResults.length === 0) return
      
      this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length
      this.scrollToMatch()
    },
    previousMatch() {
      if (this.searchResults.length === 0) return
      
      this.currentSearchIndex = this.currentSearchIndex === 0 
        ? this.searchResults.length - 1 
        : this.currentSearchIndex - 1
      this.scrollToMatch()
    },
    clearSearch() {
      this.searchTerm = ''
      this.searchResults = []
      this.currentSearchIndex = 0
      this.regexError = null
    },
    scrollToMatch() {
      if (this.searchResults.length === 0) return
      
      const contentElement = this.$refs.contentRef
      const scrollContainer = contentElement?.parentElement
      
      if (contentElement && scrollContainer) {
        // Find the highlighted match element
        const highlightedElements = contentElement.querySelectorAll('mark')
        if (highlightedElements.length > this.currentSearchIndex) {
          const targetElement = highlightedElements[this.currentSearchIndex]
          
          // Use scrollIntoView for better compatibility
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          })
        }
      }
    },
    escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    },
    resetScrollPosition() {
      const contentElement = this.$refs.contentRef
      const scrollContainer = contentElement?.parentElement
      if (scrollContainer) {
        scrollContainer.scrollTop = 0
        scrollContainer.scrollLeft = 0
      }
    },
    handleKeydown(event) {
      // Only handle keyboard shortcuts when modal is open and search has results
      if (!this.show || this.searchResults.length === 0) return
      
      switch (event.key) {
        case 'F3':
        case 'Enter':
          event.preventDefault()
          this.nextMatch()
          break
        case 'F2':
        case 'Shift+Enter':
          if (event.shiftKey) {
            event.preventDefault()
            this.previousMatch()
          }
          break
        case 'Escape':
          event.preventDefault()
          this.clearSearch()
          break
      }
    }
  },
  beforeUnmount() {
    // Clean up event listeners
    if (typeof document !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeydown)
    }
  }
}
</script>

<style scoped>
.modal-backdrop {
  z-index: 1040;
}

.modal {
  z-index: 1050;
}

pre {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  padding: 1rem;
}

/* Ensure proper scrolling behavior */
.flex-grow-1 {
  overflow: auto !important;
  -webkit-overflow-scrolling: touch;
  position: relative;
  scrollbar-width: thick;
  scrollbar-color: #6c757d #e9ecef;
}

/* Fix scrollbar positioning - make it bigger and more visible */
.flex-grow-1::-webkit-scrollbar {
  width: 16px;
  height: 16px;
}

.flex-grow-1::-webkit-scrollbar-track {
  background: #e9ecef;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.flex-grow-1::-webkit-scrollbar-thumb {
  background: #6c757d;
  border-radius: 8px;
  border: 2px solid #e9ecef;
  min-height: 40px;
}

.flex-grow-1::-webkit-scrollbar-thumb:hover {
  background: #495057;
  border-color: #dee2e6;
}

.flex-grow-1::-webkit-scrollbar-thumb:active {
  background: #343a40;
}

.flex-grow-1::-webkit-scrollbar-corner {
  background: #e9ecef;
}

mark {
  background-color: #fff3cd;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}
</style>
