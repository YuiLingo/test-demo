import validator from 'validator';
import Table from '../../../../models/table';
import Chair from '../../../../models/chair';
import controller from '../../../../libraries/controller';
import {empty} from "../../../../libraries/utilities";

export default async function handler(req, res) {

    return await controller('Post', req, res, async(response, req, res, session) => {

        const { _id } = req.query

        let table = await Table.findById(_id);

        if(empty(table)) {

            throw 'Table not found';
        }

        table.status = false;
        await table.save();

        return;
    });
}