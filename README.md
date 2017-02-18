# ALPHA RELEASE.   Untested.

# Lazy S3

Do you hate writing the same S3 operations multiple times like me?   Well, let me save you about 15 minutes and give you some high level abstraction of common S3 operations.

- Get an object from S3
- Download an object from S3
- Get a pre-signed URL from S3
- Delete an object for S3.
- Generate a policy document for browser uploads.

## Usage

Lazy S3 exposes a class, `S3`, that takes a optional object of options.   If you don't pass an object, it will look for env variables.   You can use [Foreman](https://www.npmjs.com/package/foreman) to load in a .env file containing the necessary options if you wish to not bother with setting the options in a object.

Setting a bucket is optional.    If you do set a bucket either through the options object or set it as an environment variable, it will act as the default bucket for all methods.   This means that you don't need to pass a bucket argument to any of the methods when set.  However, if you DO pass in a bucket as a parameter to a method, the argument will be used over the default bucket.   If you don't set a default bucket, you then must pass in a bucket to all methods.

```
let opts = { //configure options if they are not set as environment variables.
AWS_ACCESS_KEY_ID: 'xxxxxxx', // or process.env.AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY: 'xxxxxx' // or process.env.AWS_SECRET_ACCESS_KEY
AWS_REGION: 'us-west-2', // or process.env.AWS_REGION 
AWS_BUCKET: 'my-bucket'  // or process.env.AWS_BUCKET.   Setting either of these is essentially setting a default bucket.
}
// constructor
let s3 = new S3(opts);

// read a file and upload the contents to s3.f
fs.readFile('input.png', (err, data) => {
   if (err) {
      return console.error(err);
   }
   // File as buffer, key, bucket.  Bucket is optional if default bucket has been specified.
   // Returns promise.
   s3.upload(data, 'content/input.png', 'my-bucket')  
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

```

Documentation: https://lazy-s3.githubpages.com


