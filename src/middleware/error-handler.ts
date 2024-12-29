import {Request, Response, Errback} from 'express';

export const errorHandlerMiddleware = async (err: Errback, req: Request, res: Response) => {
    console.log(err);
    return res.status(500).json({ msg: "Something went wrong, try again later" });
}