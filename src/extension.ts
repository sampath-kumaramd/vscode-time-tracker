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
      vscode.window.showInformationMessage("Time tracking stopped");
    }
  );

  let manualEntryDisposable = vscode.commands.registerCommand(
    "time-tracker.manualEntry",
    () => {
      timeTracker.addManualEntry();
    }
  );

  context.subscriptions.push(
    timeTracker,
    startDisposable,
    stopDisposable,
    manualEntryDisposable
  );
}

export function deactivate() {
  if (timeTracker) {
    timeTracker.stop();
  }
}
