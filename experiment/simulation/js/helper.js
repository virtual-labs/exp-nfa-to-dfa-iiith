/****
 * File containing helper functions
 *
 */

function newElementNS(tag, attr) {
  const elem = document.createElementNS("http://www.w3.org/2000/svg", tag);
  attr.forEach(function (item) {
    elem.setAttribute(item[0], item[1]);
  });
  return elem;
}

function newElement(tag, attr) {
  const elem = document.createElement(tag);
  attr.forEach(function (item) {
    elem.setAttribute(item[0], item[1]);
  });
  return elem;
}

function clearElem(elem) {
  while (elem.firstChild) {
    elem.removeChild(elem.lastChild);
  }
}

/**
 * Returns the angle (in degrees) near the midpoint of an SVG path
 * by sampling slightly before and after half the path length.
 *   0   = pointing right
 *   90  = pointing up
 *  -90  = pointing down
 *  180  = pointing left
 */
function getMidAngle(pathElem) {
  const length = pathElem.getTotalLength();
  const half = length / 2;
  const sampleDist = 0.1;

  // A point just before midpoint
  const ptBefore = pathElem.getPointAtLength(Math.max(0, half - sampleDist));
  // A point just after midpoint
  const ptAfter = pathElem.getPointAtLength(Math.min(length, half + sampleDist));

  const dx = ptAfter.x - ptBefore.x;
  const dy = ptAfter.y - ptBefore.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI; // degrees in [-180..180]
}

/**
 * Decide if label goes above (negative offset) or below (positive offset)
 * based on the arrow's midpoint angle. We treat ~135..315 as “downish.”
 */
function getVerticalOffset(angleDeg) {
  let a = angleDeg % 360;
  if (a < 0) a += 360;

  // If angle ~135..315 => "downish" => place text below
  if (a > 135 && a < 315) {
    return 12; // e.g. 12px below
  } else {
    // otherwise above
    return -10; // 12px above
  }
}

/**
 * Main function to display the NFA in the SVG canvas.
 */
