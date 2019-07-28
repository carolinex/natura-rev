import React, { Component } from 'react';
import ReactDOM from 'react-dom';
//import Interact from 'interactjs';
//import {TweenMax} from "gsap/TweenMax";
import {TweenLite, AttrPlugin, Draggable} from "gsap/all";

/* styles */
import './../styles/Reset.css';
import './../styles/Main.scss';
/* components */
import Button from './Button';
import FontSelect from './FontSelect';
import VectorLib from './VectorLib';
import * as He from 'he';
import SvGcode from 'SvGcode';

class Personalization extends Component {
  constructor(props) {
    super(props);
    this.textPos = [0,0];
    this.imgPos = [0,0];
    this.selectedFont = "font1";
    this.textScale = 0.5;
    this.textRotate = 0;
    this.imgScale = 0.5;
    this.textTransform = this.textTransform.bind(this);
    this.showTab = this.showTab.bind(this);
    this.getText = this.getText.bind(this);
    this.h2Text;
    this.textDragger;
    this.extraSpacing = {
      "T": -5,
      "I": 6,
      "Igrave": 6,
      "Iacute": 3,
      "i": 10,
      "igrave": 3,
      "l": 4,
      "verbar":4,
      "!":4,
      "¡":4,
      "r":-3,
      "n":3,
      "j":-2
    }
    this.gcoder = new SvGcode();
  }

  componentDidUpdate(){
    let maxIt = 0;
    while( maxIt <= 150 &&
          (this.getWidth("text") > this.getWidth("area") ||
          this.getHeight("text") > this.getHeight("area")) ){
      maxIt++;
      this.textScale -= 0.025;
      if(this.textScale < 0.1){ this.textScale = 0.1 }
      this.textTransform();
    }

    if( this.getLeft("text") < 0 ){
      this.textPos[0] = 0;
      this.textTransform();
    }
    if( this.getTop("text") < 0 ){
      this.textPos[1] = 0;
      this.textTransform();
    }
    console.log("component updated");
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
    let product = this.props.product;
    let area = document.querySelector("#drawable");
    let svg = document.querySelector("#vector-area");
    let maxArea = [55,75];


    if(area && product && product.x){
      area.style.left = ((product.x/maxArea[0])*100)+"%";
      area.style.top = ((product.y/maxArea[1])*100)+"%";
      area.style.width = ((product.width/maxArea[0])*100)+"%";
      area.style.height = ((product.height/maxArea[1])*100)+"%";

      svg.setAttribute("viewBox", "0 0 "+(product.width*10)+" "+(product.height*10));
      svg.setAttribute("preserveAspectRatio", "xMinYMax meet");
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

  onKeyUp(e){
    let fontType = this.selectedFont;
    let charVector, charHtml, str;
    let maxLength = e.target.getAttribute("maxlength")
    let strArr = e.target.value.split("");
    let origArr = e.target.value.split("");

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
    let ns = "http://www.w3.org/2000/svg";
    let parentNode = document.querySelector(parentSelector);
    let boundsG = document.createElementNS(ns, "g");
    let bounds = document.createElementNS(ns, "rect");
    let resizer = document.createElementNS(ns, "polygon");
    let edgePos = {x:width, y:height};
    let edgeRect, edgePoint;

    boundsG.setAttribute("id", "text-bounds");
    bounds.setAttribute("id", "text-boundRect");
    //boundsG.classList.add('active');
    //boundsG.setAttribute("transform","translate(0,10)");
    boundsG.appendChild(bounds);
    parentNode.appendChild(boundsG);

    resizer.setAttribute("x",edgePos.x);
    resizer.setAttribute("y",edgePos.y);
    resizer.setAttribute("points", ""+
      (edgePos.x - 40) + "," + edgePos.y + " " +
      (edgePos.x) + "," + edgePos.y + " " +
      edgePos.x + "," + (edgePos.y - 40)
    );
    resizer.setAttribute("id","text-resize");
    resizer.classList.add("resize-handle");
    boundsG.appendChild(resizer);

    edgeRect = document.createElementNS(ns, "rect");
    edgeRect.setAttribute("x",edgePos.x-60);
    edgeRect.setAttribute("y",edgePos.y-60);
    edgeRect.setAttribute("width",80);
    edgeRect.setAttribute("height",80);
    edgeRect.setAttribute("id", "text-edge");
    edgeRect.classList.add("transparent");
    // defining binds in variables
    // so we can remove listeners later
    this.onEdgePress = this.onEdgePress.bind(this);
    this.onEdgeRelease = this.onEdgeRelease.bind(this);
    this.onEdgeDrag = this.onEdgeDrag.bind(this);
    // touch events
    edgeRect.addEventListener("touchstart", this.onEdgePress);
    edgeRect.addEventListener("touchend", this.onEdgeRelease);
    edgeRect.addEventListener("touchmove", this.onEdgeDrag);
    // mouse events
    edgeRect.addEventListener("mousedown", this.onEdgePress);
    edgeRect.addEventListener("mouseup", this.onEdgeRelease);
    document.addEventListener("mouseup", this.onEdgeRelease);
    boundsG.appendChild(edgeRect);


    bounds.setAttribute("x",0);
    bounds.setAttribute("y",0);
    bounds.setAttribute("width", width);
    bounds.setAttribute("height", height);

    this.textDragger = new Draggable.create("#vector-text", {
      trigger: bounds,
      bounds: document.getElementById("drawable"),
      onRelease: this.onTextStopDrag.bind(this)
    });

    boundsG.setAttribute('transform', 'translate(0, 0)');
    this.adjustText();
    this.textTransform();

    parentNode.addEventListener("touchstart",this.onTouchStart.bind(this));
    parentNode.addEventListener("touchend",this.onTouchRelease.bind(this));
    parentNode.addEventListener("touchmove",this.onTouchMove.bind(this));
  }

  buildVectorText(strArr){
    let area = document.querySelector("#vector-area");
    let vText = document.querySelector("#vector-text");
    let allTextVectors = document.querySelectorAll("#vector-list g");
    let charVector, charClone;
    let textScale = this.textScale;
    let extraSpacing;
    let charXPos = 0;
    let fontType = this.selectedFont;
    let tWidth = 0;
    let tHeight = 0;

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
        //charClone.classList.add('active');

        charClone.setAttribute("transform",
            "translate("+charXPos+",20)");

        charXPos += Math.ceil(charVector.getBBox().width) + 25;
        extraSpacing = this.extraSpacing[strArr[i]];
        if(extraSpacing){
          charXPos += extraSpacing;//*textScale;
        }

        vText.appendChild(charClone);
      }
    }

    //tWidth = charXPos;
    tWidth = Math.round(vText.getBBox().width + 10);
    tHeight = Math.round(vText.getBBox().height + 75);

    this.addBounds("#vector-text", tWidth, tHeight);
    this.adjustText();
  }

