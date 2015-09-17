angular.module('HT').factory('Device', function($window, Cookies, UserAgent) {
    var is = {};

    var Device = {
        name: null,
        type: null,
        screenSize: null,
        version: '',
        orientation: null,

        is: function(name) {
            return (is[name] === true);
        },

        set: function(attrs) {
            for (var key in attrs) {
                if (Device.hasOwnProperty(key)) {
                    Device[key] = attrs[key];
                }
            }
        },

        versionAtLeast: function (version) {
            version = version.split('.');

            var deviceVersion = Device.version.split('.');

            for (var i = 0, l = version.length; i < l; i++) {
                var majorDevice = parseInt(deviceVersion[i], 10),
                    major       = parseInt(version[i], 10);

                if (isNaN(majorDevice) || majorDevice < major) {
                    return false;
                }
            }

            return true;
        },

        getOriginalScreenSize: function() {
            if (Device.screenSize) {
                 return Device.screenSize;
            }
            else if (UserAgent.is('android') && UserAgent.is('mobile')) {
                Device.screenSize = 'small';
            }
            else if ($window.innerWidth >= 640 && $window.innerHeight >= 640) {
                Device.screenSize = 'large';
            }
            else if ($window.innerWidth > 468 && $window.innerHeight > 320) {
                Device.screenSize = 'medium';
            }
            else {
                Device.screenSize = 'small';
            }

            return Device.screenSize;
        },

        detectOrientation: function() {
            var isLandscape;

            if ('orientation' in $window) {
                isLandscape = Math.abs($window.orientation) == 90;
            }
            else {
                isLandscape = $window.innerHeight < $window.innerWidth;
            }

            Device.setOrientation(isLandscape);
        },

        setOrientation: function(isLandscape) {
            Device.orientation = (isLandscape) ? 'landscape' : 'portrait';
        },

        getOrientation: function() {
            if (! Device.orientation) {
                Device.detectOrientation();
            }

            return Device.orientation;
        },

        isNarrow: function(){
            return (Device.screenSize == 'small' && $window.innerWidth <= 320 && Device.type == 'Phone');
        }
    };

    checkDevice();

    return Device;

    //////////////////////////////////////////////

    function checkDevice() {
        var userAgent = ($window.navigator || {}).userAgent || '';

        var android    = userAgent.match(/(Android)\s+([\d.]+)/),
            iphone     = userAgent.match(/(iPhone).*OS\s([\d_]+)/),
            ipod       = userAgent.match(/(iPod).*OS\s([\d_]+)/),
            ipad       = userAgent.match(/(iPad).*OS\s([\d_]+)/),
            blackberry = userAgent.match(/(BlackBerry|RIM|BB10).*Version\/([\d.]+)/),
            kindle     = (userAgent.match(/(Silk)/) || userAgent.match(/(Kindle)/));

        if (android) {
            setFlag('Android');

            Device.version = android[2];
            Device.name = 'Android';
        }
        if (iphone) {
            setFlag(['iOS', 'iPhone']);

            Device.version = iphone[2].replace(/_/g, ".");
            Device.name = 'iPhone';
        }
        if (ipod) {
            setFlag(['iOS', 'iPod']);

            Device.version = ipod[2].replace(/_/g, ".");
            Device.name = 'iPod';
        }
        if (ipad) {
            setFlag(['iOS', 'iPad']);

            Device.version = ipad[2].replace(/_/g, ".");
            Device.name = 'iPad';
        }
        if (blackberry) {
            setFlag('BlackBerry');

            Device.version = blackberry[2];
            Device.name = 'BlackBerry';
        }
        if (kindle) {
            setFlag('kindle');

            Device.name = 'kindle';
        }

        if (! Device.name) {
            Device.name    = (userAgent.match(/Windows|Linux|Macintosh/) || ['Other'])[0];
            Device.version = '';

            setFlag(Device.name);
        }

        if (! Device.is('Android') && ! Device.is('iOS') && /*! Device.is('WindowsPhone') &&*/ /Windows|Linux|Macintosh/.test(Device.name)) {
            Device.type = 'Desktop';
        }
        else if (userAgent.search(/tablet/i) !== -1 || Device.is('iPad') || Device.is('kindle') || (Device.is('Android') && (userAgent.search(/mobile/i) === -1) && Device.versionAtLeast('4.0'))) {
            Device.type = 'Tablet';
        }
        else if (Device.is('Other')) {
            Device.type = 'Other';
        }
        else {
            Device.type = 'Phone';

        }

        setFlag(Device.type);
    }

    function setFlag(name) {
        name = angular.isArray(name) ? name : [name];

        for (var i = 0, l = name.length; i < l; i++) {
            is[name[i]] = true;
            is[name[i].toLowerCase()] = true;
        }
    }
});