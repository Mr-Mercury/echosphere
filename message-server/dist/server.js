"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
require('dotenv').config();
const { ExpressAuth, getSession } = require('./message-auth');
const socketUserCheck = require('./lib/socketUserCheck');
const db = require('./lib/messageDbConnection');
const port = process.env.PORT;
const app = express();
const AuthConfig = {
    secret: process.env.AUTH_SECRET,
};
app.use(express.json());
app.listen(port, () => {
    console.log('listening on port ' + port);
});
