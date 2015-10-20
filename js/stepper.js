import React from 'react';
import { Im } from './utilities.js';
import Option from './toggle-option.js';

export class Step {
  constructor(key, text) {
    this.key = key;
    this.text = text;
    this.title = key;
    this.value = key;
  }
}

export default class Stepper extends React.Component {
  static get defaultProps() {
    var items = [
      new Step('foo', 'Lorem ipsum foo bar baz'),
      new Step('bar', 'Lorem ipsum bar baz biz')
    ];
    return {
      items : items,
      action : (v) => { console.log(v); },
      value : items[0].value
    }
  }
  get activeItem() {
    return this.props.items.find(item => item.value === this.props.value);
  }
  get itemElements() {
    return this.props.items.map((item) => {
      item = Im.extend(item, {
        key : item.value,
        action : this.props.action,
        active : item.value === this.props.value
      });

      return (<Option {...item} />)
    });
  }
  render() {
    return(
      <div>
        {this.activeItem.text}
        <ul className="tab-bar">{this.itemElements}</ul>
      </div>
    );
  }
}
