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
import { Graph } from 'react-d3-graph';
import { useLocation } from "react-router-dom";

import comp_graph from 'assets/data/graph.json';

import {
    Card,
    Container,
    Row,
    Button, CardHeader, ButtonGroup
} from "reactstrap";

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
    "panAndZoom": true,
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

class CGraphClass extends React.Component {
    graphContainerRef = React.createRef();

    constructor(props) {
        super(props);
        let comp = this.props.location?.state?.company || 'TSMC'; // Default or handle missing state

        this.state = {
            graph_data: {
                nodes: [],
                links: []
            },
            comp: comp,
            graphConfig: this.getGraphConfig(), // 动态配置
            zoomLevel: 1 // 当前缩放级别
        };
    }

    getGraphConfig = () => {
        // 获取容器尺寸，如果容器还未渲染则使用默认值
        const width = this.graphContainerRef.current?.offsetWidth || window.innerWidth * 0.9;
        const height = 600; // 固定高度或使用 window.innerHeight * 0.7
        const zoom = this.state?.zoomLevel || 1;

        return {
            ...graphConfig,
            width: width,
            height: height,
            node: {
                ...graphConfig.node,
                size: 300 * zoom,
                fontSize: 12 * zoom,
                highlightFontSize: 16 * zoom
            },
            link: {
                ...graphConfig.link,
                fontSize: 8 * zoom,
                strokeWidth: 2 * zoom
            }
        };
    };

    componentDidMount() {
        // 默认显示投资方（注資方）
        if (this.state.comp) {
            this.invest();
        }

        // 监听窗口大小变化
        window.addEventListener('resize', this.handleResize);
        // 初始时更新一次配置
        this.handleResize();
    }

    componentWillUnmount() {
        // 清理事件监听
        window.removeEventListener('resize', this.handleResize);
    }

    handleResize = () => {
        // 窗口调整时更新图表配置
        this.setState({ graphConfig: this.getGraphConfig() });
    };

    // 放大
    handleZoomIn = () => {
        this.setState(prevState => {
            const newZoom = Math.min(prevState.zoomLevel * 1.2, 2.5); // 最大2.5倍
            return { zoomLevel: newZoom };
        }, () => {
            // 更新配置
            this.setState({ graphConfig: this.getGraphConfig() });
        });
    };

    // 缩小
    handleZoomOut = () => {
        this.setState(prevState => {
            const newZoom = Math.max(prevState.zoomLevel * 0.8, 0.5); // 最小0.5倍
            return { zoomLevel: newZoom };
        }, () => {
            // 更新配置
            this.setState({ graphConfig: this.getGraphConfig() });
        });
    };

    // 重置缩放
    handleZoomReset = () => {
        this.setState({ zoomLevel: 1 }, () => {
            // 更新配置
            this.setState({ graphConfig: this.getGraphConfig() });
        });
    };

    onClickNode = (nodeId) => {
        // window.alert(`Clicked node ${JSON.stringify(comp_graph[nodeId], null, "\t")}`);
        // Maybe navigate to that company?
        this.setState({ comp: nodeId }, () => {
            // Reset graph or just focus? For now let's just update state comp
            // If we want to reload the graph for the new node:
            let graph_data = { nodes: [], links: [] };
            this.addNode(nodeId, graph_data, 'in'); // Reset to just this node?
            this.setState({ graph_data });
        });
    };

    addNode = (comp, graph_data, inout) => {
        if (!comp_graph[comp]) return; // Safety check

        if (graph_data['nodes'].findIndex(n => n.id === comp) === -1) {
            graph_data['nodes'].push({ 'id': comp });
        }

        if (inout === 'in') {
            if (comp_graph[comp]['in']) {
                comp_graph[comp]['in'].forEach(element => {
                    if (graph_data['nodes'].findIndex(n => n.id === element) === -1) {
                        graph_data['nodes'].push({ 'id': element });
                    }
                    if (graph_data['links'].findIndex(l => l.source === element && l.target === comp) === -1) {
                        graph_data['links'].push({ 'source': element, 'target': comp });
                    }
                });
            }
        } else {
            if (comp_graph[comp]['out']) {
                comp_graph[comp]['out'].forEach(element => {
                    if (graph_data['nodes'].findIndex(n => n.id === element) === -1) {
                        graph_data['nodes'].push({ 'id': element });
                    }
                    if (graph_data['links'].findIndex(l => l.source === comp && l.target === element) === -1) {
                        graph_data['links'].push({ 'source': comp, 'target': element });
                    }
                });
            }
        }
    };

