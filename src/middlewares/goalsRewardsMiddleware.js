const firestoreService = require('../services/firestoreService');

exports.POINTS_PER_TICKET = 100;

// Needs to be called in actions that coincide with goal actions
exports.updateGoalProgress = async (goalID, userID, next, increment=1) => {

    const { progressMax, userProgress, goalPoints } = await firestoreService.firebaseRead(`goals/${goalID}`, next);

    if (userProgress?.[userID] >= progressMax) {
        return;  // If already completed, skip rest of function
    }

    const newUserProgress = (userProgress?.[userID] + increment) || increment;

    firestoreService.firebaseWrite(
        `goals/${goalID}`,
        { userProgress : { [userID] : newUserProgress } }, 
        next
    );

    if (newUserProgress >= progressMax) { // Award points if new progress reaches the target (max)
        this.addPointsTicketsToUser(userID, goalPoints, next);
    }

    /*
        Unhandled goals:
            SwmK4rU6fRKsH9zKIX1Z - Spin the Wheel
            YtyiZfQUZF0UrUSTViPE - Make Your First Post
            ke07miaMSI6icNq48sWB - Read Your First Career Roadmap
    */
}

exports.addPointsTicketsToUser = async (userID, numberOfPoints, next) => {
    
    // Read points and tickets
    const { pointCount, ticketCount } = await firestoreService.firebaseRead(`users/${userID}`);

    const newPointCount = pointCount + numberOfPoints;
    const newTicketCount = ticketCount + ( Math.floor(newPointCount / this.POINTS_PER_TICKET) - Math.floor(pointCount / this.POINTS_PER_TICKET) );

    // Add points and tickets
    firestoreService.firebaseWrite(
        `users/${userID}`,
        { pointCount : newPointCount, ticketCount : newTicketCount },
        next
    );
}