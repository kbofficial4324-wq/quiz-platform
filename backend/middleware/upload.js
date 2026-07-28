import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(
      "📂 Upload destination:",
      uploadDir
    );

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const filename =
      Date.now() + extension;

    console.log(
      "📄 Upload filename:",
      filename
    );

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  console.log(
    "📄 Incoming file:",
    file.originalname
  );

  console.log(
    "📄 MIME:",
    file.mimetype
  );

  if (
    file.mimetype ===
    "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF files are allowed"
      ),
      false
    );
  }
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;