import { useSearchParams } from 'react-router-dom';

//returns current time in Alaska
export function getTimestampAK() {
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

//returns functions for getting and setting parameters across multiple components
export function useQueryParams() {
  const [, setSearchParams] = useSearchParams();

  const getParam = (key) => {
    const current = new URLSearchParams(window.location.search);
    return current.get(key);
  };

  const setParam = (key, value) => {
    const current = new URLSearchParams(window.location.search);

    if (value === null || value === undefined) {
      current.delete(key);
    } else {
      current.set(key, value);
    }
    
    //uses replace to avoid adding to browser history
    setSearchParams(current, { replace: true });
  };

  return { getParam, setParam, allParams: new URLSearchParams(window.location.search) };
}

