import express from 'express';
import axios from 'axios';
import Product from './Product.js';

const router = express.Router();

const token = {
    "token_type": "Bearer",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwNzgyMTc5LCJpYXQiOjE3MjA3ODE4NzksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjBjNTljOGVjLWI5YjItNGZjZC1iZWFhLWQxMTYxMzY2M2I1MSIsInN1YiI6InByaXlhbnNoaS5taXR0YWxfY3MyMUBnbGEuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJnb01hcnQiLCJjbGllbnRJRCI6IjBjNTljOGVjLWI5YjItNGZjZC1iZWFhLWQxMTYxMzY2M2I1MSIsImNsaWVudFNlY3JldCI6ImxPU2VGRmlXUVVCWUJtQmQiLCJvd25lck5hbWUiOiJQcml5YW5zaGkgTWl0dGFsIiwib3duZXJFbWFpbCI6InByaXlhbnNoaS5taXR0YWxfY3MyMUBnbGEuYWMuaW4iLCJyb2xsTm8iOiIyMTE1MDAwNzc1In0.9XI_EGXMr6IyNseXm7Zk2jJ63xmOAoej7Mb1wrZwMnE"
};

router.get('/categories/:categoryname/products', async (req, res) => {
    const { categoryname } = req.params;
    console.log('Category:', categoryname);
    const n = parseInt(req.query.n, 10) || 10;

    try {
        const urls = [
            `http://20.244.56.144/test/companies/AMZ/categories/${categoryname}/products?top=${n}&minPrice=1&maxPrice=10000`,
            `http://20.244.56.144/test/companies/FLP/categories/${categoryname}/products?top=${n}&minPrice=1&maxPrice=10000`,
            `http://20.244.56.144/test/companies/SNP/categories/${categoryname}/products?top=${n}&minPrice=1&maxPrice=10000`,
            `http://20.244.56.144/test/companies/MYN/categories/${categoryname}/products?top=${n}&minPrice=1&maxPrice=10000`,
            `http://20.244.56.144/test/companies/AZO/categories/${categoryname}/products?top=${n}&minPrice=1&maxPrice=10000`
        ];

        const responses = await Promise.all(urls.map(url =>
            axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token.access_token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            }).catch(error => {
                console.error(`Error fetching from URL ${url}:`, error.message);
                return null;
            })
        ));

        // Filter out null responses
        console.log(responses)
        const validResponses = responses.filter(response => response !== null);
        console.log('Number of valid responses:', validResponses.length);

        const products = validResponses.reduce((acc, response) => {
            if (response.data && Array.isArray(response.data.products)) {
                acc.push(...response.data.products);
            }
            return acc;
        }, []);

        console.log('Number of products:', products.length);

        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        const top = products.slice(0, n);
        await Product.insertMany(top);

        console.log('Top products:', top);
        res.json(top);
    } catch (error) {
        console.error('Error in request processing:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/categories/:categoryname/products/:productid', async (req, res) => {
    const { productid } = req.params;
    try {
        const product = await Product.findById(productid);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
