var extend = require("util")._extend;
var progress = require("progress");

var bar, nDownloads;
var states = [];

function defined(sum, i) {
  if ( i !== undefined ) {
    sum.push( i );
  }
  return sum;
}

function get(attribute) {
  return function(obj) {
    return obj[attribute];
  };
}

function summation(sum, i) {
  return sum + (i || 0);
}

function consolidatedState() {
  var totals = states.map(get("total")).reduce(defined, []);
  var received = states.map(get("received")).reduce(summation, 0);

  if (totals.length < nDownloads) {
    return {
      isCompleted: false,
      received: received,
      total: Infinity
    };
  }

  return {
    completed: states.map(get("percent")).every(function(state) {
      return state === 100;
    }),
    received: received, 
    total: states.map(get("total")).reduce(summation, 0)
  };
}

function reportProgress(state) {
  if (!bar) {
    bar = new progress("  [:bar] :current/:total :percent :etas", {
      total: state.total,
      width: 40
    });
  }
  if(!bar.complete) {
    bar.total = state.total;
    bar.tick(state.received - bar.curr);
  }
  if (state.completed) {
    console.log("Received " + Math.floor(state.received / 1024) + "K total.");
  }
}

module.exports = function(_nDownloads) {
  nDownloads = _nDownloads;
  return function(notification) {
    states[notification.index] = extend(
      extend({}, states[notification.index]),
      notification.value
    );
    reportProgress(consolidatedState());
  };
};
