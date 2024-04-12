var child_process = require('child_process');
var cron = require('node-cron');
/*Imported DB Queries*/
const dbqueries = require('../database/dbqueries');

const job = require('../models/jobs');
const archivejobs = require('../models/archivejobs');
const website = require('../models/website');
const configs = require('../models/configs');
const ObjectID = require('mongoose').Types.ObjectId;

/*Config*/

var serverConfigs = require("../configs/serverConfigs");
var _ = require("lodash");
var fs = require('fs');
const numCPUs = serverConfigs.runJobsInServer['dev'];
let days = serverConfigs.archiveEvery;


var moment = require('moment');
const del = require('del');
const path = require('path');
const os = require('os');
const getFiles = require('node-recursive-directory');
var nrc = require('node-run-cmd');

function killProcess(pid) {

    if (pid != '') {
        try {
            console.log("Process About to Kill");
            process.kill(pid);
            console.log("Process Killled");
        } catch (error) {
            console.log(error);
        }
    }
}
//get jobs based on filter condition
var getJobs = async () => {

    var filter = {
        "createdon": {
            $lte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
        }
    }

    var result = await dbqueries.jobData(filter, "find")
    if (result.status) {
      return result.data
    } else {
      return result.error
    }




    // return new Promise(async (resolve, reject) => {


    //     try {

    //         var result = await job.find({
    //             "createdon": {
    //                 $lte: new Date((new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
    //             }
    //         })
    //             .lean()
    //             .exec();
    //         resolve(result);

    //     } catch (err) {
    //         reject(err);
    //     }


        
    // });

}
//get config data for running crons
var configData = async () => {


    var result = await dbqueries.configData({}, "find")
    if (result.status) {
      return result.data
    } else {
      return result.error
    }
    // return new Promise(async (resolve, reject) => {

    //     try {

    //         var result = await configs.find()
    //             .lean()
    //             .exec();
    //         resolve(result);
    //     } catch (err) {
    //         reject(err);
    //     }




    //     // configs.find()
    //     //     .lean()
    //     //     .exec(function (err, result) {
    //     //         if (err) {
    //     //             reject(err);
    //     //         } else {
    //     //             //console.log(result, "result---")
    //     //             resolve(result);
    //     //         }
    //     //     });
    // });

}
//this function will add jobs in archive collection
async function runArchive() {
    //get al jobs data
    let jobData = await getJobs();
    let deleteJobs = [];
    jobData.map(function (v) {
        v.jobid = v._id;
        deleteJobs.push(new ObjectID(v._id))
        delete v._id;
    });
    if (jobData.length > 0) {
        try {



            try {

                // var datas = await archivejobs.insertMany(jobData);
                var datas = await dbqueries.archiveData(jobData, "insertMany")
                console.log("Data inserted")


                try {
                    // var datas1 = await job.deleteMany({
                    //     _id: {
                    //         $in: deleteJobs
                    //     }
                    // });
                    var datas1 = await dbqueries.jobData(deleteJobs, "deleteMany")
                    console.log("Data deleted")

                } catch (err) {
                    console.log("error deleted")
                }

            } catch (err) {
                console.log("error inserted")
            }







            // archivejobs.insertMany(jobData).then(function () {
            //     console.log("Data inserted") // Success 
            //     const query = {
            //         _id: {
            //             $in: deleteJobs
            //         }
            //     };

            //     job.deleteMany(query).then(result => { })
            //         .catch(err => {
            //             console.log("Error");
            //             console.log(err);
            //         });
            // }).catch(function (error) {
            //     console.log(error) // Failure 
            // });
        } catch (e) {
            console.log(e);
        }

    }

}

