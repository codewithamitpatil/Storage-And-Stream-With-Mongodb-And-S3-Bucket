import multer, { MulterError } from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import crypto from "crypto";
import path from "path";
import mongoose from "mongoose";

import { bucket1 } from "../helpers/GridFs.js";

import filePath from "../middlewares/filePath.js";
import config from "../../config/config.js";

const storage = new GridFsStorage({
	url: config.mongoUrl,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			const extname = path.extname(file.originalname);
			console.log(extname);
			// here we can check for the extendsion
			crypto.randomBytes(16, (err, buf) => {
				if (err) {
					return reject(err);
				}

				const filename = buf.toString("hex") + path.extname(file.originalname);

				// this is most important
				const fileInfo = {
					filename: filename,
					bucketName: "photos",
				};
				resolve(fileInfo);
			});
		});
	},
});

// for file upload
const store = multer({
	storage,
	// limit the size to 20mb for any files coming in
	limits: {
		fileSize: 20000000,
	},
	// filer out invalid filetypes
	fileFilter: function (req, file, cb) {
		checkFileType(file, cb);
	},
});

export function checkFileType(file, cb) {
	const filetypes = /jpeg|jpg|png|gif/;
	//check the file extention
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) return cb(null, true);

	cb("filetype");
}

export const uploadMiddleware = (req, res, next) => {
	const upload = store.single("file");
	upload(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			console.log(err);
			return res.status(400).send("File too large");
		} else if (err) {
			if (err === "filetype") return res.status(400).send("Image files only");
			return res.sendStatus(500);
		}
		// all good, proceed
		next();
	});
};

export const deleteImage = (res, id) => {
	if (!id || id === "undefined")
		return res.status(400).send({
			message: "sorry we could not find ant image with this id",
			status: 400,
		});

	const _id = new mongoose.Types.ObjectId(id);

	bucket1.delete(_id, (err) => {
		if (err)
			return res.status(400).send({
				message: "sorry we could not find ant image with this id",
				status: 400,
			});
	});
	return res.status(200).send({
		message: "image deleted successfully",
		status: 200,
	});
};
