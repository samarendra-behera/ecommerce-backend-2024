import multer from "multer";
import { v4 as uuid } from 'uuid';
const stroage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        const id = uuid();
        const extName = file.originalname.split(".")[1];
        cb(null, `${id}.${extName}`);
    },
});
export const singleUpload = multer({ storage: stroage }).single("photo");
//# sourceMappingURL=multer.js.map