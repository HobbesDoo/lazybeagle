# Home Network Dashboard Components

This directory contains the Vue components for the home network landing page dashboard.

## Core Components

### GridContainer.vue

The main grid container that manages the layout of all cards. Features:

- Responsive CSS Grid layout that fills the entire viewport
- Configurable columns, rows, gap, and padding
- No scrolling - everything fits on one screen
- Responsive breakpoints for different screen sizes

### BaseCard.vue

The foundational card component that serves as a container for widgets. Features:

- Grid sizing support (specify width and height in grid units)
- Multiple variants (default, primary, secondary, success, warning, danger)
- Clickable state with hover effects
- Loading state with spinner
- Flexible slot-based content structure (header, content, footer)
- Dark mode support

### WebLinkCard.vue

A specialized card for displaying clickable web links to services. Features:

- Service name, description, and URL display
- Icon support (emoji or image URL)
- Status indicators (online, offline, unknown)
- Click handling with new tab option
- Extends BaseCard functionality

## Services

### api.js

Generic API service layer for making REST API calls to various home network services:

- Generic ApiClient class for HTTP requests
- Factory methods for common services (Sonarr, Radarr, Readarr, Lidarr)
- Support for API keys and custom headers
- Error handling and response parsing

## Usage Examples

### Basic Card

```vue
<BaseCard title="Service Status" :grid-width="2" :grid-height="1" variant="success">
  <p>All systems operational</p>
</BaseCard>
```

### Web Link Card

```vue
<WebLinkCard
  service-name="Plex"
  url="http://192.168.1.100:32400"
  description="Media Server"
  icon="🎬"
  :grid-width="1"
  :grid-height="1"
  variant="primary"
  :show-status="true"
  status="online"
/>
```

### API Service Usage

```javascript
import { ApiService } from '@/services/api'

// Create a Sonarr client
const sonarr = ApiService.createSonarrClient('http://192.168.1.100:8989', 'your-api-key')

// Get series data
const series = await sonarr.get('/series')
```

## Grid Layout

The dashboard uses a 6x4 grid by default (6 columns, 4 rows) that scales responsively:

- Desktop: 6 columns
- Tablet: 4 columns
- Mobile: 2 columns
- Small mobile: 1 column

Cards can span multiple grid cells by setting `grid-width` and `grid-height` props.
