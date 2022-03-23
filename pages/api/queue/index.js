import Queue from '../../../models/Queue';
import controller from '../../../libraries/controller';

export default async function handler(req, res) {

    return await controller('Get', req, res, async(response, req, res) => {

        const queues = await Queue.find({});

        return queues;
    });
}