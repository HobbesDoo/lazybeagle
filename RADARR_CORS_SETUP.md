# Radarr CORS Configuration Guide

If your Radarr upcoming releases card is not showing data, it's likely due to CORS (Cross-Origin Resource Sharing) restrictions.

## Quick Debug Steps

1. **Test the API directly**: Open `test-radarr.html` in your browser and click "Test API"
2. **Check browser console**: Press F12 and look for CORS errors
3. **Refresh your dashboard** and check the console for detailed error messages

## Fix CORS Issues

### Option 1: Configure Radarr CORS (Recommended)

1. **Open Radarr Settings**:
   - Go to `Settings` → `General`
   - Scroll to the "Security" section

2. **Add CORS Origins**:
   - Find the "CORS Origins" field
   - Add your dashboard URL: `http://localhost:5173`
   - If accessing from other devices, add those URLs too
   - Example: `http://localhost:5173,http://192.168.1.100:5173`

3. **Save and Restart**:
   - Click "Save"
   - Restart Radarr service

### Option 2: Reverse Proxy (Advanced)

If you can't modify Radarr settings, set up a reverse proxy:

```nginx
location /api/radarr/ {
    proxy_pass https://radarr.themysterymachine.net/;
    proxy_set_header Host $host;
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "X-Api-Key, Content-Type";
}
```

### Option 3: Browser Extension (Development Only)

For development, you can use a CORS browser extension, but this is **not recommended for production**.

## Common Error Messages

- **`CORS error`**: Radarr needs CORS configuration
- **`Authentication failed`**: Check your API key
- **`API endpoint not found`**: Check Radarr URL and version
- **`Network error`**: Check if Radarr is accessible

## Verify Configuration

After configuring CORS:

1. **Refresh your dashboard**
2. **Check browser console** for API call logs
3. **Look for poster URLs** in the console output
4. **Verify data**: Should see "radarr API response: X items"

## Troubleshooting

### Still not working?

1. **Check Radarr logs** for any errors
2. **Verify API key** is correct and has proper permissions
3. **Test API manually** using curl or Postman
4. **Check network connectivity** between dashboard and Radarr

### Console Debugging

Look for these console messages:

```
Making API call to: https://radarr.themysterymachine.net/api/v3/calendar...
radarr API response: 4 items
radarr item: The Naked Gun poster: https://...
```

If you see these messages, the API is working and posters should load!

---

**Need help?** Check the browser console (F12) for detailed error messages and API call logs.
