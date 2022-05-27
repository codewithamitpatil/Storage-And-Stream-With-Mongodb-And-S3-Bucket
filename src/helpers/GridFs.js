import mongoose from "mongoose";
import mongodb from "mongodb";
import { GridFsStorage } from "multer-gridfs-storage";
import Grid from "gridfs-stream";

export let gfs1;
export let bucket1;
export let gfs2;
export let bucket2;

//gridfs object
const GridFSBucket = mongodb.GridFSBucket;

// intialize bucket and grid connection
export const GridFun = () => {
	gfs1 = Grid(mongoose.connection.db, mongoose.mongo);
	gfs1.collection("photos");
	bucket1 = new GridFSBucket(mongoose.connection.db, {
		bucketName: "photos",
	});

	gfs2 = Grid(mongoose.connection.db, mongoose.mongo);
	gfs2.collection("videos");
	bucket2 = new GridFSBucket(mongoose.connection.db, {
		bucketName: "videos",
	});
};

// once the connection is esatblished
// then use
mongoose.connection.on("open", async () => {
	GridFun();
});
