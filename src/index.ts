import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';

import { errorHandlingMiddleware } from './middleware/error-handling-middleware';
import { logInfoMiddleware } from './middleware/log-info-middleware';
import { router } from './routes';
import { initDb } from './models';
import { connectSwagger } from './swagger';

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(logInfoMiddleware);
app.use(fileUpload({}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

connectSwagger(app);
app.use(router);

app.use(errorHandlingMiddleware);

const start = async () => {
    try {
        await initDb();

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
};

start();
