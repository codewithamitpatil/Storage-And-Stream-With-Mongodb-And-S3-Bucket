import multer, { MulterError } from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import crypto from "crypto";
import path from "path";
import mongoose from "mongoose";

import { bucket2 } from "../helpers/GridFs.js";

import filePath from "../middlewares/filePath.js";
import config from "../../config/config.js";

const storage = new GridFsStorage({
	url: config.mongoUrl,
	file: (req, file) => {
		return new Promise((resolve, reject) => {
			const extname = path.extname(file.originalname);
			console.log(extname);
			crypto.randomBytes(16, (err, buf) => {
				if (err) {
					return reject(err);
				}

				const filename = buf.toString("hex") + path.extname(file.originalname);

				const fileInfo = {
					filename: filename,
					bucketName: "videos",
				};
				resolve(fileInfo);
			});
		});
	},
});

const store = multer({
	storage,
	limits: {
		fileSize: 20000000,
	},

	fileFilter: function (req, file, cb) {
		checkFileType(file, cb);
	},
});

export function checkFileType(file, cb) {
	const filetypes = /mp4|webp|gif/;

	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

	const mimetype = filetypes.test(file.mimetype);

	if (mimetype && extname) return cb(null, true);

	cb("filetype");
}

export const uploadMiddleware = (req, res, next) => {
	const upload = store.single("file");
	upload(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			return res.status(400).send({
				message: "sorry file is too large",
				status: 400,
			});
		} else if (err) {
			if (err === "filetype") return res.status(400).send("Image files only");
			return res.sendStatus(500);
		}

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

	bucket2.delete(_id, (err) => {
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
