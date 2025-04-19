import { withTryCatch } from '~/helpers/with-try-catch';
import { validateProjectAccess } from '~/auth/validate-project-access';
import { Project } from '~/models';
import { ApiError } from '~/errors/api-error';

export const getApiKey = withTryCatch(async (req, res) => {
    const { projectAlias } = req.params;

    await validateProjectAccess(req, projectAlias, 'web-only');

    const project = await Project.findOne({ where: { alias: projectAlias } });

    if (!project) {
        throw ApiError.notFound('Project not found');
    }

    res.json(project.apiKey);
});
