"use strict";

const moment = require('moment');
const Promise = require('bluebird');
const AWS = require('aws-sdk');
const crypto = require('crypto');

console.log(process.env.AWS_BUCKET); // returrns defined

/** Class representing S3 functions.   Standard environment variables need to be present.
 * 
 * 
 * @class S3
 */

class S3 {
    /**
     * Creates an instance of S3. 
     * 
     * @param {string} bucket - Optional string containing default bucket.   Uses process.env.AWS_BUCKET as default if not provided.
     * @
     * 
     * @memberOf S3
     */
    constructor(bucket) {
        this.AWS_BUCKET = bucket || process.env.AWS_BUCKET;
        console.log(this.AWS_BUCKET); // returns defined
    }

    /** 
     *  Get expiration time for S3 policy
     * 
     * @returns {string} returns expiration time for S3 policy
     * 
     * @memberOf S3
     */
    getExpiryTime() {
        let _date = new Date();
        return '' + (_date.getFullYear()) + '-' + (_date.getMonth() + 1) + '-' +
            (_date.getDate() + 1) + 'T' + (_date.getHours() + 3) + ':' + '00:00.000Z';
    }

    /**
     *  Generates a policy for browser uploads
     * 
     * @param {string} contentType - Mime type for file to be uploaded.
     * @param {string} acl - acl type for file to be uploaded.   either 'public-read' or 'private' @default is 'private'
     * @param {string} bucket - Optional.   Will use bucket if provided, or will use bucket passed into constructor if passed. - Optional.   Will use bucket if provided, or will use bucket passed into constructor if passed.
     * @returns {Promise} Base64 encoded representation of policy
     * 
     * @memberOf S3
     */
    createS3Policy(contentType, acl, bucket) {
        let _bucket = bucket || this.AWS_BUCKET;
        return new Promise(function (resolve, reject) {
            if(!contentType || contentType === null) {
                reject('Error, no content type (MIME) specified.');
            }
            let _contentType = contentType || "";
            let _acl = acl || 'private';
            let date = new Date();
            var s3Policy = {
                'expiration': module.exports.aws.getExpiryTime(),
                'conditions': [ //https://aws.amazon.com/articles/1434/
                    ['starts-with', '$key', ''], {
                        'bucket': _bucket
                    }, {
                        'acl': _acl
                    }, {
                        'success_action_status': '201'
                    },
                    ["starts-with", "$Content-Type", _contentType],
                    ["starts-with", "$filename", ""],
                    ["content-length-range", 0, 1048576 * 10]

                ]
            };

            // stringify and encode the policy
            let stringPolicy = JSON.stringify(s3Policy);
            let base64Policy = new Buffer(stringPolicy, 'utf-8').toString('base64');

            // sign the base64 encoded policy
            let signature = crypto.createHmac('sha1', process.env.AWS_SECRET_ACCESS_KEY)
                .update(new Buffer(base64Policy, 'utf-8')).digest('base64');

            // build the results object
            let s3Credentials = {
                s3Policy: base64Policy,
                s3Signature: signature,
                AWSAccessKeyId: process.env.AWS_ACCESS_KEY_ID
            };

            // send it back
            resolve(s3Credentials);

        });
    }
    /**
     * 
     * 
     * @param {string} key
     * @param {string} bucket - Optional.   Will use bucket if provided, or will use bucket passed into constructor if passed. - Optional.   Will use bucket if provided, or will use bucket passed into constructor if passed.
     * @returns {Promise}
     * 
     * @memberOf S3
     */
    deleteS3Object(key, bucket) {
        let _bucket = bucket || this.AWS_BUCKET;
        return new Promise(function (resolve, reject) {
            if (!key) {
                reject('Error, no key specified');
            }
            let s3 = new AWS.S3();
            s3.deleteObjects({
                Bucket: _bucket,
                Delete: {
                    Objects: [{
                        Key: key
                    }]
                }
            }, function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve(data);
            });
        });

    }
    /**
     * 
     * 
     * @param {buffer} body - Buffer of the file to be uploaded.
     * @param {string} key - key of the uploaded 
     * @param {string} contentType - mime type of the file to be upload. 
     * @param {string} bucket - Optional.   Will use bucket if provided, or will use bucket passed into constructor if passed.
     * @param {string} acl - Optional.   ACL to use.   Defaults to private.
     * @returns {Promise}
     * 
     * @memberOf S3
     */
    upload(body, key, contentType, bucket, acl) {
        let _bucket = bucket || this.AWS_BUCKET;
        return new Promise(function (resolve, reject) {
            if (!body || body === null) {
                reject('Nothing to upload.   Please include a buffer.');
            }
            if (!Buffer.isBuffer(body)) {
                reject(`body is a ${typeof(body)}.  Please provide a valid buffer.`);
            }
            if (!key || key === null) {
                reject('Error, no key specified');
            }
            if (!contentType || contentType === null) {
                reject('No Content Type (MIME) specified.');
            }
            let _acl = acl || 'private';
            let s3obj = new AWS.S3({
                params: {
                    Bucket: _bucket,
                    Key: key,
                    ACL: _acl,
                    contentType: contentType
                }
            });
            s3obj.upload({ // upload the deliverable to S3
                    Body: body
                })
                .send(function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                });

        });

    }
    /**
     * 
     * 
     * @param {string} key - file key.  ex: 'deliverables/myfile.docx'
     * @param {number} expiration - How long the signed url should last in minutes.  leave null for 20 minutes.
     * @param {string} bucket - Optional.   Will use bucket if provided, or will use bucket passed into constructor if passed.
     * @returns {Promise} - Signed URL
     * 
     * @memberOf S3
     */
    getSignedUrl(key, expiration, bucket) {
        let _bucket = bucket || this.AWS_BUCKET;
        return new Promise(function (resolve, reject) {
                        if(!key || key === null) {
                reject('Error, no key specified');
            }
            let _defaultExp = 60 * 20 // 20 minutes.
            let _exp = expiration ? expiration * 60 : _defaultExp;
            let s3 = new AWS.S3();
            let url = s3.getSignedUrl('getObject', { // get a signed URL that will last for 20 minutes.
                Bucket: _bucket,
                Key: key,
                Expires: _exp
            });
            resolve(url);
        });
    }
    /**
     * 
     * 
     * @param {string} key ex: 'processed/kitty.png'.  Required.
     * @param {string} bucket - Optional.   Will use bucket if provided, or will use bucket passed into constructor if passed.
     * @returns {Promise} - Resolved to promise wih with buffer representation of download.   Buffer can be used as a stream or written to a file.
     * 
     * @memberOf S3
     */
    download(key, bucket) {
        let _bucket = bucket || this.AWS_BUCKET;
        return new Promise(function (resolve, reject) {
            if(!key || key === null) {
                reject('No key specified.');
            }
            let s3 = new AWS.S3();
            let params = {
                Bucket: _bucket,
                Key: key
            };
            s3.getObject(params, (err, data) => {
                if (err) {
                    reject('There was an error processing');
                }
                if (data === null) {
                    reject('File not found.');
                }
                resolve(data);
            });
        });
    }

}

module.exports = S3;