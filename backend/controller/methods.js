const express = require('express')
const { error } = require('console');
const { user } = require('./database/db');
const bcrypt = require('bcrypt')
const validation = require('../validation');
const secretkey = "8989898988"
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const marks = require('./database/marks')
const app = express()
const nodemailer = require('nodemailer')
app.use(express.json())
const Agenda = require('agenda');


//create new user
module.exports.postUsers = async (req, res) => {
    try {
        const validUser = await validation.userSchema.validateAsync(req.body)
        if (!validUser) {
            return res.json({
                msg: "Details are not valid."
            })
        }
        const { email, phoneNum } = req.body;
        const existingUser = await user.findOne({ $or: [{ email }, { phoneNum }] });

        if (existingUser) {
            return res.status(400).json({ msg: "user already exsit" })
        }
        else {
            const hash_password = await bcrypt.hash(req.body.pass, 10);
            req.body.pass = hash_password;
            await user.create(req.body)
            sendEmailForCreate(req.body);
            // console.log(req.body.email)
            startEmailJob(req.body.email);
            return res.json("User created")
        }
    } catch (error) {
        console.error(error)
        return res.status(400).json({
            msg: "Bad request"
        })
    }
};



module.exports.getUsers = async (req, res) => {
    const { page, limit, name } = req.query;
    try {
        let users;
        let userLength;
        if (name) {
            const regex = new RegExp(name, 'i');
            users = await user.find({ first_name: { $regex: regex } })
                .skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
            userLength = await user.countDocuments({ first_name: { $regex: regex } });
        } else {
            users = await user.find({})
                .skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit));
            userLength = await user.countDocuments();
        }
        return res.json({ users, userLength });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal server error');
    }
};



// get single user
module.exports.getUser = async (req, res) => {
    try {
        const data = await user.findOne({ _id: req.query.id })
        if (!data) {
            res.json({ msg: "User doest not exist." })
        }
        return res.json(data)
    } catch (error) {
        console.error(error)
        res.status(400).json({
            msg: "Users not found"

        })
    }
}

//delete user
module.exports.deleteUser = async (req, res) => {
    try {
        const id = req.query.id;
        const userHaiJaNhi = await user.findOne({ _id: id })
        if (userHaiJaNhi) {
            await user.deleteOne({ _id: id });
            return res.send({
                msg: "User Deleted"
            });
        } else {
            return res.json({ msg: "User does not exist." })
        }
    } catch {
        console.error(error)
        res.status(400).json({
            msg: "User not found"
        })
    }
}

