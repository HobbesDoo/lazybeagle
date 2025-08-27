/**
 * Background Service for Unsplash Integration
 *
 * Provides functionality to fetch beautiful background images from Unsplash
 * based on different themes and manage background rotation.
 */

/**
 * Background themes with their corresponding Unsplash search terms
 */
export const BACKGROUND_THEMES = {
  nature: {
    id: 'nature',
    name: 'Nature',
    keywords: ['nature', 'forest', 'mountains', 'landscape', 'trees', 'wilderness'],
    collections: ['1114848', '1065976'], // Nature collections
  },
  urban: {
    id: 'urban',
    name: 'Urban',
    keywords: ['city', 'urban', 'architecture', 'buildings', 'skyline', 'street'],
    collections: ['1114849', '1065396'], // Urban collections
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    keywords: ['minimal', 'clean', 'simple', 'abstract', 'geometric', 'modern'],
    collections: ['1114847', '1065392'], // Minimal collections
  },
  space: {
    id: 'space',
    name: 'Space',
    keywords: ['space', 'galaxy', 'stars', 'nebula', 'cosmos', 'astronomy'],
    collections: ['1114850', '1065397'], // Space collections
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    keywords: ['ocean', 'sea', 'water', 'waves', 'beach', 'coastal'],
    collections: ['1114851', '1065398'], // Ocean collections
  },
  mountains: {
    id: 'mountains',
    name: 'Mountains',
    keywords: ['mountains', 'peaks', 'alpine', 'snow', 'hiking', 'summit'],
    collections: ['1114852', '1065399'], // Mountain collections
  },
}

/**
 * Background service class for managing Unsplash backgrounds
 */
export class BackgroundService {
  constructor(configService = null) {
    this.configService = configService
    this.baseUrl = 'https://api.unsplash.com'
    this.cache = new Map()
    this.currentBackground = null
    this.rotationInterval = null
  }

  /**
   * Get the current API key from config service
   */
  getApiKey() {
    if (this.configService) {
      return this.configService.getApiKey('unsplash', 'access_key')
    }
    return 'demo_key' // Fallback for demo
  }

  /**
   * Get a random background image for a specific theme
   * @param {string} themeId - Theme identifier
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Background image data
   */
  async getBackgroundForTheme(themeId, options = {}) {
    const theme = BACKGROUND_THEMES[themeId]
    if (!theme) {
      throw new Error(`Unknown theme: ${themeId}`)
    }

    const { width = 1920, height = 1080, quality = 80, useCollection = true } = options

    try {
      let imageData

      if (useCollection && theme.collections.length > 0) {
        // Try to get image from curated collections first
        imageData = await this.getFromCollection(theme.collections, { width, height, quality })
      }

      if (!imageData) {
        // Fallback to search
        const randomKeyword = theme.keywords[Math.floor(Math.random() * theme.keywords.length)]
        imageData = await this.searchImages(randomKeyword, { width, height, quality })
      }

      if (!imageData) {
        // Ultimate fallback to a default image
        imageData = this.getDefaultBackground(themeId, { width, height })
      }

      return imageData
    } catch (error) {
      console.error('Failed to fetch background:', error)
      return this.getDefaultBackground(themeId, { width, height })
    }
  }

