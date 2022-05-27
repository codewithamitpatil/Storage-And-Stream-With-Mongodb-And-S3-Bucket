import express from "express";
import filePath from "../../middlewares/filePath.js";
import config from "../../../config/config.js";

import { SmartStream } from "../../helpers/smartStream.js";

import {
	deleteFileStream,
	getFileStream,
	uploadFile,
	s3,
} from "../../helpers/S3Bucket.js";

const router = express.Router();

// stream video
router.get("/:key", async (req, res, next) => {
	var size;
	try {
		//res.send(req.params.key);

		s3.headObject(
			{
				Bucket: config.awsconfig.bucketName,
				Key: req.params.key,
			},
			async (err, data) => {
				size = data.ContentLength;

				// const stream = s3.getObject({
				// 	Bucket: config.awsconfig.bucketName,
				// 	Key: req.params.key,
				// });

				if (req.headers.range) {
					console.log("called");
					// console.log(req.headers.range);
					let [start, end] = req.headers.range.replace(/bytes=/, "").split("-");
					const CHUNK_SIZE = 10 ** 6; // 1MB
					start = parseInt(start, 10);
					end = Math.min(start + CHUNK_SIZE, size - 1);
					console.log("start", start);
					console.log("enf", end);
					res.writeHead(206, {
						"Content-Range": `bytes ${start}-${end}/${size}`,
						"Accept-Ranges": "bytes",
						"Content-Length": end - start + 1,
						"Content-Type": "video/mp4",
					});

					const stream = new SmartStream(
						{
							Bucket: config.awsconfig.bucketName,
							Key: req.params.key,
						},
						s3,
						data.ContentLength,
						start,
						end,
						{
							start,
							end,
						}
					).pipe(res);

					// s3
					// 	.getObject({
					// 		Bucket: config.awsconfig.bucketName,
					// 		Key: req.params.key,
					// 	})
					// 	.createReadStream({
					// 		start,
					// 		end,
					// 	})
					// 	.pipe(res);
				} else {
					// console.log(size);
					// res.writeHead(200, {
					// 	"Content-Size": size,
					// 	"Content-Type": "video/mp4",
					// });
					// return stream.createReadStream().pipe(res);
				}
			}
		);
	} catch (e) {
		console.log(e);
		return res.send({
			message: "Invalid key",
			status: 400,
		});
	}
});

// upload files to s3
router.post("/", filePath, async (req, res, next) => {
	try {
		// extension check
		if (req.file.mimetype !== "video/mp4" && req.file.mimetype !== "image/webp") {
			return res.send({
				message: "Only mp4 and webp videos are allowed",
				status: 400,
			});
		}

		// file size check
		// it should be less than 5mb
		if (req.file.size > 3000000) {
			return res.send({
				message: "File size should not be more than 5mb",
				status: 400,
			});
		}

		await uploadFile(config.awsconfig.bucketName, req.file);
		res.send({
			message: "File uploaded successfully",
			status: 200,
			filename: req.file.filename,
		});
	} catch (e) {
		console.log(e);
	}
});

export default router;

// const {
//     createReadStream,
//     stat
// } = require('fs');
// const http = require('http');
// const {
//     promisify
// } = require('util');

// const port = 5006;
// const f1 = "sample.mp4";
// const fileInfo = promisify(stat);

// const str = "i love vaishanvi";

// http.createServer(async (req, res) => {
//     const {
//         size
//     } = await fileInfo(f1);

//     const range = req.headers.range;

//     if (range) {
//         let [start, end] = range.replace(/bytes=/, "").split('-');
//         const CHUNK_SIZE = 10 ** 6; // 1MB
//         start = parseInt(start, 10);
//         end = Math.min(start + CHUNK_SIZE, size - 1);

//         res.writeHead(206, {
// "Content-Range": `bytes ${start}-${end}/${size}`,
// "Accept-Ranges": "bytes",
// "Content-Length": end - start + 1,
// "Content-Type": "video/mp4",
//         });
//         const stream = createReadStream(f1, {
//             start,
//             end
//         });

//         stream.pipe(res)
//     } else {
//         const stream = createReadStream(f1);
// res.writeHead(200, {
//     'Content-Size': size,
//     'Content-Type': 'video/mp4'
// })

//         stream.pipe(res);

//     }

// }).listen(port, () => {
//     console.log(`Server is running on port ${port}`)
// });