//update a user
module.exports.updateUser = async (req, res) => {
    try {
        await validation.updateSchema.validateAsync(req.body);
        const existinguser = await user.findById(req.query.id)
        if (!existinguser) {
            throw new Error("user does not exist")
        }
        const filter = { _id: req.query.id };
        const validatedUpdate = { $set: req.body };
        const updatedUser = await user.findOneAndUpdate(filter, validatedUpdate, { new: true });
        res.json({
            user: updatedUser,
            msg: "User updated"
        });
    } catch (error) {
        console.error(error)
        res.status(400).json({
            msg: error.message || error
        })
    }
}
//get marks of a user
module.exports.getMarks = async (req, res) => {
    try {
        const userId = req.query.id;

        const userMarks = await marks.marks.find({ userId }).sort({ updatedAt: -1 })

        res.json(userMarks);
    } catch (error) {
        console.error('Error fetching marks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

//upload marks for a user
module.exports.addMarks = async (req, res) => {
    try {
        await validation.addMarksSchema.validateAsync(req.body);
        const id = req.query.id;
        const existingUser = await user.findOne({ _id: id });

        if (!existingUser) {
            return res.status(400).json({
                msg: 'User does not exist',
            });
        }
        const subjects = await marks.marks.find({ userId: id });
        const subjectCount = subjects.length;

        if (subjectCount >= 5) {
            return res.status(400).json({
                msg: 'Maximum subject limit reached',
            });
        }

        await marks.marks.create({
            userId: id,
            subject: req.body.subject,
            marks: req.body.marks
        });


        if (parseInt(req.body.marks) > 100) {
            return res.status(400).json({
                msg: 'Marks cannot exceed 100',
            });
        }

        const subjectsWithLowMarks = [];
        let lowMarksCount = 0;
        subjects.forEach(subject => {
            if (parseInt(subject.marks) < 40) {
                lowMarksCount++;
                subjectsWithLowMarks.push(subject.subject);
            }
        });

        if (lowMarksCount > 2) {
            sendEmailLessMarks(id, subjectsWithLowMarks);
            console.log("Sending email for less marks");
        }

        if (subjectCount === 5) {
            sendEmailForMarks(id, existingUser);
        }

        return res.json({
            msg: "Marks added"
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({
            msg: "Bad request"
        });
    }
};


//login for a user generate a token
module.exports.loginUser = async (req, res) => {
    try {
        const phone = req.body.phonenum;
        const password = req.body.password;
        const dial = req.body.dialCode;
        const email = req.body.email;
        let student = {};
        if (dial === undefined && phone === undefined) {
            const valid = await validation.validEmail.validateAsync({ email: email })
            if (!valid) {
                return res.json({ msg: "Invalid email format" })
            }
            student = await user.findOne({ email: email });
        } else {
            if (dial === undefined || dial !== "+91") {
                return res.json({ msg: "invalid dial code or dial code missing" })
            }

            student = await user.findOne({ phoneNum: phone });
        }

        if (!student) {
            return res.status(400).json({ msg: "Student not found" });
        } else {
            bcrypt.compare(password, student.pass, async function (err, result) {
                if (err) {
                    console.error("Error comparing passwords:", err);
                    return res.status(500).json({ error: "Internal server error" });
                }
                if (result) {
                    // If passwords match
                    const uid = student._id;
                    const jti = uuidv4()
                    await user.updateOne({ _id: uid }, { $set: { jti: jti } });
                    const token = await jwt.sign({ uid, jti }, secretkey)
                    res.json({ token });
                } else {
                    res.status(401).json({ msg: "Invalid password" });
                }
            });
        }
    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}


//use token and return details
module.exports.loginUserToken = async (req, res) => {
    jwt.verify(req.token, secretkey, async (err, authData) => {
        if (err) {
            res.send({ msg: "invalid token" })
        } else {
            try {
                const userData = await user.findOne({ _id: authData.uid })
                if (!userData) {
                    return res.status(400).json({ msg: "user not found" })

                }
                if (userData.jti !== authData.jti) {
                    return res.status(401).json({ msg: "Invalid token" })
                }
                res.json({
                    msg: "Profile accessed",
                    user: userData
                })
            } catch (error) {
                console.error(error);
                res.status(500).json({ msg: "Internal server error" });
            }
        }
    })
}

//send email when creation
async function sendEmailForCreate(body) {
    const { first_name, last_name, email, phoneNum, dialCode } = body;
    if (!first_name || !last_name || !email || !phoneNum || !dialCode) {
        console.log('Not all required fields are filled.');
        return;
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'abhishekbansal824.bfc@gmail.com',
            pass: 'livytifydcmzpjqh'
        }
    })

    const mailWhenCreate = {
        from: 'abhishekbansal824.bfc@gmail.com',
        to: body.email,
        subject: 'Welcome to my API',
        text: 'Your account has been created in my api.',
        replyTo: 'fullstacktester@yopmail.com'
    }


    try {
        const result = await transporter.sendMail(mailWhenCreate);
        console.log('Eamil sent successfully')
    } catch (error) {
        console.log('Email send failed with error:', error)
    }

}

//send email when marks update of 5 subjects
async function sendEmailForMarks(id, body) {

    const { first_name, last_name, email, phoneNum, dialCode } = body;
    if (!first_name || !last_name || !email || !phoneNum || !dialCode) {
        console.log('Not all required fields are filled. Skipping email.');
        return;
    }

    const existingUser = await user.findById(id)
    let transporter, mailWhenMarks;
    if (existingUser) {

        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'abhishekbansal824.bfc@gmail.com',
                pass: 'livytifydcmzpjqh'
            }
        })

        mailWhenMarks = {
            from: 'abhishekbansal824.bfc@gmail.com',
            to: existingUser.email,
            subject: 'Welcome to my API',
            text: 'Your marks has been uploaded , Ready for result declaration.',
            replyTo: 'fullstacktester@yopmail.com'

        }
    }


    try {
        const result = await transporter.sendMail(mailWhenMarks);
        console.log('Eamil sent successfully')
    } catch (error) {
        console.log('Email send failed with error:', error)
    }

}

//send email when fail in 3 or more
async function sendEmailLessMarks(id, subjectsWithLowMarks) {

    const existingUser = await user.findById(id)
    let transporter, mailWhenMarks;
    if (existingUser) {

        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'abhishekbansal824.bfc@gmail.com',
                pass: 'livytifydcmzpjqh'
            }
        })


        mailWhenMarks = {
            from: 'abhishekbansal824.bfc@gmail.com',
            to: existingUser.email,
            subject: 'Regarding Less marks',
            text: `Haan bhai ${existingUser.name},\n\n Tu in subjects me fail ho chuka hai ,zra apne marks dekh : ${subjectsWithLowMarks.join(', ')}`,
            replyTo: 'fullstacktester@yopmail.com'
        }
    }


    try {
        const result = await transporter.sendMail(mailWhenMarks);
        console.log('Eamil sent successfully')
    } catch (error) {
        console.log('Email send failed with error:', error)
    }

}

