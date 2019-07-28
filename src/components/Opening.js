import React, { Component } from 'react';
import ReactDOM from 'react-dom';
/* styles */
import './../styles/Reset.css';
import './../styles/Main.scss';
/* components */
import Button from './Button';

class Opening extends Component {
  render(){
    let texts = this.props.texts;
    let props = this.props;
    let lang = this.props.language;

    return (
      <section id="sc-0" className="current">
        <div className="bg"></div>
        <div className="color-opacity"></div>

        <h1>
        <img src="images/natura-white.svg" className="logo-big"/>
        <div id="t1">{ lang && texts.t1 ? texts.t1[lang] : "" }</div>

        <Button
        id="btnStart"
        text={ lang && texts.t2 ? texts.t2[lang] : "" }
        targetStep="1"
        class="highlight"
        clickHandler={props.stateHandler} />

        </h1>

			</section>
		)
	}

}

/*
{ texts.t1 ? texts.t1[lang] : "oi" }
*/

export default Opening;
