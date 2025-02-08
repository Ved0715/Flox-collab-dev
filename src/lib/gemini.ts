import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

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

export async function summariseCode(docs: Document) {
  try {
    console.log(`getting summary form file name ${docs.metadata.source}`);
    const code = docs.pageContent.slice(0, 30000);
    const response = await model.generateContent([
      `You are an intelligent senior software engineer specializing in onboarding junior developers into projects.
    You are onboarding a junior software engineer and explaining the purpose of the ${docs.metadata.source} file.
    Here is the code:
    ${code})
    Provide a concise summary (maximum 100 words) explaining its purpose and functionality.`,
    ]);
    return response.response.text();
  } catch (error) {
    console.error("Error summarizing code:", error);
    return "";
  }
}

export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });
  const result = await model.embedContent(summary);
  const embedding = result.embedding;

  return embedding.values;
}

// console.log(await generateEmbeddings("hi"))
// [
//   0.05173092, 0.014348275, -0.065515205, -0.020669805, -0.005743652, 0.02130271,
//   0.06315479, 0.023537816, 0.03986425, 0.048055742, -0.079087496, 0.053244445, 0.05545707,
//   0.022432942, -0.06413316, -0.03308642, -0.013099135, 0.024202557, -0.07211447, -0.004751453,
//   -0.035254944, 0.016611181, 0.0063734804, -0.026442677, -0.01801631, 0.039485794,
//   -0.0021095497, 0.03406441, 0.014335024, -0.029225143, -0.029792087, 0.07414989,
//   -0.0021364996, -0.0035640527, 0.04044915, 0.01553691, -0.05382359, 0.052743286,
//   0.022057267, -0.119347885, -0.009233461, 0.035261292, -0.016428476, -0.024090353,
//   -0.016216941, 0.013560716, 0.08716779, 0.068378076, -0.028768925, 0.020877926, 0.046347212,
//   0.013260301, -0.058144104, 0.029094292, -0.00012294136, -0.0023452793, -0.036021747,
//   -0.012526356, 0.112185724, 0.011963488, -0.04704775, -0.044092324, -0.0069064596,
//   -0.0014417566, 0.0018393125, -0.07573254, -0.023844967, -0.01267364, -0.06791492,
//   -0.03516283, -0.004558986, -0.00702996, -0.06364723, 0.050666608, -0.029636346,
//   0.015776131, -0.0055585057, -0.016555272, -0.018666776, 0.02304583, -0.031173918,
//   0.0051568164, 0.02080138, 0.07992162, -0.008227337, 0.029348692, 0.013594383, -0.011409132,
//   -0.062170222, 0.014893508, 0.015659211, -0.002218634, -0.036295302, 0.05680731,
//   0.023453753, -0.0098821055, -0.040493112, -0.05029731, 0.08572847, 0.02366027,
//   ... 668 more items
// ]