//this function will set te status based on timeout
async function setTimeOutJobFn() {

    let configDataRes = await configData();

    if (configDataRes.length != 0) {
        try {


            try{

                // var jobs =  await job.find({
                //     status: 'Running'
                // });
                var result = await dbqueries.jobData({
                    status: 'Running'
                }, "find")
                var jobs = result.data;
                if (jobs.length != 0) {
                    _.forEach(jobs, async function (doc) {
                        try {

                            let jobTypeErrorVendors = configDataRes[0].errorStatusTimeOuts;
                            if (doc.ledesfile) {
                                jobTypeErrorVendors = configDataRes[0].errorSubmissionTimeOuts;
                            }

                            let filterData = _.filter(jobTypeErrorVendors, function (itm) {
                                return itm.eBillVendorCode == doc.eBillVendorCode;
                            });

                            if (filterData.length != 0) {
                                var obJData = filterData[0].timeout;
                                var query = { status: filterData[0].status, timeoutrun: true };
                                var dateDiff = moment.utc(moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff(moment(new Date(doc.startedAt), "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
                                var conversion = obJData.split(':').reverse().reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0);
                                var conversion2 = dateDiff.split(':').reverse().reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0);
                                var isExceeded = false;
                                if (conversion < conversion2) {
                                    isExceeded = true;
                                }
                                if (isExceeded) {
                                    try {
                                        // await job.findOneAndUpdate({ _id: new ObjectID(doc._id) }, query);
                                        await dbqueries.jobData(doc._id, "findandupdate",query);
                                        if (doc.pid) {
                                            killProcess(doc.pid)
                                        }

                                    }
                                    catch (e) {
                                        console.log(e)
                                    }
                                }

                            }


                        }
                        catch (err) {
                            console.log(err)
                        }


                    });
                }
            }catch(err){
                console.log(err)
            }





            // job.find({
            //     status: 'Running'
            // }, async function (errJob, jobs) {
            //     if (jobs.length != 0) {
            //         _.forEach(jobs, async function (doc) {
            //             try {

            //                 let jobTypeErrorVendors = configDataRes[0].errorStatusTimeOuts;
            //                 if (doc.ledesfile) {
            //                     jobTypeErrorVendors = configDataRes[0].errorSubmissionTimeOuts;
            //                 }

            //                 let filterData = _.filter(jobTypeErrorVendors, function (itm) {
            //                     return itm.eBillVendorCode == doc.eBillVendorCode;
            //                 });

            //                 if (filterData.length != 0) {
            //                     var obJData = filterData[0].timeout;
            //                     var query = { status: filterData[0].status, timeoutrun: true };
            //                     var dateDiff = moment.utc(moment(new Date(), "DD/MM/YYYY HH:mm:ss").diff(moment(new Date(doc.startedAt), "DD/MM/YYYY HH:mm:ss"))).format("HH:mm:ss");
            //                     var conversion = obJData.split(':').reverse().reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0);
            //                     var conversion2 = dateDiff.split(':').reverse().reduce((prev, curr, i) => prev + curr * Math.pow(60, i), 0);
            //                     var isExceeded = false;
            //                     if (conversion < conversion2) {
            //                         isExceeded = true;
            //                     }
            //                     if (isExceeded) {
            //                         try {
            //                             await job.findOneAndUpdate({ _id: ObjectID(doc._id) }, query);
            //                             if (doc.pid) {
            //                                 killProcess(doc.pid)
            //                             }

            //                         }
            //                         catch (e) {
            //                             console.log(e)
            //                         }
            //                     }

            //                 }


            //             }
            //             catch (err) {
            //                 console.log(err)
            //             }


            //         });
            //     }
            // });




        } catch (err) {
            console.log(err)
        }
    }


}


//this function will remove unwanted files
async function clearFilesFn() {

    try {
        var outputpath = path.resolve(__dirname, "../../output");
        var uploadpath = path.resolve(__dirname, "../../uploads");
        console.log(outputpath, "outputpath")
        /*----------Get Drirectories List-------------*/
        var hlist = function getDirectories(path) {
            var arr = []
            fs.readdirSync(path).filter(function (file) {
                var show = fs.statSync(path + '/' + file).isDirectory();
                if (show) {
                    var path1 = path + '/' + file;
                    fs.readdirSync(path1).filter(function (file) {
                        if (fs.statSync(path1 + '/' + file).isDirectory()) {
                            arr.push(path1 + '/' + file)
                        }
                    });
                }
            });
            return arr
        }
        function getdelete(list) {
            list.forEach(function (dripath, index) {
                fs.stat(dripath, function (err, stat) {
                    var now = new Date().getTime() - (86400000 * 7);
                    var endTime = new Date(stat.mtime).getTime(); // 1days in miliseconds
                    if (err) { return console.error(err); }
                    if (now > endTime) {
                        return del(dripath, { force: true });
                    }
                });
            })
        }
        /*----------Ouput files deletion-------------*/
        var finallist = hlist(outputpath);
        getdelete(finallist)
        /*----------Upload files deletion-------------*/
        var fileslist = await getFiles(uploadpath);
        getdelete(fileslist)
        console.log("done");
    } catch (err) {
        console.error('Error while deleting');
        console.log(err.message)
    }


}
//cron.schedule('0 0 0 * * *', function () {
var websitedata = {};
/**********************************************************************************************************************************************
 * 2.Get website details
 **********************************************************************************************************************************************/

async function getwebsites() {


    try {
        var result = await dbqueries.websitesData({}, "find");
        // var result = await website.find().lean().exec();
        websitedata = result.data;

    } catch (err) {

    }
    // websitedata = website.find().lean().exec(function (err, result) {
    //     if (err) {

    //     } else {

    //         websitedata = result;

    //     }
    // });;

}
getwebsites();
/**********************************************************************************************************************************************
 * 3.Details of beginJob and dbBackup 
 **********************************************************************************************************************************************/

module.exports = {
    beginJob: async function () {
        cron.schedule('* * * * *', async function () {
            let configDataRes = await configData();
            // console.log(configDataRes)
            if (configDataRes.length != 0) {
                // cron.schedule('* * * * * *', function () {
                console.log(numCPUs);
                console.log('beginJob');


                try {

                    
                    var result = await dbqueries.jobData({
                        $or: [{
                            status: 'Pending'
                        }, {
                            status: 'Running'
                        }]
                    }, "find")

                    
                    var jobs = result.data;
                    if (jobs) {

                        var runningjobs = _.filter(jobs, function (o) {
                            if (o.status == 'Running') return o
                        });
                        var pendingjobsActual = _.filter(jobs, function (o) {
                            if (o.status == 'Pending') return o
                        });

                        var pendingjobs = [];
                        //ie vendors array
                        var ieVendorsArr = [];
                        var iePendingJobs = [];
                        _.each(configDataRes[0].ieVendors, function (itm) {
                            ieVendorsArr.push(itm.eBillVendorCode)
                        });
                        var isIEVendorIsInRunning = false;

                        //immediate
                        pendingjobsActual = _.orderBy(pendingjobsActual, ['immediate']);
                        pendingjobsActual = _.orderBy(pendingjobsActual, ['reviewedinvoices'], ['asc']);
                        pendingjobsActual = _.orderBy(pendingjobsActual, ['rerunerror'], ['asc']);

                        // var rerunPendingJobs = _.filter(pendingjobsActual, function (itm) {
                        //     if (!itm.rerunerror) {
                        //         return itm;
                        //     }
                        // });

                        // if (rerunPendingJobs.length != 0) {
                        //     pendingjobsActual = rerunPendingJobs;
                        // }

                        //added for run all vendor jobs parallely..
                        if (pendingjobsActual.length > numCPUs) {
                            pendingjobsActual = _.uniqWith(
                                pendingjobsActual,
                                (jobA, jobB) =>
                                    jobA.Userid === jobB.Userid &&
                                    jobA.eBillVendorCode === jobB.eBillVendorCode
                            );
                            //pendingjobsActual = _.uniqBy(pendingjobsActual, 'Userid')
                        }




                        //check IE Job is Present or not
                        //check IE submission Job is Present or not
                        var IESubmissionRunningJobs = [];
                        _.each(runningjobs, function (runJob) {
                            //checking IE Jobs are running or not
                            if (ieVendorsArr.includes(runJob.eBillVendorCode)) {
                                isIEVendorIsInRunning = true;
                            }
                            //pushing IE Submission JOBS
                            if (runJob.ledesfile) {
                                if (ieVendorsArr.includes(runJob.eBillVendorCode)) {
                                    IESubmissionRunningJobs.push(runJob)
                                }
                            }
                        });
                        //other than IE Jobs
                        _.each(pendingjobsActual, function (item, index) {
                            if (!ieVendorsArr.includes(item.eBillVendorCode)) {
                                pendingjobs.push(item)
                            } else {
                                iePendingJobs.push(item)
                            }
                        });
                        //if IE job not present in Running JOBS then take 1 IE job

                        if (iePendingJobs.length != 0) {

                            let IESubmissionJobs = _.filter(iePendingJobs, function (o) {
                                if (o.ledesfile) return o;
                            });
                            let IEStatusJobs = _.filter(iePendingJobs, function (o) {
                                if (!o.ledesfile) return o;
                            });
                            // no ie jobs are running
                            if (!isIEVendorIsInRunning) {
                                //ie pending submission jobs are present
                                if (IESubmissionJobs.length != 0) {
                                    var take1ieJob = _.take(IESubmissionJobs, 1);
                                    pendingjobs = pendingjobs.concat(take1ieJob);
                                }
                                else if (IEStatusJobs.length != 0) {
                                    pendingjobs = pendingjobs.concat(IEStatusJobs);
                                }
                            } else {
                                if (IESubmissionRunningJobs.length == 0) {
                                    pendingjobs = pendingjobs.concat(IEStatusJobs);
                                }
                            }
                        }

                        //immediate

                        pendingjobs = _.orderBy(pendingjobs, ['reviewedinvoices'], ['asc']);
                        pendingjobs = _.orderBy(pendingjobs, ['rerunerror'], ['asc']);
                        pendingjobs = _.orderBy(pendingjobs, ['immediate']);

                        //check available pending submission jobs
                        var pendingSubmissionjobs = _.filter(pendingjobs, function (o) {
                            if (o.ledesfile) return o;
                        });

                        var pendingStatusjobs = _.filter(pendingjobs, function (o) {
                            if (!o.ledesfile) return o;
                        });
                        var verifyCPUCount = true;
                        if (pendingSubmissionjobs.length != 0) {

                            var isNewForRunning2 = [];
                            _.forEach(pendingStatusjobs, function (pjob) {

                                var isExist2 = _.filter(runningjobs, function (o) {
                                    if (o.eBillVendor == pjob.eBillVendor) return o
                                });

                                if (isExist2.length == 0) {
                                    isNewForRunning2.push(pjob)
                                }

                            });
                            if (isNewForRunning2.length > 0) {
                                pendingStatusjobs = isNewForRunning2;
                            }
                            //do not verify cpu count logic
                            verifyCPUCount = false;
                            if (pendingStatusjobs.length != 0) {
                                var takePendingStatusJobsCount = numCPUs - pendingSubmissionjobs.length;
                                var NeedStatusJobs = _.take(pendingStatusjobs, takePendingStatusJobsCount);
                                pendingSubmissionjobs = pendingSubmissionjobs.concat(NeedStatusJobs);
                            }
                            pendingjobs = pendingSubmissionjobs;



                        }

                        if (verifyCPUCount && runningjobs.length >= numCPUs) {
                            console.log('no job already running ' + runningjobs);
                        } else {
                            console.log('do job can run ');
                            console.log(numCPUs - runningjobs.length);
                            var canrunjobs = numCPUs - runningjobs.length;
                            var isNewForRunning = [];
                            _.forEach(pendingjobs, function (pjob) {


                                var isExist = _.filter(runningjobs, function (o) {
                                    if (o.eBillVendor == pjob.eBillVendor) return o
                                });

                                if (isExist.length == 0) {
                                    isNewForRunning.push(pjob)
                                }

                            });
                            if (isNewForRunning.length > 0) {
                                pendingjobs = isNewForRunning;
                            }


                            var dojobs = _.take(pendingjobs, canrunjobs);
                            var readyToRun = [];
                            _.forEach(dojobs, async function (cjob) {
                                // var runSingleVendorJob= _.filter(serverConfigs.noMultipleRunningVendors, function (itm) {
                                //     return itm.eBillVendorCode == cjob.eBillVendorCode
                                // });
                                var noMultipleRunningVendors = configDataRes[0].noMultipleRunningVendorsStatus;
                                var jobType = cjob.ledesfile ? 'submission' : 'status';
                                if (jobType == 'submission') {
                                    noMultipleRunningVendors = configDataRes[0].noMultipleRunningVendorsSubmission;
                                }
                                let validCount = 0;
                                let countArray = 0;
                                countArray = _.filter(noMultipleRunningVendors, function (itm) {
                                    return itm.eBillVendorCode == cjob.eBillVendorCode
                                });
                                let multiLogins = false;
                                // if(runSingleVendorJob.length!=0){
                                //     validCount = runSingleVendorJob[0].count;
                                //     multiLogins = false;
                                // }
                                // else
                                if (countArray.length != 0) {
                                    validCount = countArray[0].count;
                                    multiLogins = countArray[0].multiLogins ? countArray[0].multiLogins : false;
                                }
                                var hasmultipleVendorCode = [];
                                //return if vendor exists in "readyToRun" array
                                // if (readyToRun.includes(cjob.eBillVendorCode)) {
                                //     return;
                                // }
                                if (validCount != 0) {
                                    if (readyToRun.includes(cjob.eBillVendorCode)) {
                                        let readyToRunCount = _.filter(readyToRun, function (itm) {
                                            return itm == cjob.eBillVendorCode
                                        });
                                        if (readyToRunCount >= validCount)
                                            return;
                                    }
                                }

                                //find vendor present in "noMultipleRunningVendors" array
                                var vendorExist = noMultipleRunningVendors.find(x => x.eBillVendorCode == cjob.eBillVendorCode);
                                //if exists push the vendor code to "readyToRun" array
                                // if (vendorExist) {
                                //     readyToRun.push(cjob.eBillVendorCode);
                                // }
                                if (vendorExist) {
                                    let readyToRunCount = _.filter(readyToRun, function (itm) {
                                        return itm == cjob.eBillVendorCode
                                    });
                                    if (readyToRunCount <= validCount)
                                        readyToRun.push(cjob.eBillVendorCode);
                                }
                                //finding vendor code is exists in job with Running status and store in array
                                _.forEach(runningjobs, function (rjob) {
                                    var hasmultipleVendorCode1 = _.filter(noMultipleRunningVendors, function (o) {
                                        if (o.eBillVendorCode == rjob.eBillVendorCode) return o.eBillVendorCode
                                    })
                                    hasmultipleVendorCode = hasmultipleVendorCode.concat(hasmultipleVendorCode1);
                                });
                                var runningVendorExist = _.filter(hasmultipleVendorCode, function (y) {
                                    return y.eBillVendorCode == cjob.eBillVendorCode
                                })

                                // if (runningVendorExist.length > 0) {
                                //     return;
                                // }

                                if (validCount != 0) {
                                    if (runningVendorExist.length >= validCount) {
                                        return;
                                    }

                                }

                                if (multiLogins) {
                                    if (runningjobs.length != 0) {
                                        let runningJobsForThisVendor = _.filter(runningjobs, function (rjob) {
                                            return rjob.eBillVendorCode == cjob.eBillVendorCode;
                                        });

                                        if (runningJobsForThisVendor.length > 0) {
                                            let isSameCredenials = _.filter(runningJobsForThisVendor, function (ejob) {
                                                return cjob.Userid == ejob.Userid
                                            });
                                            console.log(isSameCredenials.length, "isSameCredenials.length")
                                            if (isSameCredenials.length > 0) {
                                                return;
                                            }
                                        }
                                    }
                                    runningjobs.push(cjob);
                                }








                                try {
                                    
                                    // var doc = await job.findOne({
                                    //     _id: cjob._id,
                                    //     status: 'Pending'
                                    // });
                                    var result2 = await dbqueries.jobData({
                                        _id: cjob._id,
                                        status: 'Pending'
                                    }, "findonebyStatus")
                                    var doc = result2.data
                                    if (doc) {
                                        if ("status" in doc) {
                                            doc.status = 'Running';
                                            doc.startedAt = new Date();

                                            var currentdoc = doc._doc;

                                            try{
                                                   var data = await doc.save();
                                            
                                                    // console.dir(serverConfigs.ieVendors);
                                                    // console.dir(currentdoc.eBillVendorCode);
                                                    var isiewebsite = _.filter(configDataRes[0].ieVendors, function (o) {
                                                        if (o.eBillVendorCode == currentdoc.eBillVendorCode) return o
                                                    })
                                                    if (isiewebsite[0]) {

                                                        console.log('IEWebsite');
                                                        childprocessjobie(doc, configDataRes);
                                                    } else {
                                                        childprocessjob(doc, configDataRes);
                                                    }

                                                

                                            }catch(err){
                                                console.log(err);
                                            }
                                            // doc.save(function (err) {

                                            //     if (!err) {
                                            //         // console.dir(serverConfigs.ieVendors);
                                            //         // console.dir(currentdoc.eBillVendorCode);
                                            //         var isiewebsite = _.filter(configDataRes[0].ieVendors, function (o) {
                                            //             if (o.eBillVendorCode == currentdoc.eBillVendorCode) return o
                                            //         })
                                            //         if (isiewebsite[0]) {

                                            //             console.log('IEWebsite');
                                            //             childprocessjobie(doc, configDataRes);
                                            //         } else {
                                            //             childprocessjob(doc, configDataRes);
                                            //         }

                                            //     } else {
                                            //         console.log(err);
                                            //     }
                                            // });

                                        }
                                    }

                                } catch (err) {
                                    console.log(err);
                                }


                                // job.findOne({
                                //     _id: cjob._id,
                                //     status: 'Pending'
                                // }, function (err, doc) {
                                //     if (err) {
                                //         console.log(err);
                                //     } else {
                                //         if (doc) {
                                //             if ("status" in doc) {
                                //                 doc.status = 'Running';
                                //                 doc.startedAt = new Date();

                                //                 var currentdoc = doc._doc;
                                //                 doc.save(function (err) {

                                //                     if (!err) {
                                //                         // console.dir(serverConfigs.ieVendors);
                                //                         // console.dir(currentdoc.eBillVendorCode);
                                //                         var isiewebsite = _.filter(configDataRes[0].ieVendors, function (o) {
                                //                             if (o.eBillVendorCode == currentdoc.eBillVendorCode) return o
                                //                         })
                                //                         if (isiewebsite[0]) {

                                //                             console.log('IEWebsite');
                                //                             childprocessjobie(doc, configDataRes);
                                //                         } else {
                                //                             childprocessjob(doc, configDataRes);
                                //                         }

                                //                     } else {
                                //                         console.log(err);
                                //                     }
                                //                 });

                                //             }
                                //         }
                                //     }
                                // });
















                            });
                        }

                    } else {
                        console.log("nojobs")
                    }







                } catch (err) {
                    console.log(err);
                }



















                // job.find({
                //     $or: [{
                //         status: 'Pending'
                //     }, {
                //         status: 'Running'
                //     }]
                // }, function (err, jobs) {
                //     if (err) {
                //         console.log(err);
                //     }
                //     var runningjobs = _.filter(jobs, function (o) {
                //         if (o.status == 'Running') return o
                //     });
                //     var pendingjobsActual = _.filter(jobs, function (o) {
                //         if (o.status == 'Pending') return o
                //     });

                //     var pendingjobs = [];
                //     //ie vendors array
                //     var ieVendorsArr = [];
                //     var iePendingJobs = [];
                //     _.each(configDataRes[0].ieVendors, function (itm) {
                //         ieVendorsArr.push(itm.eBillVendorCode)
                //     });
                //     var isIEVendorIsInRunning = false;

                //     //immediate
                //     pendingjobsActual = _.orderBy(pendingjobsActual, ['immediate']);
                //     pendingjobsActual = _.orderBy(pendingjobsActual, ['reviewedinvoices'], ['asc']);
                //     pendingjobsActual = _.orderBy(pendingjobsActual, ['rerunerror'], ['asc']);

                //     // var rerunPendingJobs = _.filter(pendingjobsActual, function (itm) {
                //     //     if (!itm.rerunerror) {
                //     //         return itm;
                //     //     }
                //     // });

                //     // if (rerunPendingJobs.length != 0) {
                //     //     pendingjobsActual = rerunPendingJobs;
                //     // }

                //     //added for run all vendor jobs parallely..
                //     if (pendingjobsActual.length > numCPUs) {
                //         pendingjobsActual = _.uniqWith(
                //             pendingjobsActual,
                //             (jobA, jobB) =>
                //                 jobA.Userid === jobB.Userid &&
                //                 jobA.eBillVendorCode === jobB.eBillVendorCode
                //         );
                //         //pendingjobsActual = _.uniqBy(pendingjobsActual, 'Userid')
                //     }




                //     //check IE Job is Present or not
                //     //check IE submission Job is Present or not
                //     var IESubmissionRunningJobs = [];
                //     _.each(runningjobs, function (runJob) {
                //         //checking IE Jobs are running or not
                //         if (ieVendorsArr.includes(runJob.eBillVendorCode)) {
                //             isIEVendorIsInRunning = true;
                //         }
                //         //pushing IE Submission JOBS
                //         if (runJob.ledesfile) {
                //             if (ieVendorsArr.includes(runJob.eBillVendorCode)) {
                //                 IESubmissionRunningJobs.push(runJob)
                //             }
                //         }
                //     });
                //     //other than IE Jobs
                //     _.each(pendingjobsActual, function (item, index) {
                //         if (!ieVendorsArr.includes(item.eBillVendorCode)) {
                //             pendingjobs.push(item)
                //         } else {
                //             iePendingJobs.push(item)
                //         }
                //     });
                //     //if IE job not present in Running JOBS then take 1 IE job

                //     if (iePendingJobs.length != 0) {

                //         let IESubmissionJobs = _.filter(iePendingJobs, function (o) {
                //             if (o.ledesfile) return o;
                //         });
                //         let IEStatusJobs = _.filter(iePendingJobs, function (o) {
                //             if (!o.ledesfile) return o;
                //         });
                //         // no ie jobs are running
                //         if (!isIEVendorIsInRunning) {
                //             //ie pending submission jobs are present
                //             if (IESubmissionJobs.length != 0) {
                //                 var take1ieJob = _.take(IESubmissionJobs, 1);
                //                 pendingjobs = pendingjobs.concat(take1ieJob);
                //             }
                //             else if (IEStatusJobs.length != 0) {
                //                 pendingjobs = pendingjobs.concat(IEStatusJobs);
                //             }
                //         } else {
                //             if (IESubmissionRunningJobs.length == 0) {
                //                 pendingjobs = pendingjobs.concat(IEStatusJobs);
                //             }
                //         }
                //     }

                //     //immediate

                //     pendingjobs = _.orderBy(pendingjobs, ['reviewedinvoices'], ['asc']);
                //     pendingjobs = _.orderBy(pendingjobs, ['rerunerror'], ['asc']);
                //     pendingjobs = _.orderBy(pendingjobs, ['immediate']);

                //     //check available pending submission jobs
                //     var pendingSubmissionjobs = _.filter(pendingjobs, function (o) {
                //         if (o.ledesfile) return o;
                //     });

                //     var pendingStatusjobs = _.filter(pendingjobs, function (o) {
                //         if (!o.ledesfile) return o;
                //     });
                //     var verifyCPUCount = true;
                //     if (pendingSubmissionjobs.length != 0) {

                //         var isNewForRunning2 = [];
                //         _.forEach(pendingStatusjobs, function (pjob) {

                //             var isExist2 = _.filter(runningjobs, function (o) {
                //                 if (o.eBillVendor == pjob.eBillVendor) return o
                //             });

                //             if (isExist2.length == 0) {
                //                 isNewForRunning2.push(pjob)
                //             }

                //         });
                //         if (isNewForRunning2.length > 0) {
                //             pendingStatusjobs = isNewForRunning2;
                //         }
                //         //do not verify cpu count logic
                //         verifyCPUCount = false;
                //         if (pendingStatusjobs.length != 0) {
                //             var takePendingStatusJobsCount = numCPUs - pendingSubmissionjobs.length;
                //             var NeedStatusJobs = _.take(pendingStatusjobs, takePendingStatusJobsCount);
                //             pendingSubmissionjobs = pendingSubmissionjobs.concat(NeedStatusJobs);
                //         }
                //         pendingjobs = pendingSubmissionjobs;



                //     }

                //     if (verifyCPUCount && runningjobs.length >= numCPUs) {
                //         console.log('no job already running ' + runningjobs);
                //     } else {
                //         console.log('do job can run ');
                //         console.log(numCPUs - runningjobs.length);
                //         var canrunjobs = numCPUs - runningjobs.length;
                //         var isNewForRunning = [];
                //         _.forEach(pendingjobs, function (pjob) {


                //             var isExist = _.filter(runningjobs, function (o) {
                //                 if (o.eBillVendor == pjob.eBillVendor) return o
                //             });

                //             if (isExist.length == 0) {
                //                 isNewForRunning.push(pjob)
                //             }

                //         });
                //         if (isNewForRunning.length > 0) {
                //             pendingjobs = isNewForRunning;
                //         }


                //         var dojobs = _.take(pendingjobs, canrunjobs);
                //         var readyToRun = [];
                //         _.forEach(dojobs, function (cjob) {
                //             // var runSingleVendorJob= _.filter(serverConfigs.noMultipleRunningVendors, function (itm) {
                //             //     return itm.eBillVendorCode == cjob.eBillVendorCode
                //             // });
                //             var noMultipleRunningVendors = configDataRes[0].noMultipleRunningVendorsStatus;
                //             var jobType = cjob.ledesfile ? 'submission' : 'status';
                //             if (jobType == 'submission') {
                //                 noMultipleRunningVendors = configDataRes[0].noMultipleRunningVendorsSubmission;
                //             }
                //             let validCount = 0;
                //             let countArray = 0;
                //             countArray = _.filter(noMultipleRunningVendors, function (itm) {
                //                 return itm.eBillVendorCode == cjob.eBillVendorCode
                //             });
                //             let multiLogins = false;
                //             // if(runSingleVendorJob.length!=0){
                //             //     validCount = runSingleVendorJob[0].count;
                //             //     multiLogins = false;
                //             // }
                //             // else
                //             if (countArray.length != 0) {
                //                 validCount = countArray[0].count;
                //                 multiLogins = countArray[0].multiLogins ? countArray[0].multiLogins : false;
                //             }
                //             var hasmultipleVendorCode = [];
                //             //return if vendor exists in "readyToRun" array
                //             // if (readyToRun.includes(cjob.eBillVendorCode)) {
                //             //     return;
                //             // }
                //             if (validCount != 0) {
                //                 if (readyToRun.includes(cjob.eBillVendorCode)) {
                //                     let readyToRunCount = _.filter(readyToRun, function (itm) {
                //                         return itm == cjob.eBillVendorCode
                //                     });
                //                     if (readyToRunCount >= validCount)
                //                         return;
                //                 }
                //             }

                //             //find vendor present in "noMultipleRunningVendors" array
                //             var vendorExist = noMultipleRunningVendors.find(x => x.eBillVendorCode == cjob.eBillVendorCode);
                //             //if exists push the vendor code to "readyToRun" array
                //             // if (vendorExist) {
                //             //     readyToRun.push(cjob.eBillVendorCode);
                //             // }
                //             if (vendorExist) {
                //                 let readyToRunCount = _.filter(readyToRun, function (itm) {
                //                     return itm == cjob.eBillVendorCode
                //                 });
                //                 if (readyToRunCount <= validCount)
                //                     readyToRun.push(cjob.eBillVendorCode);
                //             }
                //             //finding vendor code is exists in job with Running status and store in array
                //             _.forEach(runningjobs, function (rjob) {
                //                 var hasmultipleVendorCode1 = _.filter(noMultipleRunningVendors, function (o) {
                //                     if (o.eBillVendorCode == rjob.eBillVendorCode) return o.eBillVendorCode
                //                 })
                //                 hasmultipleVendorCode = hasmultipleVendorCode.concat(hasmultipleVendorCode1);
                //             });
                //             var runningVendorExist = _.filter(hasmultipleVendorCode, function (y) {
                //                 return y.eBillVendorCode == cjob.eBillVendorCode
                //             })

                //             // if (runningVendorExist.length > 0) {
                //             //     return;
                //             // }

                //             if (validCount != 0) {
                //                 if (runningVendorExist.length >= validCount) {
                //                     return;
                //                 }

                //             }

                //             if (multiLogins) {
                //                 if (runningjobs.length != 0) {
                //                     let runningJobsForThisVendor = _.filter(runningjobs, function (rjob) {
                //                         return rjob.eBillVendorCode == cjob.eBillVendorCode;
                //                     });

                //                     if (runningJobsForThisVendor.length > 0) {
                //                         let isSameCredenials = _.filter(runningJobsForThisVendor, function (ejob) {
                //                             return cjob.Userid == ejob.Userid
                //                         });
                //                         console.log(isSameCredenials.length, "isSameCredenials.length")
                //                         if (isSameCredenials.length > 0) {
                //                             return;
                //                         }
                //                     }
                //                 }
                //                 runningjobs.push(cjob);
                //             }

                //             job.findOne({
                //                 _id: cjob._id,
                //                 status: 'Pending'
                //             }, function (err, doc) {
                //                 if (err) {
                //                     console.log(err);
                //                 } else {
                //                     if (doc) {
                //                         if ("status" in doc) {
                //                             doc.status = 'Running';
                //                             doc.startedAt = new Date();

                //                             var currentdoc = doc._doc;
                //                             doc.save(function (err) {

                //                                 if (!err) {
                //                                     // console.dir(serverConfigs.ieVendors);
                //                                     // console.dir(currentdoc.eBillVendorCode);
                //                                     var isiewebsite = _.filter(configDataRes[0].ieVendors, function (o) {
                //                                         if (o.eBillVendorCode == currentdoc.eBillVendorCode) return o
                //                                     })
                //                                     if (isiewebsite[0]) {

                //                                         console.log('IEWebsite');
                //                                         childprocessjobie(doc, configDataRes);
                //                                     } else {
                //                                         childprocessjob(doc, configDataRes);
                //                                     }

                //                                 } else {
                //                                     console.log(err);
                //                                 }
                //                             });

                //                         }
                //                     }
                //                 }
                //             });


                //         });
                //     }
                //     // console.log(jobs);

                // });
















            }
        });

    },
    dbBackup: function () {
        const backup = require('mongodb-backup');
        //To backup database at 11:59pm every day, 
        //cron.schedule("59 23 * * *", function () {
        cron.schedule("0 0 * * SUN", function () {

            //cron.schedule("*/2    ", function () {
            console.log("Running Cron Job for DB Backup");
            let date = new Date();
            let backupFolder = "../dbbackupsalvo/backup-db-" + date.valueOf();

            global.env = global.env || 'dev';
            const uridb = "mongodb://" + serverConfigs.dbConfig[global.env].mongodb.username + ":" + serverConfigs.dbConfig[global.env].mongodb.password + "@" + serverConfigs.dbConfig[global.env].mongodb.hosts[0] + "/" + serverConfigs.dbConfig[global.env].mongodb.name;
            const uridbdev = "mongodb://" + serverConfigs.dbConfig[global.env].mongodb.hosts[0] + "/" + serverConfigs.dbConfig[global.env].mongodb.name;


            backup({
                uri: uridb,
                root: backupFolder //"__dirname",
            });
            clearFilesFn();

        });
    },
    archiveJob: function () {

        //To Archive database at 1:00am every day, 
        cron.schedule("0 1 * * *", function () {
            //cron.schedule("* * * * *", function () {
            //cron.schedule("*/2    ", function () {
            console.log("Running Cron Job for Archive db");
            runArchive();
        });
    },
    setPendingJob: async function () {
        //every 5 min
        cron.schedule('*/5 * * * *', async function () {
            try {

                try {

                    var jobs = await job.find({
                        status: 'Running'
                    });
                    if (jobs.length != 0) {

                        _.forEach(jobs, async function (doc) {

                            var currentwebsite = _.filter(websitedata, function (o) {
                                if (o.eBillVendorCode == doc.eBillVendorCode) return o
                            })
                            if (currentwebsite[0]) {
                                currentwebsite = currentwebsite[0];
                            }
                            fs.access('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '-input.json', async (err) => {
                                if (err) {
                                    console.log("The file does not exist.", doc._id);
                                    try {
                                        if (doc.pid) {
                                            killProcess(doc.pid)
                                        }
                                        await job.findOneAndUpdate({ _id: new ObjectID(doc._id) }, { status: 'Pending' });
                                    }
                                    catch (e) {
                                        console.log(e)
                                    }
                                }
                            });
                        });
                    }

                } catch (err) {
                    console.log(err)
                }


                // job.find({
                //     status: 'Running'
                // }, async function (errJob, jobs) {

                //     if (jobs.length != 0) {

                //         _.forEach(jobs, async function (doc) {

                //             var currentwebsite = _.filter(websitedata, function (o) {
                //                 if (o.eBillVendorCode == doc.eBillVendorCode) return o
                //             })
                //             if (currentwebsite[0]) {
                //                 currentwebsite = currentwebsite[0];
                //             }
                //             fs.access('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '-input.json', async (err) => {
                //                 if (err) {
                //                     console.log("The file does not exist.", doc._id);
                //                     try {
                //                         if (doc.pid) {
                //                             killProcess(doc.pid)
                //                         }
                //                         await job.findOneAndUpdate({ _id: ObjectID(doc._id) }, { status: 'Pending' });
                //                     }
                //                     catch (e) {
                //                         console.log(e)
                //                     }
                //                 }
                //             });
                //         });
                //     }


                // });





            } catch (err) {
                console.log(err)
            }
        });
    },
    setRerunJob: async function () {
        let configDataRes = await configData();
        if (configDataRes.length != 0) {
            cron.schedule('*/5 * * * *', async function () {
                try {
                    let filterObj = {
                        eBillVendorCode: { $in: configDataRes[0].rerunCronJobs },
                        rerunerror: { $exists: false },
                        errorlist: { $exists: true },
                        status: 'Done',
                        cronrerun: { $exists: false },
                        ledesfile: { $exists: false }
                    };

                    try {
                        var jobs = await job.find(filterObj);
                        console.log(jobs.length, "jobs.length")
                        if (jobs.length != 0) {
                            _.forEach(jobs, async function (doc) {
                                try {
                                    let filter = {
                                        cronrerun: true
                                    };
                                    if (doc.errorlist.length == 1) {

                                        if (doc.errorlist[0].error.includes("website") || doc.errorlist[0].error.includes("error") || doc.errorlist[0].error.includes("navigation") || doc.errorlist[0].error.includes("Node") || doc.errorlist[0].error.includes("HTMLElement") || doc.errorlist[0].error.includes("Failed")) {
                                            filter['status'] = 'Pending';
                                        } else {
                                            filter['rerunerror'] = true;
                                            filter['status'] = 'Pending';
                                        }
                                    }
                                    if (doc.errorlist.length > 1) {
                                        filter['rerunerror'] = true;
                                        filter['status'] = 'Pending';

                                    }

                                    await job.findOneAndUpdate({ _id: new ObjectID(doc._id) }, filter);
                                }
                                catch (e) {
                                    console.log(e)
                                }
                            });
                        }
                    } catch (err) {
                        console.log(err, "err");
                    }


                    // job.find(filterObj, async function (errJob, jobs) {
                    //     console.log(jobs.length, "jobs.length")
                    //     if (jobs.length != 0) {
                    //         _.forEach(jobs, async function (doc) {
                    //             try {
                    //                 let filter = {
                    //                     cronrerun: true
                    //                 };
                    //                 if (doc.errorlist.length == 1) {

                    //                     if (doc.errorlist[0].error.includes("website") || doc.errorlist[0].error.includes("error") || doc.errorlist[0].error.includes("navigation") || doc.errorlist[0].error.includes("Node") || doc.errorlist[0].error.includes("HTMLElement") || doc.errorlist[0].error.includes("Failed")) {
                    //                         filter['status'] = 'Pending';
                    //                     } else {
                    //                         filter['rerunerror'] = true;
                    //                         filter['status'] = 'Pending';
                    //                     }
                    //                 }
                    //                 if (doc.errorlist.length > 1) {
                    //                     filter['rerunerror'] = true;
                    //                     filter['status'] = 'Pending';

                    //                 }

                    //                 await job.findOneAndUpdate({ _id: ObjectID(doc._id) }, filter);
                    //             }
                    //             catch (e) {
                    //                 console.log(e)
                    //             }
                    //         });
                    //     }

                    // });



                }
                catch (err) {
                    console.log(err, "err");

                }
            });
        }
    },
    settimeOutJob: async function () {
        //every 5 min
        cron.schedule('*/5 * * * *', function () {
            setTimeOutJobFn();

        });
    },
    cleanTemp: async function () {

        //every 10 min
        cron.schedule('*/10 * * * *', async function () {
            //  0 * * * *
            try {



                try {
                    var jobs = await job.find({
                        $or: [{
                            status: 'Pending'
                        }, {
                            status: 'Running'
                        }]
                    });

                    if (jobs.length == 0) {
                        nrc.run(path.resolve(__dirname, '../..', "cleartemp.cmd")).then(function (exitCodes) {
                            console.log(exitCodes)
                        }, function (err) {
                            console.log(err)
                        });
                    }
                } catch (err) {
                    console.log(err.message)
                }



                // job.find({
                //     $or: [{
                //         status: 'Pending'
                //     }, {
                //         status: 'Running'
                //     }]
                // }, function (err, jobs) {
                //     if (err) {
                //         console.log(err);
                //     }
                //     console.log(jobs.length, "obs.length")
                //     if (jobs.length == 0) {
                //         nrc.run(path.resolve(__dirname, '../..', "cleartemp.cmd")).then(function (exitCodes) {
                //             console.log(exitCodes)
                //         }, function (err) {
                //             console.log(err)
                //         });
                //     }
                // });





            } catch (err) {
                console.log(err.message)
            }

        });
    }


}

