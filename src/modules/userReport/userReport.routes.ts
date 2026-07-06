import express from "express";
import { checkAuth } from "../../middlewares/auth.middleware";
import { Role } from "../users/user.interface";
import { deleteReport, getAllReports, getReportSummary, reportUser } from "./userReport.controller";
const router = express.Router();

router.post("/userReport", checkAuth(...Object.values(Role)),reportUser);
router.get("/", checkAuth(...Object.values(Role)),getAllReports);
router.delete('/deleted',checkAuth(...Object.values(Role)),deleteReport)



router.get("/report-summary", checkAuth(...Object.values(Role)) ,  getReportSummary);

export const userReport = router;
