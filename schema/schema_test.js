const { test } = Deno;
import {
    assertEquals,
    assertThrows,
    assertThrowsAsync,
    assert,
} from "https://deno.land/std@0.51.0/testing/asserts.ts";

import {Schema} from './schema.js'

await new Promise((resolve) => setTimeout(resolve, 100));


test('transform', function transform(){
    var schema = new Schema({
        transformTrim:true,
        transformCase:'lower',
        transformCaseFirst:'upper',
    });
    var value = schema.transform('   abCd  ');
    assertEquals(value, 'Abcd');
});


test('transform mail', function transform_email(){
    var schema = new Schema({
        format: 'email',
    });
    var value = schema.transform('  HanS.x@SunRise.Com   ');
    assertEquals(value, 'hans.x@sunrise.com');
});


test('can not transform', function transform_email(){
    var schema = new Schema({
        maxLength:2
    });
    assertThrows(()=>{
        schema.transform('longer then 2 chars')
    })
});


test('autocomplete', function autocomplete(){
    var schema = new Schema({
        format: 'email',
    });
    assertEquals(schema.type, 'string');
});

test('schema_error', function schema_error(){
    var schema = new Schema({
        pattern: 'a(',
    });
    var error = schema.schemaError();
    assertEquals(error, 'schema error: pattern:\"a(\" with error:Invalid regular expression: /a(/: Unterminated group');
});

test('simple object', function schema_error(){
    var schema = new Schema({
        type:'object',
    });
    const value = {
        "key"         : "value",
        "another_key" : "another_value"
    }
    assert(schema.validate(value));
});

test('not a object', function schema_error(){
    var schema = new Schema({
        type:'object',
    });
    assert(!schema.validate('Not an object'));
});

test('not a number', function schema_error(){
    var schema = new Schema({
        type:'number',
    });
    assert(!schema.validate('666'));
});


test('a integer', function schema_error(){
    var schema = new Schema({
        type:'integer',
    });
    assert(schema.validate(2));
});


test('not a integer', function schema_error(){
    var schema = new Schema({
        type:'integer',
    });
    assert(!schema.validate(2.1));
});
