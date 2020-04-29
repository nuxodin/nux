import {
    assertEquals,
    assertThrows,
    assertThrowsAsync,
    assert,
} from "https://deno.land/std/testing/asserts.ts";

import * as Schema from './schema.js'

Deno.test(function transform(){
    var value = Schema.transform({
        transform:{
            trim:true,
            case:'lower',
            caseFirst:'upper',
    }
    }, '  abcd ');
    assertEquals(value, 'Abcd');
});

Deno.test(function complete(){
    var schema = {
        format: 'email',
    };
    Schema.complete(schema);
    var value = Schema.transform(schema, '  HanS.x@SunRise.Com   ');
    assertEquals(value, 'hans.x@sunrise.com');
});




/*
var schema = {
    type:'bool'
};
Schema.complete(schema)
console.log(schema)

var error = Schema.validate({
    maxLength:3
}, 'abcd');
console.log(error)

var schema = {
    type:'Uint8'
};
Schema.complete(schema)
console.log(schema)
*/