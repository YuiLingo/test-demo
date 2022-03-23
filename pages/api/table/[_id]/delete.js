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

        if(table.chairs.length > 0) {

            const chairResult = await Chair.deleteMany({_id:{$in:table.chairs}});

            if(!chairResult.deletedCount) {

                throw 'Chair deleting fail';
            }
        }

        const tableResult = await Table.deleteOne({ _id: table._id });

        if(!tableResult.deletedCount) {

            throw 'Table deleting fail';
        }

        return table.name;
    });
}