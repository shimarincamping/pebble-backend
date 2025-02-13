/*===================================================================================*/

// Import Express
const express = require('express');
const app = express();

// Misc. imports and mounts
const dotenv = require('dotenv').config();
const morgan = require('morgan')
const { errorHandler } = require('./src/middlewares/errorMiddleware');

app.use(express.json());
app.use(morgan("dev"));

/*===================================================================================*/

// Import routers
const userRoutes = require('./src/routes/userRoutes');



// Mount routers
app.use('/users', userRoutes);



/*===================================================================================*/

// Global error handling
app.use(errorHandler);

/*===================================================================================*/

// Starting server
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

/*===================================================================================*/

