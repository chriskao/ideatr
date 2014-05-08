/*
* Copyright (c) 2011 Google Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License"); you may not
* use this file except in compliance with the License. You may obtain a copy of
* the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
* WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
* License for the specific language governing permissions and limitations under
* the License.
*/
var serverPath = '//ideatr-theplastics.appspot.com/';

function phaseButtonClick() {
  var phase = parseInt(gapi.hangout.data.getState()['phase']);
  var value = 0;
  if (!phase) {
    // update everything else in UI (title, making ideas clickable)
    value = 1;
  } else if (phase === 1) {
    // change button
    // update everything else in UI (title, voting)
    value = 2;
  } else {
    // you're done... final report
    value = 3;
  }

  gapi.hangout.data.submitDelta({'phase': '' + value});
}

// The functions triggered by the buttons on the Hangout App
function countButtonClick() {
  // Note that if you click the button several times in succession,
  // if the state update hasn't gone through, it will submit the same
  // delta again.  The hangout data state only remembers the most-recent
  // update.
  console.log('Button clicked.');
  var value = '';
  var count = gapi.hangout.data.getState()['count'];
  var newText = document.getElementById('inputField').value;
  document.getElementById('inputField').value = '';
  if (count) {
    value = count + '<li class="idea" onClick="expandIdeaClick()">' + newText + '</li>';
  } else {
    value = '<li class="idea" onClick="expandIdeaClick()">' + newText + '</li>';
  }
  

  console.log('New count is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs
  gapi.hangout.data.submitDelta({'count': value});
}

// var forbiddenCharacters = /[^a-zA-Z!0-9_\- ]/;
var forbiddenCharacters = "";
function setText(element, text) {
  element.innerHTML = typeof text === 'string' ?
      text.replace(forbiddenCharacters, '') :
      '';
}

function expandIdeaClick() {
  var phase = parseInt(gapi.hangout.data.getState()['phase']);
  var idea = event.target;
  if (phase === 1) {
    //var idea = event.target;
    if (idea.className === "idea") {
      idea.className = "bigIdea1";
    } else if (idea.className === "bigIdea1") {
      idea.className = "bigIdea2";
    } else if (idea.className === "bigIdea2") {
      idea.className = "bigIdea3";
    } else if (idea.className === "bigIdea3") {
      idea.className = "bigIdea4";
    } else if (idea.className === "bigIdea4") {
      idea.className = "bigIdea5";
    } else if (idea.className === "bigIdea5") {
      idea.className = "bigIdea6";
    } 

    console.log(idea.innerHTML);

    var ideaList = event.target.parentNode.innerHTML;
    ideaList.replace("\"", "\\\"");

    gapi.hangout.data.submitDelta({'currentIdea': idea.innerHTML});

    gapi.hangout.data.submitDelta({'count': ideaList});
  } else if (phase === 2) {
    var votes = gapi.hangout.data.getState()['votes'];
    if (!votes) votes = {};
    else votes = JSON.parse(votes);
    console.log(votes);
    var strippedIdea = idea.innerHTML;
    if (strippedIdea.indexOf("*") >= 0) strippedIdea = strippedIdea.substr(0,strippedIdea.indexOf("*"));
    console.log(strippedIdea);
    if (votes[strippedIdea]) {
      votes[strippedIdea] = votes[strippedIdea] + 1;
    } else {
      votes[strippedIdea] = 1;
    }
    idea.innerHTML = idea.innerHTML + "*";

    console.log(JSON.stringify(votes));

    gapi.hangout.data.submitDelta({'votes': JSON.stringify(votes)});
  }
}

// $(document).ready(function() {
//   console.log("document ready");
//   $('#ideas li').click(function() {
//     console.log("item clicked");
//     alert('clicked idea: '+this.text());
//   });
// });

function getMessageClick() {
  console.log('Requesting message from main.py');
  var http = new XMLHttpRequest();
  http.open('GET', serverPath);
  http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var jsonResponse = JSON.parse(http.responseText);
      console.log(jsonResponse);

      var messageElement = document.getElementById('message');
      setText(messageElement, jsonResponse['message']);
    }
  }
  http.send();
}

