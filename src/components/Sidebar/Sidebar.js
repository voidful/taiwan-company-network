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
/*eslint-disable*/
import React from "react";
import { NavLink as NavLinkRRD, Link, useLocation } from "react-router-dom";
// nodejs library to set properties for components
import { PropTypes } from "prop-types";

// reactstrap components
import {
    Collapse,
    Form,
    Input,
    InputGroupText,
    InputGroup,
    Navbar,
    NavItem,
    NavLink,
    Nav,
    Container,
    Row,
    Col
} from "reactstrap";

var ps;

class SidebarClass extends React.Component {
    state = {
        collapseOpen: false
    };

    constructor(props) {
        super(props);
        this.activeRoute.bind(this);
    }

    // verifies if routeName is the one active (in browser input)
    activeRoute(routeName) {
        return this.props.location.pathname.indexOf(routeName) > -1 ? "active" : "";
    }

    // toggles collapse between opened and closed (true/false)
    toggleCollapse = () => {
        this.setState({
            collapseOpen: !this.state.collapseOpen
        });
    };
    // closes the collapse
    closeCollapse = () => {
        this.setState({
            collapseOpen: false
        });
    };
    // creates the links that appear in the left menu / Sidebar
    createLinks = routes => {
        return routes.map((prop, key) => {
            if (prop.name != 'Graph')
                return (
                    <NavItem key={key}>
                        <NavLink
                            to={prop.path}
                            tag={NavLinkRRD}
                            onClick={this.closeCollapse}
                            className={({ isActive }) => isActive ? "active" : ""}
                        >
                            <i className={prop.icon} />
                            {prop.name}
                        </NavLink>
                    </NavItem>
                );
        });
    };

    render() {
        const { bgColor, routes, logo } = this.props;
        let navbarBrandProps;
        if (logo && logo.innerLink) {
            navbarBrandProps = {
                to: logo.innerLink,
                tag: Link
            };
        } else if (logo && logo.outterLink) {
            navbarBrandProps = {
                href: logo.outterLink,
                target: "_blank"
            };
        }
        return (
            <Navbar
                className="navbar-vertical fixed-left navbar-light bg-white"
                expand="md"
                id="sidenav-main"
            >
                <Container fluid>
                    {/* Toggler */}
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={this.toggleCollapse}
                    >
                        <span className="navbar-toggler-icon" />
                    </button>
                    {/* Collapse */}
                    <Collapse navbar isOpen={this.state.collapseOpen}>
                        {/* Collapse header */}
                        <div className="navbar-collapse-header d-md-none">
                            <Row>
                                {logo ? (
                                    <Col className="collapse-brand" xs="6">
                                        {logo.innerLink ? (
                                            <Link to={logo.innerLink}>
                                                <img alt={logo.imgAlt} src={logo.imgSrc} />
                                            </Link>
                                        ) : (
                                            <a href={logo.outterLink}>
                                                <img alt={logo.imgAlt} src={logo.imgSrc} />
                                            </a>
                                        )}
                                    </Col>
                                ) : null}
                                <Col className="collapse-close" xs="6">
                                    <button
                                        className="navbar-toggler"
                                        type="button"
                                        onClick={this.toggleCollapse}
                                    >
                                        <span />
                                        <span />
                                    </button>
                                </Col>
                            </Row>
                        </div>
                        {/* Form */}
                        <Form className="mt-4 mb-3 d-md-none">
                            <InputGroup className="input-group-rounded input-group-merge">
                                <Input
                                    aria-label="Search"
                                    className="form-control-rounded form-control-prepended"
                                    placeholder="Search"
                                    type="search"
                                />
                                <InputGroupText>
                                    <span className="fa fa-search" />
                                </InputGroupText>
                            </InputGroup>
                        </Form>
                        {/* Navigation */}
                        <Nav navbar>{this.createLinks(routes)}</Nav>
                    </Collapse>
                </Container>
            </Navbar>
        );
    }
}

Sidebar.defaultProps = {
    routes: [{}]
};

Sidebar.propTypes = {
    // links that will be displayed inside the component
    routes: PropTypes.arrayOf(PropTypes.object),
    logo: PropTypes.shape({
        // innerLink is for links that will direct the user within the app
        // it will be rendered as <Link to="...">...</Link> tag
        innerLink: PropTypes.string,
        // outterLink is for links that will direct the user outside the app
        // it will be rendered as simple <a href="...">...</a> tag
        outterLink: PropTypes.string,
        // the image src of the logo
        imgSrc: PropTypes.string.isRequired,
        // the alt for the img
        imgAlt: PropTypes.string.isRequired
    })
};

// Wrapper to use hooks
function Sidebar(props) {
    const location = useLocation();
    return <SidebarClass {...props} location={location} />;
}

export default Sidebar;
