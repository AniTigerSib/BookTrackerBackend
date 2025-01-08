import {Request, Response, Errback} from 'express';
import { StatusCodes } from 'http-status-codes'

export const errorHandlerMiddleware = async (err: Errback, req: Request, res: Response) => {
    console.log(err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: "Something went wrong, try again later" });
}