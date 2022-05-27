import mongoose from "mongoose";

import config from '../../config/config.js';

function db() {
    mongoose.connect(config.mongoUrl);
    return mongoose.connection;
}

export default db;