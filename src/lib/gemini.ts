import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const aiSummeriesCommit = async (diff: string) => {
  const responce = await model.generateContent([
    `You are an expert programmer, and you are trying to summarize a git diff.
        Reminder about the git diff format:
        For every file, there are a few metadata lines like (for example):
        \`\`\`
        diff --git a/lib/index.js b/lib/index.js
        --- a/lib/index.js
        +++ b/lib/index.js
        \`\`\`
        This means that \`lib/index.js\` was modified in the commit. Note that this is only an example.
        Then there is a specifier of the lines that were modified.
        A line starting with \`+\` means it was added.
        A line starting with \`-\` means it was deleted.
        A line starting with neither \`+\` nor \`-\` is code given for context and better understanding.
        It is not part of the diff.
        [...]

        Please ensure your summary is pointwise and covers:
        - The purpose of the changes
        - Any new features or functionalities added
        - Any bugs or issues fixed
        - Any refactoring or code improvements
        - Any changes to dependencies or configurations
        - Any other relevant information

        EXAMPLE SUMMARY COMMENTS:
        \`\`\`
        * Increased the number of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
        * Corrected a typo in the GitHub action name [.github/workflows/gpt-commit-summarizer.yml]
        * Refactored the \`octokit\` initialization into a separate file [src/octokit.ts], [src/index.ts]
        * Implemented an OpenAI API for completions [packages/utils/apis/openai.ts]
        * Reduced numeric tolerance for test files
        \`\`\`

        Most commits will have fewer comments than this example list.
        The last comment does not include the file names because there were more than two relevant files in the hypothetical commit.
        Do not include parts of the example in your summary.
        It is given only as an example of appropriate commit summaries.`,
    `Please summarize the following diff file: \n\n${diff}`,
  ]);
  return responce.response.text();
};

