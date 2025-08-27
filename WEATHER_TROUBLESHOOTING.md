# Weather Troubleshooting Guide

## Issue: "Weather unavailable" Error

If you're seeing "Weather unavailable" in your dashboard, here are the steps to fix it:

### Step 1: Verify Your OpenWeatherMap API Key

1. **Get a Free API Key**:
   - Go to [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Go to your [API Keys page](https://home.openweathermap.org/api_keys)
   - Copy your API key

2. **Add API Key to Dashboard**:
   - Click the settings icon (⚙️) in your dashboard
   - Go to the **"API Keys"** tab
   - Paste your key in the "OpenWeatherMap API Key" field
   - Click **"Save Changes"**

### Step 2: Check Your Location Setting

1. **Set Correct Location**:
   - In settings → **"General"** tab
   - Update the "Weather Location" field
   - Use city names like: `"New York"`, `"London"`, `"Tokyo"`
   - Or use "City, Country" format: `"Paris, FR"`

### Step 3: Verify API Key Activation

- **New API keys** can take up to 10 minutes to activate
- Try refreshing the page after a few minutes
- Check the browser console (F12) for specific error messages

### Step 4: Common Location Formats

✅ **These work well**:

- `New York`
- `London, UK`
- `Tokyo, JP`
- `Los Angeles, CA, US`
- `Sydney, AU`

❌ **These might not work**:

- Misspelled city names
- Very small towns (use nearest major city)
- Special characters or accents

### Step 5: Test Your API Key

You can test your API key directly by visiting this URL (replace `YOUR_API_KEY` and `CITY_NAME`):

```
https://api.openweathermap.org/data/2.5/weather?q=CITY_NAME&appid=YOUR_API_KEY&units=metric
```

### Step 6: Check Browser Console

1. Open browser developer tools (F12)
2. Go to the **Console** tab
3. Look for weather-related error messages
4. Common errors:
   - `401 Unauthorized` → Invalid API key
   - `404 Not Found` → City name not found
   - `429 Too Many Requests` → Rate limit exceeded

### Step 7: Rate Limits

**Free OpenWeatherMap accounts have limits**:

- 1,000 API calls per day
- 60 calls per minute

If you exceed these, you'll see errors until the next reset period.

### Demo Mode

If you don't have an API key, the weather card will show demo data with:

- Temperature: 18°C
- Condition: "Partly cloudy"
- Location: Your configured city name

## Still Having Issues?

1. **Clear browser cache** and reload
2. **Check your internet connection**
3. **Try a different city name**
4. **Wait 10-15 minutes** for new API keys to activate
5. **Check the browser console** for specific error messages

The weather component will automatically retry when you update your API key or location in the settings!
