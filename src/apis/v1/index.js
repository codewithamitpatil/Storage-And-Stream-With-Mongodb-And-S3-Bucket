import express from "express";
import multer, { MulterError } from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import crypto from "crypto";
import path from "path";
import filePath from "../../middlewares/filePath.js";
import config from "../../../config/config.js";
import mongoose from "mongoose";
import mongodb from "mongodb";

import videoRoutes from "./video.js";

import { bucket1, bucket2, gfs1, gfs2 } from "../../helpers/GridFs.js";

import { GridUpload } from "../../helpers/GridFsStorage.js";

import { uploadMiddleware, deleteImage } from "../../middlewares/uploadImg.js";

const router = express.Router();

// initialize video routes
//router.use("/video", videoRoutes);

// upload profile
router.post("/img", filePath, async (req, res, next) => {
	console.log("uploaded file: ", req.file);
	return res.send(req.file);
});

// upload profile
router.post("/profile", uploadMiddleware, async (req, res, next) => {
	const { file } = req;
	// and the id of that new image file
	const { id } = file;
	// we can set other, smaller file size limits on routes that use the upload middleware
	// set this and the multer file size limit to whatever fits your project
	if (file.size > 5000000) {
		// if the file is too large, delete it and send an error
		deleteImage(res, id);
		return res.status(400).send("file may not exceed 5mb");
	}
	console.log("uploaded file: ", file);
	return res.send(file.id);
});

// get all files
router.get("/profile", async (req, res, next) => {
	gfs1.files.find().toArray((err, files) => {
		// Check if files
		if (!files || files.length === 0) {
			res.json({
				files: false,
			});
		} else {
			files.map((file) => {
				if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
					file.isImage = true;
				} else {
					file.isImage = false;
				}
			});
			res.json({
				files: files,
			});
		}
	});
});

router.get("/profile/:id", async ({ params: { id } }, res, next) => {
	if (!id || id === "undefined") return;
	res.status(400).send({ message: "no files exist", status: 400 });
	const _id = new mongoose.Types.ObjectId(id);
	bucket1
		.find({
			_id,
		})
		.toArray((err, files) => {
			if (!files || files.length === 0) {
				return res.status(400).send({ message: "no files exist", status: 400 });
			}
			// to stream image from mongodb to client
			let downloadStream = bucket1.openDownloadStream(_id).pipe(res);
		});
});

// delete image
router.delete("/profile/:id", async ({ params: { id } }, res, next) => {
	deleteImage(res, id);
});

export default router;
