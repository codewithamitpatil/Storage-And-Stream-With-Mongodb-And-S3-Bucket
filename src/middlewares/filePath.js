// this is just for to get file name and
// orignal path so i can upload in
// mongodb

import multer from 'multer';

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage
});

const filePath = upload.single('file');

export default filePath;