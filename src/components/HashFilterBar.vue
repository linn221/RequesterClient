<template>
  <div v-if="displayedHashes.length > 0" class="hash-filter-bar mb-3">
    <div class="d-flex flex-wrap gap-2 align-items-center">
      <span class="text-muted small me-2">Filter by hash:</span>
      <div 
        v-for="hashInfo in displayedHashes" 
        :key="hashInfo.hash"
        class="hash-pill d-flex align-items-center"
        :style="{ backgroundColor: hashInfo.color, color: 'white' }"
        :title="`${hashInfo.hash} (${hashInfo.count} occurrences)`"
      >
        <span 
          class="hash-text hash-clickable"
          @click="scrollToHash(hashInfo.hash)"
          :title="`Scroll to ${hashInfo.displayText}`"
        >
          {{ hashInfo.displayText }}
        </span>
        <button 
          class="hash-remove-btn"
          @click.stop="removeHash(hashInfo.hash)"
          :title="`Remove ${hashInfo.displayText} from view`"
        >
          ×
        </button>
      </div>
      <button 
        v-if="displayedHashes.length > 0"
        @click="clearAllFilters"
        class="btn btn-sm btn-outline-secondary"
        title="Clear all hash filters"
      >
        Clear All
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HashFilterBar',
  props: {
    requests: {
      type: Array,
      default: () => []
    },
    visibleHashes: {
      type: Array,
      default: () => []
    },
    hashManager: {
      type: Object,
      required: true
    }
  },
  emits: ['hash-removed', 'scroll-to-hash', 'clear-filters'],
  data() {
    return {
      removedHashes: []
    }
  },
  computed: {
    rankedHashes() {
      return this.hashManager ? this.hashManager.getRankedHashes() : []
    },
    displayedHashes() {
      return this.rankedHashes.filter(hashInfo => 
        !this.removedHashes.includes(hashInfo.hash)
      )
    }
  },
  watch: {
    requests: {
      handler() {
        // Reset removed hashes when requests change
        this.removedHashes = []
      },
      deep: true
    }
  },
  beforeUnmount() {
    // Reset removed hashes when component is destroyed
    this.removedHashes = []
  },
  methods: {
    removeHash(hash) {
      // Add to removed hashes to hide from display
      if (!this.removedHashes.includes(hash)) {
        this.removedHashes.push(hash)
      }
      // Also emit the event for parent component
      this.$emit('hash-removed', hash)
    },
    scrollToHash(hash) {
      this.$emit('scroll-to-hash', hash)
    },
    clearAllFilters() {
      // Clear removed hashes to show all hashes again
      this.removedHashes = []
      this.$emit('clear-filters')
    }
  }
}
</script>

<style scoped>
.hash-filter-bar {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.hash-pill {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.hash-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hash-text {
  margin-right: 0.25rem;
}

.hash-remove-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1;
  padding: 0;
  margin-left: 0.25rem;
  cursor: pointer;
  width: 1.2rem;
  height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.hash-remove-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.hash-remove-btn:focus {
  outline: none;
  background-color: rgba(255, 255, 255, 0.3);
}

.hash-clickable {
  cursor: pointer;
  flex-grow: 1;
}

.hash-clickable:hover {
  text-decoration: underline;
}

</style>

