export function formatDateAndTime(theDate: Date) {
    let hours = theDate.getHours();
    let minutes = theDate.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    let minuteDisplay = minutes < 10 ? '0' + minutes : minutes + '';
    const strTime = hours + ':' + minuteDisplay + ' ' + ampm;
    return (theDate.getMonth() + 1) + "/" + theDate.getDate() + "/" + theDate.getFullYear() + "  " + strTime;
}