  /**
   * Get image from Unsplash collections
   * @private
   */
  async getFromCollection(collections, { width, height, quality }) {
    const randomCollection = collections[Math.floor(Math.random() * collections.length)]
    const apiKey = this.getApiKey()

    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${randomCollection}/photos?per_page=30`,
        {
          headers: {
            Authorization: `Client-ID ${apiKey}`,
          },
        },
      )

      if (!response.ok) throw new Error('Collection fetch failed')

      const photos = await response.json()
      if (photos.length === 0) return null

      const randomPhoto = photos[Math.floor(Math.random() * photos.length)]
      return this.formatImageData(randomPhoto, { width, height, quality })
    } catch (error) {
      console.warn('Collection fetch failed:', error)
      return null
    }
  }

  /**
   * Search for images by keyword
   * @private
   */
  async searchImages(keyword, { width, height, quality }) {
    const apiKey = this.getApiKey()

    try {
      const response = await fetch(
        `${this.baseUrl}/search/photos?query=${encodeURIComponent(keyword)}&per_page=30&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${apiKey}`,
          },
        },
      )

      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      if (data.results.length === 0) return null

      const randomPhoto = data.results[Math.floor(Math.random() * data.results.length)]
      return this.formatImageData(randomPhoto, { width, height, quality })
    } catch (error) {
      console.warn('Image search failed:', error)
      return null
    }
  }

  /**
   * Format image data from Unsplash API response
   * @private
   */
  formatImageData(photo, { width, height, quality }) {
    const baseUrl = photo.urls.raw
    const imageUrl = `${baseUrl}&w=${width}&h=${height}&fit=crop&crop=entropy&q=${quality}&fm=jpg`

    return {
      id: photo.id,
      url: imageUrl,
      downloadUrl: photo.links.download_location,
      photographer: {
        name: photo.user.name,
        username: photo.user.username,
        profile: photo.user.links.html,
      },
      description: photo.alt_description || photo.description,
      color: photo.color,
      blurHash: photo.blur_hash,
      width: photo.width,
      height: photo.height,
    }
  }

  /**
   * Get a default background image for fallback
   * @private
   */
  getDefaultBackground(themeId, { width, height }) {
    const defaultImages = {
      nature: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=${width}&h=${height}&fit=crop&crop=entropy&q=80&fm=jpg`,
      urban: `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=${width}&h=${height}&fit=crop&crop=entropy&q=80&fm=jpg`,
      minimal: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=${width}&h=${height}&fit=crop&crop=entropy&q=80&fm=jpg`,
      space: `https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=${width}&h=${height}&fit=crop&crop=entropy&q=80&fm=jpg`,
      ocean: `https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=${width}&h=${height}&fit=crop&crop=entropy&q=80&fm=jpg`,
      mountains: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=${width}&h=${height}&fit=crop&crop=entropy&q=80&fm=jpg`,
    }

    return {
      id: `default-${themeId}`,
      url: defaultImages[themeId] || defaultImages.nature,
      photographer: {
        name: 'Unsplash',
        username: 'unsplash',
        profile: 'https://unsplash.com',
      },
      description: `Default ${themeId} background`,
      color: '#4A5568',
    }
  }

  /**
   * Start automatic background rotation
   * @param {string} themeId - Theme to rotate backgrounds for
   * @param {number} intervalMinutes - Rotation interval in minutes
   * @param {Function} callback - Callback function to call with new background
   */
  startRotation(themeId, intervalMinutes = 30, callback) {
    this.stopRotation()

    const rotateBackground = async () => {
      try {
        const background = await this.getBackgroundForTheme(themeId)
        this.currentBackground = background
        if (callback) callback(background)
      } catch (error) {
        console.error('Background rotation failed:', error)
      }
    }

    // Set initial background
    rotateBackground()

    // Set up interval for rotation
    if (intervalMinutes > 0) {
      this.rotationInterval = setInterval(rotateBackground, intervalMinutes * 60 * 1000)
    }
  }

  /**
   * Stop automatic background rotation
   */
  stopRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval)
      this.rotationInterval = null
    }
  }

  /**
   * Get cached background or fetch new one
   */
  async getCachedBackground(themeId, maxAge = 10 * 60 * 1000) {
    // 10 minutes default
    const cached = this.cache.get(themeId)

    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data
    }

    const background = await this.getBackgroundForTheme(themeId)
    this.cache.set(themeId, {
      data: background,
      timestamp: Date.now(),
    })

    return background
  }

  /**
   * Preload background images for better performance
   */
  preloadBackground(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = imageUrl
    })
  }

  /**
   * Get current background
   */
  getCurrentBackground() {
    return this.currentBackground
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }
}

// Default export
export default BackgroundService
