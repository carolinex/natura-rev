/* Copyright (C) 2019 Natura Cosméticos - All Rights Reserved
 * You may not use, distribute and modify this code without
 * explicit permission.
 *
 * Author: Caroline Rozendo
 *
 * 'Personalization' component is the section where users
 * chose the message and icons for the chosen product
 *
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {TweenLite, AttrPlugin, Draggable} from "gsap/all";
import * as d3 from 'd3-fetch';
import Hammer from 'hammerjs';

/* styles */
import './../styles/Reset.css';
import './../styles/Main.scss';
/* components */
import Button from './Button';
import FontSelect from './FontSelect';
import VectorLib from './VectorLib';
import * as He from 'he';
import SvGcode from './SvGcode';

class Personalization extends Component {
  constructor(props) {
    super(props);
    this.product = this.props.product;
    this.textPos = [0,0];
    this.imagePos = [0,0];
    this.selectedFont = this.props.font;
    this.minScale = 0.05;
    this.textScale = 0.05;
    this.imageScale = 0.05;
    this.textRotate = 0;
    this.imageRotate = 0;
    this.showTab = this.showTab.bind(this);
    this.targetTransform = this.targetTransform.bind(this);
    this.convertSvg = this.convertSvg.bind(this);
    this.getText = this.getText.bind(this);
    this.postCode = this.postCode.bind(this);
    this.onChangeFont = this.onChangeFont.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMsg = this.onMsg.bind(this);
    this.onBackButton = this.onBackButton.bind(this);
    this.h2Text;
    this.sentLine = 0;
    this.dragTarget;
    this.textDragger;
    this.imageDragger;
    this.gcode = "";
    this.spaceAfter = {
      "T": -6,
      "I": 6,
      "Igrave": 6,
      "Iacute": 3,
      "i": 10,
      "iacute":4,
      "igrave": 3,
      "l": 4,
      "verbar":4,
      "!":4,
      "¡":4,
      "r":-3,
      "n":3,
      "j":-2,
      "a":-10,
      "aacute":-10,
      "agrave":-10,
      "atilde":-10
    }
    this.spaceBefore = {
      /*"i": 4,
      "aacute": -5,
      "agrave": -5,
      "atilde": -5*/
    }
    this.gcoder;
  }

  componentDidMount(){

  }

  componentDidUpdate(){
    this.selectedFont = this.props.font;

    let vTarget;
    let area = document.querySelector("#vector-area");
    var hammer = new Hammer(area);

    hammer.get('pinch').set({ enable: true });

    hammer.on('pinchstart', (e) => {
      let center = {  x: e.center.x - this.getLeft("area"),
                      y: e.center.y - this.getTop("area") }
      let target;
      let tCenter = { x:this.getLeft("text") + (this.getWidth("text")/2),
                      y:this.getTop("text") + (this.getHeight("text")/2)};
      let iCenter = { x:this.getLeft("image") + (this.getWidth("image")/2),
                      y:this.getTop("image") + (this.getHeight("image")/2)};

      if(this.getDistBetween(center,tCenter) < this.getDistBetween(center,iCenter)){
        target = "text";
      }else{
        target = "image";
      }

      if(document.querySelector("#"+target+"-bounds")){
        document.querySelector("#"+target+"-bounds").remove();
      }
      if(document.querySelector("#"+target+"-remove")){
        document.querySelector("#"+target+"-remove").remove();
      }

      area.setAttribute("data-scale", this[target+"Scale"]);
      area.setAttribute("data-rotation", e.rotation);
      area.setAttribute("data-target", target);

      if(this.textDragger){ this.textDragger[0].disable(); }
      if(this.imageDragger){ this.imageDragger[0].disable(); }
    });

    hammer.on('pinchmove', (e) => {
      let target = area.getAttribute("data-target");
      let d = area.getAttribute("data-scale") || this[target+"Scale"];
      let r = area.getAttribute("data-rotation") || e.rotation;

      if(d*e.scale > 0.3 || d*e.scale < this.minScale){ return; }
      this[target+"Scale"] = d*e.scale;
      this.targetTransform(target,"50% 50%");

      if(this[target+"Dragger"]){
        this[target+"Dragger"][0].update();
        this[target+"Dragger"][0].applyBounds();
      }
    });

    hammer.on('pinchend', (e) => {
      let target = area.getAttribute("data-target");
      let vTarget = document.querySelector("#vector-"+target);
      area.setAttribute("data-scale", "");
      area.setAttribute("data-rotation", "");

      if(document.querySelector("#"+target+"-bounds")){
        document.querySelector("#"+target+"-bounds").remove();
      }
      if(document.querySelector("#"+target+"-remove")){
        document.querySelector("#"+target+"-remove").remove();
      }

      let tWidth = Math.round(vTarget.getBBox().width + 10);
      let tHeight = Math.round(vTarget.getBBox().height + 75);

      this.addBounds("#vector-"+target, tWidth, tHeight);
      this.targetTransform(target,"50% 50%");
      this.adjustTarget(target);

      if(this.textDragger){
        this.textDragger[0].enable();
        this.textDragger[0].update();
        this.textDragger[0].applyBounds();
      }
      if(this.imageDragger){
        this.imageDragger[0].enable();
        this.imageDragger[0].update();
        this.imageDragger[0].applyBounds();
      }
      area.setAttribute("data-target", "text");

    });

    this.gcoder = new SvGcode();

    if(this.props.product.rotation){
      this.product = this.props.product;
      this.textRotate = Number(this.props.product.rotation) + 360;
      this.imageRotate = Number(this.props.product.rotation) + 360;

      this.targetTransform("text");
      this.targetTransform("image");
    }

    this.updateVectors();

    if(this.textDragger){
      this.textDragger[0].update();
      this.textDragger[0].applyBounds();
    };
    if(this.imageDragger){
      this.imageDragger[0].update();
      this.imageDragger[0].applyBounds();
    };
  }

