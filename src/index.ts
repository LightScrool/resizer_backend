import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import { errorHandlingMiddleware } from './middleware/error-handling-middleware';
import { logInfoMiddleware } from './middleware/log-info-middleware';
import { router } from './routes';
import { initDb } from './models';
import { fillWithMockData } from './models/__mock__';

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(logInfoMiddleware);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(router);

app.use(errorHandlingMiddleware);

const start = async () => {
    try {
        await initDb();

        await fillWithMockData();

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
};

start();
