import multer from "multer";

const stroage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

export const singleUpload = multer({ storage: stroage }).single("photo")