<template>
  <div class="pill-input-container">
    <div class="pill-input-wrapper" @click="focusInput">
      <div class="pills-container">
        <span 
          v-for="(pill, index) in pills" 
          :key="index" 
          class="badge bg-primary me-1 mb-1 pill"
        >
          {{ pill }}
          <button 
            type="button" 
            class="btn-close btn-close-white ms-1" 
            @click.stop="removePill(index)"
            style="font-size: 0.7em;"
          ></button>
        </span>
        <input
          ref="input"
          type="text"
          class="pill-input"
          v-model="currentInput"
          @keydown="handleKeydown"
          @blur="handleBlur"
          :placeholder="pills.length === 0 ? placeholder : ''"
          :style="{ width: inputWidth + 'px' }"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PillInput',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    },
    placeholder: {
      type: String,
      default: 'Type and press space to add...'
    },
    separator: {
      type: String,
      default: ','
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      currentInput: '',
      inputWidth: 200
    }
  },
  computed: {
    pills() {
      return this.modelValue || []
    }
  },
  watch: {
    currentInput(newValue) {
      this.updateInputWidth()
    }
  },
  methods: {
    focusInput() {
      this.$refs.input.focus()
    },
    updateInputWidth() {
      // Create a temporary element to measure text width
      if (typeof document !== 'undefined') {
        const temp = document.createElement('span')
        temp.style.visibility = 'hidden'
        temp.style.position = 'absolute'
        temp.style.fontSize = '14px' // Match input font size
        temp.textContent = this.currentInput || this.placeholder || ''
        document.body.appendChild(temp)
        this.inputWidth = Math.max(200, temp.offsetWidth + 20)
        document.body.removeChild(temp)
      }
    },
    handleKeydown(event) {
      if (event.key === ' ') {
        event.preventDefault()
        this.addPill()
      } else if (event.key === 'Backspace' && this.currentInput === '' && this.pills.length > 0) {
        // If input is empty and backspace is pressed, remove the last pill
        this.removePill(this.pills.length - 1)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        this.addPill()
      }
    },
    handleBlur() {
      // Add any remaining input as a pill when focus is lost
      if (this.currentInput.trim()) {
        this.addPill()
      }
    },
    addPill() {
      const value = this.currentInput.trim()
      if (value && !this.pills.includes(value)) {
        const newPills = [...this.pills, value]
        this.$emit('update:modelValue', newPills)
        this.currentInput = ''
        this.updateInputWidth()
      }
    },
    removePill(index) {
      const newPills = this.pills.filter((_, i) => i !== index)
      this.$emit('update:modelValue', newPills)
      this.$nextTick(() => {
        this.updateInputWidth()
      })
    }
  },
  mounted() {
    this.updateInputWidth()
  }
}
</script>

<style scoped>
.pill-input-container {
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.375rem 0.75rem;
  min-height: 38px;
  background-color: #fff;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.pill-input-container:focus-within {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.pill-input-wrapper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-height: 24px;
  cursor: text;
}

.pills-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
}

.pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.pill-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  min-width: 100px;
  flex: 1;
}

.pill-input::placeholder {
  color: #6c757d;
  opacity: 1;
}
</style>
