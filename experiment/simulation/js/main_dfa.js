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

function resetStack2(){
  stack = document.getElementById("stack_list_2");
  clearElem(stack);
}

function addToStack2(str){
  stack = document.getElementById("stack_list_2");
  listElem = newElement("li", []);
  textNode = document.createTextNode(str);
  listElem.appendChild(textNode)
  if (stack.firstChild) {
    stack.firstChild.style.fontWeight = "normal";
    stack.insertBefore(listElem, stack.firstChild);
  } else {
    stack.appendChild(listElem);
  }
  stack.firstChild.style.fontWeight = "bold";

}

function removeFromStack2(){
  stack = document.getElementById("stack_list_2");
  if(stack.firstChild){
    stack.removeChild(stack.firstChild);
    if (stack.firstChild) {
      stack.firstChild.style.fontWeight = "bold";
    }
  }
}
