// check env.
var env = process.env.NODE_ENV || 'development';

// switch environment variables
const config = (env != 'development' ?
    require('dotenv').config()
    :
    require('dotenv').config({ path: './.development.env' })
)