  onBackButton(e){
    document.querySelector("#vector-text").innerHTML = "";
    document.querySelector("#vector-image").innerHTML = "";
    this.props.stateHandler(e);
  }

  updateVectors(){
    let vGroups = ["text", "image"];

    for(var i=0; i<vGroups.length; i++){
      let maxIt = 0;
      while( maxIt <= 50 &&
            (this.getWidth(vGroups[i]) > this.getWidth("area") ||
            this.getHeight(vGroups[i]) > this.getHeight("area")) ){
        maxIt++;
        this[vGroups[i]+"Scale"] -= 0.01;
        if(this[vGroups[i]+"Scale"] < this.minScale){ this[vGroups[i]+"Scale"] = this.minScale }

        this.targetTransform(vGroups[i]);
      }

      if( this.getLeft(vGroups[i]) < 0 ){
        this[vGroups[i]+"Pos"][0] = Math.abs(this.getWidth(vGroups[i]));
      }
      if( this.getTop(vGroups[i]) < 0 ){
        this[vGroups[i]+"Pos"][1] = Math.abs(this.getHeight(vGroups[i]));
      }
      this.targetTransform(vGroups[i]);

      if( this[vGroups[i]+"Dragger"] ){
        this[vGroups[i]+"Dragger"][0].update();
        this[vGroups[i]+"Dragger"][0].applyBounds();
      }
    }
  }

  createMarkup(str) {
    return {__html: str};
  }

  getCurrentTitle(){
    return this.h2Text;
  }

  getText(num){
    let texts = this.props.texts;
    let lang = this.props.language;

    return lang && texts["t"+num] ? texts["t"+num][lang] : "";
  }

  updateArea(){
    let ns = "http://www.w3.org/2000/svg";
    let product = {};
    let area = document.querySelector("#drawable");
    let areaWidth, areaHeight;
    let svg = document.querySelector("#vector-area");
    let areaSq = document.createElementNS(ns, "rect");

    if(!this.props.product.area_screen){
      return;
    }

    let areaScreen = this.props.product.area_screen.split(" ");
    let areaProduct =  [  this.props.product.product_x,
                          this.props.product.product_y,
                          this.props.product.product_width,
                          this.props.product.product_height ];

    product.x = areaScreen[0];
    product.y = areaScreen[1];
    product.width = areaScreen[2];
    product.height = areaScreen[3];
    product.rotation = Number(this.props.product.rotation) + 360;

    if(area && product && product.x){
      area.style.left = product.x+"%";
      area.style.top = product.y+"%";
      area.style.width = product.width+"%";
      area.style.height = product.height+"%";

      areaWidth = area.offsetWidth;
      areaHeight = area.offsetHeight;

      areaSq.setAttribute("width", areaProduct[2]);
      areaSq.setAttribute("height", areaProduct[3]);
      areaSq.setAttribute("fill", "none");
      areaSq.setAttribute("stroke", "#fff");
      areaSq.setAttribute("id", "areaSq");

      svg.setAttribute("viewBox", "0 0 "+(areaProduct[2]*1)+" "+(areaProduct[3]*1));
      svg.setAttribute("width", (areaProduct[2]*1)+"mm");
      svg.setAttribute("height", (0 + areaProduct[3]*1)+"mm");
      svg.setAttribute("preserveAspectRatio", "xMinYMin slice");
    }
  }