function addErrorTypeFn(doc, configDataRes) {


    if (configDataRes.length != 0) {
        /**
         * Check and prepare Error Types 
         */
        //if status is error and error list is empty
        if (doc.status == 'Error' && doc.errorlist.length == 0) {
            doc.ErrorType = 'System Error';
        }
        if (doc.errorlist) {
            if (doc.errorlist.length != 0) {
                var systemErrors = configDataRes[0].errorTypes;
                var checkSystemError = doc.errorlist.filter(item => {
                    return systemErrors.includes(item.error);
                });
                doc.ErrorType = 'System Error';
                if (checkSystemError.length == 0) {
                    doc.ErrorType = doc.ledesfile ? 'Submission Error' : 'Status Error';
                }
            }
        }
        doc['JobType'] = doc.ledesfile ? 'Submission' : 'Status';
        //31-08-2020
        if (doc['rerunerror']) {
            //only for status jobs..
            if (doc['JobType'] == 'Status') {
                try {
                    if (doc.errorlist) {
                        var chkError = [];
                        chkError = doc.errorlist.filter(item => {
                            return ['Login Failed', 'Acuity website not loaded', 'Counsellink website not loaded', 'Website Not Working'].includes(item.error);
                        });
                        if (chkError.length > 0) {
                            doc.output = doc.oldoutput ? doc.oldoutput : doc.output;
                        }
                    }

                } catch (err) {
                    console.log(err.message, "rerun");
                }

            }

        }
    }

}
/**********************************************************************************************************************************************
 * 4. To get details of child process jobs
 **********************************************************************************************************************************************/