  adjustText(){
    let text = document.querySelector("#vector-text");
    let area = document.querySelector("#vector-area").getAttribute("viewBox").split(" ");
    let maxIt = 0;

    while( maxIt <= 150 &&
          (this.getWidth("text") > this.getWidth("area") ||
          this.getHeight("text") > this.getHeight("area")) ){
      maxIt++;
      this.textScale -= 0.025;
      if(this.textScale < 0.15){ this.textScale = 0.15 }
      this.textTransform();
    }

    if( this.getLeft("text") < 0 ){ this.textPos[0] = 0 }
    if( this.getTop("text") < 0 ){ this.textPos[1] = 0 }
    if( this.getRight("text") > this.getWidth("area") ){
      this.textPos[0] = this.getLeft("area") }
    if( this.getBottom("text") > this.getBottom("area") ){
      this.textPos[1] = this.getTop("area") }
    this.textTransform();
  }

  onTextStopDrag(e){
    let text = document.querySelector("#vector-text");

    this.textPos[0] = text._gsTransform.x;//text.getBBox().x;
    this.textPos[1] = text._gsTransform.y;//text.getBBox().y;
    this.textTransform();
  }

  onEdgePress(e){
    this.textDragger[0].disable();

    let currPosX = e.clientX || e.touches[0].clientX;
    let currPosY = e.clientY || e.touches[0].clientY;
    let svgP = this.svgPoint(currPosX, currPosY);
    let handle = document.querySelector("#text-edge");
    let text = document.querySelector("#vector-text");
    handle.setAttribute("data-lastX", svgP.x);

    if(e.clientX){
      document.addEventListener("mousemove", this.onEdgeDrag, false);
    }
  }

