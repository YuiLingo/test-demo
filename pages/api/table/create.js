import validator from 'validator';
import Table from '../../../models/table';
import controller from '../../../libraries/controller';
import {empty} from "../../../libraries/utilities";

export default async function handler(req, res) {

    return await controller('Post', req, res, async(response, req, res, session) => {

        const {tableCount} = req.body;

        if(empty(tableCount) || !validator.isInt(tableCount.toString(), {gt: 1})) {

            throw 'Invalid input for number of table';
        }

        let lastTable = await Table.findOne().sort({ id: 'desc'});
        let count = empty(lastTable)? 0 : lastTable.id;
        let tables = [];

        for(let j = 0; j < tableCount; j++) {

            tables.push({
                id: ++count
            });
        }

        const tablesModel = await Table.insertMany(tables, { session: session });

        return tablesModel;
    });
}