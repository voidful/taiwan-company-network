import React, { createContext, useState, useContext } from 'react';

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider = ({ children }) => {
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companyDetails, setCompanyDetails] = useState(null);

    return (
        <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany, companyDetails, setCompanyDetails }}>
            {children}
        </CompanyContext.Provider>
    );
};
