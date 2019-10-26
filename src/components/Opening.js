/* Copyright (C) 2019 Natura Cosméticos - All Rights Reserved
 * You may not use, distribute and modify this code without
 * explicit permission.
 *
 * Author: Caroline Rozendo
 *
 * 'Opening' component has the first splash page,
 * start button and configuration of language / machine ID
 *
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
/* styles */
import './../styles/Reset.css';
import './../styles/Main.scss';
/* components */
import Button from './Button';

class Opening extends Component {

  constructor(props) {
      super(props);
      this.updateId = this.updateId.bind(this);
      this.machineID = props.machineID;
  }

  openSettings(e){
    document.querySelector("#settings").classList.add("active");
  }

  closeSettings(e){
    document.querySelector("#settings").classList.remove("active");
  }

  updateId(e){
    let val = e.target.value;
    e.target.setAttribute("data-content",val);

    this.props.updateHandler(e);
  }

  componentDidMount(){
    this.machineID = this.props.machineID;
    document.querySelector("#machineID").value = this.props.machineID;
  }

  render(){
    let texts = this.props.texts;
    let props = this.props;
    let lang = this.props.language;

    return (
      <section id="sc-0" className="current">
        <div className="bg"></div>
        <div className="color-opacity"></div>

        <h1>
        <img src="images/capa-logo.png" className="logo-big"/>

        <Button
        id="btnStart"
        text={ lang && texts.t2 ? texts.t2[lang] : "" }
        targetStep="1"
        class="highlight"
        clickHandler={ props.stateHandler } />

        </h1>

        <button id="btn-settings" onClick={ this.openSettings }>
          <svg src="images/gear.svg" />
        </button>

        <div id="settings">
          <div className="block">
            <label className="tall">ID:</label>
            <input id="machineID" data-setting="machineID" onKeyUp={ (e) => this.updateId(e) } data-content="" type="text" maxLength="15" />
          </div>

          <div className="block">
          <label>Language:</label>
          <ul>
            <li data-setting="selectedLanguage" data-content="pt" className={ lang == "pt" ? "active" : "" } onClick={ (e) => props.updateHandler(e) }>
              <img src="images/lang-pt-br.svg" />
            </li>
            <li data-setting="selectedLanguage" data-content="en" className={ lang == "en" ? "active" : "" } onClick={ (e) => props.updateHandler(e)}>
              <img src="images/lang-en-uk.svg" />
            </li>
          </ul>
          </div>

          <button id="btn-close-sett" onClick={ this.closeSettings }>
            <svg src="images/close.svg" />
          </button>
        </div>

			</section>
		)
	}

}

export default Opening;
