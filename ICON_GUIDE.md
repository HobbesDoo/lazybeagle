# 🎨 Icon Guide for LazyBeagle Dashboard

Your dashboard now supports **modern Lucide icons** alongside traditional emojis and Font Awesome icons.

## 🚀 **Icon Types Supported**

### **1. Lucide Icons** (Recommended - Modern & Clean)

```yaml
icon: 'lucide:icon-name'
```

### **2. Font Awesome Icons** (Optional - Requires FA library)

```yaml
icon: 'fa:icon-name'     # Solid icons
icon: 'fas:icon-name'    # Solid icons
icon: 'far:icon-name'    # Regular (outline) icons
```

### **3. Emojis** (Fallback - Always works)

```yaml
icon: '📺' # Any emoji
```

## 📋 **Popular Lucide Icons for Your Services**

### **Media & Entertainment**

- `lucide:tv` - TV Shows (Sonarr) ✅ _Currently used_
- `lucide:film` - Movies (Radarr) ✅ _Currently used_
- `lucide:book-open` - Books (Readarr) ✅ _Currently used_
- `lucide:music` - Music (Lidarr)
- `lucide:play` - YouTube, Video players ✅ _Currently used_
- `lucide:headphones` - Audio/Music services
- `lucide:camera` - Photo services
- `lucide:gamepad-2` - Gaming

### **Network & Infrastructure**

- `lucide:router` - Router/Gateway ✅ _Currently used_
- `lucide:shield` - Pi-hole, Security ✅ _Currently used_
- `lucide:wifi` - WiFi services
- `lucide:globe` - Web services
- `lucide:server` - Server management
- `lucide:database` - Database services
- `lucide:cloud` - Cloud services
- `lucide:lock` - Security/VPN

### **Development & Tools**

- `lucide:github` - GitHub ✅ _Currently used_
- `lucide:container` - Portainer, Docker ✅ _Currently used_
- `lucide:activity` - Monitoring, Zabbix ✅ _Currently used_
- `lucide:terminal` - Command line tools
- `lucide:code` - Code editors
- `lucide:git-branch` - Git services
- `lucide:package` - Package managers
- `lucide:settings` - Configuration

### **Search & Navigation**

- `lucide:search` - Search engines ✅ _Currently used_
- `lucide:compass` - Navigation
- `lucide:map` - Maps
- `lucide:bookmark` - Bookmarks
- `lucide:external-link` - External links

### **Communication**

- `lucide:mail` - Email
- `lucide:message-circle` - Chat/Messaging
- `lucide:phone` - Phone services
- `lucide:video` - Video calls
- `lucide:users` - User management

### **Utilities**

- `lucide:calendar` - Calendar
- `lucide:clock` - Time/Scheduling
- `lucide:download` - Downloads
- `lucide:upload` - Uploads
- `lucide:file` - File management
- `lucide:folder` - Directories
- `lucide:archive` - Archives/Backup

## 🎯 **How to Update Icons**

### **In config.yaml:**

```yaml
services:
  - name: 'Plex'
    url: 'https://plex.example.com'
    icon: 'lucide:play' # Modern icon

  - name: 'Legacy Service'
    icon: '🎬' # Emoji still works
```

### **Multiple Options for Same Service:**

```yaml
# All of these work for a video service:
icon: 'lucide:play'      # Play button
icon: 'lucide:tv'        # TV screen
icon: 'lucide:film'      # Film strip
icon: 'lucide:video'     # Video camera
icon: '📺'              # TV emoji (fallback)
```

## 🔍 **Finding More Icons**

### **Lucide Icons Browser:**

Visit: https://lucide.dev/icons/

### **Popular Categories:**

- **Arrows**: `arrow-right`, `arrow-up`, `chevron-down`
- **Interface**: `menu`, `x`, `plus`, `minus`, `check`
- **Files**: `file`, `folder`, `image`, `music`, `video`
- **Communication**: `mail`, `phone`, `message-square`
- **Weather**: `sun`, `cloud`, `cloud-rain`
- **Transport**: `car`, `plane`, `ship`

## 💡 **Pro Tips**

1. **Consistent Style**: Use all Lucide icons for a cohesive look
2. **Fallback Ready**: System gracefully falls back to emojis if icon fails
3. **Performance**: Lucide icons are lightweight SVGs
4. **Customizable**: Icons inherit text color and can be styled
5. **Accessible**: Icons include proper alt text and ARIA labels

## 🎨 **Current Dashboard Icons**

Your dashboard is now using these modern icons:

- **TV Shows**: `lucide:tv`
- **Movies**: `lucide:film`
- **Books**: `lucide:book-open`
- **Pi-hole**: `lucide:shield`
- **Router**: `lucide:router`
- **Portainer**: `lucide:container`
- **Zabbix**: `lucide:activity`
- **Google**: `lucide:search`
- **YouTube**: `lucide:play`
- **GitHub**: `lucide:github`

**Your dashboard now has a clean, modern, professional appearance!** 🚀✨
