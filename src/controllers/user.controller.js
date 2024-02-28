const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { FileQueue } = require("./../models")
const { userService,imageService,s3Service } = require('../services');
const uploadMultipleFiles = imageService.array("uploader")
const Queue = require('bull');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});
const uploadQueueFile=(data)=>{
  return new Promise(async(resolve,reject)=>{
    resolve(data)
    console.log("data ===>",data)
    let file = data.file
    let id = data.id
    let media = await s3Service.uploadImageToS3(file)
    console.log("media ===> ",media)
  })
  
}
const uploadFiles = catchAsync(async (req, res) => {
  uploadMultipleFiles(req, res, async (err) => {
    try {
      if (err) {
        return res.status(httpStatus.BAD_REQUEST).send({ message: err.message });
      }
      let files = req.files
      console.log("files ",files)
      if(!files) {
        return res.status(httpStatus.BAD_REQUEST).send({ message: "No files are selected" });
      }
      if(files.length === 0) {
        return res.status(httpStatus.BAD_REQUEST).send({ message: "No files are selected" });  
      }
      const uploadFilesQueue = new Queue('uploadFiles', {
        redis: {
          host: '127.0.0.1',
          port: 6379
        }
      });
      const options = {
        delay: 60000, // 1 min in ms
        attempts: 2
      };
      for(let i=0;i<files.length;i++) {
        let file = files[i]
        let dbFile = await FileQueue.create({
          name:file.orignalName
        })
        let data = {
           file:files[i],
           id:dbFile._id
        }
        uploadFilesQueue.add(data, options);
      }
      
      uploadFilesQueue.process(async job => { 
        return await uploadQueueFile(job.data); 
      });
      let data = await FileQueue.find({})
      res.status(httpStatus.OK).send({ message: "Files are uploaded",data });
    } catch (error) {
      res.status(httpStatus.BAD_REQUEST).send({ message: error.message });
    }

  });
})

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadFiles
}
