<template>
  <div>
    <div v-if="notes.length === 0" class="text-center text-muted py-4">
      <p>No notes yet.</p>
    </div>

    <div v-else class="list-group list-group-flush">
      <div v-for="note in notes" :key="note.id" class="list-group-item px-0">
        <div class="d-flex justify-content-between align-items-start">
          <div class="flex-grow-1">
            <!-- Edit mode -->
            <div v-if="editingNoteId === note.id">
              <form @submit.prevent="saveNote(note)">
                <div class="mb-2">
                  <textarea 
                    v-model="editingValue" 
                    class="form-control" 
                    rows="3"
                    required
                  ></textarea>
                </div>
                <div class="d-flex justify-content-end gap-2">
                  <button type="button" @click="cancelEdit" class="btn btn-sm btn-secondary">Cancel</button>
                  <button type="submit" class="btn btn-sm btn-primary">Save</button>
                </div>
              </form>
            </div>

            <!-- Display mode -->
            <div v-else>
              <p class="mb-1" style="white-space: pre-wrap;">
                <UrlText :text="note.value" />
              </p>
              <div class="d-flex align-items-center gap-3">
                <small class="text-muted">
                  Created {{ formatDate(note.created_at) }}
                </small>
                <small v-if="note.updated_at && note.updated_at !== note.created_at" class="text-muted">
                  • Updated {{ formatDate(note.updated_at) }}
                </small>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div v-if="editingNoteId !== note.id" class="btn-group btn-group-sm ms-3">
            <button @click="startEdit(note)" class="btn btn-outline-secondary btn-sm">Edit</button>
            <router-link v-if="showViewButton" :to="`/notes/${note.id}`" class="btn btn-outline-primary btn-sm">View</router-link>
            <button @click="deleteNote(note)" class="btn btn-outline-danger btn-sm">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatDate } from '../config/api'
import UrlText from './UrlText.vue'

export default {
  name: 'NotesListComponent',
  components: {
    UrlText
  },
  props: {
    notes: {
      type: Array,
      default: () => []
    },
    showViewButton: {
      type: Boolean,
      default: true
    }
  },
  emits: ['note-updated', 'note-deleted'],
  data() {
    return {
      editingNoteId: null,
      editingValue: ''
    }
  },
  methods: {
    formatDate,
    startEdit(note) {
      this.editingNoteId = note.id
      this.editingValue = note.value
    },
    cancelEdit() {
      this.editingNoteId = null
      this.editingValue = ''
    },
    async saveNote(note) {
      try {
        await this.$store.dispatch('updateNote', {
          id: note.id,
          value: this.editingValue
        })
        this.editingNoteId = null
        this.editingValue = ''
        this.$emit('note-updated', note.id)
      } catch (error) {
        console.error('Error updating note:', error)
      }
    },
    async deleteNote(note) {
      if (confirm('Are you sure you want to delete this note?')) {
        try {
          await this.$store.dispatch('deleteNote', note.id)
          this.$emit('note-deleted', note.id)
        } catch (error) {
          console.error('Error deleting note:', error)
        }
      }
    }
  }
}
</script>
