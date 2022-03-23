import Table from '../../../models/Table';
import controller from '../../../libraries/controller';
import {empty} from "../../../libraries/utilities";

export default async function handler(req, res) {

    return await controller('Get', req, res, async(response, req, res) => {

        let { available } = req.query;

        let tables = await Table.find({});

        if(available) {

            tables = tables.filter(function(table) {

                return table.chairs.length > 0;
            })
        }

        return tables;
    });
}