'use strict'

const {validate} = require('./validate');

function findRoute(routes, path, middleware = [], params = [], callback, urlNamePrefix = 'url:') {
    const [current, ...rest] = path;

    if (typeof routes === 'function') {
        return routes;
    }

    callback(routes);

    if (routes.middleware) {
        middleware.push(...routes.middleware);
    }

    const route = current ? routes.children && routes.children[current] : routes.index;

    if (route) {
        return findRoute(route, rest, middleware, params, callback, urlNamePrefix);
    }

    if (current) {
        const paramRoute = routes.param;

        if (paramRoute) {
            const {name, schema} = paramRoute;

            if (!name) {
                throw new Error('No param name');
            }

            params.push({name, schema, value: current});
            return findRoute(paramRoute, rest, middleware, params, callback, urlNamePrefix);
        }
    }

    return routes.any;
}

module.exports = {findRoute};
