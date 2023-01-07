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
        str += "read character "+nfa[nfaIndex]["input"][inputIndex]["string"][inputPointer-1];
        if(path_state=="acc"){
          str += " and moved from state "+nfa[nfaIndex]["input"][inputIndex]["states"][inputPointer-1];
          str += " to state "+nfa[nfaIndex]["input"][inputIndex]["states"][inputPointer];
        }else{
          str += " and moved from state "+nfa[nfaIndex]["input"][inputIndex]["reject_path"][inputPointer-1];
          str += " to state "+nfa[nfaIndex]["input"][inputIndex]["reject_path"][inputPointer];
        }
      }
      if(inputPointer==0){
        str += "moved to start state";
      }
      addToStack1(str);

      str = "";
      if(inputPointer!=0){
        str += "read character "+dfa[dfaIndex]["input"][inputIndex]["string"][inputPointer-1];
        str += " and moved from state "+dfa[dfaIndex]["input"][inputIndex]["states"][inputPointer-1];
        str += " to state "+dfa[dfaIndex]["input"][inputIndex]["states"][inputPointer];
      }
      if(inputPointer==0){
        str += "moved to start state";
      }
      addToStack2(str);
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