  encodeHTML(html) {
    let simpleChars = /^[0-9a-zA-Z]+$/;
    let entity;

    if( !html.match(simpleChars) ){
      entity = He.encode(html, {
          useNamedReferences: true,
          encodeEverything: true
      }).replace(/&/gi,"").replace(/;/gi,"");
      if(entity == "#x5C"){
        entity = "bsol";
      }
      if(entity == "#x2D"){
        entity = "minus";
      }
    }else{
      entity = html;
    }
    return entity;
  };

  onChangeFont(font){
    this.props.fontHandler(font);
    this.selectedFont = font;
    let element = document.querySelector("#input-msg");
    this.dispatchKeyUp(element);
  }

  dispatchKeyUp(el){
    if(document.createEventObject){
        var eventObj = document.createEventObject();
        eventObj.keyCode = 13;
        el.fireEvent("onkeyup", eventObj);
        eventObj.keyCode = 13;
    }else if(document.createEvent){
        var eventObj = document.createEvent("Events");
        eventObj.initEvent("keyup", true, true);
        eventObj.which = 13;
        eventObj.keyCode = 13;
        el.dispatchEvent(eventObj);
    }
  }

  onKeyUp(e){
    let fontType = this.selectedFont;
    let charVector, charHtml, str;
    let maxLength = e.target.getAttribute("maxlength")
    let strArr = e.target.value.split("");
    let origArr = e.target.value.split("");

    if(e.keyCode == 13){
      e.target.blur();
    }

    if(e.target.value.length > maxLength){
      strArr = e.target.value.substr(0,maxLength).split("");
      origArr = e.target.value.substr(0,maxLength).split("");
    }

    for(var i=strArr.length-1; i>=0; i--){
      charHtml = this.encodeHTML(strArr[i]);
      charVector = document.querySelector("#"+fontType+"-"+charHtml);

      if(!charVector && strArr[i]!=" "){
        strArr.splice(i,1);
        origArr.splice(i,1);
      }else{
        strArr[i] = charHtml;
      }
    }

    e.target.value = origArr.join("");
    this.buildVectorText(strArr);
  }

  addBounds(parentSelector, width, height){
    let prefix = parentSelector.split("-")[1];
    let ns = "http://www.w3.org/2000/svg";
    let parent = document.querySelector(parentSelector);
    let boundsG = document.createElementNS(ns, "g");
    let bounds = document.createElementNS(ns, "rect");
    let edgePos = {x:width, y:height};
    let edgeRect, edgePoint;

    boundsG.setAttribute("id", prefix+"-bounds");
    bounds.setAttribute("id", prefix+"-boundRect");
    boundsG.appendChild(bounds);
    parent.appendChild(boundsG);

    if(width < 70){ width=70; edgePos.x = 70; }
    if(height < 90){ height=90; edgePos.y = 90; }

    let removeBtn = document.createElementNS(ns, "g");
    let removeCirc = document.createElementNS(ns, "circle");
    let removeX = document.createElementNS(ns, "text");

    removeBtn.setAttribute("id", prefix+"-remove");
    removeBtn.setAttribute("class", "btn");
    removeBtn.appendChild(removeCirc);
    removeBtn.appendChild(removeX);

    boundsG.appendChild(removeBtn);

    removeBtn.setAttribute("transform","translate("+edgePos.x+",0)");
    removeCirc.setAttribute("r", 25);
    removeX.innerHTML = "x";
    removeX.setAttribute("y", "5px");
    removeX.setAttribute("x", "0px");

    edgeRect = document.createElementNS(ns, "rect");
    edgeRect.setAttribute("x",-40);
    edgeRect.setAttribute("y",-35);
    edgeRect.setAttribute("width",80);
    edgeRect.setAttribute("height",80);
    edgeRect.setAttribute("id", prefix+"-edge");
    edgeRect.classList.add("transparent");
    removeBtn.appendChild(edgeRect);
    this.onRemoveClick = this.onRemoveClick.bind(this);
    removeBtn.addEventListener("click", this.onRemoveClick)

    bounds.setAttribute("x",0);
    bounds.setAttribute("y",0);
    bounds.setAttribute("width", width);
    bounds.setAttribute("height", height);

    boundsG.setAttribute('transform', 'translate(0, 0)');
    this.targetTransform(prefix);
    this.adjustTarget(prefix);

    if(this[prefix+"Dragger"]){
      this[prefix+"Dragger"][0].kill();
      this[prefix+"Dragger"] = null;
    }

    this[prefix+"Dragger"] = new Draggable.create("#vector-"+prefix, {
      trigger: bounds,
      bounds: document.getElementById("drawable"),
      onRelease: this.onBoxStopDrag.bind(this)
    });

  }

