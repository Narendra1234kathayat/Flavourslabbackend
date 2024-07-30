const express = require("express");
const router = express.Router();
const moment = require("moment"); // Moment -> To display dates and times in a specific format.
const { body, validationResult } = require('express-validator');

const ContactForm = require("../models/Contact_Form");
const ReservationForm = require("../models/Reservation_Form")
const nodemailer = require('nodemailer');
// Route 1: Submit a reservation form using 'POST' method and its endpoint is -> /api/form/reservationform

router.post('/reservationform', [
    body('first_name', 'Enter a valid name.').isLength({ min: 2 }),
    body('last_name', 'Enter a valid surname.').isLength({ min: 2 }),
    body('email', 'Enter a valid email.').isEmail(),
    body('phone', 'Number must have exactly 10 digits.').isLength({ min: 10, max: 10 }),
    body("date", "Enter a valid date.").custom((value) => {
        // Custom validation to check if the date is in the correct format
        const parsedDate = moment(value, "YYYY-MM-DD", true);
        if (!parsedDate.isValid()) {
            throw new Error("Invalid date format");
        }
        return true;
    }),


], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors, "is the error")
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        let resform = await ReservationForm.create({
            fname: req.body.first_name,
            lname: req.body.last_name,
            email: req.body.email,
            number: req.body.phone,
            userDate: req.body.date,
            time: req.body.time,
        });
        res.status(200).json({ success: true, data: resform }); // Corrected to 'success'
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error occurred");
    }


});
router.post('/updatereservation', async (req, res) => {
    try {
        const { reserve, id } = req.body;
        // Use findByIdAndUpdate to find the reservation by its ID and update it
        const updatedReservation = await ReservationForm.findByIdAndUpdate(id, { reservation: reserve }, { new: true });
        // { new: true } option returns the updated document after the update is applied

        if (!updatedReservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        res.status(200).json(updatedReservation); // Return the updated reservation
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'theflavorslab980@gmail.com',
                pass: 'ydgx gdtl rjbv wkvm'
            }
        });
        var mailOptions = {
            from: 'theflavorslab980@gmail.com',
            to: `${updatedReservation.email}`,
            subject: 'Seat Reservation in The Flavors Lab',

            html: `<p>Dear <strong>${updatedReservation.fname} ${updatedReservation.lname}</strong>,</p>
            ${updatedReservation.reservation === 'rejected' ? 
            `<p>We regret to inform you that your reservation has been <strong><span style="color: red;">rejected</span></strong> due to heavy traffic in the restaurant.</p>` :
            `<p>Your reservation is <span style="color: ${updatedReservation.reservation === 'accepted' ? 'green' : 'black'}"><strong>${updatedReservation.reservation}</strong></span> and your reservation id is ${updatedReservation._id}</p>`}
            <p>If you have any further inquiries or require assistance, you can find our contact information on our website.<p/>
            <p>Thank you for choosing The Flavors Lab.</p>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return res.json({ message: "error sending email" })
            } else {
                return res.json({ status: true, message: "error sending mail" });
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/getreservation', async (req, res) => {
    try {
        const getreservation = await ReservationForm.find({}).sort({ date:-1 });
        if (!getreservation || getreservation.length === 0) {
            return res.json({ error: "No reservations found." });
        }
        return res.json(getreservation);
    } catch (error) {
        res.status(500).json({ error: "Error fetching reservations." });
    }
});

// Route 2: Submit a contactus form using 'POST' method and its endpoint is -> /api/form/contactform


router.post('/contactform', [
    body('first_name').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters long.'),
    body('last_name').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters long.'),
    body('email').trim().isEmail().withMessage('Enter a valid email address.'),
    body('phone').trim().isLength({ min: 10, max: 10 }).withMessage('Phone number must have exactly 10 digits.'),
    body('comment').trim().isLength({ min: 5 }).withMessage('Comment must be at least 5 characters long.'),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }


    try {
        // Create contact form entry
        let contactusform = await ContactForm.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            number: req.body.phone,
            comment: req.body.comment,
        });

        return res.status(200).json({ success: true, data: contactusform });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occurred");
    }
});
router.get('/fetchcontact', async (req, res) => {
    try {
        const contact = await ContactForm.find({});
        if (contact.length === 0) {
            return res.status(404).json({ error: "No contact data Found!" });
        }
        return res.status(200).json(contact);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



module.exports = router;