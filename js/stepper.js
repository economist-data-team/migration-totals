import React from 'react';
import { Im } from './utilities.js';
import Option from './toggle-option.js';

export default class Stepper extends React.Component {
  static get defaultProps() {
    return {
      items : [
        { text : 'Lorem ipsum foo bar baz', key : 'foo', title : 'foo', value : 'foo' },
        { text : 'Lorem ipsum bar baz biz', key : 'bar', title : 'bar', value : 'bar' }
      ],
      action : (v) => { console.log(v); }
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
        Things.
        <ul className="tab-bar">{this.itemElements}</ul>
      </div>
    );
  }
}
