'use strict'

const compose = require('koa-compose');
const {findRoute} = require('./router');
const {validate, ValidationError} = require('./validate');

const handleRequest = routes => async (ctx, next) => {
    const path = ctx.path.split('/').slice(1);

    try {
        const params = [];
        const middleware = [];

        let handler = findRoute(routes, path, middleware, params, routes => {
            Object.assign(ctx.state, routes.state);

            if (routes.querySchema) {
                middleware.push(querySchema(routes.querySchema));
            }
        });

        if (handler) {
            if (params.length) {
                middleware.push(validateParams(params));
            }

            if (middleware.length) {
                handler = compose([...middleware, handler]);
            }

            await handler(ctx, next);
        } else {
            ctx.status = 404;
        }
    } catch (err) {
        if (!(err instanceof ValidationError)) {
            throw err;
        }

        ctx.status = 400;

        if (ctx.state.format === 'json') {
            ctx.body = {
                error: {
                    message: err.message,
                    rule: err.rule,
                    key: err.key,
                },
            };
        } else {
            ctx.body = `Validation error: ${err.message} [${err.key}]`;
        }
    }
};

const validateParams = params => async (ctx, next) => {
    const paramValues = {};

    for (let {name, schema, value} of params) {
        paramValues[name] = validate(schema, value, name);
    }

    ctx.state.params = paramValues;
    await next();
};

const setState = state => async (ctx, next) => {
    Object.assign(ctx.state, state);
    await next();
};

const querySchema = schema => async (ctx, next) => {
    ctx.state.originalQuery = ctx.query;
    ctx.query = validate(schema, ctx.query);
    await next();
};

module.exports = {handleRequest, setState, querySchema};
