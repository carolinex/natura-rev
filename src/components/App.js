/* Copyright (C) 2019 Natura Cosméticos - All Rights Reserved
 * You may not use, distribute and modify this code without
 * explicit permission.
 *
 * Author: Caroline Rozendo
 *
 * 'App.js' is the main class for the application
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3-fetch';
/* styles */
import './../styles/Reset.css';
import './../styles/Main.scss';
/* components */
import Opening from './Opening';
import ProductSelection from './ProductSelection';
import Personalization from './Personalization';

class App extends Component {

  constructor(props) {
    super(props);

    this.texts = {};
    this.products = [];
    this.screen = 0;
    this.selectedItem = null;
    this.selectedLanguage = "pt";
    this.selectedFont = "font1";
    this.machineID = "";
    this.machineIP = "";
    this.ipData = null;
    this.loadTexts = this.loadTexts.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.updateState = this.updateState.bind(this);
    this.changeState = this.changeState.bind(this);
    this.changeFont = this.changeFont.bind(this);
    this.setState = this.setState.bind(this);

    this.state = {
      language: this.selectedLanguage,
      selectedItem: {},
      selectedFont: "font1",
      machineIP: ""
    }
  }

  loadTexts(){
    let texts = this.texts;
    let products = this.products;

    d3.tsv("data/texts.tsv?"+(new Date()).getTime(), function(d,i) {
      if(!d.en){ d.en = "" }
      texts["t"+d.id] = d;
      return d;
    }).then(this.updateState);

    d3.tsv("data/products.tsv?"+(new Date()).getTime(), function(d) {
      products.push(d);
      return d;
    }).then(this.updateState);

    d3.tsv("http://carolx.me/w/nat-server/data/ipdata.tsv?"+(new Date()).getTime())
      .then((data) => {
        this.ipData = data;
        console.log(this.ipData)
        if(!this.machineID){
          this.machineID = "";
        }else{
          this.machineIP = "";
          for(var i=0; i<data.length; i++){

            if(data[i].id == this.machineID){
              this.machineIP = data[i].ip;
              break;
            }
          }
        }

        this.updateState();
      })
  }

  componentDidMount(){
  }

  changeFont(font){
    this.selectedFont = font;
    this.updateState();
  }

  changeState(e){
    e.preventDefault();

    let products = this.products;
    let tgtRow;
    let sections = document.querySelectorAll("section");
    let tgtStep = e.target.getAttribute("data-step");


    //fullscreen
    if(tgtStep == 1){
      let elem = document.getElementById("main");

      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
      }
    }

    sections.forEach(function(elem,i){
      if(i<tgtStep){
        elem.classList.add("before");
        elem.classList.remove("current");
        elem.classList.remove("after");
      }else if(i==tgtStep){
        elem.classList.add("current");
        elem.classList.remove("before");
        elem.classList.remove("after");
      }else if(i>tgtStep){
        elem.classList.add("after");
        elem.classList.remove("current");
        elem.classList.remove("before");
      }
    });

    tgtRow = e.target.getAttribute("data-row") || null;
    if(tgtRow){
      this.selectedItem = tgtRow;
      this.updateState();
    }
  }

  updateSettings(e){
    e.stopPropagation();
    let setting = e.target.getAttribute("data-setting");
    let content = e.target.getAttribute("data-content");

    if(setting == "machineID"){
      this.machineID = content;
      localStorage.setItem("machineID", this.machineID);
      this.machineIP = "";

      this.loadTexts();
      /*for(var i=0; i<this.ipData.length; i++){
        if(this.ipData[i].id == this.machineID){
          this.machineIP = this.ipData[i].ip;
          break;
        }
      }*/
    }else if(setting == "selectedLanguage"){
      this.selectedLanguage = content;
    }

    this.updateState();
  }

  updateState(){
    let item = this.selectedItem;
    let lang = this.selectedLanguage;
    let font = this.selectedFont;
    let ip = this.machineIP;

    if( this.products != {} && this.texts != {} ){
      let product = item ? this.products[item] : {};

      this.setState({
        language: lang,
        font: font,
        machineIP: ip,
        selectedItem: product
      });
    }else{
      this.setState({
        language: lang,
        font: font,
        machineIP: ip,
        selectedItem: { }
      });
    }
  }

  componentDidUpdate(){
    if(typeof(Storage) !== "undefined") {
      localStorage.setItem("machineID", this.machineID);
      localStorage.setItem("lang", this.selectedLanguage);
    }
  }

  componentWillMount(){
    if(typeof(Storage) !== "undefined" && localStorage.lang) {
      //localStorage.clear();
      this.selectedLanguage = localStorage.lang;
      this.machineID = localStorage.machineID;
    }
    this.loadTexts();
  }

  render(){

    let lang = this.state.language;
    /* This is the overall structure of the page
     * with one component per section
     */
    return (
      <div id="main">
        <Opening
          language={lang}
          texts={this.texts}
          stateHandler = {this.changeState}
          updateHandler = {this.updateSettings}
          machineID = {this.machineID} />

        <ProductSelection
          language={lang}
          texts={this.texts}
          products={this.products}
          stateHandler = {this.changeState} />

        <Personalization
          language={ lang }
          texts={ this.texts }
          product={ this.state.selectedItem }
          stateHandler = {this.changeState }
          machineIP = { this.state.machineIP }
          fontHandler = { this.changeFont }
          font = { this.state.font }  />

			</div>
		)
	}
}

export default App;
