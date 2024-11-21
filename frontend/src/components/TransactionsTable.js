import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsTable = ({ month }) => {
    const [transactions, setTransactions] = useState([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 10; 

  
    const fetchTransactions = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/transactions`, {
                params: { 
                    month, 
                    search, 
                    page, 
                    perPage 
                }
            });
            setTransactions(data.transactions);
            setTotal(data.total);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    
    useEffect(() => {
        fetchTransactions();
    }, [month, search, page]);

    const totalPages = Math.ceil(total / perPage);

    return (
        <div>
           
            <input
                type="text"
                placeholder="Search Transactions"
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1); 
                }}
            />

            
            <h2> Transactions Table - {month}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Date of Sale</th>
                        <th>Sold</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length > 0 ? (
                        transactions.map((txn) => (
                            <tr key={txn._id}>
                                <td>{txn.title}</td>
                                <td>{txn.description}</td>
                                <td>${txn.price}</td>
                                <td>{new Date(txn.dateOfSale).toLocaleDateString()}</td>
                                <td>{txn.sold ? 'Yes' : 'No'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center' }}>
                                No transactions found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

           
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <p>
                    Page {page} of {totalPages || 1}
                </p>
                <button
                    disabled={page === 1}
                    onClick={() => setPage((prevPage) => prevPage - 1)}
                >
                    Previous
                </button>
                <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((prevPage) => prevPage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default TransactionsTable;
