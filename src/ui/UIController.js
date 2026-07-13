// Owns all DOM references and wiring for the picker/status panel. Exposes plain
// callbacks so main.js can stay the only place that knows how pieces fit together.
export class UIController {
  constructor() {
    this.fileInput = document.getElementById('fileInput');
    this.nameInput = document.getElementById('nameInput');
    this.pickStatusEl = document.getElementById('pickStatus');
    this.stage = document.getElementById('stage');
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('output');
    this.statusEl = document.getElementById('status');

    this.userName = '';
    this._onNameChange = null;

    this.nameInput.addEventListener('input', () => {
      this.userName = this.nameInput.value.slice(0, 2);
      if (this._onNameChange) this._onNameChange(this.userName);
    });
  }

  onNameChange(callback) {
    this._onNameChange = callback;
  }

  onFileSelected(callback) {
    this.fileInput.addEventListener('change', () => {
      const file = this.fileInput.files[0];
      if (file) callback(file);
    });
  }

  setPickStatus(msg) {
    this.pickStatusEl.textContent = msg;
  }

  setStatus(msg) {
    this.statusEl.textContent = msg;
  }

  showStage() {
    this.stage.hidden = false;
  }
}
