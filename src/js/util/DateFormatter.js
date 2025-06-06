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
}