  onEdgeRelease(e){
    if(e.clientX){
      document.removeEventListener("mousemove", this.onEdgeDrag, false);
      document.removeEventListener("mouseup", this.onEdgeRelease, true);
    }

    if( this.getLeft("text") < 0 ){
      this.textPos[0] = 0;
      this.textTransform();
    }
    if( this.getTop("text") < 0 ){
      this.textPos[1] = 0;
      this.textTransform();
    }

    let maxIt = 0;

    while( maxIt <= 150 &&
          (this.getWidth("text") > this.getWidth("area") ||
          this.getHeight("text") > this.getHeight("area")) ){
      maxIt++;
      this.textScale -= 0.025;
      if(this.textScale < 0.15){ this.textScale = 0.15 }
      this.textTransform();
      //console.log("rescale");
    }

    this.textDragger[0].update();
    this.textDragger[0].enable();
  }

  onEdgeDrag(e){
    let area = document.querySelector("#vector-area");
    let text = document.querySelector("#vector-text");
    let handle = document.querySelector("#text-edge");
    let lastPosX = handle.getAttribute("data-lastX");
    let currPosX = e.clientX || e.touches[0].clientX;
    let currPosY = e.clientY || e.touches[0].clientY;
    let svgP = this.svgPoint(currPosX, currPosY);
    let diffX = svgP.x - lastPosX;//textResizer[0].deltaX;
    let w = this.getWidth("text");//.getBBox().width;
    let areaW = area.getAttribute("viewBox").split(" ")[2];
    let ratio = (diffX/areaW);

    handle.setAttribute("data-lastX", svgP.x);

    this.textScale += ratio;
    if(this.textScale < 0.15){
      this.textScale = 0.15;
    };

    this.textTransform();

    if( this.getRight("text") > this.getRight("area") ||
        this.getBottom("text") > this.getBottom("area")){
      this.textScale -= ratio;
      this.textTransform();
    }

    this.textDragger[0].update();
  }

  onTouchStart(e){
    let text = document.querySelector("#vector-text");let p1, p2;
    let angle = 0;

    if(e.touches && e.touches.length > 1){
      p1 = {x: e.touches[0].clientX, y: e.touches[0].clientY };
      p2 = {x: e.touches[1].clientX, y: e.touches[1].clientY };
      angle = Math.round(this.getAngleBetween(p1,p2)*10000)/10000;

      this.textDragger[0].disable();
    }

    text.setAttribute("data-angle", angle || 0);
    text.setAttribute("data-startangle", this.textRotate);
    console.log("touch start");
  }

  onTouchRelease(e){
    this.textDragger[0].enable();
    console.log("touch end");
  }

