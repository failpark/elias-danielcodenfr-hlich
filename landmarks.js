// landmarks.js
// where vertex indices and triangulation are defined
//
// hint: you'll need either of the following to view this file
// with correct formatting:
// A) a large monitor
// B) an editor that is not editor.p5js.org and has
//    non-wrapping lines or less huge font size


//------------------------------------------
// HAND:
//
const WRIST = 0; 
const THUMB_CMC = 1; 
const THUMB_MCP = 2; 
const THUMB_IP = 3; 
const THUMB_TIP = 4; 
const INDEX_FINGER_MCP = 5; 
const INDEX_FINGER_PIP = 6; 
const INDEX_FINGER_DIP = 7; 
const INDEX_FINGER_TIP = 8; 
const MIDDLE_FINGER_MCP = 9; 
const MIDDLE_FINGER_PIP = 10; 
const MIDDLE_FINGER_DIP = 11; 
const MIDDLE_FINGER_TIP = 12; 
const RING_FINGER_MCP = 13; 
const RING_FINGER_PIP = 14; 
const RING_FINGER_DIP = 15; 
const RING_FINGER_TIP = 16; 
const PINKY_MCP = 17; 
const PINKY_PIP = 18; 
const PINKY_DIP = 19; 
const PINKY_TIP = 20; 

const HAND_VERTEX_INDICES = [
  [PINKY_MCP,WRIST,THUMB_CMC,INDEX_FINGER_MCP,MIDDLE_FINGER_MCP,RING_FINGER_MCP,PINKY_MCP],
  [THUMB_CMC,THUMB_MCP,THUMB_IP,THUMB_TIP],
  [INDEX_FINGER_MCP,INDEX_FINGER_PIP,INDEX_FINGER_DIP,INDEX_FINGER_TIP],
  [MIDDLE_FINGER_MCP,MIDDLE_FINGER_PIP,MIDDLE_FINGER_DIP,MIDDLE_FINGER_TIP],
  [RING_FINGER_MCP,RING_FINGER_PIP,RING_FINGER_DIP,RING_FINGER_TIP],
  [PINKY_MCP,PINKY_PIP,PINKY_DIP,PINKY_TIP],
  ];

const FACELANDMARKER_NOSE = [{start:168,end:6},{start:6,end:195},{start:195,end:4},{start:98,end:97},{start:97,end:2},{start:2,end:326},{start:326,end:327}];

const HANDLANDMARKER_PALM = [
  {start:PINKY_MCP,end:WRIST}, 
  {start:WRIST,end:THUMB_CMC}, 
  {start:THUMB_CMC,end:INDEX_FINGER_MCP},
  {start:INDEX_FINGER_MCP,end:MIDDLE_FINGER_MCP},
  {start:MIDDLE_FINGER_MCP,end:RING_FINGER_MCP},
  {start:RING_FINGER_MCP,end:PINKY_MCP}];
const HANDLANDMARKER_THUMB = [
  {start:THUMB_CMC,end:THUMB_MCP},
  {start:THUMB_MCP,end:THUMB_IP},
  {start:THUMB_IP,end:THUMB_TIP}];
const HANDLANDMARKER_INDEX_FINGER = [
  {start:INDEX_FINGER_MCP,end:INDEX_FINGER_PIP},
  {start:INDEX_FINGER_PIP,end:INDEX_FINGER_DIP},
  {start:INDEX_FINGER_DIP,end:INDEX_FINGER_TIP}];
const HANDLANDMARKER_MIDDLE_FINGER = [
  {start:MIDDLE_FINGER_MCP,end:MIDDLE_FINGER_PIP},
  {start:MIDDLE_FINGER_PIP,end:MIDDLE_FINGER_DIP},
  {start:MIDDLE_FINGER_DIP,end:MIDDLE_FINGER_TIP}];
const HANDLANDMARKER_RING_FINGER = [
  {start:RING_FINGER_MCP,end:RING_FINGER_PIP},
  {start:RING_FINGER_PIP,end:RING_FINGER_DIP},
  {start:RING_FINGER_DIP,end:RING_FINGER_TIP}];
const HANDLANDMARKER_PINKY = [
  {start:PINKY_MCP,end:PINKY_PIP},
  {start:PINKY_PIP,end:PINKY_DIP},
  {start:PINKY_DIP,end:PINKY_TIP}];
