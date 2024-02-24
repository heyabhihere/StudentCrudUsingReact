import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
export default function AddMarks() {

    const [subject, setSubject] = useState("")
    const [marks, setMarks] = useState("")
    const [searchParams] = useSearchParams()
    const id = searchParams.get('id')
    const navigate=useNavigate()
    


    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const responce = await fetch(`http://localhost:3000/addmarks?id=`+id, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({
                    subject, marks
                })
            })
            const data = await responce.json();
            console.log(data);
            setSubject("");
            setMarks("");

        } catch (error) {
            console.error('Error adding marks:', error);
        }
    }


    return (
        <div>
            <h1>Enter student marks</h1>
            <form onSubmit={handleSubmit}>
                <label>Enter subject name</label>
                <input
                    type='text'
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject name"
                />
                <label>Enter marks</label>
                <input
                    type='text'
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    placeholder="Enter marks"
                />
                <button className="btn" type="submit"  >Submit</button>
            </form>
            <button className="back" onClick={() => navigate('/')}>Back to home ...</button>

        </div>
    )
}



