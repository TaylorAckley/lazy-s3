[![Build Status](https://travis-ci.org/TaylorAckley/lazy-s3.svg?branch=master)](https://travis-ci.org/TaylorAckley/lazy-s3)

# Lazy S3

Do you hate writing the same S3 operations multiple times like me?   Well, let me save you about 15 minutes and give you some high level abstraction of common S3 operations.

- Get an object from S3
- Download an object from S3
- Get a pre-signed URL from S3
- Delete an object for S3.
- Generate a policy document for browser uploads.

## Advantages

- AWS Documentation can take forever to come through and figure out the arguments.
- Sets sensisble defaults.
- Makes you set a content-type.
- Error catching for missed params.
- Returns promises


## Usage

First, you must make sure the following environment variables are set.

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_BUCKET

Setting a bucket is optional.    If you do set a bucket either through the options object or set it as an environment variable, it will act as the default bucket for all methods.   This means that you don't need to pass a bucket argument to any of the methods when set.  However, if you DO pass in a bucket as a parameter to a method, the argument will be used over the default bucket.


Lazy S3 exposes a class, `S3`, that takes a optional object of options.   You can use [Foreman](https://www.npmjs.com/package/foreman) to load in a .env file containing the necessary options if you wish to not bother with setting the options in a object.

```javascript

// constructor
let s3 = new S3('my-default-bucket'); // or process.env.AWS_BUCKET.   Setting either of these is essentially setting a default bucket.

// read a file and upload the contents to s3.
fs.readFile('input.png', (err, data) => {
   if (err) {
      return console.error(err);
   }
   // File as buffer, key, content-type, bucket.  Bucket is optional if default bucket has been specified.
   // Returns promise.
   s3.upload(data, 'content/input.png', 'image/png', 'my-bucket')
    .then((res) => console.log(res)) // res is the returned metadata from s3 detailing the created object.
    .catch((err) => console.log(err));
});

// download data from S3 as a buffer and write to file file.
s3.download('content/output.png', 'my-bucket') // Key and Bucket.  Like the above, bucket is optional.
    .then((buffer) => {
        fs.writefile('output.png', buffer, (err) => {
        if(err) {
        // handle error...
        }
        });
    });

    // Get a presigned url that lasts for x amount of minutes.   Use this method to let users dowload private documents from your buckets.   Defaults to 20 minutes if the 2nd argument is omitted or null.
    s3.getSignedUrl('mygif.gif', 20, 'my-bucket')
        .then((url) => console.log(url.url))
        .catch((err) => console.log(err));


        // Create a s3 polixy to be used with browser uploads
    s3.createS3Policy('application/pdf', 'private', 'my-bucket')
        .then((policy) => console.log(policy))  // returns object of policy information.
        .catch((err) => console.log(err));

```

Documentation: https://lazy-s3.githubpages.com


