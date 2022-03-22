import Table from '../../../models/Table';
import controller from '../../../libraries/controller';

export default async function handler(req, res) {

    return await controller('Get', req, res, async(response, req, res) => {

        const tables = await Table.find({});

        let results = tables.reduce(function(results, table) {

            results[table.chairs.length] = [...results[table.chairs.length] || [], table];

            return results;

          }, {});

        return results;
    });
}