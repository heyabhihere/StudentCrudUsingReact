import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function ShowDetails() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [msg, setMsg] = useState("");
    const [data, setData] = useState([])
    const [data1, setData1] = useState([])
    const navigate=useNavigate()

    async function fetchData() {
        try {
            const response = await fetch(`http://localhost:3000/marks?id=${id}`);
            const response1 = await fetch(`http://localhost:3000/user?id=${id}`);
            const res = await response.json();
            const res1 = await response1.json();
            const dataArray = Array.isArray(res1) ? res1 : [res1];
            setData(res);
            setData1(dataArray);

            if (!data) {
                const message = "No records found for marks."
                setMsg(message);
            }else{
                const message="Here are the marks."
                setMsg(message)
            }
            
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    }


    return (
        <>
            <h1>Here are the marks details of the student</h1>
            <button onClick={fetchData}>Show Data</button>
            <table id="details-table">
                <thead>
                    <tr>
                        <th>FirstName</th>
                        <th>LastName</th>
                        <th>E-mail</th>
                        <th>DialCode</th>
                        <th>Contact</th>
                        <th>ID</th>
                    </tr>
                </thead>
                <tbody>
                    {data1.map((item, index) => (
                        <tr key={index}>
                            <td>{item.first_name}</td>
                            <td>{item.last_name}</td>
                            <td>{item.email}</td>
                            <td>{item.dialCode}</td>
                            <td>{item.phoneNum}</td>
                            <td>{item._id}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <h4>{msg}</h4>
            <table id="myTable">
                <thead>
                    <tr>
                        <th>Subject</th>
                        <th>Marks</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.subject}</td>
                            <td>{item.marks}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="back" onClick={() => navigate('/')}>Back to home ...</button>

        </>
    );
}
