import { withTryCatch } from '~/helpers/with-try-catch';
import { getUserAuthInfo } from '~/auth/get-user-auth-info';
import { ApiError } from '~/errors/api-error';
import { Project, User } from '~/models';
import { ProjectListItem } from '~/schema/project';

export const getProjectsList = withTryCatch(async (req, res) => {
    const userInfo = await getUserAuthInfo(req);

    if (!userInfo) {
        throw ApiError.unauthorized();
    }

    const { id: userId } = userInfo;

    const [projectsDb, userDb] = await Promise.all([
        Project.findAll({
            where: { UserId: userId },
            order: [['updatedAt', 'DESC']],
        }),
        User.findOne({
            where: { id: userId },
        }),
    ]);

    if (!userDb) {
        throw ApiError.notFound('User not found');
    }

    const projects: ProjectListItem[] = projectsDb.map((projectDb) => ({
        alias: projectDb.alias,
        name: projectDb.name,
        description: projectDb.description,
    }));

    const result = {
        projectsLimit: userDb.projectsLimit,
        projects,
    };

    res.json(result);
});
