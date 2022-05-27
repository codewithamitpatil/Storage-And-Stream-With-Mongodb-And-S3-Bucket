import express from "express";

import AWS from "aws-sdk";
import fs from "fs";

import filePath from "../../middlewares/filePath.js";
import config from "../../../config/config.js";

import { deleteFileStream, uploadFile, s3 } from "../../helpers/S3Bucket.js";

import videoRoutes from "./video.js";

const routes = express.Router();

routes.use("/video", videoRoutes);

// upload files to s3
routes.post("/upload", filePath, async (req, res, next) => {
	try {
		// extension check
		if (
			req.file.mimetype !== "image/png" &&
			req.file.mimetype !== "image/jpg" &&
			req.file.mimetype !== "image/jpng"
		) {
			return res.send({
				message: "Only Png, Jpg and Jpng images are allowed",
				status: 400,
			});
		}

		// file size check
		// it should be less than 5mb
		if (req.file.size > 500000) {
			return res.send({
				message: "File size should not be more than 5mb",
				status: 400,
			});
		}

		await uploadFile(config.awsconfig.bucketName, req.file);
		res.send({ message: "File uploaded successfully", status: 200 });
	} catch (e) {
		console.log(e);
	}
});

// stream file
routes.get("/:key", async (req, res, next) => {
	try {
		const stream = await s3.getObject(
			{
				Bucket: config.awsconfig.bucketName,
				Key: req.params.key,
			},
			(err, data) => {
				if (err) return err;
				return data;
			}
		);
		stream.createReadStream().pipe(res);
	} catch (e) {
		return res.send("sorry");
	}
});

// delete file
routes.delete("/:key", async (req, res, next) => {
	try {
		await deleteFileStream(config.awsconfig.bucketName, req.params.key);
		res.send({
			message: "File deleted successFully",
			status: 200,
		});
	} catch (e) {
		console.log(e);
	}
});

// get list

//export
export default routes;
