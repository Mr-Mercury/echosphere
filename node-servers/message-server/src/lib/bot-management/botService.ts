import { db } from "../messages/messageDbConnection.js";
import { Server as IoServer } from 'socket.io';
import { messagePostHandler } from "../messages/message-handler.js";
import { BotConfig } from "../entities/bot-types.js";