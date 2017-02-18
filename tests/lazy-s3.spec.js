"use strict";

require('dotenv').config();
var assert = require('assert');
var should = require('chai').should()

let env = process.env;

env.AWS_ACCESS_KEY_ID.should.be.a('string');
env.AWS_SECRET_ACCESS_KEY.should.be.a('string');
env.AWS_BUCKET.should.be.a('string');

let _bucket = env.AWS_BUCKET;
let _localImg = 'sample.jpg';
let _s3Img = 'sample.jpg;'

let s3 = require('../index.js');

describe('S3', () => {

describe('constructor', () => {
it('should not require an argument', () => {
      () => {
        new S3();
      }.should.throw(Error);
});
});

    let s3;

    beforeEach(() => {
        // Create a new S3 object before every test.
        s3 = new S3(_bucket);
    });

    describe('getObject', (done) => {
        it('should respond with the file')
        s3.download('sample.png')
            .then((res) => {
                done();
            })
            .catch((err) => done(err));
    });

});