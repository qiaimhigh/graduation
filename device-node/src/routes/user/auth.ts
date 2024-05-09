/**
 * @description: jwt鉴权 https://www.npmjs.com/package/jsonwebtoken
 */
const { SECRET_KEY, APP_SECRET_KEY } = require('../../config/index')
const jwt = require('jsonwebtoken');

// 白名单，可以不需要token进行访问
const whiteList = ['/login'];

/**
 * @description: 生成jwt令牌， accessToken
 * @param: payload 生成秘钥的数据
 * @param: options 秘钥配置项
 */
const getJsonToken = (payload, options = {}) => {
    const optionsObj = {
        // 设置1h的秘钥过期时间
        expiresIn: '1h',
        ...options
    }
    const token = jwt.sign(payload, SECRET_KEY, optionsObj);
    return token;
}

/**
 * 获取小程序登录token
 */
const getAPPToken = (payload, options = {}) => {
    const optionsObj = {
        // 设置30的秘钥过期时间
        expiresIn: '30d',
        ...options
    }
    const token = jwt.sign(payload, APP_SECRET_KEY, optionsObj);
    return token;
}

/**
 * 判断小程序token是否有效
 */
const verifyAPPToken = (token: string) => {
    try {
        // 验证失败会抛出错误
        const decoded = jwt.verify(token, APP_SECRET_KEY);
        // 返回 payload 中的数据
        return decoded;
    }
    catch (err) {
        return null;
    }
}

/**
 * refreshToken
 * 主要用来更新accessToken
 */
const getRefreshToken = (payload, options ={}) => {
    const optionsObj = {
        // 设置1h的秘钥过期时间
        expiresIn: '14d',
        ...options
    }
    const token = jwt.sign(payload, SECRET_KEY, optionsObj);
    return token;
}

/**
 * @description: 验证token
 */
const verifyToke = (token: string) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        // 返回 payload 中的数据
        return decoded;
    }
    catch {
        return null;
    }
}

/**
 * @description：认证中间件
 */
const verifyAuthorization = (req, res) => {
    const accessToken = req.headers.authorization;
    // console.log(req.headers)
    if (!accessToken) {
        return res.status(401).send({
            code: 401,
            msg: 'Unauthorized 未携带accessToken'
        });
    }
    
    try { 
        const decoded = jwt.verify(accessToken, SECRET_KEY, (err) => {
            if (err) {
                res.send({
                    code: 401,
                    msg: 'Unauthorized: 无权限 refreshToken无效'
                })
            }
            else {
                res.send({
                    code: 200,
                    msg: '当前token有效'
                })
            }
        });
        req.user = decoded;
    }
    catch(err){
        return res.status(401).send({
            code: 401,
            msg: 'Unauthorized'
        });
    }
}

module.exports = {
    verifyAuthorization,
    getJsonToken,
    verifyToke,
    getRefreshToken,
    getAPPToken,
    verifyAPPToken
}

export {};