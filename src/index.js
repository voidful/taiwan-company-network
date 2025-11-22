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
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";
import "assets/css/custom.css";
import AdminLayout from "layouts/Admin.js";

import { CompanyProvider } from "context/CompanyContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <CompanyProvider>
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Routes>
                <Route path="/*" element={<AdminLayout />} />
            </Routes>
        </BrowserRouter>
    </CompanyProvider>
);
