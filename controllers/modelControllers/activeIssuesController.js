/**
 * This controller handles the creation and manipulation of the ActiveIssues model.
 */
import { ActiveIssues } from '../../models/activeIssues.js';

/**
 * Creates a new ActiveIssue that can be used to monitor for an opportunity to provide
 * situated strategies.
 * @param scriptId {string} the ID of the script that is being monitored
 * @param scriptName {string} the name of the script that is being monitored
 * @param dateTriggered {Date} the date that the script was triggered for issueTarget
 * @param expiryTime {Date} the date after which the issue should stop being checked for
 * @param shouldRepeat {boolean} whether the issue should be re-created after it expires
 * @param issueTarget {object} the target of the issue (e.g., a person's name)
 * @param targetHashStr {string} the hash of the issue target. Used to check if an issue was already created for the same script-target pairing
 * @param computedStrategies {object[]} the strategies that should be monitored and delivered for this issue
 * @returns {ActiveIssues} the new ActiveIssue MongooseObject
 */
export const createActiveIssue = (
  scriptId,
  scriptName,
  dateTriggered,
  expiryTime,
  shouldRepeat,
  issueTarget,
  targetHashStr,
  computedStrategies
) => {
  return new ActiveIssues({
    script_id: scriptId, // TODO: need some random script ID
    name: scriptName, // TODO: ad hoc script triggerd by <person> at <time>
    date_triggered: dateTriggered,
    expiry_time: expiryTime, // TODO: figure out (probably a week or something)
    repeat: shouldRepeat, // false
    issue_target: issueTarget, // targets script write passes in
    target_hash: targetHashStr, // TODO: computed based on person and time script is created
    computed_strategies: computedStrategies,
  });
};
