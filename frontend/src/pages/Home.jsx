
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import '../App.css';
import { useNavigate } from "react-router-dom";
import {useDebouncedCallback} from 'use-debounce';

export default function Home() {

    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const search = useDebouncedCallback((filter) => {
        setSearchTerm(filter);
      }, 1000);

    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm]);

    async function fetchData() {

        try {

            const response = await fetch(`http://localhost:3000/users?page=${currentPage}&limit=5&name=${searchTerm}`);
            const res = await response.json();
            setData(res.users);
            setTotalPages(Math.ceil((res.userLength) / 5));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    async function handleSearch(event) {
        search(event.target.value);
        setCurrentPage(1);
    }

    console.log("data type=" + typeof (data))

    const deleteUser = async (id) => {
        try {
            await fetch(`http://localhost:3000/deleteuser?id=${id}`, {
                method: 'DELETE'
            });
            fetchData();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <>
            <div>
                <input
                    type="text"
                    placeholder="Search by name"
                    onChange={handleSearch}
                />
            </div>
            <div id="HomeBtn">
                <Link to="/adduser"><button className="btn">Add user</button></Link>
                <Link to="/showallmarks"><button className="btn">fetch marks</button></Link>
            </div>
            <div id="homepage">
                {data.length > 0 ? (
                    <table id="myTable">
                        <thead>
                            <tr>
                                <th>FirstName</th>
                                <th>LastName</th>
                                <th>Email</th>
                                <th>PhoneNumber</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.first_name}</td>
                                    <td>{item.last_name}</td>
                                    <td>{item.email}</td>
                                    <td>{item.phoneNum}</td>
                                    <td>
                                        <button className="add-btn" onClick={() => navigate('/addmarks?id=' + item._id)}>Add Marks</button>
                                        <button className="marks-btn" onClick={() => navigate('/Showdetails?id=' + item._id)}>Show all details</button>
                                        <button className="update-btn" onClick={() => navigate('/updateUser?id=' + item._id)}>Update</button>
                                        <button className="delete-btn" onClick={() => deleteUser(item._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <h1>No data found</h1>
                )}
                <nav>
                    <ul className='pagination'>
                        <li className="page-item">
                            <button className="page-link" onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                        </li>
                        {Array.from(Array(totalPages).keys()).map(pgNumber => (
                            <li key={pgNumber} className={`page-item ${currentPage === pgNumber +1? 'active' : ''}`}>
                                <a onClick={() => setCurrentPage(pgNumber+1)} className='page-link' >{pgNumber+1}</a>
                            </li>
                        ))}
                        <li className="page-item">
                            <button className="page-link" onClick={nextPage}>Next</button>
                        </li>
                    </ul>
                </nav>
            </div>
        </>
    );
}