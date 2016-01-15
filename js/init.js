'use strict';

import d3 from 'd3';
import React from 'react';
import { Im, parseNumerics, connectMap, generateTranslateString,  commaNumber, isNumeric }
  from './utilities.js';

import colours from './econ_colours.js';

import Header from './header.js';
import StepperRaw, { Step } from './stepper.js';
import ChartLabel from './chart-label.js';
import ChartContainer from './chart-container.js';
import ColumnChartRaw from './column-chart.js';
import ColumnChartLabelRaw from './column-chart-label.js';
import BoundedSVG from './bounded-svg.js';
import AxisRaw from './axis.js';
import MigrationBarsRaw from './migration-bars.js';
import TreemapRaw from './treemap.js';
import TooltipRaw from './tooltip.js';
// import ReSortToggle from './re-sort-toggle.js';

import countries from './countries.js';

import chroma from 'chroma-js';

import { createStore, compose } from 'redux';
import { connect, Provider } from 'react-redux';

import {
  updateSourceData, updateCountryData,
  updateAppsData, updateStepperValue,
  updateColumnChartHighlight,
  clearColumnChartHighlight,
  showTooltip, hideTooltip
} from './actions.js';
import updateState from './reducers.js'

// var store = createStore(updateState);
const DEBUGCREATESTORE = compose(
  window.devToolsExtension && window.devToolsExtension() || (f => f)
)(createStore);
var store = DEBUGCREATESTORE(updateState);
window.store = store;

var columnChartMonthFormatter = d3.time.format('%B %Y');
var applicantFormat = d3.format(',.0f');

var Stepper = connectMap({
  value : 'stepperValue'
})(StepperRaw);

var Treemap = connectMap({
  data : 'sourceData'
})(TreemapRaw);

var mousePosition = {x:0, y:0};
var Tooltip = connect(function(state) {
  return {
    show : state.tooltipShow,
    mouseX : mousePosition.x,
    mouseY : mousePosition.y,
    template : (d) => {
      var contents = state.tooltipContents;
      if(!contents) { return ''; }
      return (<div>
        <h4>{contents.countryName}</h4>
        <span>{applicantFormat(contents.applicants)}</span>
      </div>);
    }
  };
})(TooltipRaw);

var steps = [
  new Step('apps', (<span>
    Asylum claims to European Union countries are at their highest
    since records began. Around one-quarter of this year's applicants
    are Syrian. But Iraqis and Afghans fleeing war and poverty also
    account for a large share, as do largely economic migrants from
    Balkan countries like Kosovo and Albania. Around one-third of
    claims this year have been made in Germany.</span>), '1'
  ),
  new Step('recog', (<span>
    But not all of these asylum seekers will make it in. Recognition rates vary from country
    to country.</span>), '2'
  ),
  new Step('reloc', (<span>
    Under a controversial plan agreed earlier this year, up to 160,000
    asylum-seekers from Syria, Eritrea and Iraq who reach Italy and
    Greece will be relocated to most other EU countries (and some,
    like Norway, that are outside the club). The number each country
    must accept is calculated according to economic performance,
    population and previous asylum efforts. Relocations began in
    October.  </span>), '3'
  ),
  new Step('resettle', (<span>
    Most EU countries have also agreed to resettle refugees directly
    from countries like Turkey, Jordan and Lebanon, as well as some
    camps in Africa. An EU-wide scheme agreed this year was limited to
    22,000 refugees; a bigger proposal will be put forward in 2016.</span>), '4'
  )
];

var dateFormatter = d3.time.format('%d/%m/%Y');

function roundScaleMaximum(value, unit=1) {
  var magnitude = Math.floor(Math.log10(value));
  var roundingPoint = Math.pow(10, magnitude - 1) * unit;
  return Math.ceil((value + 0.5 * roundingPoint) / roundingPoint) * roundingPoint;
}

