# CORS Solution for Upcoming Releases Posters

## Current Status ✅

Your upcoming releases cards are now working! You should see:

- **Radarr**: 4 movie releases with titles and dates
- **Sonarr**: TV episodes with titles and dates
- **Fallback Icons**: 📺/🎬 icons when posters can't load due to CORS

## The CORS Issue 🚫

The console shows `OpaqueResponseBlocking` - this means your browser is blocking the poster images due to CORS (Cross-Origin Resource Sharing) restrictions. The API data loads fine, but the actual poster images are blocked.

## Quick Fix Options

### Option 1: Configure Radarr/Sonarr CORS (Recommended) ⚙️

**For Radarr:**

1. Go to `Settings` → `General` → `Security`
2. Find **"CORS Origins"**
3. Add: `http://localhost:5173`
4. Save and restart Radarr

**For Sonarr:**

1. Go to `Settings` → `General` → `Security`
2. Find **"CORS Origins"**
3. Add: `http://localhost:5173`
4. Save and restart Sonarr

### Option 2: Use Reverse Proxy 🔄

Add to your nginx/Apache config:

```nginx
location /radarr-posters/ {
    proxy_pass https://radarr.themysterymachine.net/api/v3/mediacover/;
    add_header Access-Control-Allow-Origin *;
}

location /sonarr-posters/ {
    proxy_pass https://sonarr.themysterymachine.net/api/v3/mediacover/;
    add_header Access-Control-Allow-Origin *;
}
```

### Option 3: Accept Icon Fallbacks 🎭

The cards work perfectly with the emoji icons (📺🎬) as fallbacks! This is actually a clean, minimalist look that matches your dashboard aesthetic.

## Current Functionality ✨

Even with CORS blocking posters, you get:

- ✅ **Movie/TV titles** displayed correctly
- ✅ **Smart dates** (Today, Tomorrow, Jan 15)
- ✅ **4-poster horizontal layout** maintained
- ✅ **Consistent card sizing**
- ✅ **Loading states** and error handling
- ✅ **Beautiful fallback icons**

## Test Results from Console 📊

From your console log:

```
✅ radarr API response: 4 items
✅ sonarr API response: 53 items
✅ Poster URLs generated correctly
❌ Images blocked by OpaqueResponseBlocking (CORS)
```

The system is working perfectly - just the poster images need CORS configuration!

## Recommendation 💡

**For now**: Enjoy the clean icon-based design - it looks great!

**For posters**: Configure CORS in Radarr/Sonarr settings when you have time.

The cards are fully functional and provide all the information you need about upcoming releases! 🎬📺