function updateStateUi(state) {
  var countElement = document.getElementById('count');
  var stateCount = state['count'];
  var statePhase = parseInt(state['phase']);
  console.log('Phase:' + statePhase);

  if (!stateCount) {
    setText(countElement, 'YOUR IDEAS WILL APPEAR HERE. COME UP WITH AS MANY AS YOU CAN!');
  } else if (!statePhase || statePhase < 2) {
    setText(countElement, stateCount.toString());
  }

  if (!statePhase) {
    var button = document.getElementById('phaseButton');
    button.value = 'Start Discussion';
    var title = document.getElementById('title');
    setText(title, 'Phase 1: Brainstorm ideas');

  } else if (statePhase === 1) {
    var button = document.getElementById('phaseButton');
    button.value = 'Start Voting';
    var title = document.getElementById('title');
    setText(title, 'Phase 2: Discussion');
    var currentIdea = document.getElementById('currentIdea');
    currentIdea.style.border = "1px solid black";
    if (!state['currentIdea']) {
      setText(currentIdea, 'Click on an idea to discuss!');
    } else {
      setText(currentIdea, state['currentIdea']);
    }
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#E1FFCA";

    // change button
    // update everything else in UI (title, voting)
  } else if (statePhase === 2) {
    var button = document.getElementById('phaseButton');
    button.value = 'Done';
    var title = document.getElementById('title');
    setText(title, 'Phase 3: Vote on your ideas!');
    var countButton = document.getElementById('countButton');
    var inputField = document.getElementById('inputField');
    var currentIdea = document.getElementById('currentIdea');
    setText(currentIdea, '');
    currentIdea.style.border = "0px solid black";
    if (countButton && inputField) {
      countButton.parentNode.removeChild(countButton);
      inputField.parentNode.removeChild(inputField);
    }
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#FFCAE1";
    // you're done... final report
  } else if (statePhase === 3){
    var topBar = document.getElementById('topBar');
    topBar.style.backgroundColor = "#E1CAFF";
    var button = document.getElementById('phaseButton');
    button.parentNode.removeChild(button);
    var title = document.getElementById('title');
    setText(title, 'Done! Your top voted ideas:');
    console.log(countElement.innerHTML);
    setText(countElement, '');

    var votes = state['votes'];
    if (votes) {
      votes = JSON.parse(votes);
      var sortable_ideas = [];
      for (var key in votes) {
        sortable_ideas.push([key, votes[key]]);
      }
      sortable_ideas.sort(function(a, b) {
        return b[1]-a[1];
      });
      console.log(sortable_ideas);

      var internalValue = '';

      for (i = 0; i < sortable_ideas.length; i++) {
        internalValue = internalValue + '<li class="finalIdea">' + sortable_ideas[i][0] + ' (votes: ' + sortable_ideas[i][1] + ')</li>';
      }

      setText(countElement, internalValue);
      console.log(countElement.innerHTML);
    }

    //hightlight ideas with most votes / give report
  }
}

function updateParticipantsUi(participants) {
  console.log('Participants count: ' + participants.length);
  var participantsListElement = document.getElementById('participants');
  setText(participantsListElement, participants.length.toString());
}

// A function to be run at app initialization time which registers our callbacks
function init() {
  console.log('Init app.');

  var apiReady = function(eventObj) {
    if (eventObj.isApiReady) {
      console.log('API is ready');

      gapi.hangout.data.onStateChanged.add(function(eventObj) {
        updateStateUi(eventObj.state);
      });
      gapi.hangout.onParticipantsChanged.add(function(eventObj) {
        updateParticipantsUi(eventObj.participants);
      });

      updateStateUi(gapi.hangout.data.getState());
      updateParticipantsUi(gapi.hangout.getParticipants());

      gapi.hangout.onApiReady.remove(apiReady);
    }
  };

  // This application is pretty simple, but use this special api ready state
  // event if you would like to any more complex app setup.
  gapi.hangout.onApiReady.add(apiReady);
}

gadgets.util.registerOnLoadHandler(init);
