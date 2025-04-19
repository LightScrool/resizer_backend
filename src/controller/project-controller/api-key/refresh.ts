import { v4 as uuidV4 } from 'uuid';

import { withTryCatch } from '~/helpers/with-try-catch';
import { validateProjectAccess } from '~/auth/validate-project-access';
import { Project } from '~/models';
import { ApiError } from '~/errors/api-error';

export const refreshApiKey = withTryCatch(async (req, res) => {
    const { projectAlias } = req.params;

    await validateProjectAccess(req, projectAlias, 'web-only');

    const project = await Project.findOne({ where: { alias: projectAlias } });

    if (!project) {
        throw ApiError.notFound('Project not found');
    }

    const oldKey = project.apiKey;

    let newKey = uuidV4();
    while (newKey === oldKey) {
        console.log('Api key uuidV4 collision, generating new key...');
        newKey = uuidV4();
    }

    project.apiKey = newKey;
    await project.save();

    res.status(200).send();
});
