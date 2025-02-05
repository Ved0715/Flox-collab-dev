import { db } from '@/server/db';
import { Octokit } from 'octokit'
import axios from 'axios'
import { aiSummeriesCommit } from './gemini';

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

// const githubUrldiff = 'https://github.com/doocker/genai-stack/commit/<commitHash>.diff';


type Responce = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvator: string;
    commitDate: string;
    commitAuthorGithubUrl: string;
}


export const getCommitHashes = async (githubUrl: string): Promise<Responce[]> => {
    const [owner , repo] = githubUrl.split('/').slice(-2)
    if(!owner || !repo){
        throw new Error("Invalid Github url")
    }
    const  { data }  = await octokit.rest.repos.listCommits({
        owner: owner,
        repo: repo
    });
    // console.log(data[0])
    // {
    //     sha: "caec526d75b821efffc7987d4c12d831ca0498b2",
    //     node_id: "C_kwDOKTCX2toAKGNhZWM1MjZkNzViODIxZWZmZmM3OTg3ZDRjMTJkODMxY2EwNDk4YjI",
    //     commit: {
    //       author: {
    //         name: "Tomaz Bratanic",
    //         email: "bratanic.tomaz@gmail.com",
    //         date: "2024-11-05T07:26:39Z",
    //       },
    //       committer: {
    //         name: "GitHub",
    //         email: "noreply@github.com",
    //         date: "2024-11-05T07:26:39Z",
    //       },
    //       message: "Add support for more LLM models (#186)",
    //       tree: {
    //         sha: "c703ad9f9e84f5dd308d59b2481c2e66d7101a1a",
    //         url: "https://api.github.com/repos/docker/genai-stack/git/trees/c703ad9f9e84f5dd308d59b2481c2e66d7101a1a",
    //       },
    //       url: "https://api.github.com/repos/docker/genai-stack/git/commits/caec526d75b821efffc7987d4c12d831ca0498b2",
    //       comment_count: 0,
    //       verification: {
    //         verified: true,
    //         reason: "valid",
    //         signature: "-----BEGIN PGP SIGNATURE-----\n\nwsFcBAABCAAQBQJnKcivCRC1aQ7uu5UhlAAA3vAQAFwjuY1eUVA4yAsnC/FV9wD0\nOqvouuemZgtkCr3JqNJmLnc7kf/KoUKoQN+6+EmHbt2KJ7zWQBZvVWJP17skhsHO\n/fUvvQR8TRHFREibTrYOUqa0xdc0bGlQbH9AclJSccX5salwB7r0jVVZSnGXy6nZ\nUTnQI1Ipa8u1NevyZ3ynJsS2gwFjL3AzuvTM8aXNaAiSR6rxyrALovzp16/5ebUp\noghP4PtAvyMKjc+V5p8Z1oXelEdl4yL72EdM7X+mFMKvWIHvrR1PCeVWYwhSu1y5\nuhp/Y6PNuFroX6qZmFkMbGQlViWG2AKvO8ycfYdJcmiCWOsbGGSXaBjvFg5d7T7q\n5CsdIYHdQR/hSY3pGB5L+GOQhNEi+45/oZzjqFDdQEnYO47L+bTyqBAAfhPOx3p3\nzw/AlPo1Ha6c7/Ch9hWTdIKbEhSC0GurOhPGL2xfJHSoPa+TrLeAzp5515CV1LsS\nnQc4ASQ1xquA0IIsu5ztQO0GMRqyPAzAj3Qf37+T6sS0dY9u09PTIAkklQ34uk5e\nETJil2T8Ulk2pA7o9NIl3s4UkAe31ncxrI2Xq5oRTg39zGadrhbdWLwQHPHGuE+c\nLGODa+xwCrjxEsYNdrEb0nHKL9zi/FFNu1LwTGf477CurRS+sJXPq1oa+7Xq1IpW\n0H5KSVMdY51Sg3JUZali\n=UtNx\n-----END PGP SIGNATURE-----\n",
    //         payload: "tree c703ad9f9e84f5dd308d59b2481c2e66d7101a1a\nparent 6680d03108d35df2e7b56b585a2e9e7b2b1c0d49\nauthor Tomaz Bratanic <bratanic.tomaz@gmail.com> 1730791599 +0700\ncommitter GitHub <noreply@github.com> 1730791599 +0100\n\nAdd support for more LLM models (#186)\n\n",
    //         verified_at: "2024-11-07T09:35:25Z",
    //       },
    //     },
    //     url: "https://api.github.com/repos/docker/genai-stack/commits/caec526d75b821efffc7987d4c12d831ca0498b2",
    //     html_url: "https://github.com/docker/genai-stack/commit/caec526d75b821efffc7987d4c12d831ca0498b2",
    //     comments_url: "https://api.github.com/repos/docker/genai-stack/commits/caec526d75b821efffc7987d4c12d831ca0498b2/comments",
    //     author: {
    //       login: "tomasonjo",
    //       id: 19948365,
    //       node_id: "MDQ6VXNlcjE5OTQ4MzY1",
    //       avatar_url: "https://avatars.githubusercontent.com/u/19948365?v=4",
    //       gravatar_id: "",
    //       url: "https://api.github.com/users/tomasonjo",
    //       html_url: "https://github.com/tomasonjo",
    //       followers_url: "https://api.github.com/users/tomasonjo/followers",
    //       following_url: "https://api.github.com/users/tomasonjo/following{/other_user}",
    //       gists_url: "https://api.github.com/users/tomasonjo/gists{/gist_id}",
    //       starred_url: "https://api.github.com/users/tomasonjo/starred{/owner}{/repo}",
    //       subscriptions_url: "https://api.github.com/users/tomasonjo/subscriptions",
    //       organizations_url: "https://api.github.com/users/tomasonjo/orgs",
    //       repos_url: "https://api.github.com/users/tomasonjo/repos",
    //       events_url: "https://api.github.com/users/tomasonjo/events{/privacy}",
    //       received_events_url: "https://api.github.com/users/tomasonjo/received_events",
    //       type: "User",
    //       user_view_type: "public",
    //       site_admin: false,
    //     },
    //     committer: {
    //       login: "web-flow",
    //       id: 19864447,
    //       node_id: "MDQ6VXNlcjE5ODY0NDQ3",
    //       avatar_url: "https://avatars.githubusercontent.com/u/19864447?v=4",
    //       gravatar_id: "",
    //       url: "https://api.github.com/users/web-flow",
    //       html_url: "https://github.com/web-flow",
    //       followers_url: "https://api.github.com/users/web-flow/followers",
    //       following_url: "https://api.github.com/users/web-flow/following{/other_user}",
    //       gists_url: "https://api.github.com/users/web-flow/gists{/gist_id}",
    //       starred_url: "https://api.github.com/users/web-flow/starred{/owner}{/repo}",
    //       subscriptions_url: "https://api.github.com/users/web-flow/subscriptions",
    //       organizations_url: "https://api.github.com/users/web-flow/orgs",
    //       repos_url: "https://api.github.com/users/web-flow/repos",
    //       events_url: "https://api.github.com/users/web-flow/events{/privacy}",
    //       received_events_url: "https://api.github.com/users/web-flow/received_events",
    //       type: "User",
    //       user_view_type: "public",
    //       site_admin: false,
    //     },
    //     parents: [
    //       {
    //         sha: "6680d03108d35df2e7b56b585a2e9e7b2b1c0d49",
    //         url: "https://api.github.com/repos/docker/genai-stack/commits/6680d03108d35df2e7b56b585a2e9e7b2b1c0d49",
    //         html_url: "https://github.com/docker/genai-stack/commit/6680d03108d35df2e7b56b585a2e9e7b2b1c0d49",
    //       }
    //     ],
    //   }
    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime()) as any[]

    return sortedCommits.slice(0, 10).map((commit: any) => ({
        commitHash :commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvator: commit.author?.avatar_url ?? null,
        commitDate: commit.commit?.author?.date ?? "",
        commitAuthorGithubUrl: commit.author?.html_url ?? "",
        // commitAuthorGithubUrl: commit.author?.url ?? "",

    }))
}

