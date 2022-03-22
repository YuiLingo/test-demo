import mongoose from 'mongoose';
import connection from './database';
import Response from './response';

export default async (httpMethod, req, res, callback) => {

    await connection();

    const { method } = req;
    const session = await mongoose.startSession();

    let response = Response();

    try {

        session.startTransaction();

        if(method.toUpperCase() != httpMethod.toUpperCase()) {

            throw 'Method Not Allowed';
        }

        if (typeof callback !== "function") {

            throw 'Callback Is Not A Function';
        }

        const result = await callback(response, req, res, session);

        response.addResult(result);

        await session.commitTransaction();

    } catch (error) {

        await session.abortTransaction();

        response.addError(error.toString());
    }

    session.endSession();

    return res.status(response.status).json(response.getObjectJson());

}