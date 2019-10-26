/* Copyright (C) 2019 Natura Cosméticos - All Rights Reserved
 * You may not use, distribute and modify this code without
 * explicit permission.
 *
 * Author: Caroline Rozendo
 *
 * 'FontSelect' component allows users to choose
 * which kind of font they want to use
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
/* styles */
import './../styles/Reset.css';
import './../styles/Main.scss';

class FontSelect extends Component {

  constructor(props) {
    super(props);
    this.selectedFont = "font1";
    this.changeFont = this.changeFont.bind(this);
    this.openSelect = this.openSelect.bind(this);
    this.closeSelect = this.closeSelect.bind(this);
  }

  componentDidMount(){

  }

  getText(num){
    let texts = this.props.texts;
    let lang = this.props.language;

    return lang && texts["t"+num] ? texts["t"+num][lang] : "";
  }

  openSelect(e){
    if(!document.querySelector("#font-selector ul").classList.contains("active")){
      document.addEventListener("click", this.closeSelect);
    }
    document.querySelector("#font-selector ul").classList.add("active");
  }

  closeSelect(){
    document.querySelector("#font-selector ul").classList.remove("active");
    document.removeEventListener("click", this.closeSelect);
  }

  changeFont(e){
    this.selectedFont = e.target.getAttribute("data-font");

    document.querySelector("#font-selector ul li.active").classList.remove("active");
    e.target.classList.add("active");
    this.props.fontHandler(this.selectedFont);

    document.querySelector("#font-selector .selected").innerHTML = e.target.innerHTML;

    this.closeSelect();
  }

  render(){
    let props = this.props;
    let text = this.getText.bind(this);
    let selectedStr = "Forte";

    return (
      <div id="font-selector">
        <div className="selected" onClick={this.openSelect}>{text(15)}</div>
        <ul>
          <li data-font="font1" className="active" onClick={this.changeFont}>{text(15)}</li>
          <li data-font="font2" onClick={this.changeFont}>{text(16)}</li>
        </ul>
      </div>
		)
	}
}

export default FontSelect;
