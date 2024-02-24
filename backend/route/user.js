//route/user.js
const express = require('express')
const controller = require("../controller/methods")
const verifyToken = require('../middleware/verify')
const router = express.Router()

router.post("/newuser", controller.postUsers)
router.put("/addmarks", controller.addMarks)
router.put("/updatemarks", controller.updateMarks)
router.get("/users", controller.getUsers)
router.get("/marks",controller.getMarks)
router.get("/showallmarks",controller.showAllMarks)
router.post("/login/details",controller.loginUser)
router.get("/login",verifyToken,controller.loginUserToken)
router.get("/user", controller.getUser)
router.put("/updateuser", controller.updateUser)
router.delete("/deleteuser", controller.deleteUser)
router.delete("/deletemarks", controller.deleteMarks)
module.exports = router;
