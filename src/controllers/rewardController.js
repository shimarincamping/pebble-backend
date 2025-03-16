const nodemailer = require("nodemailer");
const firestoreService = require("../services/firestoreService");
const { where } = require("firebase/firestore");
const { addPointsTicketsToUser, updateGoalProgress } = require("../middlewares/goalsRewardsMiddleware");
const { getIntegerFromString } = require("../utils/dataManipulationUtils");
const { throwError } = require("../middlewares/errorMiddleware");


exports.getAllRewards = async (req, res, next) => {
    const allRewardsData = await firestoreService.firebaseReadAll(`rewards`, next);
    return res.status(200).send(allRewardsData.map((r) => r.rewardName));
};

exports.assertTicketExists = async (req, res, next) => {
    const currentUserID = res.locals.currentUserID;

    const { ticketCount } = await firestoreService.firebaseRead(`users/${currentUserID}`, next);

    if (ticketCount >= 1) {
        return next();
    } 
        
    return throwError(403, `Ticket count is not enough, currently: ${ticketCount}`, next);
};

exports.addNewReward = async (req, res, next) => {

    try{
        const currentUserID = res.locals.currentUserID;
        
        const { ticketCount } = await firestoreService.firebaseRead(`users/${currentUserID}`);

        const newTicketCount = ticketCount - 1;
        const rewardName = req.body.rewardName;
        const pointNumber = +getIntegerFromString(rewardName);

        if (pointNumber) {
            addPointsTicketsToUser(currentUserID, pointNumber, next);
        } else {
            const { email } = await firestoreService.firebaseRead(
                `users/${currentUserID}`,
                next
            );

            const reward = await firestoreService.firebaseReadQuery(
                `rewards`,
                [where("rewardName", "==", rewardName)],
                next
            );

            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_ADDRESS,
                    pass: process.env.EMAIL_ADDRESS_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_ADDRESS, // campus central's email
                to: email,
                subject: "[PEBBLE] Congratulations on winning a special prize!",
                text: `Congratulations on winning the prize of ${rewardName}! Your code to claim your reward on the respective platform is here: ${reward[0].rewardContent.claimCode}`,
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log("error: ", error);
                } else {
                    console.log("email sent: ", info.response);
                }
            });
        }

        firestoreService.firebaseWrite(
            `users/${currentUserID}`,
            { ticketCount: newTicketCount },
            next
        );

        // Increment goal related to spinning the wheel
        updateGoalProgress("SwmK4rU6fRKsH9zKIX1Z", currentUserID, next);
        res.status(200).send(rewardName);

    }catch(e){
        console.error("Error occured while updating reward details: ",e);
    }
};
