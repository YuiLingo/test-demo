import Table from '../../../models/Table';
import controller from '../../../libraries/controller';

export default async function handler(req, res) {

    return await controller('Get', req, res, async(response, req, res) => {

        const tables = await Table.find({});

        return tables;
    });
}