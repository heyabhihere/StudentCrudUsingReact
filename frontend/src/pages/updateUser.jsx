import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import '../App.css'

export default function UpdateUser() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [dialCode, setDialCode] = useState("");
    const [phoneNum, setPhoneNumber] = useState("");
    const navigate = useNavigate()

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const updateObject = {};

            if (first_name) updateObject.first_name = first_name;
            if (last_name) updateObject.last_name = last_name;
            if (email) updateObject.email = email;
            if (dialCode) updateObject.dialCode = dialCode;
            if (phoneNum) updateObject.phoneNum = phoneNum;

            const response = await fetch(`http://localhost:3000/updateuser?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateObject)
            });
            const data = await response.json();
            console.log(data);

            setFirstName("");
            setLastName("");
            setEmail("");
            setDialCode("");
            setPhoneNumber("");
        } catch (error) {
            console.error('Error updating user:', error);
        }
    }


    return (
        <>
            <h1>Update Student Records</h1>
            <div id="formCont">
                <form id="updateUser" onSubmit={handleSubmit}>
                    <label>First Name: </label>
                    <input
                        type="text"
                        value={first_name}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter updated first name"
                    />
                    <label>Last Name: </label>
                    <input
                        type="text"
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter updated last name"
                    />
                    <label>Email: </label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter updated email"
                    />
                    <label>Dial Code: </label>
                    <input
                        type="text"
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        placeholder="Enter updated country code"
                    />
                    <label>Phone Number: </label>
                    <input
                        type="text"
                        value={phoneNum}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter updated phone number"
                    />
                    <button id="submit" type="submit">Submit</button>
                </form>

            </div>
            <button className="back" onClick={() => navigate('/')}>Back to home ...</button>
        </>
    );
}
