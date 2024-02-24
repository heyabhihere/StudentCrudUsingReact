import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function UpdateMarks() {
    const [marks, setMarks] = useState("");
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const subject = searchParams.get('subject');
    const navigate=useNavigate()


    async function handleUpdateMarks() {
        try {
           
            const response = await fetch(`http://localhost:3000/updatemarks?id=${id}&subject=${subject}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ subject, marks })
            });
            await response.json();
            setMarks("")
        } catch (error) {
            console.log(error)
        }
    }

    return (
       <>
         <div>
            <h1>Update Marks</h1>
            <div>
                <label>Fill Updated Marks:</label>
                <input type="text" value={marks} onChange={(e) => setMarks(e.target.value)} />
            </div>
            <button onClick={handleUpdateMarks}>Submit</button>
        </div>
        <button className="back" onClick={() => navigate('/')}>Back to home ...</button>
       </>
    );
}
