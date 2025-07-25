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

//returns string with first letter capitalized
export function capitalizeFirst(val) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function haversineDistance(coord1, coord2) {
  const toRad = angle => (angle * Math.PI) / 180;

  const R = 6371; // Radius of Earth in kilometers
  const lat1 = toRad(coord1[1]);
  const lon1 = toRad(coord1[0]);
  const lat2 = toRad(coord2[1]);
  const lon2 = toRad(coord2[0]);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}
