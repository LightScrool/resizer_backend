import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import { PUBLIC_FOLDER } from '~/config';

const SWAGGER_PATH = '/swagger';

export const connectSwagger = (app: Express) => {
    const swaggerDocument = YAML.load(
        path.join(PUBLIC_FOLDER, './schema.yaml'),
    );

    app.use(SWAGGER_PATH, swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
