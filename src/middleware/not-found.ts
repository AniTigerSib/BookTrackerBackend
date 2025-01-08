import { Response, Request } from "express";
import { StatusCodes } from 'http-status-codes'

export const notFound = (_: Request, res: Response) => { res.status(StatusCodes.NOT_FOUND).send("Route does not exist!"); };