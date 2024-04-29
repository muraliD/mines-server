var utils = require("../utils/utils");
var media = require("../models/media");
var multiparty = require('multiparty');
const kuuid = require('kuuid')
var fs = require('fs');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: "AKIAW3MECNQFWSJE2DOB",
    secretAccessKey: "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"
});
exports.createMedia = async function (req, res) {

    console.log(req);

    var error = {
        code: 500,
        message: ""
    };
    try {

        const form = new multiparty.Form();


        form.parse(req, async (error, fields, files) => {

            if(fields && fields.file && files && files.filecontent){
            const fileStream
                = fs.createReadStream(files.filecontent[0].path);
            console.log(fileStream)
            const params = {
                Bucket: fields.file[0],
                Key: kuuid.id().toString() + files.filecontent[0].originalFilename,
                Body: fileStream,
                ContentType: files.filecontent[0].headers["content-type"]
            };
            console.log(params);

            try {

                s3.upload(params, function (err, data) {
                    try {
                        if (err) {

                            throw err
                        }
                        console.log(`File uploaded successfully. 
                                  ${data.Location}`);
                        res.status(200).send({ sucess: true, message: data.Location,index:fields.index[0] });

                    } catch (err) {

                        utils.sendResponseForAPI({ sucess: false, message: err.message }, req, res, null);

                    }


                });



            } catch (error) {

                utils.sendResponseForAPI({ sucess: false, message: "Enter Valid Data" }, req, res, null);
                // res.status(500).send('Error uploading file to S3');
            }
        }else{
            utils.sendResponseForAPI({ sucess: false, message: "Enter Valid Data" }, req, res, null); 
        }


        });



    } catch (err) {
        utils.sendResponseForAPI({ sucess: false, message: "Enter Valid Data" }, req, res, null);

    }

};