import React from 'react';

export default class ToggleOption extends React.Component {
  constructor() {
    super(...arguments);
    this.clickAction = this.clickAction.bind(this);
  }
  clickAction() {
    this.props.action(this.props.value);
  }
  render() {
    var classes = ['tab'];
    if(this.props.active) { classes.push('active-tab'); }
    return(<li className={classes.join(' ')} onClick={this.clickAction}>{this.props.title}</li>);
  }
}
