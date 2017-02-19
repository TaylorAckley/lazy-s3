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
            let img = fs.readFile('./sample.jpg', (err, data) => {
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
        it('should error when no body is passed', (done) => {
            let s3 = new S3();
            let img = fs.readFile('./sample.jpg', (err, data) => {
                if (err) {
                    console.log(err);
                }
                s3.upload(null, filename, 'image/jpeg')
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((err) => {
                        err.should.equal('Nothing to upload.   Please include a buffer.');
                        done();
                    });
            });
        });
        it('should error when body is a string', (done) => {
            let s3 = new S3();
            let img = fs.readFile('./sample.jpg', (err, data) => {
                if (err) {
                    console.log(err);
                }
                s3.upload('hello', filename, 'image/jpeg')
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((err) => {
                        err.should.equal('body is a string.  Please provide a valid buffer.');
                        done();
                    });
            });
        });
        it('should error when filename is a null', (done) => {
            let s3 = new S3();
            let img = fs.readFile('./sample.jpg', (err, data) => {
                if (err) {
                    console.log(err);
                }
                s3.upload(data, null, 'image/jpeg')
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((err) => {
                        err.should.equal('Error, no key specified');
                        done();
                    });
            });
        });
        it('should error when contentType is a null', (done) => {
            let s3 = new S3();
            let img = fs.readFile('./sample.jpg', (err, data) => {
                if (err) {
                    console.log(err);
                }
                s3.upload(data, filename, null)
                    .then((res) => {
                        console.log(res);
                    })
                    .catch((err) => {
                        err.should.equal('No Content Type (MIME) specified.');
                        done();
                    });
            });
        });
    });

    describe('download', (done) => {
        it('should respond with a file', (done) => {
            let s3 = new S3();
            s3.download(filename)
                .then((res) => {
                    res.should.have.property('Body');
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done(err)
                });
        });
        it('should throw an error if no key is present', (done) => {
            let s3 = new S3();
            s3.download()
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    err.should.equal('No key specified.');
                    done()
                });
        });
        it('should throw an error if no file is found', (done) => {
            let s3 = new S3();
            s3.download('kitty')
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    should.exist(err);
                    done()
                });
        });
    });

    describe('getSignedUrl', (done) => {
        it('should respond with the url', (done) => {
            let s3 = new S3();
            s3.getSignedUrl(filename)
                .then((res) => {
                    res.should.contain('https');
                    done();
                })
                .catch((err) => {
                    console.log(err);
                });
        });
        it('should throw an error if no key is present.', (done) => {
            let s3 = new S3();
            s3.getSignedUrl()
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    err.should.equal('Error, no key specified');
                    done()
                });
        });
    });


    describe('delete', (done) => {
        it('should respond with success', (done) => {
            let s3 = new S3();
            s3.deleteS3Object(filename)
                .then((res) => {
                    res['Deleted'][0]['Key'].should.equal(filename);
                    done();
                })
                .catch((err) => {
                    console.log(err);
                });
        });
        it('should throw an error if no key is present.', (done) => {
            let s3 = new S3();
            s3.deleteS3Object()
                .then((res) => {
                    console.log(res);
                })
                .catch((err) => {
                    err.should.equal('Error, no key specified');
                    done()
                });
        });
    });
});

describe('getExpiryTime', (done) => {
    it('should respond with a value', (done) => {
        let s3 = new S3();
        let exp = s3.getExpiryTime();
        should.exist(exp);
        done();
    });
});

describe('createS3Policy', (done) => {
    it('should return a policy', (done) => {
        let s3 = new S3();
        s3.createS3Policy('application/pdf')
            .then((res) => {
                res.should.have.property('s3Policy');
                done();
            })
            .catch((err) => {
                console.log(err);
                done(err)
            });
    });
    it('should throw an error if contenttype isnt present', (done) => {
        let s3 = new S3();
        s3.createS3Policy()
            .then((res) => {
                //...
            })
            .catch((err) => {
                err.should.equal('Error, no content type (MIME) specified.');
                done()
            });
    });

});