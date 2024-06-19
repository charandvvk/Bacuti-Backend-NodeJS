import express from "express";
import cors from "cors";
import routes from "./routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const { PORT } = process.env;

app.listen(PORT, console.log(`Serving on port ${PORT}`));

app.use(express.json());
app.use(cors());
app.use("/", routes);
