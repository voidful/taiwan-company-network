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
import ForceGraph2D from 'react-force-graph-2d';
import { useLocation } from "react-router-dom";



import {
    Card,
    Container,
    Row,
    Col,
    Button, CardHeader, ButtonGroup, CardBody, CardTitle, CardText
} from "reactstrap";

import Header from "components/Headers/Header.js";


class CGraphClass extends React.Component {
    graphContainerRef = React.createRef();
    fgRef = React.createRef();

    constructor(props) {
        super(props);
        let comp = this.props.location?.state?.company || 'TSMC'; // Default or handle missing state

        this.state = {
            graph_data: {
                nodes: [],
                links: []
            },
            comp: comp,
            containerWidth: 800,
            containerHeight: 600,
            selectedCompanyDetails: null,
            isLoading: true,
            comp_graph: {},
            comp_details: {}
        };
    }

    componentDidMount() {
        Promise.all([
            fetch('/data/graph.json').then(res => res.json()),
            fetch('/data/company_details.json').then(res => res.json())
        ]).then(([graphData, detailsData]) => {
            this.setState({
                comp_graph: graphData,
                comp_details: detailsData,
                isLoading: false,
                selectedCompanyDetails: detailsData[this.state.comp] || null
            }, () => {
                if (this.state.comp) {
                    this.invest();
                }
            });
        }).catch(err => {
            console.error("Failed to load data:", err);
            this.setState({ isLoading: false });
        });

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
        // 窗口调整时更新容器尺寸
        if (this.graphContainerRef.current) {
            this.setState({
                containerWidth: this.graphContainerRef.current.offsetWidth,
                containerHeight: 600
            });
        }
    };

    // 放大
    handleZoomIn = () => {
        if (this.fgRef.current) {
            this.fgRef.current.zoom(this.fgRef.current.zoom() * 1.2, 400);
        }
    };

    // 缩小
    handleZoomOut = () => {
        if (this.fgRef.current) {
            this.fgRef.current.zoom(this.fgRef.current.zoom() * 0.8, 400);
        }
    };

    // 重置缩放
    handleZoomReset = () => {
        if (this.fgRef.current) {
            this.fgRef.current.zoomToFit(400, 50);
        }
    };

    onClickNode = (node) => {
        // Navigate to that company
        this.setState({
            comp: node.id,
            selectedCompanyDetails: this.state.comp_details[node.id]
        }, () => {
            // Default to showing investors when clicking a new company
            this.invest();
        });
    };

    addNode = (comp, graph_data, inout) => {
        const { comp_graph } = this.state;
        if (!comp_graph[comp]) return; // Safety check

        if (graph_data['nodes'].findIndex(n => n.id === comp) === -1) {
            graph_data['nodes'].push({ 'id': comp, 'name': comp });
        }

        if (inout === 'in') {
            if (comp_graph[comp]['in']) {
                comp_graph[comp]['in'].forEach(element => {
                    if (graph_data['nodes'].findIndex(n => n.id === element) === -1) {
                        graph_data['nodes'].push({ 'id': element, 'name': element });
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
                        graph_data['nodes'].push({ 'id': element, 'name': element });
                    }
                    if (graph_data['links'].findIndex(l => l.source === comp && l.target === element) === -1) {
                        graph_data['links'].push({ 'source': comp, 'target': element });
                    }
                });
            }
        }
    };

    updateGraph = (type, direction) => {
        let new_graph_data = { nodes: [], links: [] };
        const { comp_graph } = this.state;

        if (type === 'invest') {
            this.addNode(this.state.comp, new_graph_data, 'in');
        } else if (type === 'outvest') {
            this.addNode(this.state.comp, new_graph_data, 'out');
        } else if (type === 'investout') {
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

    // Helper wrappers to match original functionality names
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
                    {this.state.isLoading ? (
                        <div className="text-center mt-5">
                            <h3>Loading data...</h3>
                        </div>
                    ) : (
                        <Row>
                            <Col lg="8">

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
                                        <ForceGraph2D
                                            ref={this.fgRef}
                                            graphData={this.state.graph_data}
                                            width={this.state.containerWidth}
                                            height={this.state.containerHeight}
                                            nodeId="id"
                                            nodeLabel="name"
                                            nodeAutoColorBy="id"
                                            nodeCanvasObject={(node, ctx, globalScale) => {
                                                const label = node.name || node.id;
                                                const fontSize = 12 / globalScale;
                                                ctx.font = `${fontSize}px Sans-Serif`;
                                                const textWidth = ctx.measureText(label).width;
                                                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                                                // Draw node circle
                                                ctx.fillStyle = node.color || '#0072E3';
                                                ctx.beginPath();
                                                ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                                                ctx.fill();

                                                // Draw label background
                                                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                                                ctx.fillRect(
                                                    node.x - bckgDimensions[0] / 2,
                                                    node.y + 8,
                                                    bckgDimensions[0],
                                                    bckgDimensions[1]
                                                );

                                                // Draw label text
                                                ctx.textAlign = 'center';
                                                ctx.textBaseline = 'top';
                                                ctx.fillStyle = '#460046';
                                                ctx.fillText(label, node.x, node.y + 8);
                                            }}
                                            nodePointerAreaPaint={(node, color, ctx) => {
                                                ctx.fillStyle = color;
                                                ctx.beginPath();
                                                ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
                                                ctx.fill();
                                            }}
                                            linkDirectionalArrowLength={6}
                                            linkDirectionalArrowRelPos={1}
                                            linkColor={() => '#66B3FF'}
                                            linkWidth={2}
                                            onNodeClick={this.onClickNode}
                                            cooldownTicks={100}
                                            onEngineStop={() => this.fgRef.current && this.fgRef.current.zoomToFit(400, 50)}
                                            d3AlphaDecay={0.02}
                                            d3VelocityDecay={0.3}
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
                            </Col>
                            <Col lg="4">
                                <Card className="shadow border-0">
                                    <CardHeader className="bg-transparent">
                                        <h3 className="mb-0">Company Details</h3>
                                    </CardHeader>
                                    <CardBody>
                                        {this.state.selectedCompanyDetails ? (
                                            <>
                                                <CardTitle tag="h4">{this.state.selectedCompanyDetails.id}</CardTitle>
                                                <CardText>
                                                    <strong>Capital:</strong> {this.state.selectedCompanyDetails.資本總額}<br />
                                                    <strong>Representative:</strong> {this.state.selectedCompanyDetails.代表人姓名}<br />
                                                    <strong>Address:</strong> {this.state.selectedCompanyDetails.公司所在地}
                                                </CardText>
                                            </>
                                        ) : (
                                            <CardText>Select a company to view details.</CardText>
                                        )}
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    )}
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
