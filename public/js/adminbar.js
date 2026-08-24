(function (window, document) {
    'use strict';

    var root = document.getElementById('cms_adminbar');

    if (!root || root.dataset.initialized === 'true') {
        return;
    }

    root.dataset.initialized = 'true';

    var adminBaseUrl = root.dataset.adminUrl || '/admin/';
    var body = document.body;
    var context = root.dataset.context === 'backend' ? 'backend' : 'frontend';
    var placement = root.dataset.placement === 'fallback' ? 'fallback' : 'native';
    var notificationList = root.querySelector('#adminbar-content-notification-list');
    var notificationCount = root.querySelector('#adminbar-content-notification-count');

    window.DevflowAdminBar = window.DevflowAdminBar || {};
    window.DevflowAdminBar.adminUrl = adminBaseUrl;

    if (body) {
        var originalPaddingTop = parseFloat(window.getComputedStyle(body).paddingTop) || 0;
        body.style.setProperty('--cms-adminbar-original-padding-top', originalPaddingTop + 'px');
        body.classList.add(
            'has-cms-adminbar',
            'cms-adminbar-context-' + context,
            'cms-adminbar-placement-' + placement
        );
    }

    function updateToolbarHeight() {
        var height = Math.ceil(root.getBoundingClientRect().height);

        if (height > 0) {
            document.documentElement.style.setProperty('--cms-adminbar-height', height + 'px');
        }
    }

    function closeDropdown(dropdown) {
        var toggle = dropdown.firstElementChild;

        dropdown.classList.remove('is-open');
        if (toggle && toggle.classList.contains('cms-toolbar-toggle')) {
            toggle.setAttribute('aria-expanded', 'false');
        }
    }

    function closeAllDropdowns(except) {
        root.querySelectorAll('.cms-toolbar-dropdown.is-open').forEach(function (dropdown) {
            if (dropdown !== except) {
                closeDropdown(dropdown);
            }
        });
    }

    root.querySelectorAll('.cms-toolbar-dropdown > .cms-toolbar-toggle').forEach(function (toggle) {
        toggle.addEventListener('click', function () {
            var dropdown = toggle.parentElement;
            var willOpen = !dropdown.classList.contains('is-open');

            closeAllDropdowns(dropdown);
            dropdown.classList.toggle('is-open', willOpen);
            toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
        });
    });

    document.addEventListener('click', function (event) {
        if (!root.contains(event.target)) {
            closeAllDropdowns();
        }
    });

    root.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeAllDropdowns();
            if (event.target && typeof event.target.blur === 'function') {
                event.target.blur();
            }
        }
    });

    function adminUrl(path) {
        return adminBaseUrl.replace(/\/?$/, '/') + String(path).replace(/^\/+/, '');
    }

    function safeNotificationUrl(value) {
        try {
            var url = new URL(String(value || ''), document.baseURI);
            return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '#';
        } catch (error) {
            return '#';
        }
    }

    function renderNotifications(notifications) {
        notificationList.replaceChildren();

        if (!Array.isArray(notifications) || notifications.length === 0) {
            notificationCount.textContent = '0';
            notificationCount.hidden = true;

            var empty = document.createElement('li');
            empty.className = 'adminbar-empty';
            empty.textContent = 'No workflow notifications.';
            notificationList.appendChild(empty);
            return;
        }

        notificationCount.textContent = String(notifications.length);
        notificationCount.hidden = false;

        notifications.forEach(function (item) {
            var listItem = document.createElement('li');
            var link = document.createElement('a');
            var title = document.createElement('strong');
            var bodyText = document.createElement('small');

            link.className = 'adminbar-notification-link';
            link.href = safeNotificationUrl(item.url);
            link.dataset.notificationId = String(item.notification_id || '');
            title.textContent = String(item.title || '');
            bodyText.textContent = String(item.body || '');

            link.append(title, document.createElement('br'), bodyText);
            listItem.appendChild(link);
            notificationList.appendChild(listItem);
        });
    }

    function loadNotifications() {
        if (!notificationList || !notificationCount || typeof window.fetch !== 'function') {
            return;
        }

        window.fetch(adminUrl('content-notifications/unread/'), {
            credentials: 'same-origin',
            headers: {'X-Requested-With': 'XMLHttpRequest'}
        }).then(function (response) {
            if (!response.ok) {
                throw new Error('Unable to load workflow notifications.');
            }
            return response.json();
        }).then(function (response) {
            if (response && response.success) {
                renderNotifications(response.notifications || []);
            }
        }).catch(function () {
            // A notification failure must never affect the host theme.
        });
    }

    function markRead(notificationId) {
        if (!notificationId || typeof window.fetch !== 'function') {
            return;
        }

        var data = new URLSearchParams();
        data.set('notification_id', notificationId);

        window.fetch(adminUrl('content-notifications/read/'), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: data.toString()
        }).catch(function () {
            // Navigation should continue even if marking the item fails.
        });
    }

    root.addEventListener('click', function (event) {
        var link = event.target.closest('.adminbar-notification-link');

        if (link && root.contains(link)) {
            markRead(link.dataset.notificationId);
        }
    });

    updateToolbarHeight();
    window.addEventListener('resize', updateToolbarHeight, {passive: true});

    if (notificationList && notificationCount) {
        loadNotifications();
        window.setInterval(loadNotifications, 60000);
    }
})(window, document);