  onTouchMove(e){
    let text = document.querySelector("#vector-text");
    let lastAngle = parseFloat(text.getAttribute("data-angle"));
    let startAngle = parseFloat(text.getAttribute("data-startangle"));
    let angle = 0;
    let p1, p2;

    if(e.touches && e.touches.length > 1){
      p1 = {x: e.touches[0].clientX, y: e.touches[0].clientY };
      p2 = {x: e.touches[1].clientX, y: e.touches[1].clientY };

      angle = Math.round(this.getAngleBetween(p1,p2)*10000)/10000;

      let angleDiff = angle - lastAngle;

      let oldRot = this.textRotate;

      this.textRotate = angleDiff;
      if(this.textRotate > 360){ this.textRotate -= 360 };
      if(this.textRotate < 0){ this.textRotate += 360 };

      this.textTransform("50% 50%");

      if( this.getLeft("text") < 0 ||
          this.getTop("text") < 0 ||
          this.getRight("text") > this.getRight("area") ||
          this.getBottom("text") > this.getBottom("area") ||
          this.getWidth("text") > this.getWidth("area") ||
          this.getHeight("text") > this.getHeight("area")
          ){
        this.textRotate = oldRot;
        this.textTransform("50% 50%");
      }

      this.textDragger[0].update();
      console.log("touch move");
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

  textTransform(origin){
    let textScale = this.textScale;
    let textRotate = this.textRotate;
    let textPos = [this.textPos[0], this.textPos[1]];
    let text = document.querySelector("#vector-text");
    let tOrigin = origin || "left 50%";

    TweenLite.set("#vector-text", {
        scale:textScale,
        rotation:textRotate, transformOrigin:tOrigin,
        x:textPos[0],
        y:textPos[1]
      });
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

    return elemTransform.x + elemBBox.width;
  }
  getBottom(selector){
    let elem = document.querySelector("#vector-"+selector);
    let elemBBox = elem.getBoundingClientRect();
    let parent = elem.parentNode;
    let parentBBox = parent.parentNode;
    let elemTransform = elem._gsTransform || elemBBox;

    return elemTransform.y + elemBBox.height;
  }
  getLeft(selector){
    let elem = document.querySelector("#vector-"+selector);
    let elemBBox = elem.getBoundingClientRect();
    let parent = elem.parentNode;
    let parentBBox = parent.parentNode;

    return elemBBox.x - parentBBox.x;
  }
  getTop(selector){
    let elem = document.querySelector("#vector-"+selector);
    let elemBBox = elem.getBoundingClientRect();
    let parent = elem.parentNode;
    let parentBBox = parent.parentNode;

    return elemBBox.y - parentBBox.y;
  }

  svgPoint(x, y) {
    let svg = document.querySelector("#vector-area");
    //let element = svg.querySelector("#vector-text");
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

    tabContents.forEach(function(elem,i){
      let tabNum = elem.getAttribute("data-tab");
      if(tabNum==selectedTab){
        elem.classList.add("active");
      }else{
        elem.classList.remove("active");
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
  }

  stampList(){
    let list = [];

    for(var i=0; i<9; i++){
      list[i] = {img:'stamp-'+(i+1)};
    }

    return list;
  }

  useStamp(e){
      let stampId = e.target.getAttribute("data-stamp");
      let objContent = document.querySelector("#obj-"+stampId).contentDocument;
      let stamp = objContent.querySelector("#"+stampId);
      let textArea = document.querySelector("#vector-text");

      textArea.innerHTML = "";
      textArea.appendChild(stamp.cloneNode(true));

      let tWidth = Math.round(textArea.getBBox().width + 10);
      let tHeight = Math.round(textArea.getBBox().height + 10);

      this.addBounds("#vector-text", tWidth, tHeight);

      let stampGraphics = textArea.querySelector("#"+stampId).querySelectorAll("*");

      stampGraphics.forEach(function(elem,i){
        elem.removeAttribute("style");
      });

      this.textScale = 1;
      this.textTransform();

      this.adjustText();
  }

  render(){
    let texts = this.props.texts;
    let text = this.getText.bind(this);
    let product = this.props.product;
    let stampList = this.stampList();
    let useStamp = this.useStamp.bind(this);
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
              <img src={product.image} className="prod-big"/>
              <div id="drawable">
                <svg id="vector-area">
                  <g id="vector-text"></g>
                  <g id="vector-image"></g>
                  <VectorLib />
                </svg>
              </div>
            </div>
          </div>
          <div id="step-holder">
            <ul className="step-nav">
              <li className="revealed">{text("5")}</li>
              <li className="revealed">{text("6")}</li>
              <li>{text("7")}</li>
              <li>{text("8")}</li>
            </ul>

            <h2 className="step-column">
              <div id="t3" dangerouslySetInnerHTML={this.createMarkup(text("9"))}></div>
            </h2>

            <ul className="msg-options">
              <li data-step="2" className="active" onClick={this.showTab}>{text("10")}</li>
              <li data-step="3" onClick={this.showTab}>{text("11")}</li>
            </ul>

            <div id="msg-holder" className="step-column tabContent active" data-tab="2">
             <div>
              <label htmlFor="input-msg">
                <span>{text("12")}</span>
                <input id="input-msg" type="text" maxLength="15" placeholder={text("13")} onKeyUp={this.onKeyUp.bind(this)} />
              </label>

              <label htmlFor="input-font">
                <span>{text("14")}</span>
                <FontSelect
                language={lang}
                texts={texts} />
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
              targetStep="3"
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
                clickHandler={null} />
              </div>
            </div>
          </div>
        </div>
			</section>
		)
	}
}

export default Personalization;
