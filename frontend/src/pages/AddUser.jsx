import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import '../App.css'

export default function AddUser() {
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [dialCode, setDialCode] = useState("");
    const [phoneNum, setPhoneNumber] = useState("");
    const [pass, setPassword] = useState("");
    const navigate = useNavigate();


    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/newuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    first_name,
                    last_name,
                    email,
                    dialCode,
                    phoneNum,
                    pass
                })
            });
            const data = await response.json();
            console.log(data);
            setFirstName("");
            setLastName("");
            setEmail("");
            setDialCode("");
            setPhoneNumber("");
            setPassword("");
        } catch (error) {
            console.error('Error adding user:', error);
        }
    }

    return (
        <>
            <div id="formCont">
            <h2>Add Student Details</h2>
                <form id="addUser" onSubmit={handleSubmit}>
                    <label>First Name: </label>
                    <input
                        type="text"
                        value={first_name}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                    />
                    <label>Last Name: </label>
                    <input
                        type="text"
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                    />
                    <label>Email: </label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                    />
                    <label>Dial Code: </label>
                    <input
                        type="text"
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value)}
                        placeholder="Enter country code"
                    />
                    <label>Phone Number: </label>
                    <input
                        type="text"
                        value={phoneNum}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter phone number"
                    />
                    <label>Password: </label>
                    <input
                        type="password"
                        value={pass}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter pass"
                    />
                    <button id="submit" type="submit">Submit</button>
                </form>
            </div>
                <button className="back" onClick={() => navigate('/')}>Back to home ...</button>
        </>
    );
}
