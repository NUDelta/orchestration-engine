/**
 * Orchestrating Compass' in-action cues before support venues.
 */
export default {
  name: 'Compass in-action cues',
  description:
    'Have students plan/re-plan as they work throughout the week using Compass',
  timeframe: 'week',
  repeat: true,
  applicable_set: function applicableSet() {
    return projects.filter(
      where('name', [
        'Orchestration Scripting Environments',
        'Orchestrating Planning and Reflection',
        'Collective Narrative',
        'CE for Relationship Development',
        'Path',
      ])
    );
  }.toString(),
  situation_detector: function situationDetector() {
    // always be running
    return true;
  }.toString(),
  strategies: [
    // Pre/Post SIG
    {
      name: 'Pre-SIG meeting',
      description: 'Have students update their Compass before SIG meeting.',
      strategy_function: function strategy() {
        return messageChannel({
          message: `SIG is today! Please update your <${project.tools.compass.url}|Compass> with what you did in the past week, and what you’re planning on doing. You’ll be presenting your Compass during SIG!`,
          projectName: project.name,
          opportunity: function opportunity() {
            return morningOfVenue(venues.find(where('kind', 'SigMeeting')));
          }.toString(),
        });
      }.toString(),
    },
    {
      name: 'Post-SIG meeting',
      description: 'Have students update their Compass after SIG meeting.',
      strategy_function: function strategy() {
        return messageChannel({
          message: `SIG just happened! Update your <${project.tools.compass.url}|Compass> with your takeaways! What are some immediate next steps you’ll be working on, and why does it address a risk?`,
          projectName: project.name,
          opportunity: function opportunity() {
            return endOfVenue(venues.find(where('kind', 'SigMeeting')));
          }.toString(),
        });
      }.toString(),
    },
    // Pre/Post Office Hours
    {
      name: 'Pre Office Hours',
      description: 'Have students update their Compass before Office Hours.',
      strategy_function: function strategy() {
        return messageChannel({
          message: `OH is today! Update your <${project.tools.compass.url}|Compass>! What did you work on recently, and how did it address a risk? What are some immediate next steps you’ll be working on, and why does it address a risk?`,
          projectName: project.name,
          opportunity: function opportunity() {
            return morningOfVenue(venues.find(where('kind', 'OfficeHours')));
          }.toString(),
        });
      }.toString(),
    },
    {
      name: 'Post Office Hours',
      description: 'Have students update their Compass after Office Hours.',
      strategy_function: function strategy() {
        return messageChannel({
          message: `OH just happened! Update your <${project.tools.compass.url}|Compass> with your takeaways! What are some immediate next steps you’ll be working on, and why does it address a risk?`,
          projectName: project.name,
          opportunity: function opportunity() {
            return endOfVenue(venues.find(where('kind', 'OfficeHours')));
          }.toString(),
        });
      }.toString(),
    },
    // Pre/Post Studio
    {
      name: 'Pre-Studio meeting',
      description: 'Have students update their Compass before Studio.',
      strategy_function: function strategy() {
        return messageChannel({
          message: `DTR is today! Update your <${project.tools.compass.url}|Compass>! What did you work on recently, and how did it address a risk? What will you be working on in PR and LIP, and why do they address risks?`,
          projectName: project.name,
          opportunity: function opportunity() {
            return morningOfVenue(venues.find(where('name', 'Studio Meeting')));
          }.toString(),
        });
      }.toString(),
    },
    {
      name: 'Post-Studio meeting',
      description: 'Have students update their Compass after Studio.',
      strategy_function: function strategy() {
        return messageChannel({
          message: `Studio just happened! Update your <${project.tools.compass.url}|Compass> to reflect what you learned! What are some immediate next steps you’ll be working on, and why does it address a risk?`,
          projectName: project.name,
          opportunity: function opportunity() {
            return endOfVenue(venues.find(where('name', 'Studio Meeting')));
          }.toString(),
        });
      }.toString(),
    },
  ],
};
