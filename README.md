
# Admin Bar

Adds a backend admin bar to a Devflow site.

> __Requires__ Devflow Version: 3.x

> __Tested Up To:__ 3.0.0

> __Requires PHP:__ 8.4+

> __Stable Tag:__ 4.0.0

> __License:__ GPLv2-only

## Features
- Adds admin bar to top of site.
- Hides the toolbar and its assets in the Vihzhuo editor so canvas drop zones remain accessible.
- Loads Font Awesome 6.6 on the frontend for signed-in users, so icons work independently of the theme.
- Management Tab (site, plugins, users, content)
- Flush Cache
- Action hooks and filters.

## Localization
Portuguese, Chines (Simplified), German, English, Spanish, French, Italian Japanese, and Russian

## Codex Installation
1. Start a new shell session.
2. In the root of your install, run the following command ```php codex plugin:install getdevflow/adminbar```.

## Changelog

### 4.0.0
- Updated for Devflow v3
- added `csrf_field()` to POST forms

### 3.1.0
- Fix to work on frontend

### 3.0.3
- Remove old option screens
- Add new settings screen

### 3.0.2
- Mobile ready
- editorial workflow notifications

### 3.0.1
- Fixed info links

### 3.0.0
- Updated for Devflow v2

### 2.0.0
- Api change for enqueue functions

### 1.0.1
- Removed old textdomain function
- Updated locales
- 
### 1.0.0
- Initial addition
