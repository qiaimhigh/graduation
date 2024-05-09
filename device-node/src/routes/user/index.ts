const dayjs = require('dayjs');
const db = require('../../mysql/mysql')
const { getJsonToken, getRefreshToken } = require('./auth');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../../config/index')
const { managerExcelHeader, userExcelHeader } = require('./config')
const { exportExcel } = require('../../utils/exceljs')

/**
 * @description 登录
 */
const loginFun = (req, res) => {
    const { username, password } = req.body;
    console.log(req.body)
    if (!username || !password) {
        return res.status(400).send({
            code: 404,
            msg: '参数错误'
        })
    }

    try {
        const sql = 'select * from manager where userName = ?';
        db.query(sql, [username], (err, result) => {
            if (err) {
                res.status(500).send({
                    code: 500,
                    msg: '数据异常'
                });
            }
            else if (result && result?.length > 0) {
                const user = result[0];
                const payload = {
                    username
                }
                const data = JSON.parse(JSON.stringify(user));
                // // 剔除密码，增加安全
                delete data.password;
                if (user && user.userName === username && user.password === password) {
                    const accessToken = getJsonToken(payload);
                    const refreshToken = getRefreshToken(payload);
                    return res.send({
                        code: 200,
                        msg: '登陆成功',
                        data: {
                            accessToken,
                            refreshToken,
                            data
                        }
                    })
                }
                else {
                    res.status(401).send({
                        code: 402,
                        msg: '请输入正确的账号或密码'
                    })
                }
            }
            else {
                res.status(404).send({
                    code: 404,
                    msg: '当前账号不存在，请输联系管理员添加账号',
                    data: []
                })
            }
        });
    }
    catch (err) {
        res.send({
            code: 500,
            msg: err || '未知错误'
        })
    }
}

/**
 * 验证refreshToken是否有效，并且刷新短token
 * 对于活跃用户的话，可以在每次刷新短token的时候返回长token，保证一直处于登录态
 */
const refreshTokenApi = (req, res) => {
    const refreshToken = req.headers['refesh'];
    const { username } = req.query;
    try {
        jwt.verify(refreshToken, SECRET_KEY, (err) => {
            if (err) {
                res.send({
                    code: 401,
                    msg: 'Unauthorized: 无权限 token无效'
                })
            }
            else {
                const payload = { username };
                const accessToken = getJsonToken(payload);
                const refreshToken = getRefreshToken(payload);
                res.send({
                    code: 200,
                    msg: '刷新成功',
                    data: {
                        accessToken,
                        refreshToken
                    }
                })
            }
        });
    }
    catch (err) {
        return res.status(401).send({
            code: 401,
            msg: 'Unauthorized'
        });
    }
}

/**
 * 注册，目前仅限小程序
 */

/**
 * 获取用户列表
 */
