const codingChallengeDifficultyOrder = {
    "Easy" : 1,
    "Medium" : 2,
    "Hard" : 3
}

exports.sortChallengesByDifficulty = (challengeArr) => {
    return challengeArr.sort((a, b) => {
        return codingChallengeDifficultyOrder[a.quizDifficulty] - codingChallengeDifficultyOrder[b.quizDifficulty];
    })
}