import multer from "multer";

export const multerUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    console.log(file.mimetype);

    cb(null, true); 
  },
});