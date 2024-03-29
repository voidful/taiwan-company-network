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
import CGraph from "views/graph.js";
import Company from "views/Index.js";

var routes = [
    {
        path: "/index",
        name: "Company",
        icon: "ni ni-planet text-blue",
        component: Company,
        layout: "/admin"
    },
    {
        path: "/graph",
        name: "Graph",
        icon: "ni ni-tv-2 text-primary",
        component: CGraph,
        layout: "/admin"
    }
];
export default routes;
