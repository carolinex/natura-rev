import React, { Component } from 'react';
import ReactDOM from 'react-dom';
/* styles */
import './../styles/Reset.css';
import './../styles/Main.scss';

class Button extends Component {

  componentDidMount(){

  }

  render(){
    let props = this.props;

    return (
      <button id={props.id} className={props.class} onClick={props.clickHandler} data-step={props.targetStep}>
        <span id={"txt-"+props.textId}>{props.text}</span>
			</button>
		)
	}
}

export default Button;
