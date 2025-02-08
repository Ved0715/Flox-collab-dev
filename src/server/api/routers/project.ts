import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"
import { pollCommits } from "@/lib/github"
import { indexGithubRepo } from "@/lib/github-loader";

export const projectRouter = createTRPCRouter({
    createProject: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                githubUrl: z.string(),
                githubToken: z.string().optional()
            })
        ).mutation(async ({ctx, input}) => {
            try {
                const project = await ctx.db.project.create({
                    data: {
                        githubUrl: input.githubUrl,
                        name: input.name,
                        userToProject: {
                            create: {
                                userId: ctx.user.userId!,
                            },
                        },
                    },
                });
                try {
                    await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
                    await pollCommits(project.id);
                    return project;
                } catch (error) {
                    console.error("Error processing project:", error);
                    throw new Error("Failed to process project");
                }
                return project;
            } catch (error) {
                console.error("Error creating project:", error);
                throw new Error("Failed to create project");
            }
    }),

    getProjets: protectedProcedure.query(async ({ctx}) => {
        try {
            const projects = await ctx.db.project.findMany({
                where: {
                    userToProject: {
                        some: {
                            userId: ctx.user.userId!,
                        },
                    },
                    deletedAt: null,
                },
            });
            return projects;
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw new Error("Failed to fetch projects");
        }
    }),
    getCommits:protectedProcedure.input(z.object({
        projectId: z.string()
    })).query( async ({ ctx, input}) => {
        pollCommits(input.projectId).then().catch(console.error)
        return await ctx.db.commit.findMany({
            where : {
                projectId:input.projectId
        }})
    })



});