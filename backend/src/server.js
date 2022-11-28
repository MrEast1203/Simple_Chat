import http from 'http';
import express from 'express';
import dotenv from 'dotenv-defaults';
import mongoose from 'mongoose';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import mongo from './mongo'; //Connecting DB
import wsConnect from './wsConnect';

mongo.connect();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const db = mongoose.connection;
db.once('open', () => {
  console.log('MongoDB connected!');
  wss.on('connection', (ws) => {
    console.log('wss connection');
    ws.id = uuidv4();
    ws.box = '';
    //wsConnect.initData(ws);
    ws.onmessage = wsConnect.onMessage(wss, ws);
    //wsConnect.onMessage(ws);
    //console.log(ws);
  });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
