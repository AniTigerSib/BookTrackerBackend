import express from "express";
const app = express();
import dotenv from "dotenv";
import {notFound} from "./middleware/not-found";
import {errorHandlerMiddleware} from "./middleware/error-handler";
dotenv.config();

const port = process.env.PORT || 3000;

const defaultController = async (req: express.Request, res: express.Response) => {
    res.status(200).send("Access denied");
}

app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));
app.use("/", defaultController)

//@ts-ignore
app.use(notFound)
//@ts-ignore
app.use(errorHandlerMiddleware)

const start = async () => {
    try {
        app.listen(port, () => console.log(`Server listening on port ${port}...`));
    } catch (err) {
        console.log(err);
    }
};

start();