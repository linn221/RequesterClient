<template>
  <div class="autocomplete-container position-relative">
    <input
      ref="input"
      type="text"
      class="form-control"
      :placeholder="placeholder"
      v-model="searchTerm"
      @input="onInput"
      @keydown="onKeydown"
      @focus="onFocus"
      @blur="onBlur"
      autocomplete="off"
    >
    
    <!-- Suggestions dropdown -->
    <div 
      v-if="showSuggestions && filteredOptions.length > 0"
      class="autocomplete-suggestions position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm"
      style="z-index: 1000; max-height: 200px; overflow-y: auto;"
    >
      <div
        v-for="(option, index) in filteredOptions"
        :key="getOptionValue(option)"
        class="autocomplete-option px-3 py-2 cursor-pointer"
        :class="{ 'bg-primary text-white': index === selectedIndex }"
        @mousedown="selectOption(option)"
        @mouseenter="selectedIndex = index"
      >
        <div class="fw-bold">{{ getOptionLabel(option) }}</div>
        <small v-if="getOptionSubtext(option)" class="text-muted">
          {{ getOptionSubtext(option) }}
        </small>
      </div>
    </div>
    
    <!-- No results message -->
    <div 
      v-if="showSuggestions && filteredOptions.length === 0 && searchTerm.length > 0"
      class="autocomplete-suggestions position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm"
      style="z-index: 1000;"
    >
      <div class="px-3 py-2 text-muted">
        No results found
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AutocompleteInput',
  props: {
    options: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: [String, Number, Object],
      default: ''
    },
    placeholder: {
      type: String,
      default: 'Search...'
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    valueKey: {
      type: String,
      default: 'value'
    },
    subtextKey: {
      type: String,
      default: null
    },
    filterFunction: {
      type: Function,
      default: null
    },
    minChars: {
      type: Number,
      default: 0
    }
  },
  emits: ['update:modelValue', 'select'],
  data() {
    return {
      searchTerm: '',
      showSuggestions: false,
      selectedIndex: -1,
      blurTimeout: null
    }
  },
  computed: {
    filteredOptions() {
      if (this.searchTerm.length < this.minChars) return []
      
      if (this.filterFunction) {
        return this.filterFunction(this.options, this.searchTerm)
      }
      
      if (!this.searchTerm) return this.options.slice(0, 10) // Limit to 10 items
      
      const term = this.searchTerm.toLowerCase()
      return this.options.filter(option => {
        const label = this.getOptionLabel(option).toLowerCase()
        const subtext = this.getOptionSubtext(option)?.toLowerCase() || ''
        return label.includes(term) || subtext.includes(term)
      }).slice(0, 10) // Limit to 10 items
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        if (typeof newValue === 'object' && newValue) {
          this.searchTerm = this.getOptionLabel(newValue)
        } else if (typeof newValue === 'string') {
          this.searchTerm = newValue
        } else {
          this.searchTerm = ''
        }
      }
    }
  },
  methods: {
    getOptionLabel(option) {
      if (typeof option === 'string') return option
      if (typeof option === 'object' && option) {
        return option[this.labelKey] || option.toString()
      }
      return option?.toString() || ''
    },
    getOptionValue(option) {
      if (typeof option === 'string') return option
      if (typeof option === 'object' && option) {
        return option[this.valueKey] || option[this.labelKey] || option
      }
      return option
    },
    getOptionSubtext(option) {
      if (!this.subtextKey || typeof option !== 'object') return null
      return option[this.subtextKey] || null
    },
    onInput() {
      this.showSuggestions = true
      this.selectedIndex = -1
      this.$emit('update:modelValue', this.searchTerm)
    },
    onFocus() {
      this.showSuggestions = true
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout)
        this.blurTimeout = null
      }
    },
    onBlur() {
      // Delay hiding suggestions to allow for click events
      this.blurTimeout = setTimeout(() => {
        this.showSuggestions = false
        this.selectedIndex = -1
      }, 150)
    },
    onKeydown(event) {
      if (!this.showSuggestions || this.filteredOptions.length === 0) return
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          this.selectedIndex = Math.min(
            this.selectedIndex + 1, 
            this.filteredOptions.length - 1
          )
          break
        case 'ArrowUp':
          event.preventDefault()
          this.selectedIndex = Math.max(this.selectedIndex - 1, -1)
          break
        case 'Enter':
          event.preventDefault()
          if (this.selectedIndex >= 0) {
            this.selectOption(this.filteredOptions[this.selectedIndex])
          }
          break
        case 'Escape':
          this.showSuggestions = false
          this.selectedIndex = -1
          this.$refs.input.blur()
          break
      }
    },
    selectOption(option) {
      this.searchTerm = this.getOptionLabel(option)
      this.showSuggestions = false
      this.selectedIndex = -1
      this.$emit('update:modelValue', this.getOptionValue(option))
      this.$emit('select', option)
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout)
        this.blurTimeout = null
      }
    },
    focus() {
      this.$refs.input.focus()
    },
    clear() {
      this.searchTerm = ''
      this.showSuggestions = false
      this.selectedIndex = -1
      this.$emit('update:modelValue', '')
    }
  }
}
</script>

<style scoped>
.autocomplete-container {
  position: relative;
}

.autocomplete-suggestions {
  border-top: none !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
}

.autocomplete-option {
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
}

.autocomplete-option:hover {
  background-color: var(--bs-light) !important;
  color: var(--bs-dark) !important;
}

.autocomplete-option.bg-primary:hover {
  background-color: var(--bs-primary) !important;
  color: white !important;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
