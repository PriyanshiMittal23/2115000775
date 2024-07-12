import express from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const router = express.Router();
const PORT = 5000;
const token = {
    "token_type": "Bearer",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwNzgzMTQ2LCJpYXQiOjE3MjA3ODI4NDYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjBjNTljOGVjLWI5YjItNGZjZC1iZWFhLWQxMTYxMzY2M2I1MSIsInN1YiI6InByaXlhbnNoaS5taXR0YWxfY3MyMUBnbGEuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjBjNTljOGVjLWI5YjItNGZjZC1iZWFhLWQxMTYxMzY2M2I1MSIsImNsaWVudFNlY3JldCI6ImxPU2VGRmlXUVVCWUJtQmQiLCJvd25lck5hbWUiOiJQcml5YW5zaGkgTWl0dGFsIiwib3duZXJFbWFpbCI6InByaXlhbnNoaS5taXR0YWxfY3MyMUBnbGEuYWMuaW4iLCJyb2xsTm8iOiIyMTE1MDAwNzc1In0.KJUTXULPY4HW3J5588C2pfuZIJdLtTWqcpRKarQOGtk",
    "expires_in": 1720782570
};


const companies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];

const fetchProductsFromCompany = async (company, categoryname, minPrice, maxPrice, top) => {
    try {
        const response = await axios.get(
            `http://20.244.56.144/test/companies/${company}/categories/${categoryname}/products`, {
                params: { minPrice, maxPrice, top },
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error(`Error fetching products from ${company}:`, error.response.status, error.response.data);
        } else {
            console.error(`Error fetching products from ${company}:`, error.message);
        }
        throw error; 
    }
};



router.get('/categories/:categoryname/products', async (req, res) => {
    const { categoryname } = req.params;
    let { n = 10, page = 1, sort = 'price', order = 'asc', minPrice = 1, maxPrice = 10000 } = req.query;

    n = parseInt(n) || 5; 
    page = parseInt(page) || 1;
    minPrice = parseInt(minPrice) || 1;
    maxPrice = parseInt(maxPrice) || 10000;

    try {
        const promises = companies.map(company =>
            fetchProductsFromCompany(company, categoryname, minPrice, maxPrice, n) // Pass 'n' as 'top' parameter
        );

        const responses = await Promise.all(promises);
        let products = responses.flatMap(data => data);

        products = products.map(product => ({
            ...product,
            id: uuidv4(),
        }));

        products.sort((a, b) => {
            if (order === 'asc') return a[sort] > b[sort] ? 1 : -1;
            return a[sort] < b[sort] ? 1 : -1;
        });

        const startIndex = (page - 1) * n;
        const paginatedProducts = products.slice(startIndex, startIndex + n);

        res.json({
            total: products.length,
            page,
            pageSize: n,
            products: paginatedProducts,
        });
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});