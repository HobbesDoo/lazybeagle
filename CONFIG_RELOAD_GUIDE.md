# Configuration Reload Guide

## Problem: Changes to config.yaml Not Appearing

When you modify the `public/config.yaml` file directly, the changes won't appear in the dashboard because the app prioritizes localStorage over the YAML file.

## Solutions

### Option 1: Use the Settings Panel (Recommended)

1. **Open Settings**: Click the gear icon (⚙️) in your dashboard
2. **Go to Import/Export Tab**: Click the "Import/Export" tab
3. **Click "Reload from config.yaml"**: This will force reload from the YAML file
4. **Confirm**: You'll see a success message when the reload is complete

### Option 2: Clear Browser Storage

1. **Open Browser DevTools**: Press F12
2. **Go to Application Tab**: (Chrome) or Storage Tab (Firefox)
3. **Find Local Storage**: Look for your localhost:5173 entry
4. **Delete**: Remove the `lazybeagle-config` key
5. **Refresh Page**: The app will now load from config.yaml

### Option 3: Console Command (Advanced)

1. **Open Browser Console**: Press F12 → Console tab
2. **Run Command**:
   ```javascript
   // Clear localStorage and reload
   localStorage.removeItem('lazybeagle-config')
   location.reload()
   ```

## How It Works

The configuration system works in this priority order:

1. **localStorage** (user modifications via settings panel)
2. **config.yaml** (default configuration file)
3. **Built-in defaults** (fallback if both fail)

This means:

- ✅ Settings panel changes are saved to localStorage
- ✅ Direct YAML edits need to be "reloaded" to override localStorage
- ✅ You can always export your current config as YAML for backup

## Best Practices

### For Development:

- Edit `config.yaml` directly and use "Reload from config.yaml" button
- Or clear localStorage frequently during development

### For Production:

- Use the settings panel for most changes
- Export configurations for backup/sharing
- Import configurations to apply bulk changes

## Troubleshooting

**Changes still not appearing?**

1. Check browser console for errors
2. Verify YAML syntax is valid
3. Make sure the file is saved
4. Try a hard refresh (Ctrl+F5 or Cmd+Shift+R)

**Settings panel not working?**

1. Check if there are JavaScript errors in console
2. Try clearing all localStorage: `localStorage.clear()`
3. Refresh the page

## File Locations

- **Config File**: `/public/config.yaml`
- **localStorage Key**: `lazybeagle-config`
- **Settings Panel**: Gear icon → Import/Export tab
