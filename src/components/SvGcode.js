/* Copyright (C) 2019 Natura Cosméticos - All Rights Reserved
 * You may not use, distribute and modify this code without
 * explicit permission.
 *
 * Author: Caroline Rozendo
 *
 * 'SvGcode' component cleans up the SVG code
 * and transforms it into GCODE
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {TweenLite, AttrPlugin, Draggable} from "gsap/all";

import GCanvas from 'gcanvas';
import canvg from 'canvg';

function SvGcode(){
  this.convert = function(svg, scale, area, rot){
    let gcode = '';
    let splitSvg = svg.split("<svg");
    let w = Number(area[2]);
    let h = Number(area[3]);
    let x = Number(area[0]);
    let y = Number(area[1]);

    if(!svg || splitSvg.length < 2){ return gcode; }

    var driver = new GCanvas.GcodeDriver({
      write: function(cmd) {
        gcode += cmd + '\n';
      }
    });

    let gctx = new GCanvas(driver, w, h);
    gctx.toolDiameter = 0.2;

    svg = splitSvg.join('<svg id="cSvg" transform="translate('+(x)+','+(y)+')"');
    // this is a temporary element on the html
    document.querySelector("#convert").innerHTML = svg;

    TweenLite.set("#cSvg", {
        transformOrigin:"0 0",
        rotation:180,
        scaleX:-0.264583,
        scaleY:0.264583
      });
    svg = document.querySelector("#convert").innerHTML;

    canvg(gctx.canvas, svg.toString());
    gcode = parseGcode(gcode);

    document.querySelector("#convert").innerHTML = "";
    
    return gcode;
  }

}

function RDPppd(points,epsilon){
    var firstPoint=points[0];
    var lastPoint=points[points.length-1];
    var index=-1;
    var dist=0;
    var code = "";

    if(points.length<3){
      return points;
    }

    for(var i=1;i<points.length-1;i++){
      let cDist = findPerpendicularDistance(points[i],firstPoint,lastPoint);
      if(cDist>dist){
          dist=cDist;
          index=i;
          code = "";
      }
    }

    if (dist>epsilon){
        // iterate
        var l1=points.slice(0, index+1);
        var l2=points.slice(index);
        var r1=RDPppd(l1,epsilon);
        var r2=RDPppd(l2,epsilon);
        var rs=r1.slice(0,r1.length-1).concat(r2);
        return rs;
    }else{
        return [firstPoint,lastPoint];
    }
}

function parseGcode(fileData) {
  if (!fileData) {
    console.log("no gcode loaded");
    return;
  }

  let pathList, paths, pathRows;
  let rows = fileData.split(/\r?\n/);
  let rowArr;
  let penupList = [];
  let pts = [], newPts = [];
  let gcode = "G90 G21\n";
  let newGcode = "G90 G21\n";

  pathList = rows.join("\n");
  pts = [];
  newPts = [];

  for(var j=0; j<rows.length; j++){
    if(	rows[j].indexOf("X") > -1 &&
        rows[j].indexOf("Y") > -1 ){
      rows[j] = rows[j].replace("X","").replace("Y","");
      rowArr = rows[j].split(" ");
      pts.push({ code:rowArr[0], x: rowArr[1], y: rowArr[2] });
    }
  }

  if(pts.length > 0){
    newPts = [];
  }

  let startIndex = 0;
  let endIndex = 1;
  let slicedPts = [];

  for(var j=0; j<pts.length; j++){
    if(	pts[j].code.indexOf("G0") > -1 || j == pts.length-1 ){

      if(endIndex-startIndex <= 1){
        newPts.push(pts[j]);
      }else{
        endIndex = j;
        slicedPts = RDPppd(pts.slice(startIndex,endIndex), 0.06);
        newPts = newPts.concat(slicedPts);
        newPts.push(pts[j]);
      }

      startIndex = j+1;
      endIndex = j+2;
    }else{
      endIndex++;
    }
  }

  for(var j=0; j<newPts.length; j++){
    if(newPts[j].code.indexOf("G0") > -1){
      newGcode += "M300 S50.00\n";
      newGcode += newPts[j].code + " X" + newPts[j].x + " Y" + newPts[j].y + " Z0\n";
      newGcode += "M300 S30.00\n";
    }else{
      newGcode += newPts[j].code + " X" + newPts[j].x + " Y" + newPts[j].y + " Z0\n";
    }
  }
  newGcode += "M300 S50.00\n";
  newGcode += "G28\n";
  newGcode += "M30\n";

  return newGcode;
}

function findPerpendicularDistance(p, p1,p2) {
  var result;
  var slope;
  var intercept;
  if (p1.x==p2.x){
      result = Math.abs(p.x-p1.x);
  }else{
    slope = (p2.y - p1.y) / (p2.x - p1.x);
    intercept = p1.y - (slope * p1.x);
    result = Math.abs(slope * p.x - p.y + intercept) / Math.sqrt(Math.pow(slope, 2) + 1);
  }

  return result;
}

export default SvGcode;
