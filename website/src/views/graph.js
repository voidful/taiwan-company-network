/*!

=========================================================
* Argon Dashboard React - v1.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import Chart from "chart.js";
import {Graph} from 'react-d3-graph';

import comp_graph from 'assets/data/graph.json';

import {
    Card,
    Container,
    Row,
    Col,
    Button, CardHeader
} from "reactstrap";

// core components
import {
    chartOptions,
    parseOptions,
} from "variables/charts.js";

import Header from "components/Headers/Header.js";


const graphConfig = {
    "automaticRearrangeAfterDropNode": true,
    "collapsible": true,
    "directed": true,
    "focusAnimationDuration": 0.75,
    "focusZoom": 1,
    "height": 600,
    "highlightDegree": 3,
    "highlightOpacity": 0.1,
    "linkHighlightBehavior": true,
    "maxZoom": 8,
    "minZoom": 0.1,
    "nodeHighlightBehavior": true,
    "panAndZoom": false,
    "staticGraph": false,
    "staticGraphWithDragAndDrop": false,
    "width": 800,
    "d3": {
        "alphaTarget": 0.05,
        "gravity": -100,
        "linkLength": 200,
        "linkStrength": 1,
        "disableLinkForce": false
    },
    "node": {
        "color": "#0072E3",
        "fontColor": "#460046\t",
        "fontSize": 12,
        "fontWeight": "normal",
        "highlightColor": "SAME",
        "highlightFontSize": 16,
        "highlightFontWeight": "normal",
        "highlightStrokeColor": "SAME",
        "highlightStrokeWidth": "SAME",
        "labelProperty": "id",
        "mouseCursor": "pointer",
        "opacity": 1,
        "renderLabel": true,
        "size": 300,
        "strokeColor": "none",
        "strokeWidth": 1.5,
        "svg": "",
        "symbolType": "circle"
    },
    "link": {
        "color": "#66B3FF",
        "fontColor": "black",
        "fontSize": 8,
        "fontWeight": "normal",
        "highlightColor": "SAME",
        "highlightFontSize": 8,
        "highlightFontWeight": "normal",
        "labelProperty": "label",
        "mouseCursor": "pointer",
        "opacity": 1,
        "renderLabel": false,
        "semanticStrokeWidth": false,
        "strokeWidth": 2,
        "markerHeight": 6,
        "markerWidth": 6
    }
};

const onClickNode = function (nodeId) {
    window.alert(`Clicked node ${JSON.stringify(comp_graph[nodeId], null, "\t")}`);
};


const addNode = function (comp, graph_data, inout) {
    graph_data['nodes'].indexOf({'id': comp}) === -1 && graph_data['nodes'].push({'id': comp})
    if (inout === 'in') {
        comp_graph[comp]['in'].forEach(element => {
            graph_data['nodes'].indexOf({'id': element}) === -1 && graph_data['nodes'].push({'id': element})
            graph_data['links'].indexOf({
                'source': element,
                'target': comp
            }) === -1 && graph_data['links'].push({'source': element, 'target': comp})
        });
    } else {
        comp_graph[comp]['out'].forEach(element => {
            graph_data['nodes'].indexOf({'id': element}) === -1 && graph_data['nodes'].push({'id': element})
            graph_data['links'].indexOf({
                'source': comp,
                'target': element
            }) === -1 && graph_data['links'].push({'source': comp, 'target': element})
        });
    }
};

const invest = function (that) {
    let graph_data = {
        nodes: [],
        links: []
    };
    addNode(that.state.comp, graph_data, 'in')
    that.setState({
        graph_data: graph_data,
        comp: that.state.comp,
    })
};
const outvest = function (that) {
    let graph_data = {
        nodes: [],
        links: []
    };
    addNode(that.state.comp, graph_data, 'out')
    that.setState({
        graph_data: graph_data,
        comp: that.state.comp,
    })
};
const investout = function (that) {
    let graph_data = {
        nodes: [],
        links: []
    };
    comp_graph[that.state.comp]['in'].forEach(element => {
        addNode(element, graph_data, 'out')
    })
    that.setState({
        graph_data: graph_data,
        comp: that.state.comp,
    })
};
const investin = function (that) {
    let graph_data = {
        nodes: [],
        links: []
    };
    comp_graph[that.state.comp]['in'].forEach(element => {
        addNode(element, graph_data, 'in')
    })
    that.setState({
        graph_data: graph_data,
        comp: that.state.comp,
    })
};

const outvestin = function (that) {
    let graph_data = {
        nodes: [],
        links: []
    };
    comp_graph[that.state.comp]['out'].forEach(element => {
        addNode(element, graph_data, 'in')
    })
    that.setState({
        graph_data: graph_data,
        comp: that.state.comp,
    })
};
const outvestout = function (that) {
    let graph_data = {
        nodes: [],
        links: []
    };
    comp_graph[that.state.comp]['out'].forEach(element => {
        addNode(element, graph_data, 'out')
    })
    that.setState({
        graph_data: graph_data,
        comp: that.state.comp,
    })
};
class CGraph extends React.Component {

    constructor(props) {
        super(props);
        let comp = this.props.location.state['company']

        let graph_data = {
            nodes: [],
            links: []
        };
        addNode(comp, graph_data, 'in')
        this.state = {
            graph_data: graph_data,
            comp: comp
        };

        if (window.Chart) {
            parseOptions(Chart, chartOptions());
            invest(this)
        }
    }


    render() {
        return (
            <>
                <Header/>
                {/* Page content */}
                <Container className="mt--7" fluid>
                    <Row>
                        <div className="col">

                            <Card className="shadow border-0">
                                <CardHeader className=" bg-transparent">
                                    <h3 className=" mb-0">{this.state.comp}</h3>
                                </CardHeader>
                                <Graph
                                    id="graph-company"
                                    data={this.state.graph_data}
                                    config={graphConfig}
                                    onClickNode={onClickNode}
                                />
                            </Card>
                            <Col>
                                <Button color="default" outline type="button"
                                        onClick={() => invest(this)}>
                                    注資方
                                </Button>
                                <Button color="default" outline type="button"
                                        onClick={() => outvest(this)}>
                                    投資方
                                </Button>
                                <Button color="default" outline type="button"
                                        onClick={() => investout(this)}>
                                    注資方的投資
                                </Button>
                                <Button color="default" outline type="button"
                                        onClick={() => investin(this)}>
                                    注資方的注資
                                </Button>
                                <Button color="default" outline type="button"
                                        onClick={() => outvestin(this)}>
                                    投資公司的注資
                                </Button>
                                <Button color="default" outline type="button"
                                        onClick={() => outvestout(this)}>
                                    投資公司的投資
                                </Button>
                            </Col>
                        </div>
                    </Row>
                </Container>
            </>
        );
    }
}

export default CGraph;
