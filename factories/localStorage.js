angular.module('HT').factory('LocalStorage', function($window) {
    var NAMESPACE = 'key:';

    function prepareKey(key) {
        return NAMESPACE + key;
    }

    return {
        'set': function(key, value) {
            key = prepareKey(key);

            if (angular.isObject(value) || angular.isArray(value)) {
                value = angular.toJson(value);
            }

            $window.localStorage.setItem(key, value);

            return this;
        },

        'get': function(key) {
            key = prepareKey(key);

            var item = $window.localStorage.getItem(key);

            try {
                item = angular.fromJson(item);
            } catch (e) {}

            return item;
        },

        remove: function(key) {
            key = prepareKey(key);

            $window.localStorage.removeItem(key);
        },

        removeAll: function() {
            angular.forEach($window.localStorage, function(value, key) {
                if (key.indexOf(NAMESPACE) !== -1) {
                    $window.localStorage.removeItem(key);
                }
            });
        }
    };
});