function childprocessjob(doc, configDataRes) {

    try {
        //  console.log(doc._id);
        var currentwebsite = _.filter(websitedata, function (o) {
            if (o.eBillVendorCode == doc.eBillVendorCode) return o
        })
        if (currentwebsite[0]) {
            currentwebsite = currentwebsite[0];
        }
        const child_script_path = './Jobs/' + currentwebsite.filename + '.js';

        fs.promises.mkdir('./output/' + currentwebsite.outputfolder + '/' + doc._id, {
            recursive: true
        }).catch(console.error);

        var inputfile = {
            "login-url": doc.URL || currentwebsite.url,
            "user-id": doc.Userid || currentwebsite.userID,
            "pswd": doc.Password || currentwebsite.password,
            "reviewedinvoices": doc.reviewedinvoices || [],
            "rejectedinvoices": doc.rejectedinvoices || []
        };
        //  console.log(doc.ledesfile);
        if (doc.ledesfile) {
            inputfile.ledesfilepath = './uploads/' + currentwebsite.eBillVendorCode + '/' + doc.ledesfile;
        }
        if (doc.attachments) {
            // inputfile.attachments = [];
            // _.forEach(doc.attachments, function (obj) {
            //     inputfile.attachments.push('./uploads/' + currentwebsite.eBillVendorCode + '/' + obj);
            // });
            inputfile.attachments = [];
            if (configDataRes[0].lineItemAttachments.includes(doc.eBillVendorCode)) {

                // || doc.eBillVendorCode == '1000000009'
                _.forEach(doc.attachments, function (obj) {

                    if (obj.attachfile) {
                        obj.attachfile = './uploads/' + currentwebsite.eBillVendorCode + '/' + obj.attachfile;

                    } else {
                        obj.attachfile = './uploads/' + currentwebsite.eBillVendorCode + '/' + obj;

                    }


                });
                inputfile.attachments = doc.attachments;

            } else {

                _.forEach(doc.attachments, function (obj) {
                    if (obj.attachfile) {
                        inputfile.attachments.push('./uploads/' + currentwebsite.eBillVendorCode + '/' + obj.attachfile);

                    } else {
                        inputfile.attachments.push('./uploads/' + currentwebsite.eBillVendorCode + '/' + obj);

                    }

                });

            }
        }
        if (doc.isfinal) {
            inputfile.isfinal = true;
        }
        if (doc.istest) {
            inputfile.istest = true;
        }
        if (doc.deleteinvoice) {
            inputfile.deleteinvoice = true;
        }
        if (doc.rerunerror) {
            inputfile.rerunerror = true;
        }

        // console.log(inputfile);
        let data = JSON.stringify(inputfile, null, 2);
        // console.log(data,"-------------------------");

        fs.writeFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '-input.json', data, (err) => {
            if (err) throw err;
            // console.log('Data written to file');
            const child_argv = [];
            child_argv.push('-OUTPUT[./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '.json]');
            child_argv.push('-TO[60]');
            child_argv.push('-DFILE[./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + ']');
            child_argv.push('-LOG[./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '_log.log]');
            if (doc.isvisual) {
                child_argv.push('-VISUAL');
            }
            if (doc.rerunerror) {
                child_argv.push('-RERUN');
            }
            if (configDataRes[0].runParallel) {
                let parallelJobs = [];
                parallelJobs = _.filter(configDataRes[0].runParallel, function (item) {
                    return item.eBillVendorCode == doc.eBillVendorCode;
                });
                let multiBrowserVendor = [];
                multiBrowserVendor = _.filter(configDataRes[0].multiBrowsers, function (item) {
                    return item.eBillVendorCode == doc.eBillVendorCode;
                });
                if (parallelJobs.length != 0) {

                    if (parallelJobs[0].split > 1) {
                        child_argv.push('-SPLIT[' + parallelJobs[0].split + ']');
                        if (multiBrowserVendor.length != 0) {
                            child_argv.push('-ISBROWSER');
                        } else {
                            child_argv.push('-PARALLEL');
                        }
                    }

                }
            }


            const child_execArgv = [
                '--use-strict'
            ]
            if (doc.ledesfile) {
                child_argv.push('-PROCESS_SUBMIT_BATCH[./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '-input.json]')
                // inputfile.ledesfile='./uploads/'+doc.ledesfile;
            } else {
                child_argv.push('-PROCESS_STATUS_BATCH[./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '-input.json]')
            }
            console.log(child_script_path);
            console.log(child_argv);
            var child = child_process.fork(child_script_path, child_argv, {
                detached: true

            });
            savePid(child.pid, doc._id);

            // isrunning(child.pid);
            try {
                child.on('SIGHUP', function (signal) {
                    console.log('Got SIGHUP signal.', signal);
                });
                child.on('error', (code) => {
                    console.log(`child process error all stdio with code ${code}`);
                });
                child.on('close', (code) => {
                    console.log(`child process close all stdio with code ${code}`);
                });

                child.on('exit', (code) => {
                    console.log(`child process exited with code ${code}`);
                });

                child.on('disconnect', (code) => {
                    console.log(`child process disconnect with code ${code}`);
                    try {
                        fs.readFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '.json', function read(err, data) {
                            if (err) {
                                processFile(null, 'Error', 'Json File not Saved' + err,doc);
                                //throw err;
                            } else {
                                try {
                                    let content = JSON.parse(data);
                                    // Invoke the next step here however you like
                                    // console.log(content); // Put all of the code here (not the best solution)
                                    processFile(content, 'Done', 'File Saved',doc);
                                } catch (err) {
                                    processFile(null, 'Error', 'Json File Saved' + err,document,doc);
                                }
                            } // Or put the next step in a function and invoke it
                        });
                    } catch (err) {
                        processFile(null, 'Error', 'Json read File issue' + err,doc);
                    }

                    async function processFile(content, status, comments,doc) {


                        try {

                            var doc = await job.findOne({
                                _id: doc._id
                            });

                            doc.status = status;
                            doc.endedAt = new Date();
                            doc.isActive = false;
                            doc.comments = comments;
                            doc.output = content;
                            const date1 = new Date(doc.startedAt);
                            const date2 = new Date(doc.endedAt);
                            const diffTime = Math.abs(date2 - date1) / 1000;
                            doc.timeelapsed = secondsminutes(diffTime);
                            doc.errorlist = doc.output != null ? doc.output[doc.output.length - 1].errors : [];
                            // console.log(doc.errorlist);


                            addErrorTypeFn(doc, configDataRes);
                            fs.readFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '_log.log', 'utf-8', function (err, data) {
                                if (err) {
                                    doc.save();
                                    console.log(err);
                                }
                                if (doc.ledesfile) {
                                    doc.SubmissionLog = data || '';
                                    // if (doc.errorlist.length != 0) {
                                    //     doc.status = "Error";
                                    // }
                                    // console.log(data);
                                } else {
                                    doc.logs = data || '';
                                }
                                doc.save();
                            });

                        } catch (err) {
                            console.log(err);
                        }


                        // job.findOne({
                        //     _id: doc._id
                        // }, function (err, doc) {
                        //     if (err) {
                        //         console.log(err);
                        //     } else {
                        //         doc.status = status;
                        //         doc.endedAt = new Date();
                        //         doc.isActive = false;
                        //         doc.comments = comments;
                        //         doc.output = content;
                        //         const date1 = new Date(doc.startedAt);
                        //         const date2 = new Date(doc.endedAt);
                        //         const diffTime = Math.abs(date2 - date1) / 1000;
                        //         doc.timeelapsed = secondsminutes(diffTime);
                        //         doc.errorlist = doc.output != null ? doc.output[doc.output.length - 1].errors : [];
                        //         // console.log(doc.errorlist);


                        //         addErrorTypeFn(doc, configDataRes);
                        //         fs.readFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '_log.log', 'utf-8', function (err, data) {
                        //             if (err) {
                        //                 doc.save();
                        //                 console.log(err);
                        //             }
                        //             if (doc.ledesfile) {
                        //                 doc.SubmissionLog = data || '';
                        //                 // if (doc.errorlist.length != 0) {
                        //                 //     doc.status = "Error";
                        //                 // }
                        //                 // console.log(data);
                        //             } else {
                        //                 doc.logs = data || '';
                        //             }
                        //             doc.save();
                        //         });

                        //     }
                        // });



                    }
                });
            } catch (err) {
                console.log(err, "err");
            }
        });
    } catch (err) {
        console.log(err, "err");
    }

}

