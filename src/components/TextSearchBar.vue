<template>
  <div class="mb-4">
    <div class="input-group">
      <span class="input-group-text">
        <i class="bi bi-search"></i>
      </span>
      <input
        type="text"
        class="form-control"
        :placeholder="placeholder"
        v-model="searchQuery"
        @input="onSearch"
        @keyup.enter="onSearch"
      />
      <button 
        v-if="searchQuery" 
        class="btn btn-outline-secondary" 
        type="button" 
        @click="clearSearch"
        title="Clear search"
      >
        <i class="bi bi-x"></i>
      </button>
    </div>
    <div v-if="searchQuery" class="form-text">
      <small class="text-muted">
        <i class="bi bi-info-circle"></i>
        Search supports regex patterns. {{ filteredCount }} of {{ totalCount }} items match.
      </small>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TextSearchBar',
  props: {
    placeholder: {
      type: String,
      default: 'Search in text field...'
    },
    totalCount: {
      type: Number,
      default: 0
    },
    filteredCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['search', 'clear'],
  data() {
    return {
      searchQuery: ''
    }
  },
  methods: {
    onSearch() {
      this.$emit('search', this.searchQuery)
    },
    clearSearch() {
      this.searchQuery = ''
      this.$emit('clear')
    }
  }
}
</script>
