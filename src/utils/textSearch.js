/**
 * Text search utilities with regex support and highlighting
 */

/**
 * Search for text in a given string using regex
 * @param {string} text - The text to search in
 * @param {string} searchQuery - The search query (supports regex)
 * @returns {boolean} - Whether the text matches the search query
 */
export function searchInText(text, searchQuery) {
  if (!searchQuery || !text) return true
  
  try {
    // Create regex from search query, case insensitive
    const regex = new RegExp(searchQuery, 'i')
    return regex.test(text)
  } catch (error) {
    // If regex is invalid, fall back to simple string search
    return text.toLowerCase().includes(searchQuery.toLowerCase())
  }
}

/**
 * Extract matched text snippets from a given string using regex
 * @param {string} text - The text to search in
 * @param {string} searchQuery - The search query (supports regex)
 * @param {number} maxResults - Maximum number of results to return
 * @param {number} contextLength - Length of context around each match
 * @returns {Array} - Array of matched text snippets
 */
export function extractMatchedSnippets(text, searchQuery, maxResults = 5, contextLength = 50) {
  if (!searchQuery || !text) return []
  
  try {
    const regex = new RegExp(searchQuery, 'gi')
    const matches = []
    let match
    
    while ((match = regex.exec(text)) !== null && matches.length < maxResults) {
      const start = Math.max(0, match.index - contextLength)
      const end = Math.min(text.length, match.index + match[0].length + contextLength)
      
      let snippet = text.substring(start, end)
      
      // Add ellipsis if we're not at the beginning/end
      if (start > 0) snippet = '...' + snippet
      if (end < text.length) snippet = snippet + '...'
      
      matches.push(snippet)
    }
    
    return matches
  } catch (error) {
    // If regex is invalid, fall back to simple string search
    const lowerText = text.toLowerCase()
    const lowerQuery = searchQuery.toLowerCase()
    const matches = []
    let index = 0
    
    while ((index = lowerText.indexOf(lowerQuery, index)) !== -1 && matches.length < maxResults) {
      const start = Math.max(0, index - contextLength)
      const end = Math.min(text.length, index + searchQuery.length + contextLength)
      
      let snippet = text.substring(start, end)
      
      // Add ellipsis if we're not at the beginning/end
      if (start > 0) snippet = '...' + snippet
      if (end < text.length) snippet = snippet + '...'
      
      matches.push(snippet)
      index += searchQuery.length
    }
    
    return matches
  }
}

/**
 * Highlight search terms in text using HTML bold tags
 * @param {string} text - The text to highlight
 * @param {string} searchQuery - The search query to highlight
 * @returns {string} - Text with highlighted search terms
 */
export function highlightSearchTerms(text, searchQuery) {
  if (!searchQuery || !text) return text
  
  try {
    const regex = new RegExp(`(${searchQuery})`, 'gi')
    return text.replace(regex, '<strong>$1</strong>')
  } catch (error) {
    // If regex is invalid, fall back to simple string replacement
    const lowerText = text.toLowerCase()
    const lowerQuery = searchQuery.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)
    
    if (index === -1) return text
    
    const before = text.substring(0, index)
    const match = text.substring(index, index + searchQuery.length)
    const after = text.substring(index + searchQuery.length)
    
    return before + '<strong>' + match + '</strong>' + after
  }
}

/**
 * Filter an array of items based on text search
 * @param {Array} items - Array of items to filter
 * @param {string} searchQuery - The search query
 * @param {string} textField - The field name containing the text to search
 * @returns {Array} - Filtered array with search results added
 */
export function filterItemsByTextSearch(items, searchQuery, textField = 'text') {
  if (!searchQuery) {
    return items.map(item => ({ ...item, search_results: [] }))
  }
  
  return items
    .filter(item => searchInText(item[textField], searchQuery))
    .map(item => ({
      ...item,
      search_results: extractMatchedSnippets(item[textField], searchQuery)
    }))
}