  buildVectorText(strArr){
    let area = document.querySelector("#vector-area");
    let vText = document.querySelector("#vector-text");
    let allTextVectors = document.querySelectorAll("#vector-list g");
    let charVector, charClone;
    let textScale = this.textScale;
    let textRotation = this.textRotate;
    let spaceAfter;
    let spaceBefore;
    let charXPos = 0;
    let fontType = this.selectedFont;
    let tWidth = 0;
    let tHeight = 0;
    let ns = "http://www.w3.org/2000/svg";
    let charG = document.createElementNS(ns, "g");

    allTextVectors.forEach(function(elem,i){
      elem.classList.remove('active');
    });

    vText.setAttribute("transform","");
    vText.innerHTML = "";

    for(var i=0; i<strArr.length; i++){
      if(strArr[i]==" " || strArr[i]=="#x20"){
        charXPos += 35;
      }else{
        charVector = document.querySelector("#"+fontType+"-"+strArr[i]);

        charClone = charVector.cloneNode(true);
        charClone.setAttribute("id","");

        spaceBefore = this.spaceBefore[strArr[i]];
        if(spaceBefore){ charXPos -= spaceBefore; }

        charClone.setAttribute("transform",
            "translate("+charXPos+",20)");
        charG.classList.add("text-content");

        charXPos += Math.ceil(charVector.getBBox().width) + 25;
        spaceAfter = this.spaceAfter[strArr[i]];
        if(spaceAfter){ charXPos += spaceAfter; }

        charG.appendChild(charClone);
        vText.appendChild(charG);
      }
    }

    //tWidth = charXPos;
    tWidth = Math.round(vText.getBBox().width + 10);
    tHeight = Math.round(vText.getBBox().height + 75);

    this.addBounds("#vector-text", tWidth, tHeight);
    this.adjustTarget("text");

    let evt = new Event('mouseup');
    document.dispatchEvent(evt);
  }

  adjustTarget(which){
    let target = document.querySelector("#vector-"+which);
    let maxIt = 0;

    while( maxIt <= 50 &&
          (this.getWidth(which) > this.getWidth("area") ||
          this.getHeight(which) > this.getHeight("area")) ){
      maxIt++;
      this[which+"Scale"] -= 0.01;
      if(this[which+"Scale"] < this.minScale){ this[which+"Scale"] = this.minScale }
      this.targetTransform(which);
    }

    this[which+"Pos"][0] = target._gsTransform.x;
    this[which+"Pos"][1] = target._gsTransform.y;

    if(this[which+"Dragger"]){
      this[which+"Dragger"][0].update();
      this[which+"Dragger"][0].applyBounds();
    }
  }

  onBoxStopDrag(e){
    let text = document.querySelector("#vector-text");
    let image = document.querySelector("#vector-image");

    this.textPos[0] = text._gsTransform.x;
    this.textPos[1] = text._gsTransform.y;
    this.targetTransform("text");

    this.imagePos[0] = image._gsTransform.x;
    this.imagePos[1] = image._gsTransform.y;
    this.targetTransform("image");
  }

  onRemoveClick(e){
    let parent = e.target.parentNode.getAttribute("id").split("-")[0];
    document.querySelector("#vector-"+parent).innerHTML = "";
  }

  onEdgePress(e){

    let prefix = e.target.getAttribute("id").split("-")[0].replace("#","");
    let edgeRect = document.querySelector("#"+prefix+"-edge");

    document.addEventListener("mouseup", this.onEdgeRelease);

    this.dragTarget = prefix;

    let currPosX = e.clientX || e.touches[0].clientX;
    let currPosY = e.clientY || e.touches[0].clientY;
    let svgP = this.svgPoint(currPosX, currPosY);
    let handle = document.querySelector("#"+prefix+"-edge");
    let target = document.querySelector("#vector-"+prefix);
    handle.setAttribute("data-lastX", svgP.x);

    if(e.clientX){
      document.addEventListener("mousemove", this.onEdgeDrag);
    }
  }

  onEdgeRelease(e){
    if(e.clientX){
      document.removeEventListener("mousemove", this.onEdgeDrag);
      document.removeEventListener("mouseup", this.onEdgeRelease);
    }
    this.updateVectors();
  }

