'use strict'

function validate(schema, value, path = []) {
    if (typeof schema === 'object') {
        if (typeof value !== 'object' ) {
            throw new ValidationError('Expected an object');
        }

        if (schema instanceof Array) {
            if (!(value instanceof Array)) {
                throw new ValidationError('Expected an array');
            }

            return schema.map((itemSchema, i) => validate(itemSchema, value[i], path.concat(i)));
        } else {
            return Object.keys(schema).reduce((acc, key) => {
                acc[key] = validate(schema[key], value[key], path.concat(key));
                return acc;
            }, {});
        }
    } else if (typeof schema === 'function') {
        try {
            return schema(value);
        } catch (err) {
            if (err instanceof ValidationError) {
                err.rule = schema.name;
                err.path = path;
            }

            throw err;
        }
    } else {
        throw new Error('Invalid schema');
    }
}

class ValidationError extends Error {
    constructor(message, rule, path) {
        super(message);
        this.rule = rule;
        this.path = path;
    }
}

const v = {
    number(value) {
        const number = Number(value);

        if (Number.isNaN(number)) {
            throw new ValidationError('Expected a number');
        }

        return number;
    },

    string(value) {
        return String(value);
    },

    trim(value) {
        return v.string(value).trim();
    },

    required(schema) {
        const required = value => {
            if (value == null || value === '') {
                throw new ValidationError('Required');
            }

            return schema(value);
        };

        required.meta = {schema};
        return required;
    },

    array(schema) {
        const array = value => {
            if (!(typeof value === 'object' && value instanceof Array)) {
                throw new ValidationError('Expected an array');
            }

            return value.map(schema);
        };

        array.meta = {itemSchema: schema};
        return array;
    },
};

module.exports = {validate, ValidationError, v};
