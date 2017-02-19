"use strict";

require('dotenv').config();

let fs = require('fs');
let moment = require('moment');

let ts = moment().format('YYY_MM_DD');
let filename = `unit/${ts}_unit.jpg`

let assert = require('assert');
let chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

let env = process.env;
describe('env vars', () => {
    it(' should be defined and strings', () => {
        env.AWS_ACCESS_KEY_ID.should.be.a('string');
        env.AWS_SECRET_ACCESS_KEY.should.be.a('string');
        env.AWS_BUCKET.should.be.a('string');
    });
})


const _bucket = env.AWS_BUCKET;
let _localImg = 'sample.jpg';
let _s3Img = 'sample.jpg;'

let S3 = require('../index.js');

describe('S3', () => {

    describe('constructor', () => {
        it('should not require an argument', () => {
            let s3 = new S3()
            s3.should.be.a('object');
            s3.should.have.property('AWS_BUCKET');
        });

        it('should use the bucket if passed', () => {
            let s3 = new S3('ackley-landfill')
            s3.should.be.a('object');
            s3.should.have.property('AWS_BUCKET').equals('ackley-landfill');
        });
    });

    describe('upload', (done) => {
        it('should upload a file', (done) => {
            let s3 = new S3();
            let img = fs.readFile('./tests/sample.jpg', (err, data) => {
                if (err) {
                    console.log(err);
                }
                s3.upload(data, filename, 'image/jpeg')
                    .then((res) => {
                    res.should.have.property('Key').equals(filename)
                    done();
                })
                    .catch((err) => console.log(err));
            });
        });
            it('should upload a file', (done) => {
            let s3 = new S3();
            let img = fs.readFile('./tests/sample.jpg', (err, data) => {
                if (err) {
                    console.log(err);
                }
                s3.upload(data, filename, 'image/jpeg')
                    .then((res) => {
                    res.should.have.property('Key').equals(filename)
                    done();
                })
                    .catch((err) => console.log(err));
            });
        });
    });

    describe('download', (done) => {
        it('should respond the file', (done) => {
            let s3 = new S3();
            s3.download(filename)
                .then((res) => {
                    console.log(res);
                    res.should.have.property('Body');
                    done();
                })
                .catch((err) => {
                    console.log(err);
                done(err)
                });
        });
    });


});