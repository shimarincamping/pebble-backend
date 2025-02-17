const timeConversionMapping = [
    { unitName: 'year', unitInSeconds: 60 * 60 * 24 * 365 },
    { unitName: 'month', unitInSeconds: 60 * 60 * 24 * 30 },
    { unitName: 'day', unitInSeconds: 60 * 60 * 24 },
    { unitName: 'hour', unitInSeconds: 60 * 60 },
    { unitName: 'minute', unitInSeconds: 60 },
    { unitName: 'second', unitInSeconds: 1 }
]

exports.getTimeDurationString = (currentTime, referenceTime) => {

    const seconds = Math.ceil((currentTime - referenceTime) / 1000);

    for (const unit of timeConversionMapping) {
        const { unitName, unitInSeconds } = unit;
        const value = Math.floor(seconds / unitInSeconds);

        if (value > 1) {
            return `${value} ${unitName}s ago`
        } else if (value === 1) {
            return `1 ${unitName} ago`
        }
    }

    return "Now";
}