class ColumnFrame extends React.Component {
  static get defaultProps() {
    return {
      columnData : [],
      columnScale : d3.scale.linear(),
      columnChartHighlight : null
    };
  }
  render() {
    var maximum = roundScaleMaximum(this.props.columnData.map(d => d.Total).reduce((memo, n) => Math.max(memo, n), 0));
    var columnChartProps = {
      margin : [10, 10, 40],
      series : [
        { name : 'germany', accessor : d => d.Germany },
        { name : 'europe', accessor : d => d.otherEurope }
      ],
      yScale : d3.scale.linear().domain([0, maximum]),
      spacing : 1,
      enterHandler : d => store.dispatch(updateColumnChartHighlight(d)),
      leaveHandler : d => store.dispatch(clearColumnChartHighlight()),
      data : this.props.columnData,
      xScale : this.props.columnScale,
      backgroundColour : '#E4EDF1' //colours.blue[6]
    };
    var columnAxisProps = {
      height : 300,
      margin : [260, 10, 10],
      tickValues : d3.range(0, 90, 12),
      tickFormat : v => Math.floor(v/12) + 2008,
      scale : this.props.columnScale
    };

    var highlight = this.props.columnChartHighlight ||
      (this.props.columnData ? this.props.columnData[this.props.columnData.length - 1] : null);
    // we're rendering this here because it generates the x/y coordinate
    // values that the label will need to render correctly. This is a
    // stupid hack but so it goes
    var chartRendered = (<ColumnChartRaw {...columnChartProps} />);
    if(!highlight || !highlight.x) {
      React.render(chartRendered, document.createElement('div'));
    }

    var total = highlight ? highlight.Germany + highlight.otherEurope : 0;
    var month = highlight ? new Date(highlight.month) : null;
    var columnChartLabelProps = {
      position : highlight ? [highlight.x + 2, highlight['y-europe']] : [null, null],
      text : highlight ? `${columnChartMonthFormatter(month)}: ${commaNumber(highlight.Germany + highlight.otherEurope)}` : '',
      verticalOffset : total < 50000 ? -30 : 0
    };

    var treemapProps = {
      margin : [10, 10, 10, 130],
      height : 400,
      dataProcessor : data => {
        return {
          hideText : true,
          children : [
            // applicant numbers here are totally a hack
            { hideText : true, children : Im.filter(data, d => d.rate > 75), applicants : 40 },
            { hideText : true, children : Im.filter(data, d => d.rate > 50 && d.rate <= 75), applicants : 30 },
            { hideText : true, children : Im.filter(data, d => d.rate > 10 && d.rate <= 50), applicants : 20 },
            { hideText : true, children : Im.filter(data, d => d.rate <= 10), applicants : 10 },
          ]
        };
      },
      valueFn : d => d.applicants,
      colourScale : d => {
        var rate = d.rate;
        if(rate === '#N/A') { return colours.grey[3]; }
        if(rate > 75) { return colours.red[1]; }
        if(rate > 50) { return colours.blue[3]; }
        if(rate > 10) { return colours.blue[4]; }
        if(rate <= 10) { return colours.yellow[0]; }
        // background and errors, basically
        return 'white';
      },
      dataSort : (a,b) => a.applicants - b.applicants,
      valueFormat : applicantFormat,
      enterFn : d => {
        // console.log('enter', d3.event);
        mousePosition.x = d3.event.pageX;
        mousePosition.y = d3.event.pageY;
        store.dispatch(showTooltip(d));
      },
      leaveFn : d => {
        store.dispatch(hideTooltip());
      }
    }

    return(<div>
      <svg width="595" height="300">
        {chartRendered}
        <ColumnChartLabelRaw {...columnChartLabelProps} />
        <AxisRaw {...columnAxisProps} />
        <ChartLabel text="Monthly asylum applications to Europe"/>
      </svg>
      <svg width="595" height="400">
        <ChartLabel text="Asylum applications to Europe" />
        <Treemap {...treemapProps} />
      </svg>
    </div>);
  }
}
class BarFrame extends React.Component {
  static get defaultProps() {
    return {
      data : [],
      groups : [
        {
          dataKey : 'positive',
          scale : d3.scale.linear().domain([0, 150000]).range([120, 585]),
          colour : 'red'
        }
      ]
    };
  }
  render() {
    var height = 30;
    var axes = this.props.groups.map((g, idx) => {
      if(g.hideBackground) { return null; }
      var domain = g.scale.domain()

      var axisProps = {
        scale : g.scale,
        orient : 'top',
        presetRange : true,
        tickPosition: 'tick',
        margin: [0, 10],
        tickValues : d3.range(domain[0], domain[1]+1, 25000),
        tickFormat : v => v/1000,
        height: height
      };

      return (<AxisRaw {...axisProps} />);
    });

    var props = {
      data : this.props.data,
      groups : this.props.groups
    };

    return(<div>
      <svg width="595" height={height}>
        {axes}
      </svg>
      <MigrationBarsRaw {...props}/>
    </div>);
  }
}

// these scales are for the per-country bars
var fullScale = d3.scale.linear().domain([0, 200000]).range([115, 575]);
var positiveScale = d3.scale.linear().domain([0, 75000]).range([115, 295]);
var relocScale = d3.scale.linear().domain([0,50000]).range([315, 435]);
var resettleScale = d3.scale.linear().domain([0,50000]).range([455, 575]);

