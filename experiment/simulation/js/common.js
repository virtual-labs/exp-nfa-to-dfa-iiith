/****
  * File containing event listeners
  *
  */

window.addEventListener('load', function(e){
  canvas1 = document.getElementById("canvas1");
  canvas2 = document.getElementById("canvas2");

  refreshInput();
  refreshCanvas1();
  refreshCanvas2();
  resetStack1();
  resetStack2();

  // Event listener for changing FA
  changeFA = document.getElementById("change_fa");
  changeFA.addEventListener("click", function(e){
    clearElem(canvas1);
    clearElem(canvas2);
    nfaIndex = nfaIndex + 1;
    dfaIndex = dfaIndex + 1;
    if(nfaIndex >= nfa.length){
      nfaIndex = 0;
    }
    if(dfaIndex >= dfa.length){
      dfaIndex = 0;
    }
    refreshCanvas1();
    refreshCanvas2();
    resetInput();
    resetStack1();
    resetStack2();
  });

  // Event listener for changing input
  changeInput = document.getElementById("change_input");
  changeInput.addEventListener("click", function(e){
    inputIndex = inputIndex + 1;
    if(inputIndex >= nfa[nfaIndex]["input"].length){
      inputIndex = 0;
    }
    inputPointer = -1;
    refreshInput();
    refreshCanvas1();
    refreshCanvas2();
    resetStack1();
    resetStack2();
  });

  // Event listener for next
  next = document.getElementById("next");
  next.addEventListener("click", function(e){
    if(inputPointer != nfa[nfaIndex]["input"][inputIndex]["string"].length){
      inputPointer = inputPointer + 1;
      refreshInput();
      refreshCanvas1();
      refreshCanvas2();

      str = "";
      if(inputPointer!=0){
        str += "Read character "+nfa[nfaIndex]["input"][inputIndex]["string"][inputPointer-1];
        if(path_state=="acc"){
          str += " and moved from State "+nfa[nfaIndex]["input"][inputIndex]["states"][inputPointer-1];
          str += " to State "+nfa[nfaIndex]["input"][inputIndex]["states"][inputPointer];
        }else{
          str += " and moved from State "+nfa[nfaIndex]["input"][inputIndex]["reject_path"][inputPointer-1];
          str += " to State "+nfa[nfaIndex]["input"][inputIndex]["reject_path"][inputPointer];
        }
      }
      if(inputPointer==0){
        str += "Moved to Start State";
      }
      addToStack1(str);

      str = "";
      if(inputPointer!=0){
        str += "Read character "+dfa[dfaIndex]["input"][inputIndex]["string"][inputPointer-1];
        str += " and moved from State "+dfa[dfaIndex]["input"][inputIndex]["states"][inputPointer-1];
        str += " to State "+dfa[dfaIndex]["input"][inputIndex]["states"][inputPointer];
      }
      if(inputPointer==0){
        str += "Moved to Start State";
      }
      addToStack2(str);

      // Display popup at end
      if(inputPointer==dfa[dfaIndex]["input"][inputIndex]["string"].length){

        nfaComputationStatus = "Rejected";
        dfaComputationStatus = "Rejected";

        for(itr=0;itr<nfa[nfaIndex]["vertices"].length;++itr){

          if(path_state=="acc"){
            if(nfa[nfaIndex]["vertices"][itr]["text"] == nfa[nfaIndex]["input"][inputIndex]["states"][inputPointer]){
              if(nfa[nfaIndex]["vertices"][itr]["type"] == "accept"){
                nfaComputationStatus = "Accepted";
              }
              break;
            }
          }else{
            if(nfa[nfaIndex]["vertices"][itr]["text"] == nfa[nfaIndex]["input"][inputIndex]["reject_path"][inputPointer]){
              if(nfa[nfaIndex]["vertices"][itr]["type"] == "accept"){
                nfaComputationStatus = "Accepted";
              }
              break;
            }
          }

        }
        for(itr=0;itr<dfa[dfaIndex]["vertices"].length;++itr){
          if(dfa[dfaIndex]["vertices"][itr]["text"] == dfa[dfaIndex]["input"][inputIndex]["states"][inputPointer]){
            if(dfa[dfaIndex]["vertices"][itr]["type"] == "accept"){
              dfaComputationStatus = "Accepted";
            }
            break;
          }
        }
        swal("Input string was " + nfaComputationStatus + " by NFA and " + dfaComputationStatus + " by DFA"+'\n'+"Explanation: " + nfa[nfaIndex]["Explanation"][inputIndex]["string"]);
      }
    }
  });

  // Event listener for prev
  prev = document.getElementById("prev");
  prev.addEventListener("click", function(e){
    if(inputPointer != -1){
      inputPointer = inputPointer - 1;
      refreshInput();
      refreshCanvas1();
      refreshCanvas2();
      removeFromStack1();
      removeFromStack2();
    }
  });

  path_switch = document.getElementById("path_switch");
  path_switch.addEventListener("change", function(e){
    if(path_state == "acc"){
      path_state = "rej";
    }else{
      path_state = "acc";
    }
    inputPointer = -1;
    refreshInput();
    refreshCanvas1();
    refreshCanvas2();
    resetStack1();
    resetStack2();
  });
});
