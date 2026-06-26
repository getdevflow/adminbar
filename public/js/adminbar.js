(function ($) {
    'use strict';

    function adminUrl(path)
    {
        return (window.DevflowAdminBar.adminUrl || '/admin/') + path;
    }

    function renderNotifications(notifications)
    {
        var $list = $('#adminbar-content-notification-list');
        var $count = $('#adminbar-content-notification-count');

        $list.empty();

        if (!notifications || !notifications.length) {
            $count.text('0').hide();

            $list.append(
                '<li class="adminbar-empty">No notifications.</li>'
            );

            return;
        }

        $count.text(notifications.length).show();

        $.each(notifications, function (_, item) {
            var html =
                '<li>' +
                '<a href="' + item.url + '" data-notification-id="' + item.notification_id + '" class="adminbar-notification-link">' +
                '<strong>' + escapeHtml(item.title || '') + '</strong>' +
                '<br>' +
                '<small>' + escapeHtml(item.body || '') + '</small>' +
                '</a>' +
                '</li>';

            $list.append(html);
        });
    }

    function loadNotifications()
    {
        $.ajax({
            url: adminUrl('content-notifications/unread/'),
            method: 'GET',
            dataType: 'json'
        }).done(function (response) {
            if (response.success) {
                renderNotifications(response.notifications || []);
            }
        });
    }

    function markRead(notificationId)
    {
        $.ajax({
            url: adminUrl('content-notifications/read/'),
            method: 'POST',
            dataType: 'json',
            data: {
                notification_id: notificationId
            }
        });
    }

    function escapeHtml(text)
    {
        return $('<div>').text(text || '').html();
    }

    $(document).on(
        'click',
        '.adminbar-notification-link',
        function () {
            var notificationId = $(this).data('notification-id');

            if (notificationId) {
                markRead(notificationId);
            }
        }
    );

    $(function () {
        loadNotifications();

        setInterval(loadNotifications, 60000);
    });

})(jQuery);
