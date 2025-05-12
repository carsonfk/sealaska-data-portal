const getTimestampAK = function() {
    let timestamp = new Date(); // Current date and time

        // Format the date and time in a specific time zone
        const formattedTimestamp = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Juneau',
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(timestamp);

        let timestampSplit = formattedTimestamp.split(', ');
        return {date: timestampSplit[0], time: timestampSplit[1]};
    }
    
    export default getTimestampAK;

    