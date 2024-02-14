/**
 * Support students in recognizing when they are overworking
 * TODO: get this to work retrospectively, not just on the current sprint (cases: start of sprint, middle of sprint, end of sprint)
 */
export default {
  name: 'Overworking',
  description: 'Students have spent too many hours in the past week',
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
    let isOverPoints = this.project.tools.sprintLog.points.map((student) => {
      let currStudent = student.name;
      let currStudentHoursSpent = student.hoursSpent.total;
      let currStudentHoursAvail = student.pointsAvailable;
      return {
        student: currStudent,
        hoursSpent: currStudentHoursSpent,
        hoursAvail: currStudentHoursAvail,
        isOver: currStudentHoursSpent > multiplier * currStudentHoursAvail,
      };
    });

    if (isCurrentlySig && isOverPoints.some((student) => student.isOver)) {
      console.log(isOverPoints);
    }

    // return true if current is SIG and any students are over points
    return isCurrentlySig && isOverPoints.some((student) => student.isOver);
  }.toString(),
  strategies: [
    {
      name: 'Overworking',
      description: 'Students have spent too many hours in the past week',
      strategy_function: async function strategy() {
        return await this.messagePeople({
          message: `It looks like ${this.project.name} (${this.project.students
            .map((student) => {
              return student.name.split(' ')[0];
            })
            .join(' and ')}) has OVER worked in the last week (${
            this.project.tools.sprintLog.totalPoints.hoursSpent.total
          } points committed out of ${
            this.project.tools.sprintLog.totalPoints.pointAvailable
          } points available; <${
            this.project.tools.sprintLog.url
          }|Sprint Log>).`,
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
