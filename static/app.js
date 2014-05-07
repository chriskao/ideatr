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
    value = '\"<li class="idea" onClick="expandIdeaClick()">' + newText + '</li>';
  }
  

  console.log('New count is ' + value);
  // Send update to shared state.
  // NOTE:  Only ever send strings as values in the key-value pairs
  gapi.hangout.data.submitDelta({'count': value});
}

var forbiddenCharacters = /[^a-zA-Z!0-9_\- ]/;
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

    var ideaList = '\"' + event.target.parentNode.innerHTML;
    ideaList.replace("\"", "\\\"");

    gapi.hangout.data.submitDelta({'count': ideaList});
  } else if (phase === 2) {
    idea.innerHTML = idea.innerHTML + "*";

    var ideaList = '\"' + event.target.parentNode.innerHTML;
    ideaList.replace("\"", "\\\"");

    gapi.hangout.data.submitDelta({'count': ideaList});
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
    setText(countElement, 'IDEAS QUICK');
  } else {
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
    setText(title, 'Phase 2: Discusson');

    // change button
    // update everything else in UI (title, voting)
  } else if (statePhase === 2) {
    var button = document.getElementById('phaseButton');
    button.value = 'Done';
    var title = document.getElementById('title');
    setText(title, 'Phase 3: Vote on your ideas!');
    var countButton = document.getElementById('countButton');
    var inputField = document.getElementById('inputField');
    if (countButton && inputField) {
      countButton.parentNode.removeChild(countButton);
      inputField.parentNode.removeChild(inputField);
    }
    // you're done... final report
  } else if (statePhase === 3){
    var button = document.getElementById('phaseButton');
    button.parentNode.removeChild(button);
    var title = document.getElementById('title');
    setText(title, 'Done!');
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
