'use strict'

const Koa = require('koa');
const logger = require('koa-logger');
const {handleRequest} = require('../framework');
const routes = require('./routes');
const PORT = process.env.PORT || 3000;

const app = new Koa();

if (process.env.NODE_ENV === 'development') {
    app.use(logger());
}

app.use(handleRequest(routes));
app.listen(PORT);
console.log(`Listening on ${PORT}`);
