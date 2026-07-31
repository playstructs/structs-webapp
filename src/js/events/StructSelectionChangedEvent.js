import {EVENTS} from "../constants/Events";

export class StructSelectionChangedEvent extends CustomEvent {

  /**
   * @param {string|null} structId the ID of the struct on the newly selected tile or null when
   *   the selection was cleared or the selected tile holds no struct
   */
  constructor(structId = null) {
    super(EVENTS.STRUCT_SELECTION_CHANGED);
    this.structId = structId;
  }
}
