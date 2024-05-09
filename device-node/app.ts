const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./src/routes/index')
const bodyParser = require('body-parser')


app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// 配置跨域
app.use(cors({
    origin: '*'
}));
// 路由
app.use(router);

app.listen(9000, () => {
    console.log('端口监听在: http//location:9000');
})

