import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import fileUpload from "express-fileupload";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../swagger-output.json";
import router from "./routes/app";
import morgan from "morgan";
import timeout from "connect-timeout";

const ACCEPTED_URL = [
    process.env.ACCEPT_DEV_URL,
    process.env.ACCEPT_DEV_URL_1,
    process.env.ACCEPT_PRODUCTION,
];

const app = express();
if (process.env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
}

app.use(timeout(45000));
app.use(haltOnTimedout);
app.use(helmet());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    cors({
        origin: ACCEPTED_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(
    fileUpload({
        createParentPath: true,
    })
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/static", express.static("uploads"));
app.use("/swagger", express.static("api-doc"));
app.use(router);

function haltOnTimedout(req, res, next) {
    if (!req.timedout) next();
}

export { app };