const getUserList = (req, res) => {
    const curPage = parseInt(req.query.curPage, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const { studentID } = req.query;

    if (curPage < 1 || pageSize < 1) {
        return res.send({
            code: 400,
            msg: '查询参数错误'
        })
    }

    try {
        // 查询总数
        let totalSql = 'SELECT COUNT(*) AS total FROM user';
        const queryParams = [];

        if (studentID) {
            totalSql += ' where studentID = ?';
            queryParams.push(`%${studentID}%`);
        }

        // 计算分页查询的起点
        const offset = (curPage - 1) * pageSize;

        db.query(totalSql, queryParams, (err, result) => {
            if (err) {
                res.send({
                    code: 400,
                    msg: err || '未知错误'
                })
            }
            else {
                const total = result[0].total;
                const totalPages = Math.ceil(total / pageSize);

                let sql = 'select * from user';
                if (studentID) {
                    sql += ' WHERE studentID LIKE ?';
                }
                sql += ' limit ?,?'
                queryParams.push(offset, pageSize)
                db.query(sql, queryParams, (err, result) => {
                    if (err) {
                        console.log(err)
                        res.status(500).send({
                            code: 500,
                            msg: '服务异常请稍后重试'
                        })
                    }
                    else if (result && result?.length > 0) {
                        // 过滤sql获取的密码
                        const userList = result.map(user => {
                            const { password, ...userWithoutPassword } = user;
                            return userWithoutPassword;
                        });
                        res.send({
                            code: 200,
                            msg: '获取用户列表成功',
                            data: {
                                curPage,
                                total,
                                totalPages,
                                userList,
                                pageSize
                            }
                        })
                    }
                    else {
                        res.send({
                            code: 400,
                            msg: '获取数据失败'
                        })
                    }
                })
            }
        })
    }
    catch (err) {
        res.status(500).send({
            code: 500,
            msg: err || '未知错误'
        })
    }
}

/**
 * 获取用户留言列表
 */
const getMessageList = (req, res) => {
    const curPage = parseInt(req.query.curPage, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const { type = 'all', isNeedPage = true } = req.query;
    // console.log(type)

    try {
        const totalSql = 'SELECT COUNT(*) AS total FROM message';
        // 计算分页查询的起点
        const offset = (curPage - 1) * pageSize;

        db.query(totalSql, (err, totalResult) => {
            if (err) {
                res.send({
                    code: 500,
                    msg: err.message || '服务异常'
                })
            }
            else {
                const total = totalResult[0].total;
                const totalPages = Math.ceil(total / pageSize);

                let sql = `select * from message where type = 'userMsg'`;

                switch (type) {
                    case 'all':
                        break;
                    case 'handled':
                        sql += ' and isHandle = 1'
                        break;
                    case 'unhandled':
                        sql += ' and isHandle = 0'
                        break;
                }

                if (isNeedPage) {
                    sql += ' limit ?,?'
                }


                db.query(sql, [offset, pageSize], (err, result) => {
                    if (err) {
                        console.log(err)

                        res.send({
                            code: 500,
                            msg: err.message || '服务异常'
                        })
                    }
                    else {
                        res.send({
                            code: 200,
                            msg: '获取留言列表成功',
                            data: {
                                curPage,
                                total,
                                pageSize,
                                totalPages,
                                userMsgList: result || []
                            }
                        })
                    }
                })
            }
        })
    }
    catch (err) {
        // console.log(err)
        res.send({
            code: 500,
            msg: err.message || '未知错误'
        })
    }
}

/**
 * 修改设用户留言信息
 */
const editMessage = (req, res) => {
    const { id, isHandle, handlePerson } = req.body;
    console.log(req.body)
    const handleTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    try {
        const sql = 'update message set isHandle = ?, handleTime = ?, handlePerson = ? where id = ?';
        db.query(sql, [parseInt(isHandle), handleTime, handlePerson, parseInt(id)], (err, result) => {
            if (err) {
                res.send({
                    code: 500,
                    msg: err || '服务异常'
                })
            }
            else if (result && result.affectedRows > 0) {
                res.send({
                    code: 200,
                    msg: '修改成功',
                })
            }
            else {
                res.send({
                    code: 400,
                    msg: '修改失败',
                })
            }
        })
    }
    catch (err) {
        res.send({
            code: 500,
            msg: err.message || '未知错误'
        })
    }
}

/**
 * 留言
 */
const pushUserMsg = (req, res) => {
    const { userMsg, studentID } = req.body;

    try {
        const sql = `insert into message (msg, studentID, msgTime, type) values(?, ?, ?, 'userMsg')`;
        const curTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
        db.query(sql, [userMsg, studentID, curTime], (err, result) => {
            if (err) {
                res.send({
                    code: 500,
                    msg: err.message || '服务异常'
                })
            }
            else if (result && result.affectedRows > 0) {
                res.send({
                    code: 200,
                    msg: '留言成功',
                })
            }
            else {
                res.send({
                    code: 400,
                    msg: '留言失败',
                })
            }
        })
    }
    catch (err) {
        res.send({
            code: 500,
            msg: err.message || '未知错误'
        })
    }
}

/**
 * excel导出全部管理员列表
 */
const exportManagerList = (req, res) => {
    try {
        const sql = 'select * from manager';
        db.query(sql, async (err, result) => {
            if (err) {
                res.send({
                    code: 500,
                    msg: err || '服务异常'
                })
            }
            else {
                const excelBuffer = await exportExcel({data: result, header: managerExcelHeader, filename: '管理员信息表'});
                res.setHeader('Content-disposition', 'attachment;filename=file.xlsx')
                res.setHeader(
                    'Content-Type',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
                // 这里必须直接写excelBuffer  不能使用{ code： ... }这种形式，不知道为啥
                res.send(excelBuffer)
            }
        })
    }
    catch (err) {
        res.send({
            code: 500,
            msg: err.message || '服务异常'
        })
    }
}

/**
 * excel导出全部学生用户列表
 */
const exportUserList = (req, res) => {
    try {
        const sql = 'select * from user';
        db.query(sql, async (err, result) => {
            if (err) {
                res.send({
                    code: 500,
                    msg: err || '服务异常'
                })
            }
            else {
                const excelBuffer = await exportExcel({data: result, header: userExcelHeader, filename: '学生信息表'});
                res.setHeader('Content-disposition', 'attachment;filename=file.xlsx')
                res.setHeader(
                    'Content-Type',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );
                // 这里必须直接写excelBuffer  不能使用{ code： ... }这种形式，不知道为啥
                res.send(excelBuffer)
            }
        })
    }
    catch (err) {
        res.send({
            code: 500,
            msg: err.message || '服务异常'
        })
    }
}

module.exports = {
    loginFun,
    getUserList,
    refreshTokenApi,
    getMessageList,
    editMessage,
    pushUserMsg,
    exportManagerList,
    exportUserList
}
export { };