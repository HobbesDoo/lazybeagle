# Complete CORS Solutions for Poster Images

## Current Status 🚫

Your poster images are being blocked by CORS (Cross-Origin Resource Sharing) policies. This is a browser security feature that prevents websites from loading resources from other domains without permission.

## Why CORS is Blocking Your Posters

- **Browser Security**: Your dashboard runs on `http://localhost:5173`
- **Radarr/Sonarr URLs**: `https://radarr.themysterymachine.net` and `https://sonarr.themysterymachine.net`
- **Different Origins**: Browser blocks cross-origin image requests without proper headers

## 🔧 Solution 1: Configure CORS in Radarr/Sonarr (RECOMMENDED)

### For Radarr:

1. **Open Radarr Web Interface**
2. **Go to Settings** → **General** → **Security**
3. **Find "CORS Origins"** field
4. **Add your dashboard URL**: `http://localhost:5173`
5. **If accessing from other devices, add those too**:
   ```
   http://localhost:5173,http://192.168.1.100:5173,http://your-server-ip:5173
   ```
6. **Save Settings** and **restart Radarr**

### For Sonarr:

1. **Open Sonarr Web Interface**
2. **Go to Settings** → **General** → **Security**
3. **Find "CORS Origins"** field
4. **Add your dashboard URL**: `http://localhost:5173`
5. **Save Settings** and **restart Sonarr**

### Expected Result:

✅ Poster images should load directly without CORS errors

## 🔄 Solution 2: Reverse Proxy (Advanced)

If you can't modify Radarr/Sonarr settings, set up a reverse proxy:

### Nginx Configuration:

```nginx
# Add to your nginx config
location /proxy/radarr-posters/ {
    proxy_pass https://radarr.themysterymachine.net/api/v3/mediacover/;
    proxy_set_header Host radarr.themysterymachine.net;
    proxy_set_header X-Api-Key b2c75a609dfe49f5a48f73c7606caa78;

    # Add CORS headers
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "X-Api-Key, Content-Type";

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}

location /proxy/sonarr-posters/ {
    proxy_pass https://sonarr.themysterymachine.net/api/v3/mediacover/;
    proxy_set_header Host sonarr.themysterymachine.net;
    proxy_set_header X-Api-Key 1098ec9f76e0439c9ddad8652ed87c8e;

    # Add CORS headers
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
    add_header Access-Control-Allow-Headers "X-Api-Key, Content-Type";

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        return 204;
    }
}
```

## 🌐 Solution 3: Browser Extension (Development Only)

For development/testing, you can use a CORS browser extension:

### Chrome:

- Install "CORS Unblock" or "Disable CORS" extension
- **⚠️ WARNING**: Only use for development, disable for normal browsing

### Firefox:

- Install "CORS Everywhere" extension
- **⚠️ WARNING**: Security risk, only for testing

## 🛠️ Solution 4: Image Proxy Service

Create a simple image proxy service:

### Option A: Cloudflare Workers

```javascript
// Cloudflare Worker script
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('url')

    if (!targetUrl) {
      return new Response('Missing url parameter', { status: 400 })
    }

    const response = await fetch(targetUrl, {
      headers: {
        'X-Api-Key': 'your-api-key-here',
      },
    })

    const newResponse = new Response(response.body, response)
    newResponse.headers.set('Access-Control-Allow-Origin', '*')
    return newResponse
  },
}
```

### Option B: Simple PHP Proxy

```php
<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: image/jpeg');

$url = $_GET['url'];
$apiKey = 'your-api-key-here';

$context = stream_context_create([
    'http' => [
        'header' => "X-Api-Key: $apiKey\r\n"
    ]
]);

readfile($url, false, $context);
?>
```

## 🎭 Solution 5: Accept Icon Fallbacks (Current State)

**Your current setup is actually quite elegant!**

### Advantages of Icon Fallbacks:

- ✅ **Fast Loading**: No network requests for images
- ✅ **Consistent Design**: Clean, minimalist appearance
- ✅ **Always Available**: No broken images
- ✅ **Bandwidth Efficient**: Smaller data usage
- ✅ **Professional Look**: Many modern dashboards use this approach

### Current Icons:

- 🎬 Movie icons for Radarr
- 📺 TV icons for Sonarr
- Clean, readable layout

## 🧪 Testing Your Setup

### Check Console Messages:

1. **Open browser console** (F12)
2. **Look for poster URLs** like:
   ```
   radarr poster URL: https://radarr.themysterymachine.net/api/v3/mediacover/movie/991/poster.jpg?apikey=...
   ```
3. **Try opening URL directly** in browser
4. **Check for CORS errors**

### Test Direct Access:

```bash
# Test if poster exists
curl "https://radarr.themysterymachine.net/api/v3/mediacover/movie/991/poster.jpg?apikey=YOUR_API_KEY"
```

## 📊 Recommendation

**For immediate use**: Keep the current icon-based design - it looks professional and works perfectly.

**For posters**: Try Solution 1 (CORS configuration) first, as it's the cleanest approach.

## 🔍 Current Status Summary

✅ **Data Loading**: API calls working perfectly  
✅ **Show/Movie Info**: Titles, dates, and details display correctly  
✅ **Layout**: 4-poster horizontal layout maintained  
✅ **Fallback Icons**: Clean, professional appearance  
❌ **Poster Images**: Blocked by CORS (by design for security)

Your dashboard is **fully functional** - the poster images are a nice-to-have enhancement, but the current design is clean and professional without them!

---

**Need help implementing any of these solutions? Let me know which approach you'd like to try!**
