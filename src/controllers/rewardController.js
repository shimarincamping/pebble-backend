const nodemailer = require("nodemailer");
const firestoreService = require("../services/firestoreService");
const { where } = require("firebase/firestore");
const {
    addPointsTicketsToUser,
} = require("../middlewares/goalsRewardsMiddleware");
exports.getAllRewards = async (req, res, next) => {
    const allRewardsData = await firestoreService.firebaseReadAll(
        `rewards`,
        next
    );
    return res.status(200).send(allRewardsData.map((r) => r.rewardName));
};

exports.assertTicketExists = async (req, res, next) => {
    const currentUserID = req.currentUserID || "WRfW7QuVFmNmunEiPbkt"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to Anoop)

    const { ticketCount } = await firestoreService.firebaseRead(
        `users/${currentUserID}`,
        next
    );

    if (ticketCount >= 1) {
        res.status(200).send();
        next();
    } else {
        res.status(404).send(
            `ticket count is not enough, currently: ${ticketCount}`
        );
    }
};

exports.addNewReward = async (req, res, next) => {
    const currentUserID = req.currentUserID || "WRfW7QuVFmNmunEiPbkt"; // This assumes auth. middleware will set an ID globally for all requests // (for now defaults to Anoop)
    const { ticketCount } = await firestoreService.firebaseRead(
        `users/${currentUserID}`
    );
    const newTicketCount = ticketCount - 1;
    const rewardName = req.body.rewardName;

    if (rewardName == "+10 Points") {
        addPointsTicketsToUser(currentUserID, 10, next);
        res.status(200).send();
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

        firestoreService.firebaseWrite(
            `users/${currentUserID}`,
            { ticketCount: newTicketCount },
            next
        );
    }
};
// For wheel spinning:
// - Remember to add points to user if they win points
// - Remember to increment the relevant goal associated with spinning wheels