function displayCanvas(canvas, nfa, inputPointer, currNode) {
  const sine45 = 0.707;

  const nodes = [];
  const edges = [];

  // Define arrowhead marker for edges
  const defs = newElementNS("defs", []);
  const marker = newElementNS("marker", [
    ["id", "arrowhead"],
    ["markerWidth", "10"],
    ["markerHeight", "7"],
    ["refX", "5"],
    ["refY", "3.5"],
    ["orient", "auto"],
    ["markerUnits", "strokeWidth"],
  ]);

  const arrow = newElementNS("path", [
    ["d", "M0,0 L10,3.5 L0,7 Z"],
    ["fill", "black"],
  ]);
  marker.appendChild(arrow);
  defs.appendChild(marker);
  canvas.appendChild(defs);

  // Parse nodes in NFA
  nfa["vertices"].forEach(function (elem, index) {
    const newnode = {
      text: elem["text"],
      type: elem["type"],
      // "width" and "height" are assumed to be global or passed in
      x: width / 5 + index * (width / 5),
      y: height / 2,
    };
    nodes.push(newnode);
  });

  // Display nodes
  nodes.forEach(function (elem) {
    let color = "black";
    let stroke_width = "1px";
    let fillColor = "#ffffff";

    if (elem["type"] === "start") {
      fillColor = "#6699CC";
      const startArrow = newElementNS("path", [
        ["id", elem["text"] + "_start_arrow"],
        [
          "d",
          "M " +
          (elem["x"] - radius - 40) +
          " " +
          elem["y"] +
          " L " +
          (elem["x"] - radius) +
          " " +
          elem["y"],
        ],
        ["fill", "none"],
        ["stroke", color],
        ["stroke-width", stroke_width],
        ["marker-end", "url(#arrowhead)"],
      ]);
      canvas.appendChild(startArrow);
    } else if (elem["type"] === "accept") {
      fillColor = "#97d23d";
      const outerCircle = newElementNS("circle", [
        ["id", elem["text"] + "_outer_circle"],
        ["cx", elem["x"]],
        ["cy", elem["y"]],
        ["r", radius + 5],
        ["stroke", color],
        ["fill", "none"],
        ["stroke-width", stroke_width],
      ]);
      canvas.appendChild(outerCircle);
    }
    if (currNode === elem["text"]) {
      fillColor = "Gray";
    }

    const circleElem = newElementNS("circle", [
      ["id", elem["text"] + "_circle"],
      ["cx", elem["x"]],
      ["cy", elem["y"]],
      ["r", radius],
      ["stroke", color],
      ["fill", fillColor],
      ["stroke-width", stroke_width],
    ]);

    const textElem = newElementNS("text", [
      ["id", elem["text"] + "_circle_text"],
      ["x", elem["x"]],
      ["y", elem["y"]],
      ["fill", "#000"],
      ["text-anchor", "middle"],
      ["dominant-baseline", "middle"],
    ]);
    textElem.textContent = elem["text"];

    canvas.appendChild(circleElem);
    canvas.appendChild(textElem);
  });

  // Parse edges in NFA
  nfa["edges"].forEach(function (e) {
    const newEdge = {
      text: e["text"],
      type: e["type"],
      start: { text: e["start"], x: 0, y: 0 },
      mid: { x: 0, y: 0 },
      end: { text: e["end"], x: 0, y: 0 },
    };

    // Find start/end coords
    nodes.forEach(function (nodeElem) {
      if (nodeElem["text"] === e["start"]) {
        newEdge["start"]["x"] = nodeElem["x"];
        newEdge["start"]["y"] = nodeElem["y"];
      }
      if (nodeElem["text"] === e["end"]) {
        newEdge["end"]["x"] = nodeElem["x"];
        newEdge["end"]["y"] = nodeElem["y"];
      }
    });

    const offset = radius;
    const isMultipleSymbols =
      Array.isArray(e["text"]) && e["text"].length > 1;
    const additionalOffset = isMultipleSymbols ? e["text"].length * 10 : 0;

    if (e["type"] === "forward") {
      newEdge["start"]["x"] += offset * sine45;
      newEdge["start"]["y"] -= offset * sine45;
      newEdge["end"]["x"] -= offset * sine45;
      newEdge["end"]["y"] -= offset * sine45;

      newEdge["mid"]["x"] =
        (newEdge["start"]["x"] + newEdge["end"]["x"]) / 2;
      newEdge["mid"]["y"] =
        newEdge["start"]["y"] - (radius + additionalOffset);
    } else if (e["type"] === "backward") {
      newEdge["start"]["x"] -= offset * sine45;
      newEdge["start"]["y"] += offset * sine45;
      newEdge["end"]["x"] += offset * sine45;
      newEdge["end"]["y"] += offset * sine45;

      newEdge["mid"]["x"] =
        (newEdge["start"]["x"] + newEdge["end"]["x"]) / 2;
      newEdge["mid"]["y"] =
        newEdge["start"]["y"] + (radius + additionalOffset);
    } else if (e["type"] === "self") {
      newEdge["start"]["x"] += offset * sine45;
      newEdge["start"]["y"] += offset * sine45;
      newEdge["end"]["x"] -= offset * sine45;
      newEdge["end"]["y"] += offset * sine45;

      newEdge["mid"]["x"] =
        (newEdge["start"]["x"] + newEdge["end"]["x"]) / 2;
      newEdge["mid"]["y"] =
        newEdge["start"]["y"] + 3 * radius + additionalOffset;
    }

    edges.push(newEdge);
  });

  // Display edges
  edges.forEach(function (elem) {
    const baseId = elem["start"]["text"] + "_" + elem["end"]["text"];

    // Use a cubic Bézier path
    const linepoints =
      "M " +
      elem["start"]["x"] +
      " " +
      elem["start"]["y"] +
      " C " +
      elem["start"]["x"] +
      " " +
      elem["start"]["y"] +
      "," +
      elem["mid"]["x"] +
      " " +
      elem["mid"]["y"] +
      "," +
      elem["end"]["x"] +
      " " +
      elem["end"]["y"];

    const line = newElementNS("path", [
      ["id", baseId],
      ["d", linepoints],
      ["fill", "none"],
      ["stroke", "black"],
      ["marker-end", "url(#arrowhead)"],
    ]);
    canvas.appendChild(line);

    const pathLen = line.getTotalLength();
    const halfLen = pathLen / 2;
    const midPt = line.getPointAtLength(halfLen);

    const angleDeg = getMidAngle(line);
    const verticalOffset = getVerticalOffset(angleDeg);

    let labelStr = "";
    if (Array.isArray(elem["text"])) {
      labelStr = elem["text"].join(",");
    } else {
      labelStr = elem["text"];
    }

    const label = newElementNS("text", [
      ["id", baseId + "_text"],
      ["fill", "black"],
      ["text-anchor", "middle"],
      ["dominant-baseline", "middle"],
    ]);
    label.setAttribute("x", midPt.x);
    label.setAttribute("y", midPt.y + verticalOffset);
    label.textContent = labelStr;
    canvas.appendChild(label);
  });

  return [nodes, edges];
}
