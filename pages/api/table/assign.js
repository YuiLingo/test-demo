import validator from 'validator';
import Table from '../../../models/Table';
import Queue from '../../../models/Queue';
import controller from '../../../libraries/controller';
import {empty} from "../../../libraries/utilities";

export default async function handler(req, res) {

    return await controller('Get', req, res, async(response, req, res, session) => {

        let { headCount } = req.query;
        let tableAssigned = [];
        let queue, leftQueue;
        let result = [];

        let firstQueue = await Queue.findOne().sort({ id: 'asc'});

        // check queue is exists
        if(!empty(firstQueue)) {

            // if new customer entry, then push them into the queue
            if(!empty(headCount)) {

                let lastQueue = await Queue.findOne().sort({ id: 'desc'});
                let count = empty(lastQueue)? 0 : lastQueue.id;

                // queue the new customer entry
                queue = await Queue.create([{
                    id: ++count,
                    headCount: headCount
                }], { session: session });
            }

            // assign table for first queue customer
            headCount = firstQueue.headCount;
        }

        if(empty(headCount) || !validator.isInt(headCount.toString(), {gte: 0})) {

            throw 'Invalid input for number of head count';
        }

        let tables = await Table.find({status: false}).session(session);

        tables = tables.filter(function(table) {

            return table.chairs.length > 0;
        })
        .sort(function(prev, curr) {

            return prev.chairs.length - curr.chairs.length;
        });

        do {

            if(tables.length > 0) {

                let assignedTable = tables.find(function(table, index) {

                    let assignable = false;

                    if(table.chairs.length >= headCount) {

                        assignable = true;

                    } else if(index == (tables.length - 1)) {

                        assignable = true;
                    }

                    if(assignable) {

                        result = [...result, {
                            table: table,
                            headCount: table.chairs.length > headCount? headCount: table.chairs.length
                        }];

                        headCount -= table.chairs.length;

                        return true;
                    }

                    return false;
                });


                tables = tables.filter(function(table, index) {

                    return assignedTable._id != table._id;
                });

                    // assigned all
                if(headCount <= 0) {

                    if(!empty(firstQueue)) {

                        await firstQueue.deleteOne();
                    }

                } else {


                }

                tableAssigned.push(assignedTable);

            } else {

                // if is not the queueed customer assignment, then create a new queue
                if(empty(firstQueue)) {

                    let lastQueue = await Queue.findOne().sort({ id: 'desc'});
                    let count = empty(lastQueue)? 0 : lastQueue.id;

                    queue = await Queue.create([{
                        id: ++count,
                        headCount: headCount
                    }], { session: session });


                } else {
                    // if is queueed customer assignment, the left customer, continue to queue

                    firstQueue.headCount = headCount;
                    await firstQueue.save();
                    leftQueue = firstQueue;
                }

                headCount = 0;
            }

        } while(headCount > 0);

        if(tableAssigned.length > 0) {

            let tablesSeat = await Table.updateMany({
                _id:{ $in : tableAssigned.map( table => table._id) }
            }, {
                $set: { status: true },
            })
            .session(session);

            if(!tablesSeat.modifiedCount) {

                throw 'Table assigning fail';
            }
        }

        return {
            assigned: result,
            queue: queue, // new queue
            leftQueue: leftQueue, // not completed assign queue
            firstQueue: firstQueue, // if process is first queue
        };
    });
}