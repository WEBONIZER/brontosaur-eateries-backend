import express from 'express';
import mongoose from "mongoose";
import cors from "cors";
import errorMdlwr from "./src/middlewares/error";
import eateries from './src/routes/eateries';
import fs from 'fs';
import https from 'https';
import 'dotenv/config';

const { PORT, MONGO_URL } = process.env;

const MONGO_CONNECT = MONGO_URL ? MONGO_URL : 'mongodb://localhost:27017/eateriesdb';

const app = express();

mongoose.set("strictQuery", false);
mongoose.connect(MONGO_CONNECT);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/eateries", eateries);
app.use("*", (req, res) => {
    res.status(404).json({ message: "Not Found" });
});
app.use(errorMdlwr);

const httpsOptions = {
    key: fs.readFileSync("../brontosaur-certificate/brontosaur.ru.key"),
    cert: fs.readFileSync("../brontosaur-certificate/fullchain.cer"),
};

https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});