async function fetchProjectGithubUrl(projectId:string) {
    const project = await db.project.findUnique({
        where:{
            id: projectId
        },
        select:{
            githubUrl:true
        }
    })
    if(!project?.githubUrl){
        throw new Error("Project has not github url")
    }
    return { project, githubUrl: project.githubUrl }
}


async function filterUnprocessedCommits(projectId: string, commitHash: Responce[]) {
    const processCommits = await db.commit.findMany({
        where: {
            projectId
        }
    })
    // choolsong the commits which are not processed
    const unprocessedCommits = commitHash.filter((commit) => !processCommits.some((processCommit) => processCommit.commitHash = commit.commitHash))

    return unprocessedCommits
}



// await pollCommits("cm6rmmaon000c2mcn5e8fcexo");

async function summariesCommit(githubUrl: string, commitHash: string) {
// git the diff then pass the diff into model
        const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`,{
            headers: {
                Accept: 'application/vnd.github.v3.diff'
            }
        })
        return await aiSummeriesCommit(data) || ""
}



export const pollCommits = async (projectId: string) => {
    const { project , githubUrl } = await fetchProjectGithubUrl(projectId);
    const commitHash = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId , commitHash)
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(commit => {
        return summariesCommit(githubUrl , commit.commitHash)
    }))
    const summaries = summaryResponses.map((response) => {
        if (response.status === 'fulfilled'){
            return response.value as string
        }
        return ""
    })

    const commit = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            console.log(`processing commit ${index}`);
            return {
                projectId:projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitAutherAvator: unprocessedCommits[index]!.commitAuthorAvator,
                commitAutherName: unprocessedCommits[index]!.commitAuthorName,
                commitDate: unprocessedCommits[index]!.commitDate,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorGithubUrl: unprocessedCommits[index]!.commitAuthorGithubUrl,
                summary
            }
        })
    })
    return commit
}