import * as vscode from "vscode";

interface TimeEntry {
  date: string;
  duration: number;
  description: string;
}

export class TimeTracker implements vscode.Disposable {
  private startTime: number | null = null;
  private elapsedTime: number = 0;
  private timerId: NodeJS.Timeout | null = null;
  private statusBarItem: vscode.StatusBarItem;
  private timeEntries: TimeEntry[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    this.statusBarItem.show();
    this.updateStatusBar();
    this.loadTimeEntries();
  }

  start() {
    if (this.startTime === null) {
      this.startTime = Date.now();
      this.timerId = setInterval(() => {
        this.elapsedTime = Date.now() - this.startTime!;
        this.updateStatusBar();
      }, 1000);
    }
  }

  stop() {
    if (this.startTime !== null && this.timerId !== null) {
      clearInterval(this.timerId);
      this.elapsedTime = Date.now() - this.startTime;
      this.saveTimeEntry("Automatic tracking");
      this.startTime = null;
      this.timerId = null;
      this.elapsedTime = 0;
      this.updateStatusBar();
    }
  }

  async addManualEntry() {
    const hours = await vscode.window.showInputBox({
      prompt: "Enter hours worked",
      placeHolder: "e.g., 1.5",
    });

    if (hours === undefined) return; // User cancelled the input

    const description = await vscode.window.showInputBox({
      prompt: "Enter a description for this work",
      placeHolder: "e.g., Working on feature X",
    });

    if (description === undefined) return; // User cancelled the input

    const hoursFloat = parseFloat(hours);
    if (isNaN(hoursFloat)) {
      vscode.window.showErrorMessage(
        "Invalid hour input. Please enter a number."
      );
      return;
    }

    this.saveTimeEntry(description, hoursFloat * 3600000);
    vscode.window.showInformationMessage(
      `Added ${hours} hours for: ${description}`
    );
  }

  private saveTimeEntry(
    description: string,
    duration: number = this.elapsedTime
  ) {
    const entry: TimeEntry = {
      date: new Date().toISOString(),
      duration: duration,
      description: description,
    };
    this.timeEntries.push(entry);
    this.context.globalState.update("timeEntries", this.timeEntries);
  }

  private loadTimeEntries() {
    this.timeEntries = this.context.globalState.get("timeEntries", []);
  }

  private updateStatusBar() {
    if (this.startTime === null) {
      this.statusBarItem.text = `$(clock) Start Timer`;
      this.statusBarItem.command = "time-tracker.start";
    } else {
      this.statusBarItem.text = `$(stop) ${this.getElapsedTime()}`;
      this.statusBarItem.command = "time-tracker.stop";
    }
  }

  getElapsedTime(): string {
    const seconds = Math.floor(this.elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, "0")}:${(minutes % 60)
      .toString()
      .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  }

  dispose() {
    this.stop();
    this.statusBarItem.dispose();
  }
}