  onEdgeDrag(e){
    let prefix = this.dragTarget;
    //let target = document.querySelector("#vector-"+this.dragTarget);
    let area = document.querySelector("#vector-area");
    let target = document.querySelector("#vector-"+prefix);
    let handle = document.querySelector("#"+prefix+"-edge");
    let lastPosX = handle.getAttribute("data-lastX");
    let currPosX = e.clientX || e.touches[0].clientX;
    let currPosY = e.clientY || e.touches[0].clientY;
    let svgP = this.svgPoint(currPosX, currPosY);
    let diffX = svgP.x - lastPosX;
    let w = this.getWidth(prefix);
    let areaW = target.getBoundingClientRect().width;
    let ratio = (diffX/(areaW+500));

    handle.setAttribute("data-lastX", svgP.x);

    this[prefix+"Scale"] += ratio;
    this.targetTransform(prefix);

    if( this.getRight(prefix)-15 > this.getRight("area") ||
        this.getBottom(prefix)-15 > this.getBottom("area")){
      this[prefix+"Scale"] -= ratio;
      this.targetTransform(prefix);
    }

    if(this[prefix+"Scale"] < this.minScale){
      this[prefix+"Scale"] = this.minScale;
    };
    this[prefix+"Dragger"][0].update();
    this[prefix+"Dragger"][0].applyBounds();
  }

  onTouchStart(e){
    let target;
    let text = document.querySelector("#vector-text");
    let img = document.querySelector("#vector-image");
    let p1, p2;
    let angle = 0;

    for(var i=0; i<e.path.length;i++){
      if(e.path[i] == text){
        target = text;
        break;
      }else if(e.path[i] == img){
        target = img;
        break;
      }
    }

    if(!target){
      return;
    }

    if(e.touches && e.touches.length > 1){
      p1 = {x: e.touches[0].clientX, y: e.touches[0].clientY };
      p2 = {x: e.touches[1].clientX, y: e.touches[1].clientY };
      angle = Math.round(this.getAngleBetween(p1,p2)*10000)/10000;

      this.textDragger[0].disable();
    }

    target.setAttribute("data-angle", angle || 0);
    target.setAttribute("data-startangle", this.textRotate);
  }

  onTouchRelease(e){
    this.textDragger[0].enable();
    //console.log("touch end");
  }

  onTouchMove(e){
    let target;
    let targetType = "";
    let text = document.querySelector("#vector-text");
    let img = document.querySelector("#vector-image");
    let lastAngle = parseFloat(text.getAttribute("data-angle"));
    let startAngle = parseFloat(text.getAttribute("data-startangle"));
    let angle = 0;
    let p1, p2;

    if(e.touches && e.touches.length > 1){
      for(var i=0; i<e.path.length;i++){
        if(e.path[i] == text){
          target = text; targetType = "text";
          break;
        }else if(e.path[i] == img){
          target = img; targetType = "image";
          break;
        }
      }if(!target){
        return;
      }

      let lastAngle = parseFloat(target.getAttribute("data-angle"));
      let startAngle = parseFloat(target.getAttribute("data-startangle"));
      p1 = {x: e.touches[0].clientX, y: e.touches[0].clientY };
      p2 = {x: e.touches[1].clientX, y: e.touches[1].clientY };

      angle = Math.round(this.getAngleBetween(p1,p2)*10000)/10000;

      let angleDiff = angle - lastAngle;

      let oldRot = this.textRotate;

      this[targetType+"Rotate"] = angleDiff;
      if(this[targetType+"Rotate"] > 360){ this[targetType+"Rotate"] -= 360 };
      if(this[targetType+"Rotate"] < 0){ this[targetType+"Rotate"] += 360 };

      this.targetTransform(targetType,"50% 50%");

      this[targetType+"Dragger"][0].update();
      this[targetType+"Dragger"][0].applyBounds();
    }
  }

  getAngleBetween(p1, p2){
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
  }

  getDistBetween(p1,p2){
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;

    return Math.abs(Math.sqrt( dx*dx + dy*dy ));
  }

  targetTransform(which, origin){
    let scale = this[which+"Scale"];
    let rotate = this[which+"Rotate"];
    let pos = [this[which+"Pos"][0], this[which+"Pos"][1]];
    let target = document.querySelector("#vector-"+which);
    let tOrigin = origin || "left top";

    //this.updateVectors();

    TweenLite.set("#vector-"+which, {
        scale:scale,
        rotation:rotate, transformOrigin:tOrigin,
        x:pos[0],
        y:pos[1]
      });

    if(this[which+"Scale"] < 0.12){
      target.classList.remove("medium");
      target.classList.remove("large");
      target.classList.add("small");
    }else if(this[which+"Scale"] >= 0.15){
      target.classList.remove("small");
      target.classList.remove("large");
      target.classList.add("medium");
    }
    if(this[which+"Scale"] > 0.17){
      target.classList.remove("small");
      target.classList.remove("medium");
      target.classList.add("large");
    }
  }

