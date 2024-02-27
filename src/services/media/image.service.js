const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
    const isImage = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    console.log('isImage ',isImage)
    if (isImage) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only image files are allowed.'), false); // Reject the file
    }
}

const upload = multer({
  fileFilter,
  storage : storage
});

module.exports = upload;