// Utility for generating consistent colors for hashes
export class HashColorManager {
  constructor() {
    this.hashColors = new Map()
    this.hashOccurrences = new Map()
    this.hashRanks = new Map()
    this.colorPalette = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
      '#A9DFBF', '#F9E79F', '#D5DBDB', '#AED6F1', '#A3E4D7'
    ]
    this.colorIndex = 0
  }

  // Count hash occurrences across all requests and assign ranks
  countHashOccurrences(requests) {
    this.hashOccurrences.clear()
    this.hashRanks.clear()
    
    // Count occurrences
    requests.forEach(request => {
      const hashes = [
        request.req_hash,
        request.response_hash, 
        request.response_body_hash
      ].filter(hash => hash)
      
      hashes.forEach(hash => {
        this.hashOccurrences.set(hash, (this.hashOccurrences.get(hash) || 0) + 1)
      })
    })
    
    // Sort by occurrence count and assign ranks
    const sortedHashes = Array.from(this.hashOccurrences.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
    
    sortedHashes.forEach(([hash, count], index) => {
      this.hashRanks.set(hash, index + 1) // Rank starts from 1
    })
  }

  getColorForHash(hash) {
    if (!hash) return null
    
    if (this.hashColors.has(hash)) {
      return this.hashColors.get(hash)
    }
    
    // Check if hash has only one occurrence
    const count = this.hashOccurrences.get(hash) || 0
    if (count === 1) {
      // Use gray for single occurrence hashes
      this.hashColors.set(hash, '#6c757d')
      return '#6c757d'
    }
    
    const color = this.colorPalette[this.colorIndex % this.colorPalette.length]
    this.hashColors.set(hash, color)
    this.colorIndex++
    return color
  }

  getHashDisplayText(hash) {
    if (!hash) return ''
    
    const shortHash = hash.substring(0, 6)
    const rank = this.hashRanks.get(hash)
    
    if (rank && rank > 1) {
      return `${shortHash}|${rank}`
    }
    
    return shortHash
  }

  shouldShowHash(hash) {
    return hash && this.hashOccurrences.get(hash) > 0
  }

  // Get all hashes sorted by rank (highest to lowest)
  getRankedHashes() {
    return Array.from(this.hashRanks.entries())
      .sort((a, b) => a[1] - b[1]) // Sort by rank ascending (1, 2, 3...)
      .map(([hash, rank]) => ({
        hash,
        rank,
        count: this.hashOccurrences.get(hash),
        displayText: this.getHashDisplayText(hash),
        color: this.getColorForHash(hash)
      }))
  }

  // Filter requests by visible hashes
  filterRequestsByVisibleHashes(requests, visibleHashes) {
    if (!visibleHashes || visibleHashes.length === 0) {
      return requests
    }
    
    return requests.filter(request => {
      const requestHashes = [
        request.req_hash,
        request.response_hash,
        request.response_body_hash
      ].filter(hash => hash)
      
      return requestHashes.some(hash => visibleHashes.includes(hash))
    })
  }

  reset() {
    this.hashColors.clear()
    this.hashOccurrences.clear()
    this.hashRanks.clear()
    this.colorIndex = 0
  }
}

// Global instance
export const hashColorManager = new HashColorManager()
