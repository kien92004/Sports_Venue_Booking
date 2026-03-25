interface bookingDate {
    bookingId: number;
    start: string;
    end: string;
}
const generateBookingDate = (bookingId: number, startDateInput: string, endDateInput: string, dayOfWeek: number) => {
    const startDate = new Date(startDateInput);
    const endDate = new Date(endDateInput);

    const startTime = {
        hour: startDate.getHours(),
        minute: startDate.getMinutes()
    };
    const endTime = {
        hour: endDate.getHours(),
        minute: endDate.getMinutes()
    };
    const dayOfWeeks = dayOfWeek % 7 - 1;

    const result: bookingDate[] = [];
    let current = new Date(startDate);
     while (current.getDay() !== dayOfWeeks) {
    current.setDate(current.getDate() + 1);
  }

    while (current <= endDate) {
        if (current.getDay() === dayOfWeeks) {
            const bookingStart = new Date(
                current.getFullYear(),
                current.getMonth(),
                current.getDate(),
                startTime.hour,
                startTime.minute
            );
            const bookingEnd = new Date(
                current.getFullYear(),
                current.getMonth(),
                current.getDate(),
                endTime.hour,
                endTime.minute
            );

            result.push({
                bookingId: bookingId,
                start: bookingStart.toISOString(),
                end: bookingEnd.toISOString()
            });
        }
        current.setDate(current.getDate() + 7);
    }

    return result;
}

export default generateBookingDate;
