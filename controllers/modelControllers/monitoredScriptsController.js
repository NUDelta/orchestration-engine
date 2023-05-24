/**
 * This is the controller handles the creation and manipulation of the Monitored Scripts model.
 */
import { MonitoredScripts } from '../../models/monitoredScripts.js';

// TODO: need to test this
/**
 * Creates a new MonitoredScript that encodes a situated practice to monitor and faciltate.
 * @param name {string} the name of the script
 * @param description {string} the description of the script
 * @param timeframe {string} the timeframe that the script should be monitored for
 * @param shouldScriptRepeat {boolean} whether the script should be re-created after it expires
 * @param applicableSet {string} the set of people that the script should be monitored for. This is a function that returns a list.
 * @param situationDetector {string} the function that specifies when the script should be triggered. This is a function that returns a boolean.
 * @param strategies {object[]} the strategies that should be monitored and delivered for this issue, if detected. This is a list of objects that each include a name, description, and a strategy function (as a string).
 */
export const createMonitoredScript = (
  name,
  description,
  timeframe,
  shouldScriptRepeat,
  applicableSet,
  situationDetector,
  strategies
) => {
  return new MonitoredScripts({
    name: name,
    description: description,
    timeframe: timeframe,
    repeat: shouldScriptRepeat,
    applicable_set: applicableSet,
    situation_detector: situationDetector,
    strategies: strategies,
  });
};
