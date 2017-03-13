const compose = require('koa-compose');
const {setState} = require('../framework');
const {validate, v} = require('../validate');

module.exports = {
    index: async (ctx, next) => {
        ctx.body = 'Hello, World!';
        await next();
    },

    children: {
        pages: {
            index: {
                state: {format: 'json'},
                querySchema: {
                    text: v.required(v.trim),
                },
                index: async (ctx, next) => {
                    const {text} = ctx.query;
                    ctx.body = {pages: {text}};
                    await next();
                },
            },

            param: {
                name: 'id',
                schema: v.number,

                index: async (ctx, next) => {
                    const {id} = ctx.state.params;
                    ctx.body = `pages → ${id}`;
                    await next();
                },

                children: {
                    show: async (ctx, next) => {
                        const {id} = ctx.state.params;
                        ctx.body = `pages → ${id} → show`;
                        await next();
                    },
                },
            },

            children: {
                show: async (ctx, next) => {
                    ctx.body = 'pages → show';
                    await next();
                },
            },
        },
    },
};