    updateGraph = (type, direction) => {
        // let graph_data = { ...this.state.graph_data }; // removed unused variable
        // The original code seemed to reset graph_data for some, but append for others? 
        // Actually, the original code created a NEW graph_data every time in the functions.
        // Let's follow that pattern for now to match behavior, or improve it.
        // The original behavior:
        // invest/outvest: creates NEW graph_data with just the main comp and its neighbors.
        // investout/investin/etc: creates NEW graph_data based on neighbors.

        // Let's stick to the original logic but cleaner.

        let new_graph_data = { nodes: [], links: [] };

        if (type === 'invest') {
            this.addNode(this.state.comp, new_graph_data, 'in');
        } else if (type === 'outvest') {
            this.addNode(this.state.comp, new_graph_data, 'out');
        } else if (type === 'investout') {
            // comp_graph[that.state.comp]['in'].forEach(element => addNode(element, graph_data, 'out'))
            if (comp_graph[this.state.comp] && comp_graph[this.state.comp]['in']) {
                comp_graph[this.state.comp]['in'].forEach(element => {
                    this.addNode(element, new_graph_data, 'out');
                });
            }
        } else if (type === 'investin') {
            if (comp_graph[this.state.comp] && comp_graph[this.state.comp]['in']) {
                comp_graph[this.state.comp]['in'].forEach(element => {
                    this.addNode(element, new_graph_data, 'in');
                });
            }
        } else if (type === 'outvestin') {
            if (comp_graph[this.state.comp] && comp_graph[this.state.comp]['out']) {
                comp_graph[this.state.comp]['out'].forEach(element => {
                    this.addNode(element, new_graph_data, 'in');
                });
            }
        } else if (type === 'outvestout') {
            if (comp_graph[this.state.comp] && comp_graph[this.state.comp]['out']) {
                comp_graph[this.state.comp]['out'].forEach(element => {
                    this.addNode(element, new_graph_data, 'out');
                });
            }
        }

        if (new_graph_data.nodes.length > 0) {
            this.setState({ graph_data: new_graph_data });
        } else {
            window.alert('No data found');
        }
    };

    // Helper wrappers to match original functionality names if needed, or just use updateGraph directly in render
    invest = () => this.updateGraph('invest');
    outvest = () => this.updateGraph('outvest');
    investout = () => this.updateGraph('investout');
    investin = () => this.updateGraph('investin');
    outvestin = () => this.updateGraph('outvestin');
    outvestout = () => this.updateGraph('outvestout');


    render() {
        return (
            <>
                <Header />
                {/* Page content */}
                <Container className="mt--7" fluid>
                    <Row>
                        <div className="col">

                            <Card className="shadow border-0">
                                <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                    <h3 className="mb-0">{this.state.comp}</h3>
                                    <div className="d-flex align-items-center">
                                        <small className="text-muted mr-3">Click nodes to explore</small>
                                        <ButtonGroup size="sm">
                                            <Button color="secondary" outline onClick={this.handleZoomOut} title="缩小">
                                                <i className="fas fa-search-minus" />
                                            </Button>
                                            <Button color="secondary" outline onClick={this.handleZoomReset} title="重置">
                                                <i className="fas fa-sync-alt" />
                                            </Button>
                                            <Button color="secondary" outline onClick={this.handleZoomIn} title="放大">
                                                <i className="fas fa-search-plus" />
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </CardHeader>
                                <div ref={this.graphContainerRef} style={{ height: '600px', width: '100%' }}>
                                    <Graph
                                        id="graph-company"
                                        data={this.state.graph_data}
                                        config={this.state.graphConfig}
                                        onClickNode={this.onClickNode}
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="text-sm text-muted mb-2">Relationship Controls:</p>
                                    <ButtonGroup className="flex-wrap">
                                        <Button color="primary" outline size="sm" onClick={this.invest} className="mb-2">
                                            注資方 (Investors)
                                        </Button>
                                        <Button color="primary" outline size="sm" onClick={this.outvest} className="mb-2">
                                            投資方 (Investments)
                                        </Button>
                                        <Button color="info" outline size="sm" onClick={this.investout} className="mb-2">
                                            注資方的投資 (Investors' Investments)
                                        </Button>
                                        <Button color="info" outline size="sm" onClick={this.investin} className="mb-2">
                                            注資方的注資 (Investors' Investors)
                                        </Button>
                                        <Button color="success" outline size="sm" onClick={this.outvestin} className="mb-2">
                                            投資公司的注資 (Investments' Investors)
                                        </Button>
                                        <Button color="success" outline size="sm" onClick={this.outvestout} className="mb-2">
                                            投資公司的投資 (Investments' Investments)
                                        </Button>
                                    </ButtonGroup>
                                </div>
                            </Card>
                        </div>
                    </Row>
                </Container>
            </>
        );
    }
}

// Wrapper component to use hooks with class component
function CGraph(props) {
    const location = useLocation();
    return <CGraphClass {...props} location={location} />;
}

export default CGraph;
