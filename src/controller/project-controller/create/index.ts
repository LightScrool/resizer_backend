import { v4 as uuidV4 } from 'uuid';

import { withTryCatch } from '~/helpers/with-try-catch';
import { getUserAuthInfo } from '~/auth/get-user-auth-info';
import { ApiError } from '~/errors/api-error';
import { Project, User } from '~/models';
import { inputProjectSchema, ProjectListItem } from '~/schema/project';

export const create = withTryCatch(async (req, res) => {
    const parsedBody = inputProjectSchema.safeParse(req.body);

    if (!parsedBody.success) {
        const { error } = parsedBody;
        throw ApiError.badRequest(error.message);
    }

    const inputProject = parsedBody.data;

    const userInfo = await getUserAuthInfo(req);

    if (!userInfo) {
        throw ApiError.unauthorized();
    }

    const { id: userId } = userInfo;

    const userDb = await User.findOne({
        where: { id: userId },
        include: [{ model: Project, as: 'projects' }],
    });

    if (!userDb) {
        throw ApiError.notFound('User not found');
    }

    // @ts-expect-error Кривая типизация ORM
    const projects: Array<{ alias: string }> = userDb.projects;

    if (userDb.projectsLimit <= projects.length) {
        throw ApiError.badRequest('Projects limit exceeded');
    }

    if (projects.some((project) => project.alias === inputProject.alias)) {
        throw ApiError.badRequest(
            `Project with alias "${inputProject.alias}" already exists`,
        );
    }

    const apiKey = uuidV4();

    const projectDb = await Project.create({
        UserId: userId,
        apiKey,
        ...inputProject,
    });

    const result: ProjectListItem = {
        alias: projectDb.alias,
        name: projectDb.name,
        description: projectDb.description,
    };

    res.json(result);
});