  getWidth(selector){
    return document.querySelector("#vector-"+selector)
                  .getBoundingClientRect().width;
  }
  getHeight(selector){
    return document.querySelector("#vector-"+selector)
                  .getBoundingClientRect().height;
  }
  getRight(selector){
    let elem = document.querySelector("#vector-"+selector);
    let elemBBox = elem.getBoundingClientRect();
    let parent = elem.parentNode;
    let parentBBox = parent.parentNode;
    let elemTransform = elem._gsTransform || elemBBox;

    return elemBBox.x + elemBBox.width;
  }
  getBottom(selector){
    let elem = document.querySelector("#vector-"+selector);
    let elemBBox = elem.getBoundingClientRect();
    let parent = elem.parentNode;
    let parentBBox = parent.parentNode;
    let elemTransform = elem._gsTransform || elemBBox;

    return elemBBox.y + elemBBox.height;
  }
  getLeft(selector){
    let elem = document.querySelector("#vector-"+selector);
    let elemBBox = elem.getBoundingClientRect();
    let parent = elem.parentNode;
    let parentBBox = parent.parentNode.getBoundingClientRect();

    return elemBBox.x - parentBBox.x;
  }

  getTop(selector){
    let elem = document.querySelector("#vector-"+selector);
    let elemBBox = elem.getBoundingClientRect();
    let parent = elem.parentNode;
    let parentBBox = parent.parentNode.getBoundingClientRect();

    return elemBBox.y - parentBBox.y;
  }

  svgPoint(x, y) {
    let svg = document.querySelector("#vector-area");
    let pt = svg.createSVGPoint();

    pt.x = x;
    pt.y = y;

    let svgPt = pt.matrixTransform(svg.getScreenCTM().inverse());

    return svgPt;
  }

  showTab(e){
    let tabContents = document.querySelectorAll(".step-column.tabContent");
    let allTabs = document.querySelectorAll(".msg-options li");
    let selectedTab = e.target.getAttribute("data-step");
    let msgMenu = document.querySelector("#msg-text-menu");
    let navTab;


    if(selectedTab==4){
      console.log(4);
      msgMenu.classList.remove("active");
      document.querySelector("#title3").classList.remove("active");
      document.querySelector("#title4").classList.add("active");
    }else{
      console.log("not4");
      msgMenu.classList.add("active");
      document.querySelector("#title3").classList.add("active");
      document.querySelector("#title4").classList.remove("active");
    }

    tabContents.forEach(function(elem,i){
      let tabNum = elem.getAttribute("data-tab");
      let navTab = document.querySelector(".step-nav li[data-num='"+(i+2)+"']");

      if(tabNum==selectedTab){
        elem.classList.add("active");
      }else{
        elem.classList.remove("active");
      }

      if(!navTab){ return; }

      if(tabNum<=selectedTab){
        navTab.classList.add("revealed");
      }else{
        navTab.classList.remove("revealed");
      }
    });

    allTabs.forEach(function(elem,i){
      let tabNum = elem.getAttribute("data-step");
      if(tabNum==selectedTab){
        elem.classList.add("active");
      }else{
        elem.classList.remove("active");
      }
    });
    this.updateVectors();
  }

  convertSvg(e){
    let svg = document.querySelector("#vector-area");
    let svgCopy = svg.cloneNode(true);
    let textVector = document.querySelector("#vector-text");
    let imageVector = document.querySelector("#vector-image");
    let screenWidth = svg.getBoundingClientRect().width;
    let props = this.props;
    let productArea = [ props.product.product_x,
                        props.product.product_y,
                        props.product.product_width,
                        props.product.product_height ];
    let productRot = Number(props.product.rotation)*-1;
    let productWidth;

    if(productArea){
      productWidth = productArea[2];
    }else{
      return;
    }

    if(svgCopy.querySelector("#text-bounds")){
      svgCopy.querySelector("#text-bounds").remove()
    };
    if(svgCopy.querySelector("#image-bounds")){
      svgCopy.querySelector("#image-bounds").remove()
    };
    svgCopy.querySelector("#vector-list").remove();

    svgCopy.querySelector("#vector-text").setAttribute("id", "final-text");
    svgCopy.querySelector("#vector-image").setAttribute("id", "final-image");

    let svgContainer = document.createElement("div");
    svgContainer.appendChild(svgCopy);

    svgContainer.querySelector("#final-text").setAttribute("style","fill:none;stroke:#000");
    svgContainer.querySelector("#final-image").setAttribute("style","fill:none;stroke:#000");

    let areaWidth = document.querySelector("#drawable").offsetWidth;
    let scale = 1;//areaWidth/productWidth;

    this.gcode = this.gcoder.convert(svgContainer.innerHTML, scale, productArea, productRot);
    console.log("GENERATING GCODE: \n"+this.gcode);

    this.postCode(this.sentLine);
  }

