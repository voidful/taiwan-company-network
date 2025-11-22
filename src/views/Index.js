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

import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col, InputGroupText, Input, InputGroup, Button
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
        fetch('/data/graph.json')
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
                        <div className="text-center mt-5">
                            <h3>Loading company list...</h3>
                        </div>
                    ) : (
                        <Row>
                            <div className=" col">
                                <Card className=" shadow">
                                    <CardHeader className=" bg-transparent">
                                        <h3 className="mb-0">Company list</h3>
                                        <br />
                                        <div className="search-container">
                                            <InputGroup className="search-input-group">
                                                <InputGroupText>
                                                    <i className="fas fa-search" />
                                                </InputGroupText>
                                                <Input
                                                    placeholder="Search companies..."
                                                    type="text"
                                                    className="form-control"
                                                    onChange={(e) => {
                                                        this.setState({
                                                            search: e.target.value.split(' ').filter(Boolean), // Filter out empty strings
                                                            visibleCompanies: 20 // Reset visible count on search
                                                        });
                                                    }}
                                                />
                                            </InputGroup>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <Row>
                                            {
                                                filteredCompanies.slice(0, this.state.visibleCompanies).map((comp) => {
                                                    return (
                                                        <Col xl="3" md="6" key={comp}>
                                                            <Card className="company-card" onClick={() => this.handleOnClick(comp)}>
                                                                <CardBody>
                                                                    <span className="company-name">{comp}</span>
                                                                    <i className="fas fa-arrow-right company-arrow" />
                                                                </CardBody>
                                                            </Card>
                                                        </Col>
                                                    );
                                                })
                                            }
                                        </Row>
                                        {filteredCompanies.length > this.state.visibleCompanies && (
                                            <div className="load-more-container text-center mt-4">
                                                <Button
                                                    className="btn-load-more"
                                                    color="primary"
                                                    onClick={() => this.setState(prevState => ({ visibleCompanies: prevState.visibleCompanies + 20 }))}
                                                >
                                                    Load More
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
    return <IndexClass {...props} navigate={navigate} />;
}

export default Index;
