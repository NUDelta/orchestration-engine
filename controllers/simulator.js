import { DateTime } from "luxon";
import { compileScriptFromJson } from "./compiler.js";

export const simulateScripts = async (scriptList, startTime, endTime) => {
  // compile each script
  let compiledScripts = [];
  for (let i = 0; i < scriptList.length; i++) {
    compiledScripts.push(await compileScriptFromJson(scriptList[i]));
  }

  // track which scripts have been triggered
  let triggeredScriptIndexSet = new Set();

  // simulate
  console.log(`------------- Starting Simulation for S2021 -------------`);

  let currDay = 0;
  let weekCounter = 0;
  while (startTime <= endTime) {
    if (currDay !== startTime.weekday) {
      console.log("\n");
      currDay = startTime.weekday;
      let currDayString = "";
      switch (currDay) {
        case 1:
          currDayString = "Sunday";
          break;
        case 2:
          currDayString = "Monday";
          break;
        case 3:
          currDayString = "Tuesday";
          break;
        case 4:
          currDayString = "Wednesday";
          break;
        case 5:
          currDayString = "Thursday";
          break;
        case 6:
          currDayString = "Friday";
          break;
        case 7:
          currDayString = "Saturday";
          break;
      }

      // clear the trigger set every sunday
      if (currDay === 1) {
        triggeredScriptIndexSet.clear();
        weekCounter++;
        console.log(`------------- Week ${ weekCounter } -------------`);
      }

      console.log(`${ currDayString } | ${ startTime.month }-${ startTime.day }-${ startTime.year }`);
    }

    // check if any scripts meet the conditions
    for (let index = 0; index < compiledScripts.length; index++) {
      if (!triggeredScriptIndexSet.has(index)) {
        // eval condition
        let currDate = startTime;
        let is_condition_met = eval(compiledScripts[index].parsed_detection_condition);

        // check if script condition is met
        if (is_condition_met) {
          triggeredScriptIndexSet.add(index);

          // check if actionable feedback should be presented
          if (compiledScripts[index].parsed_actionable_feedback.parsed_feedback_trigger === "immediate") {
            console.log(`${ startTime.hour.toString().padStart(2, "0") }:${ startTime.minute.toString().padStart(2, "0") } -- ${ compiledScripts[index].parsed_target.join(", ") }: ${ compiledScripts[index].parsed_actionable_feedback.parsed_feedback_message }`);
          }
        }
      }
    }

    // progress hours
    startTime = startTime.plus({ hours: 1 });
  }
  console.log(`------------- Simulation for S2021 Complete -------------`);
}