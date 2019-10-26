import React, { Component } from 'react';
import ReactDOM from 'react-dom';
/* styles */
import './../styles/Reset.css';
import './../styles/Main.scss';
/* components */
import Button from './Button';

class ProductSelection extends Component {

  createMarkup(str) {
    return {__html: str};
  }

  onItemClick(e) {
    this.props.stateHandler(e);
  }

  render(){
    let texts = this.props.texts;
    let products = this.props.products;
    let props = this.props;
    let lang = this.props.language;

    return (
      <section id="sc-1" className="">
        <header>
          <img src="images/natura-cor.svg" className="logo-small"/>
        </header>
        <div className="content">
          <h2>
            <div id="t3" dangerouslySetInnerHTML={this.createMarkup(lang && texts.t3 ? texts.t3[lang] : "")}></div>
          </h2>
          <ul className="product-list scrollable">
          {products.map((row, j) =>
            <li key={j} data-row={j} data-step="2" onClick={this.onItemClick.bind(this)}>
              <img src={ row.image1 } />
              <div className="label">
                { row["name_"+lang] }
              </div>
            </li>
          )
          }
          </ul>

          <div className="button-holder">
          <Button
          id=""
          text={ lang && texts.t34 ? texts.t34[lang] : "" }
          targetStep="0"
          class=""
          clickHandler={props.stateHandler} />
          </div>
        </div>

			</section>
		)
	}
}

export default ProductSelection;
