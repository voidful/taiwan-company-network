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
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// reactstrap components
import { Container } from "reactstrap";
// core components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";

class AdminClass extends React.Component {
    mainContentRef = React.createRef();

    componentDidUpdate(e) {
        document.documentElement.scrollTop = 0;
        document.scrollingElement.scrollTop = 0;
        if (this.mainContentRef.current) {
            this.mainContentRef.current.scrollTop = 0;
        }
    }

    getRoutes = routes => {
        return routes.map((prop, key) => {
            return (
                <Route
                    path={prop.path}
                    element={<prop.component />}
                    key={key}
                />
            );
        });
    };

    getBrandText = path => {
        for (let i = 0; i < routes.length; i++) {
            if (path.indexOf(routes[i].path) !== -1) {
                return routes[i].name;
            }
        }
        return "Brand";
    };

    render() {
        return (
            <>
                <Sidebar
                    {...this.props}
                    routes={routes}
                />
                <div className="main-content" ref={this.mainContentRef}>
                    <AdminNavbar
                        {...this.props}
                        brandText={this.getBrandText(this.props.location.pathname)}
                    />
                    <Routes>
                        {this.getRoutes(routes)}
                        <Route path="*" element={<Navigate to="/index" replace />} />
                    </Routes>
                    <Container fluid>
                        <AdminFooter />
                    </Container>
                </div>
            </>
        );
    }
}

// Wrapper to use hooks
function Admin(props) {
    const location = useLocation();
    return <AdminClass {...props} location={location} />;
}

export default Admin;
