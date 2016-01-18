'use strict';

import d3 from 'd3';
import React from 'react';
import Imm from 'immutable';
import { Im, parseNumerics, connectMap, generateTranslateString,
  generateRectPolygonString, commaNumber, isNumeric, addDOMProperty }
  from './utilities.js';

addDOMProperty('fontStyle', 'font-style');

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
import ChartLegend from './legend.js';
import SourceLabel from './source.js';
import TooltipRaw from './tooltip.js';
import SankeyRaw from './sankey.js';
// import ReSortToggle from './re-sort-toggle.js';

import countries from './countries.js';

import chroma from 'chroma-js';

import { createStore, compose } from 'redux';
import { connect, Provider } from 'react-redux';

import {
  updateSourceData, updateCountryData,
  updateAppsData, updateStepperValue,
  updateSankeyData,
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

// Time format function
var columnChartMonthFormatter = d3.time.format('%B %Y');
var applicantFormat = d3.format(',.0f');

var Stepper = connectMap({
  value : 'stepperValue'
})(StepperRaw);

// Call the treemap at once
var Treemap = connectMap({
  data : 'sourceData'
})(TreemapRaw);

var Sankey = connectMap({
  data : 'sankeyData'
})(SankeyRaw);

// Array of Step constructors
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
    since records began. Around one-quarter of this year’s applicants
    are Syrian. But Iraqis and Afghans fleeing war and poverty also
    account for a large share, as do largely economic migrants from
    Balkan countries like Kosovo and Albania. Around one-third of
    claims this year have been made in Germany.</span>), '1'
  ),
  new Step('sankey', <span>Sankey sankey sankey</span>, 'S'),
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

// Time format function
var dateFormatter = d3.time.format('%d/%m/%Y');

function roundScaleMaximum(value, unit=1) {
  var magnitude = Math.floor(Math.log10(value));
  var roundingPoint = Math.pow(10, magnitude - 1) * unit;
  return Math.ceil((value + 0.5 * roundingPoint) / roundingPoint) * roundingPoint;
}

// React Component
class ColumnFrame extends React.Component {
  static get defaultProps() {
    return {
      columnData : [],
      columnScale : d3.scale.linear(),
      columnChartHighlight : null
    };
  }

  // Render function
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

    // Treemap object
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
      // color fill funciton
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
      // sort comparison function
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
    };

    var legendProps = {
      margin : [290, 10, 10, 20],
      height : 400,
      legendLabel : 'Acceptance Rate',
      legendItems : [
        { colour : colours.red[1], label : 'over 75%' },
        { colour : colours.blue[3], label : '50-75%' },
        { colour : colours.blue[4], label : '10-50%' },
        { colour : colours.yellow[0], label : '10% or less' }
      ]
    };

    return(<div>
      <svg width="595" height="300">
        {chartRendered}
        <ColumnChartLabelRaw {...columnChartLabelProps} />
        <AxisRaw {...columnAxisProps} />
        <ChartLabel text="Monthly asylum applications to Europe" />
      </svg>
      <svg width="595" height="400">
        <ChartLabel text="Asylum applications to Europe" subtitle="October 2014 - October 2015" />
        <ChartLegend {...legendProps} />
        <Treemap {...treemapProps} />
      </svg>
      <svg width="595" height="50">
        <SourceLabel text="Source: to come" />
       </svg>
    </div>)
  }
}


