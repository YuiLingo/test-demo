import { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'


export default function Admin() {

    const swalModal = withReactContent(Swal);
    const [tables, setTables] = useState([]);

    useEffect(() => {

        getAllTables();
    }, []);

    const getAllTables = async () => {

        let response = await axios.get('/api/table')
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

    const createTable = async () => {

        swalModal.fire({
            title: 'Add Tables',
            input: 'number',
            inputAttributes: {
                min: '1'
            },
            showCancelButton: true,
            confirmButtonText: 'Save',
            showLoaderOnConfirm: true,
            preConfirm: (tableCount) => {

                return axios({
                    method: 'post',
                    url: '/api/table/create',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    data : JSON.stringify({
                        "tableCount": tableCount
                    })
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
                    swalModal.showValidationMessage(`Create tables error: ${error}`)
                })
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
        .then((result) => {

            if (result.isConfirmed) {

                getAllTables();

                let count = result.value? result.value.length: 0;

                Swal.fire({
                    title: `Create ${count} Tables`,
                })
            }
        })
    }

    const deleteTable = async (table) => {

        swalModal.fire({
            title: `Deleting Table ${table.name}`,
            showCancelButton: true,
            showLoaderOnConfirm: true,
            preConfirm: () => {

                return axios({
                    method: 'post',
                    url: `/api/table/${table._id}/delete`,
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
                    swalModal.showValidationMessage(`Deleting table: ${error}`)
                })
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
        .then((result) => {

            if (result.isConfirmed) {

                getAllTables();

                Swal.fire({
                    title: `Table Deleted`,
                })
            }
        })

    }

    const addChairs = async (table) => {

        swalModal.fire({
            title: `Add Table ${table.name} Chairs`,
            input: 'number',
            inputAttributes: {
                min: '1'
            },
            showCancelButton: true,
            confirmButtonText: 'Save',
            showLoaderOnConfirm: true,
            preConfirm: (chairCount) => {

                return axios({
                    method: 'post',
                    url:  `/api/table/${table._id}/chair/add`,
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    data : JSON.stringify({
                        "chairCount": chairCount
                    })
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
                    swalModal.showValidationMessage(`Add chairs error: ${error}`)
                })
            },
            allowOutsideClick: () => !Swal.isLoading()
        })
        .then((result) => {

            if (result.isConfirmed) {

                getAllTables();

                let count = result.value.chairs.length? result.value.chairs.length: 0;

                Swal.fire({
                    title: `Add ${count} Chairs To Table ${table.name} Successful`,
                })
            }
        })
    }

    return (
      <div class="">
        <Head>
            <title>Admin Dashboard</title>
        </Head>
        <nav class="navbar navbar-expand-lg fixed-top navbar-light bg-light">
            <div class="container">
                <Link href="/">
                    <a class="ms-md-auto">Home</a>
                </Link>
            </div>
        </nav>
        <main class="main">
            <div class="container my-md-5">
                <h4>Tables Management</h4>
                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                    <button class="btn btn-primary me-md-2" type="button" onClick={createTable}>Add Tables</button>
                </div>
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
                                            <div class="btn-group float-end" role="group">
                                                <button type="button" class="btn btn-sm btn-primary" onClick={() => addChairs(table)}>Add Chairs</button>
                                                <button type="button" class="btn btn-sm btn-danger" onClick={() => deleteTable(table)}>Delete</button>
                                            </div>
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