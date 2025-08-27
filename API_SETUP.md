# API Setup Guide

## Adding Your Unsplash API Keys

To enable beautiful background images from Unsplash, you need to add your API keys to the dashboard.

### Step 1: Get Your Unsplash API Keys

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application (if you don't have one)
3. Copy your **Access Key** (required)
4. Copy your **Secret Key** (optional, for advanced features)

### Step 2: Add Keys to Dashboard

1. Open your dashboard at `http://localhost:5173`
2. Click the settings icon (⚙️) in the top-right corner
3. Navigate to the **"API Keys"** tab
4. Paste your **Access Key** in the "Unsplash Access Key" field
5. Optionally, paste your **Secret Key** in the "Unsplash Secret Key" field
6. Click **"Save Changes"**

### Step 3: Configure Background Settings

1. In the **"General"** tab of settings:
   - Choose your preferred background theme
   - Enable/disable auto-rotation
   - Set rotation interval (if enabled)
2. Your backgrounds will now use high-quality images from Unsplash!

## Adding OpenWeatherMap API Key (Optional)

For real weather data instead of demo data:

1. Get an API key from [OpenWeatherMap](https://openweathermap.org/api)
2. In the dashboard settings → **"API Keys"** tab
3. Enter your key in the "OpenWeatherMap API Key" field
4. Set your location in the **"General"** tab

## Configuration File

Your settings are automatically saved to localStorage and can be exported/imported as YAML files:

- **Export**: Settings → Import/Export → Export Config as YAML
- **Import**: Settings → Import/Export → paste YAML → Import Configuration

The main configuration file is located at `/public/config.yaml` and contains all default settings and service definitions.

## Troubleshooting

- **No backgrounds loading**: Check that your Unsplash Access Key is correct
- **Demo weather data**: Add your OpenWeatherMap API key for real weather
- **Settings not saving**: Check browser console for any errors

## Rate Limits

- **Unsplash**: 50 requests/hour for demo apps, 5000/hour for production
- **OpenWeatherMap**: 1000 calls/day on free tier

Your API keys are stored locally and never sent to any third-party servers other than the respective APIs.
