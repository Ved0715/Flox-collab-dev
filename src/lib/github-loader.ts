import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents'
import { summariseCode , generateEmbedding} from './gemini'
import { db } from '@/server/db'

export const loadGithubRepo = async (githubUrl: string , githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || '',
        branch: 'main',
        ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5
    })
    const docs = await loader.load()
    return docs
}
// console.log(await loadGithubRepo('https://github.com/Ved0715/EmailApp', ))
// Document {
//     pageContent: "import express  from 'express';\nimport dotenv from 'dotenv';\nimport connectDB from './db/connectDb.js';\nimport cookieParser from 'cookie-parser';\nimport cors from 'cors';\nimport path from 'path' ;\nimport helmet from 'helmet';\nimport rateLimit from 'express-rate-limit';\nimport mongoSanitize from 'express-mongo-sanitize';\nimport userRoutes from \"./routes/user.routes.js\";\nimport emailRoutes from \"./routes/email.routes.js\";\nimport verifyRouter from \"./routes/verifyEmail.routes.js\";\n\n// Load environment variables\ndotenv.config({});\n\nconst app = express() ;\nconst PORT = process.env.PORT || 8080;\n\napp.use(helmet());\n\nconnectDB();\n\n// Rate limiting\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000, // 15 minutes\n  max: 100 // limit each IP to 100 requests per windowMs\n});\napp.use(limiter);\n\n// Data sanitization against NoSQL injection\napp.use(mongoSanitize());\n\n\n//middleware\napp.get('/', (req, res, next) => {\n    res.send(\"This is my backend\");\n});\n\napp.use(express.urlencoded({extended:true}));\napp.use(express.json()); \napp.use(cookieParser());\n\n\n\nconst corsOptions = {\n    origin: 'http://localhost:5173', \n    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',\n    credentials: true,\n    optionsSuccessStatus: 204\n  };\n    \napp.use(cors(corsOptions));\n\n//routes\napp.use(\"/api/v1/user\", userRoutes)\napp.use(\"/api/v1/email\", emailRoutes)\napp.use(\"/api/v1/verify-email\", verifyRouter)\n\n\n\n\n// app.use((req, res, next) => {\n//     res.status(404).sendFile(path.join(__dirname, 'frontend/build', 'index.html'));\n// });\n\napp.use((err, req, res, next) => {\n    console.error(err.stack);\n    res.status(500).json({\n        message: \"Something went wrong!\",\n        success: false,\n    });\n});\n\napp.listen(PORT , ()=> {\n    console.log(`Server Running on port ${PORT}`)\n})",
//     metadata: {
//       source: "backend/index.js",
//       repository: "https://github.com/Ved0715/EmailApp",
//       branch: "main",
//     },
//     id: undefined,
//   }



export const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async doc => {
        const summary = await summariseCode(doc)
        const embedding = await generateEmbedding(summary)
        return {
            summary,
            embedding,
            sorceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileNmae: doc.metadata.source,
        }
    }))
}

export const indexGithubRepo = async (projectId: string, githubUrl:string , githubToken?:string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken);
    const allEmbedding = await generateEmbeddings(docs)
    await Promise.allSettled(allEmbedding.map( async (embdedding,index) => {
        console.log(`processing ${index + 1} of ${allEmbedding.length}`)
        if (!embdedding) return
        const sourceCodeEmbedding = await db.sorceCodeEmbedding.create({
            data: {
                summary: embdedding.summary,
                sorceCode: embdedding.sorceCode,
                filename: embdedding.fileNmae,
                projectId,
            },
        });
        await db.$executeRaw`
            UPDATE "SorceCodeEmbedding"
            SET "summaryEmbedding" = ${embdedding.embedding}::vector
            WHERE "id" = ${sourceCodeEmbedding.id}
        `;
    }))
}
