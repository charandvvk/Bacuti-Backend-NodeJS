import express from "express";
import {
    columnController,
    tableController,
    pieController,
} from "./controllers.js";

const router = express.Router();

router
    .get("/column/:emissionType", columnController)
    .get("/table", tableController)
    .get("/pie", pieController);

export default router;
