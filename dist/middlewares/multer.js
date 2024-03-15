import multer from "multer";
import { v4 as uuid } from 'uuid';
import { upload_path } from '../app.js';
const stroage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, upload_path);
    },
    filename: function (req, file, cb) {
        const id = uuid();
        const extName = file.originalname.split(".")[1];
        cb(null, `${id}.${extName}`);
    },
});
export const singleUpload = multer({ storage: stroage }).single("photo");
