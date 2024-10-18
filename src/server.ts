import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from 'body-parser'
import cors from "cors";
import bcrypt from "bcryptjs";

dotenv.config();
import './config/connectDB'



import adminRoute from './routes/admin/adminRoutes'
import adminAuthRoute from './routes/admin/authRoutes'
import adminZoneRoute from './routes/admin/zoneRoutes'
import adminJudgeRoute from './routes/admin/judgeRoutes'
import adminParticipantRoute from './routes/admin/participantRoutes'
import adminQuestionRoute from './routes/admin/questionRoutes'
import adminBundleRoute from './routes/admin/bundleRoutes'
import adminResultRoute from './routes/admin/resultRoutes'
import judgeRoute from './routes/judge/index'

import { errorHandler, notFound } from "./middlewares/errorMiddlewares";
import Admin from "./models/admin";

const app: Express = express();

const corsOptions = {
  origin:'http://localhost:3000', 
  credentials:true,
  optionSuccessStatus:200
};



app.use(cors(corsOptions));

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.get("/", (req: Request, res: Response) =>
  res.json({ success: true, msg: "Quran_Quiz app server working successfully!" })
);

app.use("/api/judge", judgeRoute);
// Admin Routes
 app.use('/api/admin',adminRoute)
 app.use('/api/admin/auth',adminAuthRoute)
 app.use('/api/admin/zone',adminZoneRoute)
 app.use('/api/admin/judge',adminJudgeRoute)
 app.use('/api/admin/participant',adminParticipantRoute)
 app.use('/api/admin/question',adminQuestionRoute)
 app.use('/api/admin/bundle',adminBundleRoute)
 app.use('/api/admin/result',adminResultRoute)

 const addAdmin = async () => {
  const email = "admin@quranapp.com";

  const password = "admin@123";
  const salt = await bcrypt.genSaltSync(10);
  const hashedPassword = await bcrypt.hash(password.trim(), salt);
  await Admin.create({
    email,
    password: hashedPassword,
    name:"Admin"
  });
};
// addAdmin()


app.use(notFound);
app.use(errorHandler);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
