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
    /*
    e.preventDefault();
    let products = this.props.products;
    let tgtRow = e.target.getAttribute("data-row");
    console.log(products[tgtRow]);

    let sections = document.querySelectorAll("section");
    let tgt = 2;

    sections.forEach(function(elem,i){
      if(i<tgt){
        elem.classList.add("before");
        elem.classList.remove("current");
        elem.classList.remove("after");
      }else if(i==tgt){
        elem.classList.add("current");
        elem.classList.remove("before");
        elem.classList.remove("after");
      }else if(i>tgt){
        elem.classList.add("after");
        elem.classList.remove("current");
        elem.classList.remove("after");
      }
    });
    */
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
          <ul className="product-list">
          {products.map((row, j) =>
            <li key={j} data-row={j} data-step="2" onClick={this.onItemClick.bind(this)}>
              <img src={ row.image } />
              <div className="label">
                { row["name_"+lang] }
              </div>
            </li>
          )
          }
          </ul>

          <Button
          id=""
          text={ lang && texts.t4 ? texts.t4[lang] : "" }
          targetStep="0"
          class=""
          clickHandler={props.stateHandler} />
        </div>

			</section>
		)
	}

}

/*{data.map((row, i) =>
  {row.map((col, j) =>
    <ProductThumb />
  )}
)}*/

export default ProductSelection;