  // send code through websocket
  postCode(codeLine){
    let gcodeLines = this.gcode.split("\n");
    let targetIP = '';
    this.sentLine = 0;

    if(this.props.machineIP != ""){
      targetIP = 'ws://'+this.props.machineIP;
      console.log(targetIP);
    }else{
      console.log("IP not provided");
      return;
    }

    var conn = new WebSocket( targetIP + ':81/', ['arduino']);
    conn.onopen = function(evt) {
      console.log("WS CONNECTION OPENED...");
      conn.send(gcodeLines[0]+"\n");
    };

    conn.onmessage = (evt) => {
      if(evt.data=="OK" && this.sentLine < gcodeLines.length-1){
        this.sentLine += 1;
      }else if(evt.data=="OK"){
        this.gcode = "";
        this.sentLine = 0;
      }else{
        this.gcode = "";
        this.sentLine = 0;
      }

      if(evt.data == "OK" && this.sentLine < gcodeLines.length-1){
        conn.send(gcodeLines[this.sentLine]+"\n");
      }else{
        console.log("CLOSING CONNECTION");
        conn.close();
      }
      console.log("WS Server response: \n" + evt.data);
    };

    conn.onerror = (error) => {
      console.log("ERROR");
      console.log(error);
    };

    conn.onclose = (e) => {
      console.log("WS CONNECTION CLOSED");
      console.log(e);
    };

  }

  onMsg(evt){
    if(evt.data=="OK" && this.sentLine < gcodeLines.length-1){
      this.sentLine += 1;
    }else if(evt.data=="OK"){
      this.gcode = "";
      this.sentLine = 0;
    }else{
      this.gcode = "";
      this.sentLine = 0;
    }

    if(evt.data == "OK"){
      conn.send(gcodeLines[this.sentLine]+"\n");
    }else{
      conn.close();
    }
    console.log("WS Server response: \n" + evt.data);
  }

