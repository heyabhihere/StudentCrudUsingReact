import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css'

export default function ShowAllMarks() {
    const [data, setData] = useState([]);
    const navigate = useNavigate()


    async function fetchMarksData() {
        try {
            const response = await fetch('http://localhost:3000/showallmarks')
            const res = await response.json()
            setData(res)

        } catch (error) {
            res.json({ msg: error })
        }
    }
    async function DeleteMarks(userId) {
        try {
            const response = await fetch(`http://localhost:3000/deletemarks?id=${userId}`, {
                method: 'DELETE'
            })
            await response.json();
            fetchMarksData()
        } catch (error) {
            console.error("error deleting marks:", error);
        }

    }
    useEffect(() => {
        fetchMarksData();
    }, []);


    return (
        <>
            <div id='showAllMarks'>
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Subject</th>
                            <th>Marks</th>
                            <th>Updation</th>
                            <th>Deletion</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((record) => (
                            <tr key={record._id}>
                                <td>{record.user.first_name} {record.user.last_name} ({record.user.email})</td>
                                <td>{record.subject}</td>
                                <td>{record.marks}</td>
                                <td>
                                    <button className="update-btn" onClick={() => navigate(`/updatemarks?id=${record.userId}&subject=${record.subject}`)}>Update</button></td>
                                <td>
                                    <button className="delete-btn" onClick={() => DeleteMarks(record.userId)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <button className="back" onClick={() => navigate('/')}>Back to home ...</button>
            </div >
        </>
    )
}
