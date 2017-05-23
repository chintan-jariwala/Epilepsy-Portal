'use strict';

/**
 * @module controller/helper/process-survey-instances
 */

const moment = require('moment');
const sqlDateFormat = 'ddd MMM DD YYYY HH:mm:ss ZZ';
const viewDateFormat = 'MM-DD-YYYY HH:mm';

/**
 * Takes in a Survey Instances and processes it to get Compliance chart details
 * @param {Array<Object>} surveys - list of survey instances
 * @returns {Object} Complience chart data
 */
function processSurveyInstances (surveys) {

    const filterSurveyByState = surveys.filter((survey) => {
    return survey.state === 'completed';
     });
    //var datasets = pickTimeLeft(filterSurveyByState);
      var datasets  = processSurveySummary (filterSurveyByState);
    var labels = [];
    for (var i = 0; i < datasets.length; i++) {
      var dataSet = datasets[i];
      var y = dataSet.data;
      var x = dataSet.dates;
      datasets[i].data = [];
      for (var j = 0; j < x.length; j++) {
        datasets[i].data.push({'x':x[j],'y':y[j]});
      }
      labels.push.apply(labels,dataSet.dates);
    }
    const numberOfDays = 7;
    const endDateforChart = moment(labels[labels.length - 1]).add(numberOfDays, 'day');
    labels.push(moment(endDateforChart).format(viewDateFormat));
    return {
        labels: labels,
        datasets: datasets
    };
    //return pickTimeLeft(filterSurveyByState);
}

/**
 * Takes in a Survey Instances and get the % time left to be shown on complience chart
 * @param {Object} surveys - list of survey instances
 * @returns {Object} processed list of datetimes
 */
function pickDates (surveys) {
    const dates = surveys.map((survey) => {
        return moment(survey.StartTime).format(viewDateFormat);
    });

    if (surveys[0]) {
        // Adding an additional week to include all the dates in compliance chart.
        // This is done because chart js plots only the first day of the week.
        const numberOfDays = 7;
        const endDateforChart = moment(surveys[surveys.length -1].EndTime).add(numberOfDays, 'day');

        dates.push(moment(endDateforChart).format(viewDateFormat));
    }

    return dates;
}

/**
 * Takes in a Survey Instances and get the % time left to be shown on complience chart
 * @param {Array<Object>} surveys - list of survey instances
 * @returns {Object} processed list of % time left data
 */
function pickTimeLeft (surveys) {
    var surveySet = new Set();
    //surveySet.add("Sickle Cell Weekly Survey");
    //surveySet.add("Sickle Cell Daily Survey");
    for (var i = 0; i < surveys.length; i++) {
        surveySet.add(surveys[i].activityTitle);
    }
    var surveyTypes = [] ;
    for (let activityTitle of surveySet) {
      surveyTypes.push(surveys.filter((survey) =>
        {return survey.activityTitle === activityTitle}));
    }
    var returnArray = [];
    for (var i = 0; i < surveyTypes.length; i++) {
      if (surveyTypes[i].length>0) {
        var samplePoint = surveyTypes[i][0];
        var dataPoints = surveyTypes[i].map((survey) => {
            return calculateTimeLeft(
                moment(survey.StartTime),
                moment(survey.EndTime),
                moment(survey.ActualSubmissionTime)
            )
        });
        var dates = surveyTypes[i].map((survey) => {
            return moment(survey.StartTime).format(viewDateFormat);
        });

          var dataArr = {
              label: '% Time left until '+ samplePoint.activityTitle + ' expired',
              borderColor: getRGBA(i),
              pointBorderColor: getRGBA(i),
              fill: false,
              lineTension: 0.1,
              backgroundColor: getRGBA(i),
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBackgroundColor: "#fff",
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: dataPoints,
              dates: dates
          }
        returnArray.push(dataArr);
      }
    }

    return returnArray;

}


/**
 * Takes in a Survey Instances and get the % time left to be shown on complience chart
 * @param {Array<Object>} surveys - list of survey instances
 * @returns {Object} processed list of % time left data
 */
function processSurveySummary (surveys) {

     surveys = surveys.filter((survey) => {
            return survey.state === 'completed';
});

    var surveySet = new Set();
    //surveySet.add("Sickle Cell Weekly Survey");
    //surveySet.add("Sickle Cell Daily Survey");
    for (var i = 0; i < surveys.length; i++) {
        surveySet.add(surveys[i].activityTitle);
    }
    var surveyTypes = [] ;
    for (let activityTitle of surveySet) {
        surveyTypes.push(surveys.filter((survey) =>
            {return survey.activityTitle === activityTitle}));
    }
    var returnArray = [];
    for (var i = 0; i < surveyTypes.length; i++) {
        if (surveyTypes[i].length>0) {
            var samplePoint = surveyTypes[i][0];
            var dataPoints = surveyTypes[i].map((survey) => {
                    return calculateTimeLeft(
                        moment(survey.StartTime),
                        moment(survey.EndTime),
                        moment(survey.ActualSubmissionTime)
                    )
                });
            var dates = surveyTypes[i].map((survey) => {
                    return moment(survey.StartTime).format(viewDateFormat);
        });

            var dataArr = {
                label: samplePoint.activityTitle ,
                borderColor: getRGBA(i),
                pointBorderColor: getRGBA(i),
                fill: false,
                lineTension: 0.1,
                backgroundColor: getRGBA(i),
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBorderColor: "rgba(220,220,220,1)",
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                data: dataPoints,
                dates: dates
            }
            returnArray.push(dataArr);
        }
    }

    return returnArray;
}


function getRGBA(i){
  if(i ==0)
  {
      return  'rgba(44, 62, 80,1)'
  }
  else {
      return  'rgba(231, 76, 60,1)'
  }

}

/**
 * Takes in a Survey Instances and get the % time left to be shown on complience chart
 * @param {Moment} openTime - When survey instance became availible
 * @param {Moment} endTime - When the survey instance is no longer availible to be taken
 * @param {Moment} completedTime - When the survey instance was actually completed
 * @returns {Number} percent time left after completing survey instance
 */
function calculateTimeLeft (openTime, endTime, completedTime) {
    const percent = 100;
    const minTime = 0;

    // calculate the time in hours until end time
    const totalAvailibleTime = endTime.diff(openTime, 'hours');
    let percentTimeLeft = minTime;

    if (completedTime !== null && !isNaN(completedTime)) {
        const timeTaken = endTime.diff(completedTime, 'hours');

        // caculate percent of time taken out of total time availible to take the survey
        percentTimeLeft = Math.round(timeTaken / totalAvailibleTime * percent);
    }

    // either take the amount of time left
    // or if the survey instance expired (negative percent) show zero time left
    return Math.max(percentTimeLeft, minTime);
}


/**
 * Takes in a value and checks whether the value is an integer
 * @param {Integer} value - to be checked for integer
 * @returns {Boolean} return true if the number is an integer or false otherwise
 */
function isInt (value) {
    return !isNaN(value) && ((x) => {
            return (x | 0) === x;
})(parseFloat(value));
}


module.exports = processSurveyInstances;
module.exports.pickDates = pickDates;
module.exports.pickTimeLeft = pickTimeLeft;
module.exports.calculateTimeLeft = calculateTimeLeft;
module.exports.fetchSurveySummary = processSurveySummary;
