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

    this.loadTexts = this.loadTexts.bind(this);
    this.updateState = this.updateState.bind(this);
    this.changeState = this.changeState.bind(this);
    this.setState = this.setState.bind(this);

    this.state = {
      language: this.selectedLanguage,
      selectedItem: {},
      textScale: 0.3,
      textPos:[20,40],
      imgScale: 0.3,
      imgPos:[0,0],
      selectedFont: "font1"
    }
  }

  loadTexts(){
    //this.texts = {};
    //this.products = {};
    let texts = this.texts;
    let products = this.products;

    d3.tsv("data/texts.tsv", function(d,i) {
      if(!d.en){ d.en = "" }
      texts["t"+d.id] = d;
      return d;
    }).then(this.updateState);

    d3.tsv("data/products.tsv", function(d) {
      products.push(d);
      return d;
    }).then(this.updateState);
  }

  componentDidMount(){
    /*this.setState({
      language: "pt",
      selectedItem: {}
    });*/
  }

  changeState(e){
    //console.log(this.state);
    e.preventDefault();

    let products = this.products;
    let tgtRow;
    let sections = document.querySelectorAll("section");
    let tgtStep = e.target.getAttribute("data-step");

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
        elem.classList.remove("after");
      }
    });

    tgtRow = e.target.getAttribute("data-row") || null;
    if(tgtRow){
      this.selectedItem = tgtRow;
      this.updateState();
    }
  }

  updateState(){
    let item = this.selectedItem;
    let lang = this.selectedLanguage;

    if( this.products != {} && this.texts != {} ){
      let product = item ? this.products[item] : {};

      this.setState({
        language: lang,
        selectedItem: product
      });
    }
  }

  componentDidUpdate(){
    console.log("state updated");
  }

  componentWillMount(){
    this.loadTexts();
  }

  render(){
    //console.log(this.state);
    let lang = this.state.language;

    return (
      <div id="main">
        <Opening
          language={lang}
          texts={this.texts}
          stateHandler = {this.changeState} />

        <ProductSelection
          language={lang}
          texts={this.texts}
          products={this.products}
          stateHandler = {this.changeState} />

        <Personalization
          language={lang}
          texts={this.texts}
          product={this.state.selectedItem}
          stateHandler = {this.changeState} />

			</div>
		)
	}
}

export default App;
