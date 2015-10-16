import React from 'react';
import Option from './toggle-option.js';
import { Im } from './utilities.js';

export default class ToggleBar extends React.Component {
  constructor(props) {
    super(...arguments);
  }
  static get defaultProps() {
    return {
      items : [
        { title : 'Foo', key : 'foo', value : 'foo' },
        { title : 'Bar', key : 'bar', value : 'bar' }
      ],
      action : (v) => { console.log(v); }
    };
  }
  get itemElements () {
    return this.props.items.map((item) => {
      item = Im.extend(item, {
        key : item.value,
        action : this.props.action,
        active : item.value === this.props.value
      });
      return (<Option {...item} />);
    });
  }
  render() {
    return (<ul className='toggle-bar tab-bar'>{this.itemElements}</ul>);
  }
}
