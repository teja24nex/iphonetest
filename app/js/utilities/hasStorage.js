/**
 * This tests if the localStorage is available or not.
 * Alternatively, you can check how modernizr does it:
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/storage/localstorage.js
 *
 * If you check just (typeof window.Storage != "undefined"),
 * it will not detect if the user is allowing localStorage or not.
 *
 * If you check (typeof window.localStorage != "undefined"),
 * it will throw a SecurityException if the user has disallowed localStorage.
 */
/* jshint ignore:start */
var hasStorage = (function() {
    try {
        var ls = window.localStorage,
            t1 = "--storage-test--",
            t2 = null;
        ls.setItem(t1, t1);
        t2 = ls.getItem(t1);
        ls.removeItem(t1);
        return (t1 === t2);
    } catch (exception) {
        return false;
    }
}());
/* jshint ignore:end */