var relocAlts = {
  'NONEU'  : (<text y="12" x="2" className="reloc-note" fill={colours.grey[5]}>Not an EU member</text>),
  'SUPPLY' : (<text y="12" x="2" className="reloc-note" fill={colours.aquamarine[0]}>Supplying refugees</text>),
  'EXEMPT' : (<text y="12" x="2" className="reloc-note" fill={colours.red[2]}>Exempt by treaty</text>)
};
var stepGroups = {
  recog : [
    {
      groupKey : 'asylum',
      dataKey : ['total', 'positive'],
      scale : fullScale,
      colour : [colours.blue[3], colours.red[0]]
    }
  ],
  reloc : [
    {
      groupKey : 'asylum',
      dataKey : 'positive',
      scale : positiveScale,
      colour: colours.red[0]
    },
    {
      dataKey : 'relocation',
      scale : relocScale,
      colour: colours.aquamarine[0],
      alts : relocAlts
    }
  ],
  resettle : [
    {
      groupKey : 'asylum',
      dataKey : 'positive',
      scale : positiveScale,
      colour: colours.red[0]
    },
    {
      dataKey : 'relocation',
      scale : relocScale,
      colour: colours.aquamarine[0],
      alts : relocAlts
    },
    {
      dataKey : 'resettlement',
      scale : resettleScale,
      colour : colours.yellow[0]
    }
  ]
};

class MigrationFSMRaw extends React.Component {
  static get defaultProps() {
    return {
      step : 'apps'
    };
  }
  get columnStep() {
    var columnProps = {
      columnData : this.props.columnData,
      columnScale : this.props.columnScale,
      columnChartHighlight : this.props.columnChartHighlight
    };
    return (<ColumnFrame {...columnProps} />);
  }
  get barStep() {
    var barProps = {
      data : this.props.barData,
      groups : stepGroups[this.props.step]
    };

    return (<BarFrame {...barProps} />);
  }
  render() {
    switch(this.props.step) {
      case 'apps':
        return this.columnStep;
      case 'recog':
      case 'reloc':
      case 'resettle':
        return this.barStep;
    }
  }
}

var MigrationFSM = connectMap({
  step : 'stepperValue',
  columnData : 'appsData',
  columnScale : 'appsScale',
  barData : 'countryData',
  columnChartHighlight : 'columnChartHighlight'
})(MigrationFSMRaw);

class Chart extends ChartContainer {
  render() {
    var stepperProps = {
      items : steps,
      action : (v) => { store.dispatch(updateStepperValue(v)); }
    };

    return(
      <div className='chart-container'>
        <Header title="To come" subtitle="Also to come"/>
        <Stepper {...stepperProps} />
        <MigrationFSM />
        <Tooltip bottomAnchor={true} />
      </div>
    );
  }
}
var props = {
  height : 320
};

var chart = React.render(
<div>
  <Provider store={store}>
    {() => <Chart {...props} />}
  </Provider>
</div>, document.getElementById('interactive'));

d3.csv('./data/applications.csv', function(error, data) {
  data = data.map(parseNumerics).map((d) => {
    d.month = dateFormatter.parse(d.month);
    d.otherEurope = d.Total - d.Germany;
    return d;
  });

  store.dispatch(updateAppsData(data));
});

d3.csv('./data/countries.csv', function(error, data) {
  data = data.map(parseNumerics).map(d => {
    d.countryName = countries[d.iso3].name;
    d.key = d.iso3;
    return d;
  }).sort((a,b) => {
    // sort NA's to the bottom
    if(a.total === 'NA') { return 1; }
    if(b.total === 'NA') { return -1; }
    return b.total - a.total;
  });

  // now we're going to recalculate some scales...

  // the easy scale to work out is the full one
  var fullScaleMax = roundScaleMaximum(data.map(d => d.total)
    .filter(isNumeric)
    .reduce((memo, n) => Math.max(memo, n), 0),
  0.5);
  fullScale.domain([0, fullScaleMax]);

  var positiveMax = roundScaleMaximum(data.map(d => d.positive)
    .filter(isNumeric)
    .reduce((memo, n) => Math.max(memo, n), 0),
  5);
  var reMax = roundScaleMaximum(
    Math.max(
      data.map(d => d.relocation).filter(isNumeric).reduce((memo, n) => Math.max(memo, n), 0),
      data.map(d => d.resettlement).filter(isNumeric).reduce((memo, n) => Math.max(memo, n), 0)
    ),
  5);

  var start = positiveScale.range()[0];
  var end = resettleScale.range()[1];

  var span = end - start;
  // 20px for gutters
  var factor = (span - 40) / (positiveMax + reMax * 2);
  var positions = [0, positiveMax, positiveMax + reMax, positiveMax + reMax * 2].map(n => start + n * factor);

  positiveScale.domain([0, positiveMax]).range(positions.slice(0,2));
  relocScale.domain([0, reMax]).range(positions.slice(1,3).map(n => n + 20));
  resettleScale.domain([0, reMax]).range(positions.slice(2,4).map(n => n + 40));

  store.dispatch(updateCountryData(data));
});

d3.csv('./data/incoming.csv', function(error, data) {
  data = data.map(parseNumerics).map(d => {
    var iso3 = d.ISO3;
    d.countryName = iso3 === 'UNK' ? 'Unknown' :
      iso3 === 'STLS' ? 'Stateless' : countries[iso3].name;
    d.key = iso3;
    return d;
  });
  store.dispatch(updateSourceData(data));
});
