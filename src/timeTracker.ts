import * as vscode from "vscode";

export class TimeTracker implements vscode.Disposable {
  private startTime: number | null = null;
  private elapsedTime: number = 0;
  private timerId: NodeJS.Timeout | null = null;
  private statusBarItem: vscode.StatusBarItem;

  constructor(private context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    this.statusBarItem.show();
    this.updateStatusBar();
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
      this.startTime = null;
      this.timerId = null;
      this.updateStatusBar();
    }
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

    const entry = {
      date: new Date().toISOString(),
      duration: hoursFloat * 3600000, // Convert hours to milliseconds
      description: description,
    };

    // Here we'll eventually save this entry to our data storage
    console.log("Manual entry added:", entry);
    vscode.window.showInformationMessage(
      `Added ${hours} hours for: ${description}`
    );
  }
}
