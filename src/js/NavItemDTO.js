export class NavItemDTO {
  constructor(id, label, actionHandler = () => {}) {
    this.id = id;
    this.label = label;
    this.actionHandler = actionHandler;
  }
}