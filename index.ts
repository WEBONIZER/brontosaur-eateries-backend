import express from 'express';
import 'dotenv/config';

const { PORT } = process.env;

const app = express();

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
}) 