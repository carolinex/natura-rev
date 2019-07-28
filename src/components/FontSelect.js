import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
/* styles */
import './../styles/Reset.css';
import './../styles/Main.scss';

class FontSelect extends Component {

  componentDidMount(){

  }

  getText(num){
    let texts = this.props.texts;
    let lang = this.props.language;

    return lang && texts["t"+num] ? texts["t"+num][lang] : "";
  }

  render(){
    let props = this.props;
    let text = this.getText.bind(this);
    let selectedStr = "Forte";

    return (
      <div id="font-selector">
        <div className="selected">Forte</div>
        <ul>
          <li data-font="font1" className="active">{text(15)}</li>
          <li data-font="font2">{text(16)}</li>
        </ul>

      </div>
		)
	}
}

export default FontSelect;
