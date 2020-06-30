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
import comp_graph from 'assets/data/graph.json';
import { withRouter } from "react-router";

import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col, InputGroupAddon, InputGroupText, Input, InputGroup
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";

class Index extends React.Component {
    state = {};

    constructor(props) {
        super(props);

        this.state = {
            search: []
        }
    }

    handleOnClick = (comp) => {
        this.props.history.push('/admin/graph', {
            company: comp
        })

    }

    render() {
        let options;
        if (this.state.search.length) {
            const searchPattern = new RegExp(this.state.search.map(term => `(?=.*${term})`).join(''), 'i');
            options = Object.keys(comp_graph).filter(option =>
                option.match(searchPattern)
            );
        } else {
            options = Object.keys(comp_graph);
        }

        return (
            <>
                <Header/>
                {/* Page content */}
                <Container className=" mt--7" fluid>
                    {/* Table */}
                    <Row>
                        <div className=" col">
                            <Card className=" shadow">
                                <CardHeader className=" bg-transparent">
                                    <h3 className=" mb-0">Company list</h3>
                                    <br/>
                                    <InputGroup className="input-group-alternative">
                                        <InputGroupAddon addonType="prepend">
                                            <InputGroupText>
                                                <i className="fas fa-search"/>
                                            </InputGroupText>
                                        </InputGroupAddon>
                                        <Input placeholder="Search" type="text"
                                               onChange={(e) => this.setState({search: e.target.value.split(' ')})}/>
                                    </InputGroup>
                                </CardHeader>
                                <CardBody>
                                    <Row className=" icon-examples">
                                        {options.slice(0, 100).map((key, index) => (
                                            <Col lg="4" md="4" key={index}>
                                                <CardBody>
                                                    <button
                                                        className=" btn-icon-clipboard"
                                                        type="button"
                                                        onClick={() => this.handleOnClick(key)}>
                                                        <div>
                                                            <i className=" ni ni-building"/>
                                                            <span>{key}</span>
                                                        </div>
                                                    </button>
                                                </CardBody>
                                            </Col>
                                        ))}
                                    </Row>
                                </CardBody>
                            </Card>
                        </div>
                    </Row>
                </Container>
            </>
        );
    }
}

export default withRouter(Index);
