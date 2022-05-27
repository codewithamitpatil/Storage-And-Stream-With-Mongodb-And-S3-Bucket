import { rejects } from "assert";
import AWS from "aws-sdk";
import fs from "fs";
import { resolve } from "path";
import util from "util";

import config from "../../config/config.js";

// bucker connection
export const s3 = new AWS.S3({
	region: config.awsconfig.region,
	accessKeyId: config.awsconfig.accessKeyId,
	secretAccessKey: config.awsconfig.secretAccessKey,
});

// get list of  buckets
export async function getListOfBuckets() {
	return new Promise((resolve, reject) => {
		try {
			s3.listBuckets((err, data) => {
				// error check
				if (err) return reject(err);
				// return buckets array
				return resolve(data?.Buckets);
			});
		} catch (e) {
			return reject(e);
		}
	});
}

// get list of objects in bucket
export async function getListOfObjects(bucketName) {
	return new Promise((resolve, reject) => {
		try {
			s3.listObjects({ Bucket: bucketName }, (err, data) => {
				// error check
				if (err) return reject(err);
				// return buckets array
				return resolve(data?.Contents);
			});
		} catch (e) {
			return reject(e);
		}
	});
}

// uploads a file to s3
export function uploadFile(bucketName, file) {
	const fileStream = fs.createReadStream(file.path);
	return s3
		.upload({
			Bucket: bucketName,
			Body: fileStream,
			Key: file.filename,
		})
		.promise();
}

export function getFileStream(bucketName, fileKey) {
	try {
		return s3
			.getObject({
				Key: fileKey,
				Bucket: bucketName,
			})
			.createReadStream();
	} catch (e) {
		console.log(e.message);
	}
}

//getFileStream(config.awsconfig.bucketName, "aaa");
export function deleteFileStream(bucketName, fileKey) {
	return s3.deleteObject(
		{
			Key: fileKey,
			Bucket: bucketName,
		},
		(err) => {
			console.log(err);
		}
	);
}

export function getObjectData(bucketName, fileKey) {
	s3.headObject(
		{
			Bucket: config.awsconfig.bucketName,
			Key: "WIN_20211008_13_00_59_Pro.mp4",
		},
		(err, data) => {
			console.log(data.ContentLength);
		}
	);
}
