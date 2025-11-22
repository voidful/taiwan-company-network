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

import { useNavigate } from "react-router-dom";
import { useCompany } from "context/CompanyContext";

import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col, InputGroupText, Input, InputGroup, Button, Spinner
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";

class IndexClass extends React.Component {
    state = {
        search: [],
        visibleCompanies: 20, // Initial number of companies to show
        comp_graph: {},
        isLoading: true
    };

    componentDidMount() {
        // Clear company details when on company list page
        if (this.props.setCompanyDetails) {
            this.props.setCompanyDetails(null);
        }

        fetch('https://eric-lam.com/taiwan-company-network/data/graph.json')
            .then(res => res.json())
            .then(data => {
                this.setState({
                    comp_graph: data,
                    isLoading: false
                });
            })
            .catch(err => {
                console.error("Failed to load graph data:", err);
                this.setState({ isLoading: false });
            });
    }



    handleOnClick = (comp) => {
        this.props.navigate('/graph', {
            state: { company: comp }
        })

    }

    render() {
        const { comp_graph, isLoading } = this.state;
        const filteredCompanies = Object.keys(comp_graph).filter((comp) => {
            if (this.state.search.length === 0) {
                return true;
            }
            const searchPattern = new RegExp(this.state.search.map(term => `(?=.*${term})`).join(''), 'i');
            return comp.match(searchPattern);
        });

        return (
            <>
                <Header />
                {/* Page content */}
                <Container className=" mt--7" fluid>
                    {/* Table */}
                    {isLoading ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '500px'
                        }}>
                            <Spinner color="primary" style={{ width: '4rem', height: '4rem' }} type="grow" children="" />
                            <h3 style={{ marginTop: '30px' }} className="text-muted">Loading company list</h3>
                        </div>
                    ) : (
                        <Row className="fade-in">
                            <div className=" col">
                                <Card className="shadow-hover fade-in" style={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <CardHeader style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '12px 12px 0 0',
                                        border: 'none'
                                    }}>
                                        <h3 className="mb-0" style={{ color: 'white', fontWeight: '700' }}>
                                            <i className="fas fa-building mr-2" />
                                            Company List
                                        </h3>
                                        <br />
                                        <div className="search-container">
                                            <InputGroup className="search-input-group">
                                                <InputGroupText>
                                                    <i className="fas fa-search" />
                                                </InputGroupText>
                                                <Input
                                                    placeholder="Search companies..."
                                                    type="text"
                                                    value={this.state.searchText}
                                                    className="form-control"
                                                    onChange={(e) => {
                                                        this.setState({
                                                            searchText: e.target.value,
                                                            search: e.target.value.split(' ').filter(Boolean),
                                                            visibleCompanies: 20
                                                        });
                                                    }}
                                                />
                                                {this.state.searchText && (
                                                    <Button
                                                        color="light"
                                                        size="sm"
                                                        style={{
                                                            position: 'absolute',
                                                            right: '5px',
                                                            top: '50%',
                                                            transform: 'translateY(-50%)',
                                                            zIndex: 10,
                                                            borderRadius: '50%',
                                                            width: '30px',
                                                            height: '30px',
                                                            padding: 0
                                                        }}
                                                        onClick={() => {
                                                            this.setState({
                                                                searchText: '',
                                                                search: [],
                                                                visibleCompanies: 20
                                                            });
                                                        }}
                                                    >
                                                        <i className="fas fa-times" />
                                                    </Button>
                                                )}
                                            </InputGroup>
                                            {this.state.search.length > 0 && (
                                                <small className="text-muted mt-2 d-block">
                                                    Found {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
                                                </small>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <Row>
                                            {
                                                filteredCompanies.slice(0, this.state.visibleCompanies).map((comp, index) => {
                                                    return (
                                                        <Col xl="3" md="6" key={comp}
                                                            className="fade-in"
                                                            style={{ animationDelay: `${index * 0.05}s` }}>
                                                            <div
                                                                className="company-item"
                                                                onClick={() => this.handleOnClick(comp)}>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between'
                                                                }}>
                                                                    <span style={{
                                                                        fontWeight: '600',
                                                                        fontSize: '0.95rem',
                                                                        color: '#32325d'
                                                                    }}>
                                                                        {comp}
                                                                    </span>
                                                                    <i className="fas fa-arrow-right"
                                                                        style={{
                                                                            color: '#5e72e4',
                                                                            fontSize: '0.85rem',
                                                                            transition: 'transform 0.2s ease'
                                                                        }} />
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    );
                                                })
                                            }
                                        </Row>

                                        {/* Empty State */}
                                        {filteredCompanies.length === 0 && this.state.search.length > 0 && (
                                            <div className="text-center py-5 fade-in">
                                                <i className="fas fa-search" style={{
                                                    fontSize: '4rem',
                                                    color: '#d1d5db',
                                                    marginBottom: '20px'
                                                }} />
                                                <h4 style={{ color: '#6b7280' }}>No companies found</h4>
                                                <p className="text-muted">
                                                    Try adjusting your search terms
                                                </p>
                                                <Button
                                                    color="primary"
                                                    outline
                                                    onClick={() => {
                                                        this.setState({
                                                            searchText: '',
                                                            search: [],
                                                            visibleCompanies: 20
                                                        });
                                                    }}
                                                >
                                                    Clear Search
                                                </Button>
                                            </div>
                                        )}

                                        {filteredCompanies.length > this.state.visibleCompanies && (
                                            <div className="text-center mt-4 fade-in">
                                                <Button
                                                    color="primary"
                                                    size="lg"
                                                    style={{
                                                        borderRadius: '50px',
                                                        padding: '12px 40px',
                                                        fontWeight: '600',
                                                        boxShadow: '0 4px 15px rgba(94, 114, 228, 0.3)'
                                                    }}
                                                    onClick={() => this.setState(prevState => ({ visibleCompanies: prevState.visibleCompanies + 20 }))}
                                                >
                                                    <i className="fas fa-chevron-down mr-2" />
                                                    Load More Companies
                                                </Button>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </div>
                        </Row>
                    )}
                </Container>
            </>
        );
    }
}

// Wrapper component to use hooks with class component
function Index(props) {
    const navigate = useNavigate();
    const { setCompanyDetails } = useCompany();
    return <IndexClass {...props} navigate={navigate} setCompanyDetails={setCompanyDetails} />;
}

export default Index;
