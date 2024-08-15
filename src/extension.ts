import * as vscode from "vscode";
import { TimeTracker } from "./timeTracker";

let timeTracker: TimeTracker;

export function activate(context: vscode.ExtensionContext) {
  timeTracker = new TimeTracker(context);

  let startDisposable = vscode.commands.registerCommand(
    "time-tracker.start",
    () => {
      timeTracker.start();
      vscode.window.showInformationMessage("Time tracking started");
    }
  );

  let stopDisposable = vscode.commands.registerCommand(
    "time-tracker.stop",
    () => {
      timeTracker.stop();
    }
  );

  let manualEntryDisposable = vscode.commands.registerCommand(
    "time-tracker.manualEntry",
    () => {
      timeTracker.addManualEntry();
    }
  );

  let dailyReportDisposable = vscode.commands.registerCommand(
    "time-tracker.dailyReport",
    () => {
      timeTracker.showDailyReport();
    }
  );

  let allEntriesDisposable = vscode.commands.registerCommand(
    "time-tracker.allEntries",
    () => {
      timeTracker.showAllEntries();
    }
  );

  context.subscriptions.push(
    timeTracker,
    startDisposable,
    stopDisposable,
    manualEntryDisposable,
    dailyReportDisposable,
    allEntriesDisposable
  );
}

export function deactivate() {
  if (timeTracker) {
    timeTracker.stop();
  }
}
