angular.module('resource').factory('Resource', function($resource, Config) {
    return function(url, paramDefaults, actions) {
        var DEFAULT_ACTIONS = {
            'get':    {method: 'GET', url: url},
            'save':   {method: 'POST', url: url},
            'update': {method: 'PUT', url: url},
            'query':  {method: 'GET', isArray: true, url: url},
            'remove': {method: 'DELETE', url: url},
            'delete': {method: 'DELETE', url: url},
            'head':   {method: 'HEAD', url: url}
        };

        actions = angular.extend({}, DEFAULT_ACTIONS, actions);

        angular.forEach(actions, function(action, name) {
            // Transform URL
            if ('url' in action) {
                action.url = Config.API_URL + action.url;
            }
        });

        var Resource = $resource(Config.API_URL + url, paramDefaults, actions);

        // Prototype
        angular.extend(Resource.prototype, {
            '$set': function(attrs) {
                for (var key in attrs) {
                    if (key[0] !== '$') {
                        this[key] = attrs[key];
                    }
                }

                return this;
            },
            '$clear': function() {
                for (var key in this) {
                    if (key[0] === '$') {
                        continue;
                    }

                    this[key] = void 0;
                }
            }
        });

        return Resource;
    };
});

