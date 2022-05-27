import multer, { MulterError } from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import crypto from "crypto";
import path from "path";

import filePath from "../middlewares/filePath.js";
import config from "../../config/config.js";

// to uplod files in mongodb
export const GridUpload = (bucketName) => {
	const storage = new GridFsStorage({
		url: config.mongoUrl,
		file: (req, file) => {
			return new Promise((resolve, reject) => {
				const extname = path.extname(file.originalname);

				// here we can check for the extendsion
				crypto.randomBytes(16, (err, buf) => {
					if (err) {
						return reject(err);
					}
					const filename = buf.toString("hex") + path.extname(file.originalname);

					// this is most important
					const fileInfo = {
						filename: filename,
						bucketName: bucketName,
					};
					resolve(fileInfo);
				});
			});
		},
	});

	const upload = multer({
		storage,
	});

	return upload;
};
