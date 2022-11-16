import http from 'http';
import express from 'express';
import dotenv from 'dotenv-defaults';
import mongoose from 'mongoose';
import WebSocket from 'ws';
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
    //wsConnect.initData(ws);
    ws.onmessage = wsConnect.onMessage(ws);
    //wsConnect.onMessage(ws);
    //console.log(ws);
  });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
