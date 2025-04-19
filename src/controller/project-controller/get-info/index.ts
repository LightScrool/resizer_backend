import { withTryCatch } from '~/helpers/with-try-catch';
import { validateProjectAccess } from '~/auth/validate-project-access';
import { Project } from '~/models';
import { ApiError } from '~/errors/api-error';
import { ProjectInfo } from '~/schema/project';

export const getInfo = withTryCatch(async (req, res) => {
    const { projectAlias } = req.params;

    await validateProjectAccess(req, projectAlias, 'any');

    const project = await Project.findOne({ where: { alias: projectAlias } });

    if (!project) {
        throw ApiError.notFound('Project not found');
    }

    const result: ProjectInfo = {
        alias: project.alias,
        presetsLimit: project.presetsLimit,
        imagesLimit: project.imagesLimit,
        name: project.name,
        description: project.description,
    };

    res.json(result);
});