  downloadFile(text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', "drawing.gcode");

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  stampList(){
    let list = [];
    for(var i=0; i<9; i++){
      list[i] = {img:'stamp-'+(i+1)};
    }
    return list;
  }

  iconList(){
    let list = [];
    for(var i=0; i<32; i++){
      list[i] = {img:'icon-'+(i+1)};
    }
    return list;
  }

  useStamp(e){
      let stampId = e.target.getAttribute("data-stamp");
      let objContent = document.querySelector("#obj-"+stampId).contentDocument;
      let stamp = objContent.querySelector("#"+stampId);
      let textArea = document.querySelector("#vector-text");
      let newStamp = stamp.cloneNode(true);

      newStamp.setAttribute("class", "text-content");

      textArea.innerHTML = "";
      textArea.appendChild(newStamp);

      let tWidth = Math.round(textArea.getBBox().width + 10);
      let tHeight = Math.round(textArea.getBBox().height + 10);

      this.addBounds("#vector-text", tWidth, tHeight);

      let stampGraphics = textArea.querySelector(".text-content").querySelectorAll("*");

      stampGraphics.forEach(function(elem,i){
        elem.removeAttribute("style");
      });

      this.targetTransform("text");
      this.adjustTarget("text");

      this.updateVectors();
  }

  useIcon(e){
      let iconId = e.target.getAttribute("data-icon");
      let objContent = document.querySelector("#icon-"+iconId).contentDocument;
      let icon = objContent.querySelector("#"+iconId);
      let imgArea = document.querySelector("#vector-image");

      imgArea.innerHTML = "";
      imgArea.appendChild(icon.cloneNode(true));

      let tWidth = Math.round(imgArea.getBBox().width + 10);
      let tHeight = Math.round(imgArea.getBBox().height + 10);

      this.addBounds("#vector-image", tWidth, tHeight);

      let iconGraphics = imgArea.querySelector("#"+iconId).querySelectorAll("*");

      iconGraphics.forEach(function(elem,i){
        elem.removeAttribute("style");
      });

      this.targetTransform("image");
      this.adjustTarget("image");

      this.updateVectors();
  }

  render(){
    let texts = this.props.texts;
    let text = this.getText.bind(this);
    let product = this.props.product;
    let stampList = this.stampList();
    let iconList = this.iconList();
    let useStamp = this.useStamp.bind(this);
    let useIcon = this.useIcon.bind(this);
    let props = this.props;
    let lang = this.props.language;
    let h2Title = this.h2Title;
    let selectStyles = {
      option: (styles, { data, isDisabled, isFocused, isSelected }) => {
        return {
          backgroundColor: isDisabled
            ? null
            : isSelected
            ? "#555"
            : isFocused
            ? "#ccc"
            : null
        }
      }
    }

    this.updateArea();

    return (
      <section id="sc-2" className="">
        <header>
          <img src="images/natura-cor.svg" className="logo-small"/>
        </header>
        <div className="content">
          <div id="prod-area">
            <div className="img-holder">
              <img src={product.image2} className="prod-big"/>
              <div id="drawable">
                <svg id="vector-area" className={product.pen}>
                  <g id="vector-sq"></g>
                  <g id="vector-text">
                    <g className="content"></g>
                  </g>
                  <g id="vector-image"></g>
                  <VectorLib />
                </svg>
              </div>
            </div>
            <div id="btns" className="inactive">
              <button id="btn-scale-up" className="btn-top">+</button>
              <button id="btn-scale-down" className="btn-bottom">-</button>
              <button id="btn-rotate-left" className="btn-top"><img src="images/rotate-left.svg" alt="left" /></button>
              <button id="btn-rotate-right" className="btn-bottom"><img src="images/rotate-right.svg" alt="right" /></button>
              <button id="btn-remove">x</button>
            </div>
          </div>
          <div id="step-holder">
            <ul className="step-nav">
              <li data-num="1" className="revealed">{text("5")}</li>
              <li data-num="1" className="revealed">{text("6")}</li>
              <li data-num="4">{text("7")}</li>
              <li data-num="5">{text("8")}</li>
            </ul>

            <h2 className="step-column">
              <div id="title3" className="title active">{text("9")}</div>
              <div id="title4" className="title">{text("20")}</div>
            </h2>

            <ul className="msg-options active" id="msg-text-menu">
              <li data-step="2" className="active" onClick={this.showTab}>{text("10")}</li>
              <li data-step="3" onClick={this.showTab}>{text("11")}</li>
            </ul>

            <div id="msg-holder" className="step-column tabContent active" data-tab="2">
              <div>
                <label htmlFor="input-msg">
                  <span>{text("12")}</span>
                  <input id="input-msg" type="text" maxLength="15" placeholder={text("13")} onKeyUp={this.onKeyUp} />
                </label>

                <label htmlFor="input-font">
                  <span>{text("14")}</span>
                  <FontSelect
                  language={lang}
                  texts={texts}
                  fontHandler = { this.onChangeFont } />
                </label>
              </div>
              <div className="button-holder">
                <Button
                id=""
                text={ lang && texts.t18 ? texts.t18[lang] : "" }
                targetStep="1"
                class=""
                clickHandler={props.stateHandler} />

                <Button
                id=""
                text={ lang && texts.t19 ? texts.t19[lang] : "" }
                targetStep="4"
                class="highlight"
                clickHandler={this.showTab} />
              </div>
            </div>

            <div id="msg2-holder" className="step-column tabContent" data-tab="3">
              <div id="stamp-holder" className="contents">
                <ul>
                  {stampList.map(function(d, idx){
                     return (<li key={d.img} data-stamp={d.img} onClick={useStamp}><object className="stamp-img" id={"obj-"+d.img} data={'images/stamps/'+d.img+'.svg'} type="image/svg+xml"></object></li>);
                   })}
                </ul>
              </div>
              <div className="button-holder step-column">
                <Button
                id=""
                text={ lang && texts.t18 ? texts.t18[lang] : "" }
                targetStep="2"
                class=""
                clickHandler={this.showTab} />

                <Button
                id=""
                text={ lang && texts.t19 ? texts.t19[lang] : "" }
                targetStep="4"
                class="highlight"
                clickHandler={this.showTab} />
              </div>
            </div>

            <div id="msg3-holder" className="step-column tabContent" data-tab="4">
              <div id="icon-holder" className="contents">
                <ul>
                  {iconList.map(function(d, idx){
                   return (<li key={d.img} data-icon={d.img} onClick={useIcon}><object className="icon-img" id={"icon-"+d.img} data={'images/icons/'+d.img+'.svg'} type="image/svg+xml"></object></li>);
                  })}
                </ul>
              </div>
              <div className="button-holder step-column">
                <Button
                id=""
                text={ lang && texts.t18 ? texts.t18[lang] : "" }
                targetStep="2"
                class=""
                clickHandler={this.showTab} />

                <Button
                id=""
                text={ lang && texts.t33 ? texts.t33[lang] : "" }
                targetStep="4"
                class="highlight"
                clickHandler={this.convertSvg} />

                <Button
                id=""
                text={ lang && texts.t34 ? texts.t34[lang] : "" }
                targetStep="1"
                class="borderless"
                clickHandler={this.onBackButton} />
              </div>
            </div>

          </div>
        </div>
			</section>
		)
	}
}

export default Personalization;
