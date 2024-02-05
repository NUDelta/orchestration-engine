/**
 * Sends a message to a Slack channel.
 * @param message string message to send. Passed in as a standard string, but ES6 template literals
 * are supported and executed at run-time within an ExecutionEnv that contains organization data.
 * This means you compose templated messages such as, "Hello ${ this.project.sigHead }!"
 * @param projectName optional string name of a project (and correspondingly, it's slack channel)
 * @param sigName optional string name of a SIG (and correspondingly, it's slack channel)
 * @param opportunity string function to compute the date when message should be delivered.
 * @returns {Promise<{opportunity_fn: string, outlet_fn: string, outlet_args: {}}>}
 */
export const messageChannel = async ({
  message = '',
  projectName,
  sigName,
  opportunity,
} = {}) => {
  // structure output object
  let outputObj = {
    outlet_fn: '',
    outlet_args: {},
    opportunity_fn: '',
  };

  // check if projectName or sigName was passed in
  if (projectName !== undefined) {
    outputObj.outlet_fn = sendSlackMessageToProjectChannel;
    outputObj.outlet_args = { projectName, message };
  } else if (sigName !== undefined) {
    outputObj.outlet_fn = sendSlackMessageToSigChannel;
    outputObj.outlet_args = { sigName, message };
  }
  outputObj.opportunity_fn = new Function(`return ${opportunity}`)();

  return outputObj;
};

/**
 * Sends a message to a private multi-person DM on Slack.
 * @param message string message to send. Passed in as a standard string, but ES6 template literals
 * are supported and executed at run-time within an ExecutionEnv that contains organization data.
 * This means you compose templated messages such as, "Hello ${ this.project.sigHead }!"
 * @param people list of strings with people's names.
 * @param opportunity string function to compute the date when message should be delivered.
 * @returns {Promise<{opportunity_fn: *, outlet_fn: ((function({people: *, message: *}): Promise<void>)|*), outlet_args: {message: *, people: *}}>}
 */
export const messagePeople = async ({ message, people, opportunity } = {}) => {
  // structure output object
  return {
    outlet_fn: sendSlackMessageToPeople,
    outlet_args: { people, message },
    opportunity_fn: new Function(`return ${opportunity}`)(),
  };
};

/**
 * Stores an ActiveIssue in the database that the OSE Diagnosis Tool can present to a user.
 * @param message string message to send. Passed in as a standard string, but ES6 template literals
 * are supported and executed at run-time within an ExecutionEnv that contains organization data.
 * This means you compose templated messages such as, "Hello ${ this.project.sigHead }!"
 * @param projectName string name of a project
 * @param opportunity string function to compute the date when message should be delivered.
 * @returns {Promise<{opportunity_fn: string, outlet_fn: string, outlet_args: {}}>}
 */
export const presentInDiagnosisTool = async ({
  message = '',
  projectName,
  opportunity,
} = {}) => {
  return {
    outlet_fn: () => {
      return;
    },
    outlet_args: { projectName, message },
    opportunity_fn: new Function(`return ${opportunity}`)(),
  };
};

/**
 * TODO: implement
 * Schedules message to be included in a summary message to a person (or list of people).
 * @param issue object issue that the message is for. this is used to generate headers in the
 * message body to separate strategies from different issues from each other.
 * @param message string message to present in the summary.. Passed in as a standard string,
 * but ES6 template literals are supported and executed at run-time within an ExecutionEnv that
 * contains organization data. This means you compose templated messages such as,
 * "Hello ${ this.project.sigHead }!"
 * @param people list of strings with people's names.
 * @param opportunity string function to compute the date when message should be delivered.
 */
export const includeInSummary = async (issue, message, people, opportunity) => {
  return;
};

export const presentInNotetakingTool = async (
  message = '',
  projectName,
  opportunity
) => {
  return {
    outlet_fn: () => {
      return;
    },
    outlet_args: { projectName, message },
    opportunity_fn: new Function(`return ${opportunity}`)(),
  };
};

/**
 * TODO: implement
 * Presents a mentor with follow-up interactions that they can choose for the system to track.
 */
export const selectFollowUpInteraction = () => {
  return;
};

/**
 * Helper function that sends a Slack message to a project channel.
 * @param projectName string name of project whose channel the message should be sent.
 * @param message string message to send.
 * @returns {Promise<void>}
 */
const sendSlackMessageToProjectChannel = async function ({
  projectName,
  message,
}) {
  try {
    // must use this and include the post to studio api function since this is run in the exec. env
    await this.postToStudioApi('slack/messageProjectChannel', {
      projName: projectName,
      message: eval('`' + message + '`'),
    });
  } catch (error) {
    console.error(`Error sendSlackMessageToProjectChannel:`);
    console.error(error);
  }
};

/**
 * Helper function that sends a Slack message to a SIG channel.
 * @param sigName string name of a SIG whose channel the message should be sent.
 * @param message string message to send.
 * @returns {Promise<void>}
 */
const sendSlackMessageToSigChannel = async function ({ sigName, message }) {
  try {
    // must use this and include the post to studio api function since this is run in the exec. env
    await this.postToStudioApi('slack/messageSigChannel', {
      sigName: sigName,
      message: eval('`' + message + '`'),
    });
  } catch (error) {
    console.error(`Error sendSlackMessageToProjectChannel: ${error}`);
  }
};

/**
 * Helper function that sends a Slack message to a list of people.
 * @param people list of strings with people's names.
 * @param message string message to send.
 * @returns {Promise<void>}
 */
const sendSlackMessageToPeople = async function ({ people, message }) {
  try {
    // must use this and include the post to studio api function since this is run in the exec. env
    await this.postToStudioApi('slack/messagePeople', {
      people: JSON.stringify(people),
      message: eval('`' + message + '`'),
    });
  } catch (error) {
    console.error(`Error in sendSlackMessageToPeople: ${error.stack}`);
  }
};
