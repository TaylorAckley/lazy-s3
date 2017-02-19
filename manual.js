"use strict";

require('dotenv').config();
let fs = require('fs');
let moment = require('moment');

let ts = moment().format('YYY_MM_DD');
let filename = `manual/${ts}_manual.jpg `

let S3 = require('./index.js');

let img = fs.readFile('./tests/sample.jpg', (err, data) => {
    if(err) {
        console.log(err);
    }
    console.log(data);
    s3.upload(data, filename)
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
});

let s3 = new S3();



s3.download('sample.jpg')
    .then((res) => console.log(res))
    .catch((err) => console.log(err));

