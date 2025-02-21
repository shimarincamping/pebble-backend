const firestoreService = require('../services/firestoreService');

exports.getAllRewards = async (req, res, next) => {
    const allRewardsData = await firestoreService.firebaseReadAll(`rewards`, next);
    return res.status(200).send(allRewardsData.map(r => r.rewardName));
}



// For wheel spinning:
    // - Remember to add points to user if they win points
    // - Remember to increment the relevant goal associated with spinning wheels