async function savePid(pid, _id) {


    try {

        var result = await job.findOneAndUpdate({ _id: new ObjectID(_id) }, { pid: pid });

    } catch (err) {
        console.log(err)
    }


    // job.findOneAndUpdate({ _id: ObjectID(_id) }, { pid: pid }, function (err, result) {
    //     if (err) {
    //         console.log(err)
    //     } else {
    //     }
    // });
}
/**********************************************************************************************************************************************
 * 5. To get details of child process jobs
 **********************************************************************************************************************************************/

function childprocessjobie(doc, configDataRes) {

    if (configDataRes.length != 0) {
        try {
            //  console.log(doc._id);
            var currentwebsite = _.filter(websitedata, function (o) {
                if (o.eBillVendorCode == doc.eBillVendorCode) return o
            })
            if (currentwebsite[0]) {
                currentwebsite = currentwebsite[0];
            }
            const child_script_path = './' + currentwebsite.filename + '.exe';

            fs.promises.mkdir('./output/' + currentwebsite.outputfolder + '/' + doc._id, {
                recursive: true
            }).catch(console.error);

            var inputfile = {
                "loginurl": doc.URL || currentwebsite.url,
                "userid": doc.Userid || currentwebsite.userID,
                "pswd": doc.Password || currentwebsite.password,
                "reviewedinvoices": doc.reviewedinvoices || [],
                "rejectedinvoices": doc.rejectedinvoices || []
            };
            if (doc.ledesfile) {
                inputfile.ledesfilepath = 'uploads\\' + currentwebsite.eBillVendorCode + '\\' + doc.ledesfile;
            }
            if (doc.attachments) {
                inputfile.attachments = [];
                _.forEach(doc.attachments, function (obj) {

                    inputfile.attachments.push('./uploads/' + currentwebsite.eBillVendorCode + '/' + obj.attachfile);
                });
            }
            if (doc.isfinal) {
                inputfile.isfinal = true;
            }
            if (doc.istest) {
                inputfile.istest = true;
            }
            if (doc.deleteinvoice) {
                inputfile.deleteinvoice = true;
            }
            // console.log(inputfile);
            let data = JSON.stringify(inputfile, null, 2);

            fs.writeFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '-input.json', data, (err) => {
                if (err) throw err;
                console.log('Data written to file');
                const child_argv = [];
                child_argv.push('-OUTPUT[output\\' + currentwebsite.outputfolder + '\\' + doc._id + '\\' + doc._id + '.json]');
                child_argv.push('-TO[60]');
                child_argv.push('-LOG[output\\' + currentwebsite.outputfolder + '\\' + doc._id + '\\' + doc._id + '_log]');

                const child_execArgv = [
                    '--use-strict'
                ]
                if (doc.ledesfile) {
                    child_argv.push('-PROCESS_SUBMIT_BATCH[output\\' + currentwebsite.outputfolder + '\\' + doc._id + '\\' + doc._id + '-input.json]')
                    // inputfile.ledesfile='./uploads/'+doc.ledesfile;
                } else {
                    child_argv.push('-PROCESS_STATUS_BATCH[output\\' + currentwebsite.outputfolder + '\\' + doc._id + '\\' + doc._id + '-input.json]')
                }
                console.dir(child_argv);

                var child = child_process.execFile(child_script_path, child_argv);

                savePid(child.pid, doc._id);
                try {
                    child.on('SIGHUP', function (signal) {
                        console.log('Got SIGHUP signal.', signal);
                    });
                    child.on('error', (code) => {
                        console.log(`child process error all stdio with code ${code}`);
                    });
                    child.on('close', (code) => {
                        console.log(`child process close all stdio with code ${code}`);
                    });

                    child.on('exit', (code) => {
                        console.log(`child process exited with code ${code}`);
                        try {
                            fs.readFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '.json', function read(err, data) {
                                if (err) {
                                    processFile(null, 'Error', 'Json File not Saved' + err,doc);
                                    //throw err;
                                } else {
                                    try {
                                        let content = JSON.parse(data);
                                        // Invoke the next step here however you like
                                        console.log(content); // Put all of the code here (not the best solution)
                                        processFile(content, 'Done', 'File Saved',doc);
                                    } catch (err) {
                                        processFile(null, 'Error', 'Json File Saved' + err,doc);
                                    }
                                } // Or put the next step in a function and invoke it
                            });
                        } catch (err) {
                            processFile(null, 'Error', 'Json read File issue' + err,doc);
                        }

                        async function processFile(content, status, comments,doc) {



                            try {
                                var doc = await job.findOne({
                                    _id: doc._id
                                });
                                doc.status = status;
                                doc.endedAt = new Date();
                                doc.isActive = false;
                                doc.comments = comments;
                                doc.output = content;
                                const date1 = new Date(doc.startedAt);
                                const date2 = new Date(doc.endedAt);
                                const diffTime = Math.abs(date2 - date1) / 1000;
                                doc.timeelapsed = secondsminutes(diffTime);
                                doc.errorlist = doc.output != null ? doc.output[doc.output.length - 1].errors : [];
                                // console.log(doc.errorlist);


                                addErrorTypeFn(doc, configDataRes);



                                fs.readFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '_log.log', 'utf-8', function (err, data) {
                                    if (err) {
                                        doc.save();
                                        console.log(err);
                                    }
                                    if (doc.ledesfile) {
                                        doc.SubmissionLog = data || '';
                                        doc.JobType = 'Submission';
                                        // if (doc.errorlist.length != 0) {
                                        //     doc.status = "Error";
                                        // }
                                        // console.log(data);
                                    } else {
                                        doc.logs = data || '';
                                        doc.JobType = 'Status';
                                        // console.log(data);
                                    }
                                    doc.save();
                                });

                            } catch (err) {
                                console.log(err);
                            }





                            // job.findOne({
                            //     _id: doc._id
                            // }, function (err, doc) {
                            //     if (err) {
                            //         console.log(err);
                            //     } else {
                            //         doc.status = status;
                            //         doc.endedAt = new Date();
                            //         doc.isActive = false;
                            //         doc.comments = comments;
                            //         doc.output = content;
                            //         const date1 = new Date(doc.startedAt);
                            //         const date2 = new Date(doc.endedAt);
                            //         const diffTime = Math.abs(date2 - date1) / 1000;
                            //         doc.timeelapsed = secondsminutes(diffTime);
                            //         doc.errorlist = doc.output != null ? doc.output[doc.output.length - 1].errors : [];
                            //         // console.log(doc.errorlist);


                            //         addErrorTypeFn(doc, configDataRes);



                            //         fs.readFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '_log.log', 'utf-8', function (err, data) {
                            //             if (err) {
                            //                 doc.save();
                            //                 console.log(err);
                            //             }
                            //             if (doc.ledesfile) {
                            //                 doc.SubmissionLog = data || '';
                            //                 doc.JobType = 'Submission';
                            //                 // if (doc.errorlist.length != 0) {
                            //                 //     doc.status = "Error";
                            //                 // }
                            //                 // console.log(data);
                            //             } else {
                            //                 doc.logs = data || '';
                            //                 doc.JobType = 'Status';
                            //                 // console.log(data);
                            //             }
                            //             doc.save();
                            //         });

                            //     }
                            // });
                        }
                    });

                    child.on('disconnect', (code) => {
                        console.log(`child process disconnect with code ${code}`);
                        try {
                            fs.readFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '.json', function read(err, data) {
                                if (err) {
                                    processFile(null, 'Error', 'Json File not Saved' + err,doc);
                                    //throw err;
                                } else {
                                    try {
                                        let content = JSON.parse(data);
                                        // Invoke the next step here however you like
                                        console.log(content); // Put all of the code here (not the best solution)
                                        processFile(content, 'Done', 'File Saved',doc);
                                    } catch (err) {
                                        processFile(null, 'Error', 'Json File Saved' + err,doc);
                                    }
                                } // Or put the next step in a function and invoke it
                            });
                        } catch (err) {
                            processFile(null, 'Error', 'Json read File issue' + err,doc);
                        }

                        async function processFile(content, status, comments,doc) {
try{
    var doc = await  job.findOne({
        _id: doc._id
    });
    doc.status = status;
    doc.endedAt = new Date();
    doc.isActive = false;
    doc.comments = comments;
    doc.output = content;
    const date1 = new Date(doc.startedAt);
    const date2 = new Date(doc.endedAt);
    const diffTime = Math.abs(date2 - date1) / 1000;
    doc.timeelapsed = secondsminutes(diffTime);
    doc.errorlist = doc.output != null ? doc.output[doc.output.length - 1].errors : [];
    console.log(doc.errorlist, "--------------");

    addErrorTypeFn(doc, configDataRes);

    fs.readFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '_log.log', 'utf-8', function (err, data) {
        if (err) {
            doc.save();
            console.log(err);
        }
        if (doc.ledesfile) {
            doc.SubmissionLog = data || '';
            doc.JobType = 'Submission';
            // if (doc.errorlist.length != 0) {
            //     doc.status = "Error";
            // }
            console.log(data);
        } else {
            doc.logs = data || '';
            doc.JobType = 'Status';
            console.log(data);
        }
        doc.save();
    });
}catch(err){
    console.log(err);
}


                            // job.findOne({
                            //     _id: doc._id
                            // }, function (err, doc) {
                            //     if (err) {
                            //         console.log(err);
                            //     } else {
                            //         doc.status = status;
                            //         doc.endedAt = new Date();
                            //         doc.isActive = false;
                            //         doc.comments = comments;
                            //         doc.output = content;
                            //         const date1 = new Date(doc.startedAt);
                            //         const date2 = new Date(doc.endedAt);
                            //         const diffTime = Math.abs(date2 - date1) / 1000;
                            //         doc.timeelapsed = secondsminutes(diffTime);
                            //         doc.errorlist = doc.output != null ? doc.output[doc.output.length - 1].errors : [];
                            //         console.log(doc.errorlist, "--------------");

                            //         addErrorTypeFn(doc, configDataRes);

                            //         fs.readFile('./output/' + currentwebsite.outputfolder + '/' + doc._id + '/' + doc._id + '_log.log', 'utf-8', function (err, data) {
                            //             if (err) {
                            //                 doc.save();
                            //                 console.log(err);
                            //             }
                            //             if (doc.ledesfile) {
                            //                 doc.SubmissionLog = data || '';
                            //                 doc.JobType = 'Submission';
                            //                 // if (doc.errorlist.length != 0) {
                            //                 //     doc.status = "Error";
                            //                 // }
                            //                 console.log(data);
                            //             } else {
                            //                 doc.logs = data || '';
                            //                 doc.JobType = 'Status';
                            //                 console.log(data);
                            //             }
                            //             doc.save();
                            //         });

                            //     }
                            // });



                        }
                    });
                } catch (err) {
                    console.log(err, "err");
                }
            });
        } catch (err) {
            console.log(err, "err");
        }
    }

}
/**********************************************************************************************************************************************
 * 6. To get details of child process jobs
 **********************************************************************************************************************************************/
function secondsminutes(time) {
    var hr = ~~(time / 3600);
    var min = ~~((time % 3600) / 60);
    var sec = time % 60;
    var sec_min = "";
    if (hr > 0) {
        sec_min += "" + hr + ":" + (min < 10 ? "0" : "");
    }
    sec_min += "" + min + ":" + (sec < 10 ? "0" : "");
    sec_min += "" + sec;
    return sec_min;
}