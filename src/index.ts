import express from "express";
import cors from "cors";
import {config} from "./config";
import authRoutes from "./routes/auth-routes";
import bookRoutes from "./routes/book-routes";
import {notFound} from "./middleware/not-found";
import {errorHandlerMiddleware} from "./middleware/error-handler";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/client', bookRoutes);

// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

app.use(notFound)
app.use(errorHandlerMiddleware)

const start = async () => {
    try {
        app.listen(config.port, () => console.log(`Server listening on port ${config.port}...`));
    } catch (err) {
        console.log(err);
    }
};

start();