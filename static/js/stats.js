/*
 * Site analytics
 *
 * Replace the two placeholder IDs below before enabling collection. These are
 * public site identifiers, not private credentials. Keeping the integrations
 * here means every page uses the same configuration.
 */
(function () {
    'use strict';

    const GOOGLE_MEASUREMENT_ID = 'G-F66EZSG9P8'; // e.g. G-XXXXXXXXXX
    // const BAIDU_SITE_ID = '';         // e.g. 0123456789abcdef

    // Topic pages are rendered by topic.html, so report the article path
    // instead of grouping every article under /topic.
    function pagePath() {
        const file = new URLSearchParams(window.location.search).get('file');
        if (!file) return window.location.pathname;

        try {
            const decoded = decodeURIComponent(file);
            return decoded.startsWith('/') ? decoded.split(/[?#]/, 1)[0] : window.location.pathname;
        } catch (error) {
            return window.location.pathname;
        }
    }

    const path = pagePath();

    if (GOOGLE_MEASUREMENT_ID) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', GOOGLE_MEASUREMENT_ID, { send_page_view: false });
        window.gtag('event', 'page_view', { page_path: path });

        const googleScript = document.createElement('script');
        googleScript.async = true;
        googleScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GOOGLE_MEASUREMENT_ID);
        document.head.appendChild(googleScript);
    }

    // if (BAIDU_SITE_ID) {
    //     window._hmt = window._hmt || [];
    //     // Disable Baidu's automatic URL page view so the normalized topic path
    //     // below is the only page view recorded.
    //     window._hmt.push(['_setAutoPageview', false]);
    //     window._hmt.push(['_trackPageview', path]);

    //     const baiduScript = document.createElement('script');
    //     baiduScript.async = true;
    //     baiduScript.src = 'https://hm.baidu.com/hm.js?' + encodeURIComponent(BAIDU_SITE_ID);
    //     document.head.appendChild(baiduScript);
    // }
}());
