import './App.css'
import Home from './pages/Home'
import AddUser from './pages/AddUser'
import AddMarks from './pages/addMarks'
import ShowDetails from './pages/showDetails'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UpdateUser from './pages/updateUser' 
import ShowAllMarks from './pages/showAllMarks'
import UpdateMarks from './pages/updateMarks'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adduser" element={<AddUser />} />
        <Route path="/addmarks" element={<AddMarks />} />
        <Route path="/showdetails" element={<ShowDetails/>} />
        <Route path="/updateuser" element={<UpdateUser />} />
        <Route path="/showallmarks" element={<ShowAllMarks />} />
        <Route path="/updatemarks" element={<UpdateMarks />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
