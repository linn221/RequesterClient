<template>
  <span v-html="formattedText"></span>
</template>

<script>
export default {
  name: 'UrlText',
  props: {
    text: {
      type: String,
      required: true
    }
  },
  computed: {
    formattedText() {
      if (!this.text) return ''
      
      // URL regex pattern
      const urlRegex = /(https?:\/\/[^\s]+)/g
      
      return this.text.replace(urlRegex, (url) => {
        // Ensure URL is properly encoded
        const encodedUrl = encodeURI(url)
        return `<a href="${encodedUrl}" target="_blank" rel="noopener noreferrer" class="text-decoration-none">${url}</a>`
      })
    }
  }
}
</script>

<style scoped>
/* Ensure links are styled properly */
:deep(a) {
  color: #0d6efd;
  text-decoration: underline;
}

:deep(a:hover) {
  color: #0a58ca;
  text-decoration: underline;
}
</style>
