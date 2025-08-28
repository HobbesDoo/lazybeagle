# Upcoming Releases Setup Guide

This guide explains how to set up the upcoming releases cards for Sonarr and Radarr in your LazyBeagle dashboard.

## Features

✨ **New Upcoming Releases Cards:**

- **📺 Upcoming TV Shows** - Shows upcoming episodes from Sonarr
- **🎥 Upcoming Movies** - Shows upcoming movie releases from Radarr
- **Smart Date Formatting** - "Today", "Tomorrow", "In 3 days", or "Jan 15"
- **Movie Posters** - Visual poster display with fallback icons
- **Configurable** - Adjust number of releases, card size, and refresh interval

## Requirements

- **Sonarr** v3+ running with API access
- **Radarr** v3+ running with API access
- Valid API keys for both services

## Setup Instructions

### 1. Get Your API Keys

#### Sonarr API Key:

1. Open your Sonarr web interface
2. Go to **Settings** → **General**
3. Copy the **API Key** from the Security section

#### Radarr API Key:

1. Open your Radarr web interface
2. Go to **Settings** → **General**
3. Copy the **API Key** from the Security section

### 2. Update Your Configuration

Edit `public/config.yaml` and update the services section:

```yaml
services:
  - name: 'TV Shows'
    url: 'https://your-sonarr-url.com' # Your Sonarr URL
    description: 'TV Shows'
    icon: '📺'
    category: 'download'
    api_key: 'your_actual_sonarr_api_key_here' # Paste your Sonarr API key
    enabled: true
    grid_width: 1
    grid_height: 1
    position: 'auto'

  - name: 'Movies'
    url: 'https://your-radarr-url.com' # Your Radarr URL
    description: 'Movies'
    icon: '🎥'
    category: 'download'
    api_key: 'your_actual_radarr_api_key_here' # Paste your Radarr API key
    enabled: true
    grid_width: 1
    grid_height: 1
    position: 'auto'
```

### 3. Configure Upcoming Releases Cards

The upcoming releases cards are configured in the `layout` section:

```yaml
layout:
  upcoming_releases:
    enabled: true
    position: 'releases'
    cards:
      - service_type: 'sonarr'
        title: 'Upcoming TV'
        grid_width: 2 # Width in grid cells
        grid_height: 3 # Height in grid cells
        max_releases: 6 # Number of releases to show
        refresh_interval: 30 # Refresh every 30 minutes
        enabled: true

      - service_type: 'radarr'
        title: 'Upcoming Movies'
        grid_width: 2
        grid_height: 3
        max_releases: 6
        refresh_interval: 30
        enabled: true
```

## Customization Options

### Card Settings:

- **`grid_width`**: Card width (1-4 grid cells)
- **`grid_height`**: Card height (1-4 grid cells)
- **`max_releases`**: Maximum releases to display (1-12)
- **`refresh_interval`**: Minutes between API calls (5-120)

### Date Display:

- **Today's releases**: "Today"
- **Tomorrow's releases**: "Tomorrow"
- **This week**: "In 3 days"
- **Further out**: "Jan 15", "Mar 22"

## Troubleshooting

### "API key not configured"

- Ensure your API key is correctly set in `config.yaml`
- Check that there are no extra spaces or quotes around the key

### "Service not configured"

- Verify the service URL is correct and accessible
- Ensure the service name matches exactly ("TV Shows" for Sonarr, "Movies" for Radarr)

### "No upcoming releases"

- Check if your Sonarr/Radarr has monitored content
- Verify the services are accessible from your dashboard

### CORS Issues

- Some Sonarr/Radarr setups may require CORS configuration
- Add your dashboard domain to the allowed origins in Sonarr/Radarr settings

## API Endpoints Used

- **Sonarr**: `GET /api/v3/calendar?start={date}&end={date}&unmonitored=false`
- **Radarr**: `GET /api/v3/calendar?start={date}&end={date}&unmonitored=false`

## Security Notes

- API keys are stored in your local configuration
- No API keys are transmitted to external services
- All API calls are made directly from your browser to your services

---

**Need help?** Check your browser console (F12) for detailed error messages.
