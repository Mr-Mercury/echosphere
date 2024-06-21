import { ExpressAuth, getSession } from "@auth/express"
import express from "express";

require('dotenv').config();

import { socketUserCheck } from './lib/socketUserCheck.js';
import { db } from "./lib/messageDbConnection.js";

//TODO: Env variables for port to enable horizontal scaling 
const port = 4000;
const app = express();

const AuthConfig = {
    secret: process.env.AUTH_SECRET,
}


app.use(express.json());

app.listen(port, () => {
    console.log('listening on port ' + port);

})