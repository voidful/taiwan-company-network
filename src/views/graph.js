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
import { useCompany } from "context/CompanyContext";



import {
    Card,
    Container,
    Row,
    Col,
    Button, CardHeader, ButtonGroup, Spinner
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
            isLoading: true,
            comp_graph: {},
            comp_details: {},
            hoveredNode: null
        };
    }

    componentDidMount() {
        // Set initial container size
        this.handleResize();

        Promise.all([
            fetch('https://eric-lam.com/taiwan-company-network/data/graph.json').then(res => res.json()),
            fetch('https://eric-lam.com/taiwan-company-network/data/company_details.json').then(res => res.json())
        ]).then(([graphData, detailsData]) => {
            this.setState({
                comp_graph: graphData,
                comp_details: detailsData,
                isLoading: false,
            }, () => {
                const details = detailsData[this.state.comp] || null;
                this.props.setCompanyDetails(details);

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
        }, () => {
            this.props.setCompanyDetails(this.state.comp_details[node.id]);
            // Default to showing investors when clicking a new company
            this.invest();
        });
    };

    onNodeHover = (node) => {
        this.setState({ hoveredNode: node });
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
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '500px'
                        }}>
                            <Spinner color="primary" style={{ width: '4rem', height: '4rem' }} type="grow" children="" />
                            <h3 style={{ marginTop: '30px' }} className="text-muted">Loading data</h3>
                        </div>
                    ) : (
                        <Row className="fade-in">
                            <Col lg="12">

                                <Card style={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
                                }}>
                                    <CardHeader style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '12px 12px 0 0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        border: 'none'
                                    }}>
                                        <h3 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>
                                            <i className="fas fa-project-diagram mr-2" />
                                            {this.state.comp}
                                        </h3>
                                        <div className="d-flex align-items-center">
                                            <small style={{ color: 'rgba(255,255,255,0.9)', marginRight: '15px' }}>
                                                Click nodes to explore
                                            </small>
                                            <ButtonGroup size="sm">
                                                <Button
                                                    style={{
                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                        border: '1px solid rgba(255,255,255,0.4)',
                                                        color: 'white'
                                                    }}
                                                    onClick={this.handleZoomOut}
                                                    title="缩小">
                                                    <i className="fas fa-search-minus" />
                                                </Button>
                                                <Button
                                                    style={{
                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                        border: '1px solid rgba(255,255,255,0.4)',
                                                        color: 'white'
                                                    }}
                                                    onClick={this.handleZoomReset}
                                                    title="重置">
                                                    <i className="fas fa-sync-alt" />
                                                </Button>
                                                <Button
                                                    style={{
                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                        border: '1px solid rgba(255,255,255,0.4)',
                                                        color: 'white'
                                                    }}
                                                    onClick={this.handleZoomIn}
                                                    title="放大">
                                                    <i className="fas fa-search-plus" />
                                                </Button>
                                            </ButtonGroup>
                                        </div>
                                    </CardHeader>
                                    <div ref={this.graphContainerRef} style={{ height: '600px', width: '100%', position: 'relative' }}>
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
                                                const isHovered = this.state.hoveredNode && this.state.hoveredNode.id === node.id;
                                                const fontSize = isHovered ? 14 / globalScale : 12 / globalScale;
                                                ctx.font = `${isHovered ? 'bold ' : ''}${fontSize}px Sans-Serif`;
                                                const textWidth = ctx.measureText(label).width;
                                                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4);

                                                // Draw node circle
                                                ctx.fillStyle = node.color || '#0072E3';
                                                ctx.beginPath();
                                                const nodeSize = isHovered ? 7 : 5;
                                                ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
                                                ctx.fill();

                                                // Draw label background
                                                ctx.fillStyle = isHovered ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)';
                                                ctx.fillRect(
                                                    node.x - bckgDimensions[0] / 2,
                                                    node.y + 8,
                                                    bckgDimensions[0],
                                                    bckgDimensions[1]
                                                );

                                                // Draw label text
                                                ctx.textAlign = 'center';
                                                ctx.textBaseline = 'top';
                                                ctx.fillStyle = isHovered ? '#000' : '#460046';
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
                                            onNodeHover={this.onNodeHover}
                                            cooldownTicks={100}
                                            onEngineStop={() => {
                                                if (this.fgRef.current && this.state.graph_data.nodes.length > 1) {
                                                    this.fgRef.current.zoomToFit(400, 50);
                                                }
                                            }}
                                            d3AlphaDecay={0.02}
                                            d3VelocityDecay={0.3}
                                        />

                                        {/* Tooltip for hovered node */}
                                        {this.state.hoveredNode && this.state.comp_details[this.state.hoveredNode.id] && (
                                            <div className="tooltip-modern scale-in" style={{
                                                position: 'absolute',
                                                top: '15px',
                                                right: '15px',
                                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fe 100%)',
                                                border: '2px solid #5e72e4',
                                                borderRadius: '12px',
                                                padding: '20px',
                                                boxShadow: '0 10px 40px rgba(94, 114, 228, 0.25)',
                                                maxWidth: '380px',
                                                zIndex: 1000,
                                                pointerEvents: 'none'
                                            }}>
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)',
                                                    color: 'white',
                                                    padding: '12px 15px',
                                                    margin: '-20px -20px 15px -20px',
                                                    borderRadius: '10px 10px 0 0',
                                                    fontWeight: '700',
                                                    fontSize: '1.1rem'
                                                }}>
                                                    <i className="fas fa-building mr-2" />
                                                    {this.state.hoveredNode.id}
                                                </div>
                                                <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                                                    <div style={{
                                                        marginBottom: '12px',
                                                        paddingBottom: '12px',
                                                        borderBottom: '1px solid #e9ecef'
                                                    }}>
                                                        <div style={{
                                                            color: '#8898aa',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            marginBottom: '4px'
                                                        }}>
                                                            Capital
                                                        </div>
                                                        <div style={{ color: '#32325d', fontWeight: '600' }}>
                                                            {this.state.comp_details[this.state.hoveredNode.id].資本總額}
                                                        </div>
                                                    </div>
                                                    <div style={{
                                                        marginBottom: '12px',
                                                        paddingBottom: '12px',
                                                        borderBottom: '1px solid #e9ecef'
                                                    }}>
                                                        <div style={{
                                                            color: '#8898aa',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            marginBottom: '4px'
                                                        }}>
                                                            Representative
                                                        </div>
                                                        <div style={{ color: '#32325d', fontWeight: '600' }}>
                                                            {this.state.comp_details[this.state.hoveredNode.id].代表人姓名}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{
                                                            color: '#8898aa',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px',
                                                            marginBottom: '4px'
                                                        }}>
                                                            Address
                                                        </div>
                                                        <div style={{ color: '#32325d', fontWeight: '600', lineHeight: '1.6' }}>
                                                            {this.state.comp_details[this.state.hoveredNode.id].公司所在地}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="graph-controls p-4">
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '12px'
                                        }}>
                                            <div>
                                                <h6 className="mb-0" style={{
                                                    color: '#32325d',
                                                    fontWeight: '700',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    <i className="fas fa-project-diagram mr-2" style={{ color: '#5e72e4' }} />
                                                    Relationship Controls
                                                </h6>
                                                <p className="text-sm text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                                                    Explore company connections
                                                </p>
                                            </div>
                                        </div>
                                        <Row>
                                            <Col md="6" className="mb-2">
                                                <Button
                                                    color="primary"
                                                    block
                                                    onClick={this.invest}
                                                    style={{
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        fontSize: '0.875rem',
                                                        padding: '10px'
                                                    }}>
                                                    <i className="fas fa-arrow-down mr-2" />
                                                    注資方 (Investors)
                                                </Button>
                                            </Col>
                                            <Col md="6" className="mb-2">
                                                <Button
                                                    color="success"
                                                    block
                                                    onClick={this.outvest}
                                                    style={{
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        fontSize: '0.875rem',
                                                        padding: '10px'
                                                    }}>
                                                    <i className="fas fa-arrow-up mr-2" />
                                                    投資方 (Investments)
                                                </Button>
                                            </Col>
                                            <Col md="6" className="mb-2">
                                                <Button
                                                    color="info"
                                                    outline
                                                    block
                                                    onClick={this.investout}
                                                    style={{
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        fontSize: '0.875rem',
                                                        padding: '10px'
                                                    }}>
                                                    <i className="fas fa-share mr-2" />
                                                    Investors' Investments
                                                </Button>
                                            </Col>
                                            <Col md="6" className="mb-2">
                                                <Button
                                                    color="info"
                                                    outline
                                                    block
                                                    onClick={this.investin}
                                                    style={{
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        fontSize: '0.875rem',
                                                        padding: '10px'
                                                    }}>
                                                    <i className="fas fa-exchange-alt mr-2" />
                                                    Investors' Investors
                                                </Button>
                                            </Col>
                                            <Col md="6" className="mb-2">
                                                <Button
                                                    color="warning"
                                                    outline
                                                    block
                                                    onClick={this.outvestin}
                                                    style={{
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        fontSize: '0.875rem',
                                                        padding: '10px'
                                                    }}>
                                                    <i className="fas fa-users mr-2" />
                                                    Investments' Investors
                                                </Button>
                                            </Col>
                                            <Col md="6" className="mb-2">
                                                <Button
                                                    color="warning"
                                                    outline
                                                    block
                                                    onClick={this.outvestout}
                                                    style={{
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        fontSize: '0.875rem',
                                                        padding: '10px'
                                                    }}>
                                                    <i className="fas fa-network-wired mr-2" />
                                                    Investments' Investments
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                </Card >
                            </Col >
                        </Row >
                    )
                    }
                </Container >
            </>
        );
    }
}

// Wrapper to use hooks
function CGraph(props) {
    const location = useLocation();
    const { setCompanyDetails } = useCompany();
    return <CGraphClass {...props} location={location} setCompanyDetails={setCompanyDetails} />;
}

export default CGraph;
