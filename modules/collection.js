/**
 * Angular Collection - The Collection module for AngularJS
 */
(function (window, angular, undefined) {'use strict';

var collectionModule = angular.module('collection', [])

    .factory('$collection', ['$filter', function ($filter) {
        var _guid = function() {
            var s4 = function() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            };

            return s4() + s4() + '-' + s4() + '-' + s4() +
                '-' + s4() + '-' + s4() + s4() + s4();
        };

        var _checkValue = function(item, compareFn) {
            return compareFn(item);
        };

        // Helper function to continue chaining intermediate results.
        var _result = function(models) {
            return this._chain ? (new Collection(models)).chain() : models;
        };

        var Collection = function(models, options) {
            options || (options = {});

            if (options.comparator !== void 0) {
                this.comparator = options.comparator;
            }

            this.idAttribute = options.idAttribute || this.idAttribute;

            this._reset();

            this.initialize.apply(this, arguments);
            if (angular.isArray(models) && models.length) {
                this.add(models);
            }
        };

        angular.extend(Collection.prototype, {
            idAttribute: 'id',

            initialize: function() {},

            add: function (models, options) {
                options || (options = {});

                if ( ! angular.isArray(models)) {
                    models = models ? [models] : [];
                }

                var i, l, model, existing, sort;
                sort = (this.comparator && options.sort !== false);

                for (i = 0, l = models.length; i < l; i++) {
                    model = models[i];

                    var id = model[this.idAttribute];
                    if (existing = this.get(id)) {
                        angular.extend(existing, model);
                    }
                    else {
                        // *** Private properties ***
                        model.$$cid = _guid(); // Client id

                        if (model[this.idAttribute] != null) this.hash[model[this.idAttribute]] = model;
                        this.hash[model.$$cid] = model;

                        if (options.at != null) {
                            this.array.splice(options.at, 0, model);

                        } else {
                            this.array.push(model);
                        }

                        this.length += 1;
                    }
                }

                if (sort) this.sort();

                return this;
            },

            sort: function () {
                if (angular.isString(this.comparator)) {
                    this.array = $filter('orderBy')(this.array, this.comparator);
                }

                return this;
            },

            get: function (id) {
                return this.hash[id];
            },

            find: function (expr, value, deepCompare) {
                var _value = this.where(expr, value, deepCompare, true);

                return _result.call(this, _value);
            },

            where: function (expr, value, deepCompare, returnFirst) {
                var results = [];

                var compareFn ;
                if (angular.isFunction(expr)){
                    compareFn = expr;
                }
                else {
                    var compareObj = {};
                    if (typeof expr === 'string'){
                        compareObj[expr] = value;
                    } else {
                        compareObj = expr;
                    }

                    compareFn = function(obj) {
                        for (var key in compareObj) {
                            if (compareObj.hasOwnProperty(key)) {
                                if (compareObj[key] !== obj[key]) return false;
                            }
                        }
                        return true;
                    };
                }

                if ( ! compareFn) {
                    return false;
                }

                //loop over all the items in the array
                for (var i = 0; i < this.array.length; i++) {
                    if (_checkValue(this.array[i], compareFn)) {
                        if (returnFirst) {
                            return this.array[i];
                        } else {
                            results.push(this.array[i]);
                        }
                    }
                }

                var _value =  (returnFirst) ? void 0 : results;

                return _result.call(this, _value);
            },

            update: function (model) {
                var existing = this.get(model[this.idAttribute]) || this.get(model.$$cid);

                if (existing) {
                    angular.extend(existing, model);

                    if (model[this.idAttribute] != null) { // The collection model does not yet have an id, only cid
                        this.hash[model[this.idAttribute]] = existing;
                    }
                }
                else {
                    this.add(model)
                }

                return this;
            },

            remove: function (models) {
                if ( ! angular.isArray(models)) {
                    models = models ? [models] : [];
                }

                var i, l, index, model;
                for (i = 0, l = models.length; i < l; i++) {
                    model = models[i];
                    if ( ! model) continue;

                    index = this.array.indexOf(models[i]);
                    if (index === -1) {
                        continue;
                    }

                    delete this.hash[model.$$cid];
                    delete this.hash[model[this.idAttribute]];
                    this.array.splice(index, 1);
                    this.length--;
                }

                return this;
            },

            removeAll: function () {
                this.hash         = {};
                this.array.length = 0;
                this.length       = 0;
                this.lastResponse = null;

                return this;
            },

            removeWhere: function (expr, value, deepCompare) {
                var objects = this.where(expr, value, deepCompare);
                this.remove(objects);

                return this;
            },

            last: function () {
                return this.array[this.length - 1];
            },

            at: function (index) {
                return this.array[index];
            },

            size: function () {
                return this.array.length;
            },

            all: function () {
                return this.array;
            },

            toJSON: function() {
                var value = this.map(function(model){
                    return angular.copy(model);
                });

                return _result.call(this, value);
            },

            each: function(iterator, context) {
                var nativeForEach = Array.prototype.forEach;

                if (nativeForEach && this.array.forEach === nativeForEach) {
                    this.array.forEach(iterator, context);
                }
                else if (this.array.length === +this.array.length) {
                    for (var i = 0, l = this.array.length; i < l; i++) {
                        iterator.call(context, this.array[i], i, this.array);
                    }
                }
            },

            map: function (iterator, context) {
                var results   = [],
                    nativeMap = Array.prototype.map;

                if (nativeMap && this.array.map === nativeMap) {
                    return this.array.map(iterator, context);
                }
                angular.forEach(this.array, function(value, index, list) {
                    results.push(iterator.call(context, value, index, list));
                });

                return _result.call(this, results);
            },

            filter: function(expression, comparator) {
                var value = $filter('filter')(this.array, expression, comparator);

                return _result.call(this, value);
            },

            pluck: function(key) {
                return this.map(function(value){
                    return value[key];
                });
            },

            indexOf: function(model) {
                var nativeIndexOf = Array.prototype.indexOf;

                var i = 0, l = this.array.length;
                if (nativeIndexOf && this.array.indexOf === nativeIndexOf) {
                    return this.array.indexOf(model);
                }

                for (; i < l; i++) {
                    if (this.array[i] === model) {
                        return i;
                    }
                }
                return -1;
            },

            chain: function() {
                this._chain = true;

                return this;
            },

            clone: function() {
                return new this.constructor(this.array);
            },

            slice: function(begin, end) {
                return this.array.slice(begin, end);
            },

            copy: function(collection) {
                if ( ! collection instanceof Collection) {
                    return;
                }

                this.add(collection.array);
            },

            unshift: function(models, options) {
                this.add(models, angular.extend({at: 0}, options));

                return this;
            },

            _reset: function () {
                this.length = 0;
                this.hash   = {};
                this.array  = [];
            }
        });

        Collection.extend = function (protoProps, staticProps) {
            var parent = this;
            var child;

            if (protoProps && protoProps.hasOwnProperty('constructor')) {
                child = protoProps.constructor;
            } else {
                child = function () {
                    return parent.apply(this, arguments);
                };
            }

            angular.extend(child, parent, staticProps);

            var Surrogate = function () {
                this.constructor = child;
            };
            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate;

            if (protoProps) angular.extend(child.prototype, protoProps);

            child.getInstance = Collection.getInstance;
            child.__super__   = parent.prototype;

            return child;
        };

        Collection.getInstance = function(models, options) {
            return new this(models, options);
        };

        return Collection;
    }]);

    /**
     * Pagination
     * @param params
     * @constructor
     */
    var Pagination = function(params) {
        this.defaultParams = params; // Params defined by the user
        this.params        = {}; // Params received from API (link header)
        this.finished      = false;
        this.total         = 0;
    };

    Pagination.prototype = {
        clear: function() {
            this.params   = {};
            this.finished = false;
            this.total    = 0;
        }
    };

    Pagination.parseLinkHeader = function(linkHeader) {
        var parseUrl = function(url) {
            var splitRegExp = new RegExp(
                '^' +
                '(?:' +
                '([^:/?#.]+)' +                         // scheme - ignore special characters
                // used by other URL parts such as :,
                // ?, /, #, and .
                ':)?' +
                '(?://' +
                '(?:([^/?#]*)@)?' +                     // userInfo
                '([\\w\\d\\-\\u0100-\\uffff.%]*)' +     // domain - restrict to letters,
                // digits, dashes, dots, percent
                // escapes, and unicode characters.
                '(?::([0-9]+))?' +                      // port
                ')?' +
                '([^?#]+)?' +                           // path
                '(?:\\?([^#]*))?' +                     // query
                '(?:#(.*))?' +                          // fragment
                '$');

            var split = url.match(splitRegExp);

            return {
                url:      split[0],
                protocol: split[1],
                auth:     split[2],
                hostname: split[3],
                port:     split[4],
                pathname: split[5],
                query:    split[6],
                hash:     split[7]
            };
        };

        var parseQueryString = function(queryString) {
            var pairs = queryString.split('&'),
                obj = {},
                pair, key, value;

            for (var i = 0, length = pairs.length; i < length; i++) {
                if (pairs[i] === '') {
                    continue;
                }

                pair  = pairs[i].split('=');
                key   = decodeURIComponent(pair[0]);
                value = (pair[1]) ? decodeURIComponent(pair[1]) : '';

                obj[key] = value;
            }

            return obj;
        };

        var parseLink = function(link) {
            // parts:                   (0)                                 (1)
            // <https://api.hometalk.com/posts/1234?page_num=3&limit=10>; rel="next"
            var parts       =  link.split(';'),
                linkUrl     =  parts[0].replace(/[<>]/g, ''),
                parsedUrl   =  parseUrl(linkUrl),
                queryString =  parseQueryString(parsedUrl.query);

            // rel="next" => 1: rel, 2: next
            var match = parts[1].match(/ *(.+) *= *"(.+)"/),
                rel   = match[2];

            return {
                rel: rel,
                data: queryString
            };
        };

        var links = {},
            split = linkHeader.split(',');

        for (var i = 0; i < split.length; i++) {
            var link = parseLink(split[i]);

            if (link && link.rel) {
                links[link.rel] = link.data;
            }
        }

        return links;
    };

    collectionModule.provider('Collection', function() {
        var paginationParams = {};

        this.paginationParams = function(params) {
            paginationParams = params;
        };

        this.$get = ['$collection', '$q', '$injector', function($collection, $q, $injector) {
            function collectionFactory(options) {
                options || (options = {});

                // Decorator
                if (options.decorator) {
                    // Check if the decorator exists
                    if (angular.isString(options.decorator)) {
                        options.decorator = $injector.has(options.decorator) ?
                            $injector.get(options.decorator) : angular.noop;
                    }
                    else {
                        options.decorator = $injector.invoke(options.decorator);
                    }
                }
                else {
                    options.decorator = angular.noop;
                }

                /**
                 * Transform models nested arrays properties into collections
                 * {key: [1,2,3]} ==> {key: Collection([1,2,3]}
                 */
                function transformIntoCollection(model) {
                    for (var key in model) {
                        if (model.hasOwnProperty(key)) {
                            if (options.transform.hasOwnProperty(key) && angular.isArray(model[key])) {
                                var transformOptions = angular.extend({}, options.transform[key]);
                                model[key] = new (collectionFactory(transformOptions))(model[key]);
                            }
                        }
                    }
                }

                /**
                 * Collection
                 * @param models
                 * @constructor
                 */
                var Collection = function(models) {
                    if (options.resource) {
                        this.resource = options['resource'];
                    }

                    var params        = angular.extend({}, options['pagination'] || {}, paginationParams);
                    this.pagination   = new Pagination(params);
                    this.options      = options;
                    this.lastResponse = null;

                    $collection.call(this, models, options);
                };

                Collection.prototype = Object.create($collection.prototype);

                angular.extend(Collection.prototype, {
                    add: function(_models, _options) {
                        if ( ! angular.isArray(_models)) {
                            _models = _models ? [_models] : [];
                        }

                        // Decorate items
                        options.decorator(_models);

                        if (options.transform) {
                            for (var i = 0; i < _models.length; i++) {
                                transformIntoCollection(_models[i]);
                            }

                        }

                        // Add items
                        $collection.prototype.add.call(this, _models, _options);

                        return this;
                    },

                    update: function(model) {
                        $collection.prototype.update.call(this, model);

                        if (options.transform) {
                            var existing = this.get(model[this.idAttribute]);
                            transformIntoCollection(existing);
                        }
                    },

                    $load: function(params, loadOptions) {
                        params      = params      || {};
                        loadOptions = loadOptions || {};

                        if (this.pagination.finished && ! loadOptions.force) {
                            return $q.when(this);
                        }

                        var self        = this,
                            deferred    = $q.defer(),
                            pagination  = angular.extend({}, this.pagination.defaultParams, this.pagination.params);

                        angular.extend(params, pagination);

                        var fn = (options.collectionField) ? 'get' : 'query';

                        this.resource[fn](params, function(data, headers) {
                            // Total results
                            self.pagination.total = headers('X-Total-Count') || data.length;

                            // Link headers
                            if (headers('link')) {
                                var linkHeader = Pagination.parseLinkHeader(headers('link'));

                                self.pagination.finished = (linkHeader.next) ? false : true;

                                angular.extend(self.pagination.params, linkHeader.next || {});
                            }
                            else {
                                self.pagination.finished = true;
                            }

                            if (loadOptions.replace) {
                                self.$clear();
                            }

                            self.add((options.collectionField) ? data[options.collectionField] : data); // Add items to the collection

                            // Save last response
                            if (options.lastResponse) {
                                self.lastResponse = angular.copy(data);
                            }

                            deferred.resolve(self);
                        }, function(error) {
                            deferred.reject(error);
                        });

                        return deferred.promise;
                    },
                    $save: function(model) {
                        var self    = this,
                            fn      = (this.get(model[this.idAttribute])) ? 'update' : 'save',
                            promise = this.resource[fn](model).$promise;

                        if (model.$$cid != null) {
                            promise.then(function(modelData) {
                                self.update(angular.extend({$$cid: model.$$cid}, modelData));
                            });
                        }
                        else {
                            promise.then(function(model) {
                                self.add(model);
                            });
                        }

                        return promise;
                    },
                    $update: function(model) {
                        var self        = this,
                            promise     = this.resource.update(model).$promise;

                        promise.then(function(model) {
                            self.update(model);
                        });

                        return promise;
                    },
                    $remove: function(params) {
                        var self = this,
                            promise;

                        if (params[this.idAttribute] != null) {
                            promise = this.resource.remove(params).$promise;

                            promise.then(function() {
                                var model = self.get(params[self.idAttribute]);
                                self.remove(model);
                            });
                        }
                        else {
                            var model = self.get(params.$$cid);
                            self.remove(model);

                            promise = $q.when(model);
                        }

                        return promise;
                    },
                    $clear: function() {
                        this.removeAll();
                        this.pagination.clear();

                        return this;
                    },
                    $pagination: function(params) {
                        angular.extend(this.pagination.defaultParams, params);

                        return this;
                    }
                });

                Collection.prototype.$get = function(params, getOptions) {
                    getOptions = getOptions || {};

                    var idAttribute = this.idAttribute;

                    if (angular.isUndefined(params[idAttribute])) {
                        throw new Error('Collection [$get]: Missing id attribute.');
                    }

                    var model = this.get(params[idAttribute]);
                    if (angular.isDefined(model) && ! getOptions.force) {
                        return $q.when(model);
                    }

                    var promise = this.resource.get(params).$promise,
                        self    = this;

                    promise.then(function(model) {
                        self.add(model);
                    });

                    return promise;
                };

                Collection.instance = function(models) {
                    return new this(models);
                };

                return Collection;
            }

            return collectionFactory;
        }];
    });
})(window, window.angular);