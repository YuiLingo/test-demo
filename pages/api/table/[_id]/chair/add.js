import validator from 'validator';
import Table from '../../../../../models/table';
import Chair from '../../../../../models/chair';
import controller from '../../../../../libraries/controller';
import {empty} from "../../../../../libraries/utilities";

export default async function handler(req, res) {

    return await controller('Post', req, res, async(response, req, res, session) => {

        const { _id } = req.query;
        const {chairCount} = req.body;

        if(empty(chairCount) || !validator.isInt(chairCount.toString(), {gt: 1})) {

            throw 'Invalid input for number of chair';
        }

        let table = await Table.findById(_id);

        if(empty(table)) {

            throw 'Table not found';
        }

        let lastChair = await Chair.findOne().sort({ id: 'desc'});
        let count = empty(lastChair)? 0 : lastChair.id;
        let chairs = [];

        for(let j = 0; j < chairCount; j++) {

            chairs.push({
                id: ++count
            });
        }

        const chairsModel = await Chair.insertMany(chairs, { session: session });

        await Chair.deleteMany({_id:{$in:table.chairs}});
        table.chairs = chairsModel;
        await table.save();

        return table;
    });
}