class MigrationColumnHeaderRaw extends BoundedSVG {
  static get defaultProps() {
    return Im.extend(super.defaultProps, {});
  }
  render() {
    var toppers = this.props.groups.map(gr => {
      var range = gr.scale.range();
      var polygonProps = {
        fill : gr.colour.push ? gr.colour[0] : gr.colour,
        points : generateRectPolygonString(range[0], 0, range[1], 5, true)
      };

      return (<polygon {...polygonProps}></polygon>)
    });

    var labels = this.props.groups.map(gr => {
      var range = gr.scale.range();
      var label;

      if(gr.label.push) {
        // it's an array!
        label = gr.label.map((l, idx) => {
          var tspanProps = {
            key : gr.dataKey[idx],
            fill : gr.colour[idx]
          };
          return (<tspan {...tspanProps}><tspan>{l}</tspan><tspan> </tspan></tspan>)
        });
      } else {
        label = (<tspan key={gr.dataKey}>{gr.label}</tspan>);
      }

      var textProps = {
        fill : gr.colour.push ? undefined : gr.colour,
        x : range[0],
        y : 20,
        key : gr.dataKey
      };

      return (<text className="migration-column-label" {...textProps}>{label}</text>);
    });

    return (<g>
      {toppers}
      {labels}
    </g>);
  }
}
var MigrationColumnHeader = connectMap({

})(MigrationColumnHeaderRaw);

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
    var axisHeight = 65;
    var axes = this.props.groups.map((g, idx) => {
      if(g.hideBackground) { return null; }
      var domain = g.scale.domain()

      var axisProps = {
        scale : g.scale,
        orient : 'top',
        presetRange : true,
        tickPosition: 'tick',
        margin: [25, 10, 0],
        tickValues : d3.range(domain[0], domain[1]+1, 25000),
        tickFormat : v => v/1000,
        height: axisHeight
      };

      return (<AxisRaw {...axisProps} />);
    });

    var headerProps = {
      groups : this.props.groups
    };

    var props = {
      data : this.props.data,
      groups : this.props.groups
    };

    // -1 on the x position of the thousands label is a totally
    // eyeballed kloodge
    return(<div>
      <svg width="595" height={axisHeight}>
        <MigrationColumnHeader {...headerProps} />
        <text x={fullScale.range()[0] - 1} y="40" fontSize="13" fontStyle="italic">’000</text>
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

var rawGroups = {
  asylumFull : {
    label: ['Total asylum decisions', 'of which positive'],
    groupKey : 'asylum',
    dataKey : ['total', 'positive'],
    scale : fullScale,
    colour : [colours.blue[3], colours.red[0]]
  },
  asylumPositive : {
    label: 'Positive decisions',
    groupKey : 'asylum',
    dataKey : 'positive',
    scale : positiveScale,
    colour: colours.red[0]
  },
  reloc : {
    label: 'Alloted relocations',
    dataKey : 'relocation',
    scale : relocScale,
    colour: colours.aquamarine[0],
    alts : {
      'NONEU'  : (<text y="12" x="2" className="reloc-note" fill={colours.grey[5]}>Not an EU member</text>),
      'SUPPLY' : (<text y="12" x="2" className="reloc-note" fill={colours.aquamarine[0]}>Supplying refugees</text>),
      'EXEMPT' : (<text y="12" x="2" className="reloc-note" fill={colours.red[2]}>Exempt by treaty</text>)
    }
  },
  resettle : {
    label: 'Resettlements',
    dataKey : 'resettlement',
    scale : resettleScale,
    colour : colours.yellow[0]
  }
}
var stepGroups = {
  recog : [ rawGroups.asylumFull ],
  reloc : [ rawGroups.asylumPositive, rawGroups.reloc ],
  resettle : [ rawGroups.asylumPositive, rawGroups.reloc, rawGroups.resettle ]
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
  get sankeyStep() {
    var sankeyProps = {
      width : 575,
      axes : [
        { name : 'Origin', unit : '' },
        { name : 'Destination', unit : '' },
        { name : 'Total decisions†', unit : '', side : 'right' },
        { name : 'Decisions by origin', unit : '% accepted', side : 'right' }
      ],
      height : 500,
      nodeWidth : 20
    };
    return (
      <Sankey {...sankeyProps} />
    );
  }

  render() {
    switch(this.props.step) {
      case 'apps':
        return this.columnStep;
      case 'sankey':
        return this.sankeyStep;
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

// Not sure where this fits on
// React Chart render
var chart = React.render(
<div>
  <Provider store={store}>
    {() => <Chart {...props} />}
  </Provider>
</div>, document.getElementById('interactive'));


//load in applications data from CSV file
d3.csv('./data/applications.csv', function(error, data) {
  data = data.map(parseNumerics).map((d) => {
    d.month = dateFormatter.parse(d.month);
    d.otherEurope = d.Total - d.Germany;
    return d;
  });

  store.dispatch(updateAppsData(data));
});

//load in countries data from CSV file
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

//load in "incoming" data from CSV file
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



function collateValues(memo, d) {
  return memo + +d.values;
}
var decisionNames = {
  positive : 'accepted',
  rejected : 'rejected'
};
d3.csv('./data/sankey.csv', function(error, data) {
  // once we get the data in, there's a ton of recalculating and parsing
  // to be done on it. We do all that here.
  data = Imm.List(data).map((d) => {
    d.decision = decisionNames[d.decision];
    return d;
  });
  var origins = Imm.Set(data.map(m => m.from)).map(m => ({
    name : m, type : 'o',
    allValues : data.filter(d => d.from === m),
    total : data.filter(d => d.from === m).reduce(collateValues, 0)
  }));
  var destinations = Imm.Set(data.map(m => m.to)).map(m => ({
    name : m, type : 'd',
    allValues : data.filter(d => d.to === m),
    total : data.filter(d => d.to === m).reduce(collateValues, 0)
  }));
  var decisions = Imm.Set(data.map(m => m.decision)).map(m => ({
    name : m, type : 'dc',
    total : data.filter(d => d.decision === m).reduce(collateValues, 0)
  }));
  var originDecisions = decisions.reduce((memo, dc) => {
    return memo.union(origins.map(o => ({
      name : `${o.name}-${dc.name}`, type : 'odc', o : o, dc : dc,
      countryTotal : o.total,
      total : data.filter(d => d.decision === dc.name && d.from === o.name).reduce(collateValues, 0)
    })));
  }, Imm.Set());
  var origins2 = origins.map(
    d => Imm.Map(d).set('name', `${d.name}-2`)
                  .set('type', 'o-2')
                  .set('odcY', originDecisions.find(odc => odc.o === d && odc.dc.name === 'accepted'))
                  .set('odcN', originDecisions.find(odc => odc.o === d && odc.dc.name === 'rejected'))
                  .set('o', origins.find(o => d.name === o.name))
                  .toJS()
  ).sort((a, b) => { return a.odcY.total - b.odcY.total; });
  origins = origins.map((o) => {
    o.o_2 = origins2.find(o_2 => o_2.name === `${o.name}-2`);
    return o;
  });

  var ordering = ['o', 'd', 'dc', 'o-2'];
  var nodes = origins.union(destinations).union(decisions).union(origins2).sort((a, b) => {
    return ordering.indexOf(b.type) - ordering.indexOf(a.type) ||
      (b.type === 'o-2' ? (b.odcY.total / (b.odcY.total + b.odcN.total)) : b.total) -
      (a.type === 'o-2' ? (a.odcY.total / (a.odcY.total + a.odcN.total)) : a.total);
  });
  function findNode(m) {
    return nodes.find(n => n.name === m.name);
  }

  function getValue(origin, destination, decision) {
    var n = data.find(line => (line.from === origin.name && line.to === destination.name && line.decision === decision.name));
    return +n.values;
  }
  var links = Imm.OrderedSet();
  var o_d = origins.reduce((memo, o) => {
    return memo.union(destinations.reduce((memo, d) => {
      var value = decisions.reduce((memo, dc) => {
        return memo + getValue(o, d, dc);
      }, 0);
      return memo.add({type: 'o_d', source : findNode(o), target : findNode(d), value : value });
    }, Imm.Set()));
  }, Imm.Set());

  var d_dc = destinations.reduce((memo, d) => {
    return memo.union(decisions.reduce((memo, dc) => {
      return memo.add({ type : 'd_dc', source : findNode(d), target : findNode(dc), value : origins.reduce((memo, o) => {
        return memo + getValue(o, d, dc);
      }, 0)});
    }, Imm.Set()));
  }, Imm.Set());

  var dc_odc = originDecisions.reduce((memo, odc) => {
    var o2 = { name : `${odc.o.name}-2` };
    return memo.add({ type : 'dc_odc', source : findNode(odc.dc), target : findNode(o2), value : destinations.reduce((memo, d) => {
      return memo + getValue(odc.o, d, odc.dc);
    }, 0)});
  }, Imm.OrderedSet());

  links = links.union(o_d).union(d_dc).union(dc_odc);

  store.dispatch(updateSankeyData({ links : links.toJS(), nodes : nodes.toJS() }));
});