//update marks
module.exports.updateMarks = async (req, res) => {
    try {
        const existingUser = marks.marks.findOne({ userId: req.query.id });
        if (!existingUser) {
            throw new Error("user does not exist")
        }

        const subject = req.query.subject;
        const subjectExists = await marks.marks.findOne({ userId: req.query.id, subject });

        if (!subjectExists) {
            throw new Error("Subject does not exist");
        }

        const filter = { userId: req.query.id, subject };
        const validatedUpdate = { $set: { marks: req.body.marks } };
        const updatedMarks = await marks.marks.findOneAndUpdate(filter, validatedUpdate, { new: true });
        if (!updatedMarks) {
            throw new Error("Failed to update marks");
        }
        res.json({
            marks: updatedMarks,
            msg: "Marks updated successfully"
        });
    } catch (error) {
        res.status(400).json({
            msg: error.message || error
        })
    }
}

//show all marks
module.exports.showAllMarks = async (req, res) => {
    try {
        const allMarks = await marks.marks.find({});
        const modifiedRecords = [];


        for (const mark of allMarks) {
            const userDetail = await user.findById(mark.userId);
            if (userDetail) {
                const modifiedRecord = {
                    _id: mark._id,
                    userId: mark.userId,
                    subject: mark.subject,
                    marks: mark.marks,
                    user: {
                        first_name: userDetail.first_name,
                        last_name: userDetail.last_name,
                        email: userDetail.email
                    }
                };
                modifiedRecords.push(modifiedRecord);
            }
        }

        res.json(modifiedRecords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//delete marks
module.exports.deleteMarks = async (req, res) => {
    const id = req.query.id;
    try {
        const delMarks = await marks.marks.findOne({ userId: id })
        if (delMarks) {
            await marks.marks.deleteOne({ userId: id })
            return res.send({
                msg: "User record deleted"
            });
        } else {
            return res.json({ msg: "user not found" })
        }
    } catch (error) {
        res.json({ msg: error }).status(400)
    }
}



function startEmailJob(emailId) {
    const agenda = new Agenda({ db: { address: "mongodb://127.0.0.1:27017/DATABASE2" } });

    agenda.define('sendConfirmationEmail', async (job) => {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'abhishekbansal824.bfc@gmail.com',
                    pass: 'livytifydcmzpjqh'
                }
            });
            await transporter.sendMail({
                from: 'abhishekbansal824.bfc@gmail.com',
                to: emailId,
                subject: 'Hello ',
                text: 'Hello world ',
            });
            console.log(`Confirmation email sent to ${emailId}`);
        } catch (error) {
            console.error('Error sending confirmation email:', error);

        }
    });

    const agendaFunction = async () => {
        try {
            await agenda.start();
            await agenda.every('3 seconds', 'sendConfirmationEmail', { emailId });
            console.log('Job scheduled successfully.');
        } catch (error) {
            console.error('Error scheduling job:', error);
            await agenda.stop();
        }
    };

    agendaFunction();
}

