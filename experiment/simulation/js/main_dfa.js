/*****
 * File containing main logic to display DFA
 *
 */

function refreshCanvas2(){
  clearElem(canvas2);

  dfa_curr = ""
  if(inputPointer != -1){
    // console.log("before", inputPointer, curr);
    // console.log(dfa[dfaIndex]["input"]);
    dfa_curr = dfa[dfaIndex]["input"][inputIndex]["states"][inputPointer];
    // console.log("after", inputPointer, curr);
  }
  dfa_res = displayCanvas(canvas2, dfa[dfaIndex], inputPointer, dfa_curr);

  dfa_nodes = dfa_res[0]
  dfa_edges = dfa_res[1]
}

function resetInput(){
  inputIndex = 0
  inputPointer = -1

  refreshInput();
}

function refreshInput(){
  inputContainer = document.getElementById("input_container");
  clearElem(inputContainer);
  for(let i=0;i<dfa[dfaIndex]["input"][inputIndex]["string"].length;++i){
    textColor = "black";
    if(inputPointer == i){
      textColor = "red";
    }
    span = newElement("font", [["id", "text_"+i], ["color", textColor]]);
    text = document.createTextNode(dfa[dfaIndex]["input"][inputIndex]["string"][i]);
    span.appendChild(text);
    inputContainer.appendChild(span);
  }
}

window.addEventListener('load', function(e){
  canvas2 = document.getElementById("canvas2");

  refreshInput();
  refreshCanvas2();

  // Event listener for changing DFA
  changeDFA = document.getElementById("change_dfa");
  changeDFA.addEventListener("click", function(e){
    clearElem(canvas2);
    dfaIndex = dfaIndex + 1;
    if(dfaIndex >= dfa.length){
      dfaIndex = 0;
    }
    refreshCanvas2();
    resetInput();
  });

  // Event listener for changing input
  changeInput = document.getElementById("change_input");
  changeInput.addEventListener("click", function(e){
    inputIndex = inputIndex + 1;
    if(inputIndex >= dfa[dfaIndex]["input"].length){
      inputIndex = 0;
    }
    inputPointer = -1;
    refreshInput();
    refreshCanvas2();
  });

  // Event listener for next
  next = document.getElementById("next");
  next.addEventListener("click", function(e){
    if(inputPointer != dfa[dfaIndex]["input"][inputIndex]["string"].length){
      inputPointer = inputPointer + 1;
      refreshInput();
      refreshCanvas2();
    }
  });

  // Event listener for prev
  prev = document.getElementById("prev");
  prev.addEventListener("click", function(e){
    if(inputPointer != -1){
      inputPointer = inputPointer - 1;
      refreshInput();
      refreshCanvas2();
    }
  });

});
