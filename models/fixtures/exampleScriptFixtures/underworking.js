/**
 * Support students in recognizing when they are underworking
 * TODO: get this to work retrospectively, not just on the current sprint
 */
export default {
  name: 'Underworking',
  description: 'Students have spent too few hours in the past week',
  timeframe: 'week',
  repeat: false,
  applicable_set: async function applicableSet() {
    return this.projects.filter(
      this.whereAll('students', 'role', 'NonPhdStudent')
    );
  }.toString(),
  situation_detector: async function situationDetector() {
    // run detector only if it's SIG time
    let isCurrentlySig = await this.currentlyIs(
      await this.startOfVenue(
        await this.venues.find(this.where('kind', 'SigMeeting'))
      )
    );

    // check if we're mid-sprint
    let currDate = new Date();
    let currSprint = this.project.tools.sprintLog.name;
    let currSprintInfo = this.processes.find((process) => {
      return process.name === currSprint;
    });
    let sprintStartDay = new Date(currSprintInfo.startDay);
    let sprintEndDay = new Date(currSprintInfo.endDay);
    let midSprint = new Date(currSprintInfo.startDay);
    midSprint.setDate(midSprint.getDate() + 7);
    let isMidSprint = currDate >= midSprint && currDate < sprintEndDay;

    // scale the hours available by 0.5 if we're mid-sprint
    let multiplier = isMidSprint ? 0.5 : 1.0;

    // check if any student has spent more hours than allocated
    let isUnderPoints = this.project.tools.sprintLog.points.map((student) => {
      let currStudent = student.name;
      let currStudentHoursSpent = student.hoursSpent.total;
      let currStudentHoursAvail = student.pointsAvailable;
      return {
        student: currStudent,
        hoursSpent: currStudentHoursSpent,
        hoursAvail: currStudentHoursAvail,
        isUnder:
          currStudentHoursSpent < 0.8 * (multiplier * currStudentHoursAvail),
      };
    });

    if (isCurrentlySig && isUnderPoints.some((student) => student.isUnder)) {
      console.log(isUnderPoints);
    }

    // return true if current is SIG and any students are over points
    return isCurrentlySig && isUnderPoints.some((student) => student.isUnder);
  }.toString(),
  strategies: [
    {
      name: 'Underworking',
      description: 'Students have spent too few hours in the past week',
      strategy_function: async function strategy() {
        return await this.messagePeople({
          message: `Students have spent too few hours in the past week.`,
          people: ['Kapil Garg'],
          opportunity: async function () {
            return await this.startOfVenue(
              await this.venues.find(this.where('kind', 'SigMeeting'))
            );
          }.toString(),
        });
      }.toString(),
    },
  ],
};
