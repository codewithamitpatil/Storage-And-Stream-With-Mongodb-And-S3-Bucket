import mongoose from "mongoose";
import express from "express";
import cors from "cors";

import config from "../config/config.js";
import db from "./db/db.js";

// routes
import routerv1 from "./apis/v1/index.js";
import routerv2 from "./apis/v2/index.js";

const port = config.port;
const app = express();

// enable cors
app.use(cors("*"));

// parse json
app.use(express.json());

// parse urlencoded data
app.use(
	express.urlencoded({
		extended: true,
	})
);

// include routes
//app.use("", routes);
app.use("/v1", routerv1);
app.use("/v2", routerv2);

const dbCon = () => {
	db()
		.on("error", (error) => {
			console.log("mongodb connection failed", error);
		})
		.on("disconnect", () => {
			console.log("mongodb disconnect");
		})
		.once("open", () => {
			console.log("mongodb connected successfully");
			//   GridFun();
			server();
		});
};

dbCon();

const server = () => {
	app.listen(port, () => {
		console.log(`Server is listening on port :: ${port}`);
	});
};
