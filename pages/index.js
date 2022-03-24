import { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {empty} from "../libraries/utilities";

export default function Admin() {

    const swalModal = withReactContent(Swal);
    const [tables, setTables] = useState([]);
    const [queues, setQueues] = useState([]);
	const [customerCount, setCustomerCount] = useState(0);
	const [assignment, setAssignment] = useState({});

    useEffect(() => {

        getAllTables();
        getAllQueue({});
    }, []);

    const getAllTables = async () => {

        let response = await axios.get('/api/table', {
                                        params: {
                                          available: true
                                        }
                                    })
                                    .then(response => response)
                                    .catch(error => {
                                        if(error.response) {

                                            return error.response;
                                        };

                                        return error
                                    });

        if(response.data) {

            if(response.data.status == 200) {

                setTables(response.data.result);

            } else {

                if(response.data.message) {

                    alert(response.data.message);

                } else {

                    alert('something went wrong');
                }

            }
        } else {

            alert('something went wrong');
        }

    };

    const getAllQueue = async (assignedQueue) => {

        let response = await axios.get('/api/queue', {
                                  params: {
                                    available: true
                                  }
                              })
                              .then(response => response)
                              .catch(error => {
                                  if(error.response) {

                                      return error.response;
                                  };

                                  return error
                              });

        if(response.data) {

            if(response.data.status == 200) {

				let oldQueue = [];

				if(!empty(assignedQueue)) {

					oldQueue = queues.filter(queue => {

						return queue._id == assignedQueue._id;
					});
				}
                setQueues([...oldQueue, ...response.data.result]);

            } else {

                if(response.data.message) {

                    alert(response.data.message);

                } else {

                    alert('something went wrong');
                }

            }
        } else {

            alert('something went wrong');
        }
    }

	const freeUpTable = async (table) => {

		swalModal.fire({
            title: `Freeing Up Table ${table.name}`,
            showCancelButton: true,
            showLoaderOnConfirm: true,
            preConfirm: () => {

                return axios({
                    method: 'post',
                    url: `/api/table/${table._id}/freeup`,
                    headers: {
                      'Content-Type': 'application/json'
                    }
                })
                .then(response => {
                    if (response.data) {

                        if(response.data.status == 200) {

                            return response.data.result;

                        } else {

                            throw new Error(response.data.message);
                        }

                    } else {

                        throw new Error('Request Error');
                    }
                })
                .catch(error => {
                    swalModal.showValidationMessage(`Freeing up table: ${error}`)
                })
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
        .then((result) => {

            if (result.isConfirmed) {

                getAllTables();

                Swal.fire({
                    title: `Table Freed`,
                })
            }
        })
	}

	const assign = async () => {

		swalModal.fire({
            title: `Allocating Table`,
            showCancelButton: true,
            showLoaderOnConfirm: true,
            preConfirm: () => {

                return axios('/api/table/assign', {
					params: {
						headCount: customerCount
					}
				})
                .then(response => {
                    if (response.data) {

                        if(response.data.status == 200) {

							setAssignment(response.data.result);
                            return response.data.result;

                        } else {

                            throw new Error(response.data.message);
                        }

                    } else {

                        throw new Error('Request Error');
                    }
                })
                .catch(error => {
                    swalModal.showValidationMessage(`Allocating table: ${error}`)
                })
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
        .then((result) => {

            if (result.isConfirmed) {

				let data = result.value;
				let assignedQueue = {};

				if(empty(data.firstQueue)) {

					let text = '';

					if(!empty(data.assigned) && Array.isArray(data.assigned)) {

						for(let i = 0; i < data.assigned.length; i++) {

							text += `${data.assigned[i].headCount} customer head to ${data.assigned[i].table.name}, `;
						}
					}

					if(!empty(data.queue) || !empty(data.queue[0])) {

						text += `${data.queue[0].headCount} customers required to wait till next available table - ${data.queue[0].id}, `;

					}

					Swal.fire({
						title: 'Tables Allocated',
						text: text
					});

				} else {

					assignedQueue = data.firstQueue;
				}

				getAllTables();
				getAllQueue(assignedQueue);
            }
        })
	}

	const queueHeadToFormatter = (queue) => {

		let text = 'queuing';

		if(!empty(assignment.firstQueue)) {

			if(queue._id == assignment.firstQueue._id) {

				text = (!empty(assignment.assigned) || !empty(assignment.leftQueue)) ? '': 'queuing';

				if(!empty(assignment.assigned) && Array.isArray(assignment.assigned)) {

					for(let i = 0; i < assignment.assigned.length; i++) {

						text += `${assignment.assigned[i].headCount} customer head to ${assignment.assigned[i].table.name}, `;
					}
				}

				if(!empty(assignment.leftQueue)) {

					text += `${assignment.leftQueue.headCount} customers required to wait till next available table`;
				}
			}
		}

		return text;
	}
    return (
      <div class="">
        <Head>
            <title>User Dashboard</title>
        </Head>
        <nav class="navbar navbar-expand-lg fixed-top navbar-light bg-light">
            <div class="container">
                <Link href="/admin">
                    <a class="ms-md-auto">Admin</a>
                </Link>
            </div>
        </nav>
        <main class="main">
            <div class="container my-md-5">
                <h4>Welcome Board</h4>
				<form class="row g-3">
  					<div class="col-auto">
						<div class="input-group mb-3">
							<input type="number" class="form-control" placeholder="No. of Customers" value={customerCount} onChange={e => setCustomerCount(e.target.value)} />
							<button class="btn btn-primary" type="button" onClick={assign}>Submit</button>
						</div>
					</div>
				</form>
				<h4>Queue Board</h4>
				<div class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Queue No</th>
                                <th scope="col">No. of People</th>
                                <th scope="col">Head to </th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {queues.map((queue, index) => {

                                return (
                                    <tr>
                                        <td>{++index}</td>
                                        <td>{queue.id}</td>
                                        <td>{queue.headCount}</td>
                                        <td>{queueHeadToFormatter(queue)}</td>
                                        <td>

                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
				<h4>Tables Board</h4>
                <div class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Table</th>
                                <th scope="col">Chairs</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map((table, index) => {

                                return (
                                    <tr>
                                        <td>{++index}</td>
                                        <td>{table.name}</td>
                                        <td>{table.chairs.length}</td>
                                        <td className={ 'text-white ' + (table.chairs.length? (table.status? 'bg-danger': 'bg-success'): 'bg-secondary')}>{table.chairs.length? (table.status? 'In used': 'Available'): '-'}</td>
                                        <td>
											{table.status? <button type="button" class="btn btn-sm btn-primary" onClick={() => freeUpTable(table)}>Free Up</button>: ''}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
      </div>
    )
  }