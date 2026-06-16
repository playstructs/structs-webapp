export class DateFormatter {

  /**
   * @param datetimeString
   * @return {string}
   */
  formatDate(datetimeString) {
    return new Date(datetimeString).toLocaleDateString(
      'default',
      {
        month:"long",
        day:"numeric",
        year:"numeric"
      }
    );
  }

  formatTime(datetimeString) {
    return new Date(datetimeString).toLocaleTimeString(
      'default',
      {
        hour : "2-digit",
        minute : "2-digit",
        second : "2-digit"
      }
    );
  }

  formatDatetime(datetimeString) {
    return `${this.formatTime(datetimeString)} ${this.formatDate(datetimeString)}` ;
  }

  /**
   * @param {number} millisecondsRemaining
   */
  formatDuration(millisecondsRemaining) {
    const seconds = Math.floor(millisecondsRemaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h`;
    }
    if (minutes > 0) {
        return `${minutes}m`;
    }
    return `${seconds}seconds`;
  }
}